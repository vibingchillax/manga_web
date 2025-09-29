import type { components } from "#open-fetch-schemas/mangadex";
import type { Flags } from "@manga_web/sources";
import type { scrapedChapters, scrapedMangas } from "../prisma/client";

export type Manga = components["schemas"]["Manga"]
export type MangaList = components["schemas"]["MangaList"]
export type Tag = components["schemas"]["Tag"]

export type ScrapedChapterWithManga = scrapedChapters & { scrapedMangas: scrapedMangas }

export type MangaAggregateResponse = Record<
  string,
  {
    volume: string;
    count: number;
    chapters: Record<
      string,
      {
        chapter: string;
        id: string;
        others: string[];
        count: number;
      }
    >;
  }
>;

export type {
  Manga as ScrapedManga,
  Chapter as ScrapedChapter,
} from "@manga_web/sources"

export type SourceLabel = { label: string, id: string, url: string, flags: Flags[] };

export enum UploadState {
  Pending,
  Uploading,
  Success,
  Fail,
  PendingRemoval,
  Removed,
}