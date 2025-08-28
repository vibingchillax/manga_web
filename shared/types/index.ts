import type { components } from "#open-fetch-schemas/mangadex";
import type { Flags } from "@manga_web/sources";

export type Manga = components["schemas"]["Manga"]
export type MangaList = components["schemas"]["MangaList"]
export type Tag = components["schemas"]["Tag"]

export type {
  Manga as ScrapedManga,
  Chapter as ScrapedChapter,
} from "@manga_web/sources"

export type SourceLabel = { label: string, id: string, url: string, flags: Flags[] };