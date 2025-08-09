import type { components } from "#open-fetch-schemas/mangadex";

export type Manga = components["schemas"]["Manga"]
export type MangaList = components["schemas"]["MangaList"]
export type Tag = components["schemas"]["Tag"]


export type SourceLabel = { label: string, id: string, url: string };