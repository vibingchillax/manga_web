import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import { randomUUID } from "crypto";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });
  }

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  ); // manga id, should check if manga is not found

  const data = await readMultipartFormData(event);
  if (!data) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
    });
  }

  const file = data.find((f) => f.name === "file");
  const volume = data.find((f) => f.name === "volume")?.data?.toString();
  const description = data
    .find((f) => f.name === "description")
    ?.data?.toString();
  const locale = data.find((f) => f.name === "locale")?.data?.toString();

  const schema = z.object({
    file: z
      .object({
        filename: z.string(),
        type: z.string().optional(),
        data: z.instanceof(Buffer),
      })
      .refine((f) => f.data.length > 0, "File must not be empty"),
    volume: zVolume.optional(),
    description: z.string().optional(),
    locale: zLang,
  });

  const body = schema.parse({
    file: file
      ? { filename: file.filename, type: file.type, data: file.data }
      : undefined,
    volume,
    description,
    locale,
  });

  if (!body.file) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing file field",
    });
  }

  const detect = await fileTypeFromBuffer(body.file.data);

  if (!detect?.mime || !IMAGE_TYPES.includes(detect.mime)) {
    throw new Error(
      `Invalid or unrecognized file type: ${detect?.mime ?? "unknown"}. Allowed: JPEG, PNG, GIF.`,
    );
  }

  const result = await kubo.add(body.file.data);
  const cid = result.cid.toString();

  const targetDir = `/manga_web/${params.id}/cover/${body.locale}/`;
  await kubo.files.mkdir(targetDir, { parents: true });
  await kubo.files.cp(
    `/ipfs/${cid}`,
    `${targetDir}/${randomUUID()}.${detect.ext}`,
  );

  const created = await prisma.coverArt.create({
    data: {
      id: randomUUID(),
      mangaId: params.id,
      volume: body.volume,
      description: body.description,
      locale: body.locale,
      uploader: user.id,
      file: {
        originalUrl: useAppConfig().kuboGatewayUrl,
        data: {
          cid: cid,
          mimeType: detect.mime,
        },
      },
    },
  });

  return {
    result: "ok",
    data: formatCoverArt(created),
  };
});
