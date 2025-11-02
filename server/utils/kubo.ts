import { fileTypeFromStream } from "file-type";
import { create } from "kubo-rpc-client";

export interface DownloadedFile {
  url: string;
  cid: string;
  ext: string;
}

export interface DownloadResult {
  result: "ok" | "ko";
  file: DownloadedFile | null;
  error?: string;
}

export const kubo = create({
  url: useAppConfig().kuboApiUrl,
});

export async function downloadImageFromUrl(
  url: string,
): Promise<DownloadResult> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    if (!res.body) throw new Error(`Empty response body`);

    const [streamA, streamB] = res.body.tee();

    const type = await fileTypeFromStream(streamA);
    if (!type) throw new Error(`Unable to detect file type from ${url}`);
    if (!type.mime.startsWith("image/"))
      throw new Error(`Invalid MIME type: ${type.mime}`);

    const result = await kubo.add(streamB);

    return {
      result: "ok",
      file: {
        url,
        cid: result.cid.toString(),
        ext: type.ext,
      },
    };
  } catch (err: any) {
    const message = err?.message || "Unknown error";
    console.warn(`[IPFSDownload] Failed for ${url} → ${message}`);
    return {
      result: "ko",
      file: null,
      error: message,
    };
  }
}

export async function downloadImagesFromUrls(
  urls: string[],
  concurrency = 15,
): Promise<DownloadResult[]> {
  const results: DownloadResult[] = [];
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const i = index++;
      const url = urls[i];
      const downloaded = await downloadImageFromUrl(url);
      results[i] = downloaded;
    }
  }

  await Promise.all(Array(concurrency).fill(null).map(worker));
  return results;
}
