import { z } from "zod";
import { downloadImagesFromUrls } from "~~/server/utils/kubo";
import path from "path";
import type { ScrapedPage } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const chapter = await prisma.scrapedChapter.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!chapter)
    throw createError({
      statusCode: 404,
      statusMessage: "Chapter not found",
    });

  let pages = (chapter.pages as ScrapedPage[]) ?? [];

  if (pages.length > 0 && pages.every((p) => p.cid))
    return {
      chapterId: chapter.id,
      data: pages,
    };

  if (pages.length === 0) {
    const result = await sourcesInstance.runSourceForPages({
      chapter: {
        id: chapter.id,
        sourceId: chapter.sourceId,
        url: chapter.url,
      },
    });

    if (result.length === 0)
      throw createError({
        statusCode: 404,
        statusMessage: "Pages not found",
      });

    pages = result.map((r) => ({
      originalUrl: r.url,
      cid: null,
    }));

    await prisma.scrapedChapter.update({
      where: {
        id: chapter.id,
      },
      data: {
        pages,
      },
    });
  }

  const pending = pages.filter((p) => !p.cid);
  if (pending.length === 0) {
    return {
      chapterId: chapter.id,
      data: pages,
    };
  }

  downloadImagesFromUrls(pending.map((p) => p.originalUrl))
    .then(async (downloaded) => {
      const updatedPages = [...pages];
      const failed: string[] = [];

      const targetDir = `/manga_web/${chapter.mangaId}/scraped/${chapter.sourceId}/${chapter.id}_${chapter.translatedLanguage}_v${chapter.volume ?? "v"}_c${chapter.chapter ?? "c"}`;
      await kubo.files.mkdir(targetDir, { parents: true }).catch(() => {});

      for (let i = 0; i < downloaded.length; i++) {
        const d = downloaded[i];
        const pageUrl = pending[i].originalUrl;
        const index = updatedPages.findIndex((p) => p.originalUrl === pageUrl);

        if (!d || d.result !== "ok" || !d.file) {
          console.warn(
            `[IPFSDownload] Failed to download image for chapter=${chapter.id} page=${i + 1} url="${pageUrl}" → ${d?.error ?? "Unknown error"}`,
          );
          failed.push(pageUrl);
          continue;
        }

        const cid = d.file.cid;
        const fileName = `${i + 1}.${d.file.ext}`;
        const targetPath = path.join(targetDir, fileName);

        try {
          await kubo.files.rm(targetPath).catch(() => {});
          await kubo.files.cp(`/ipfs/${cid}`, targetPath);
          updatedPages[index].cid = cid;
        } catch (err: any) {
          console.warn(
            `[IPFSDownload] Failed to copy CID=${cid} to MFS path="${targetPath}" for chapter=${chapter.id} url="${pageUrl}" → ${err.message}`,
          );
          failed.push(pageUrl);
        }
      }

      const allDone = updatedPages.every((p) => p.cid);
      await prisma.scrapedChapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          pages: updatedPages,
          downloaded: allDone,
          downloadedAt: allDone ? new Date() : null,
        },
      });

      if (failed.length > 0) {
        console.warn(
          `[IPFSDownload] ${failed.length}/${downloaded.length} pages failed for chapter=${chapter.id}`,
        );
      } else {
        console.log(
          `[IPFSDownload] All pages successfully downloaded for chapter=${chapter.id}`,
        );
      }
    })
    .catch((err) => console.error("[IPFSDownload]", err));

  return {
    chapterId: chapter.id,
    data: pages,
  };
});
