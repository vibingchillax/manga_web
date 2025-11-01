import type { components } from "#open-fetch-schemas/mangadex";
import type { Flags } from "@manga_web/sources";
import type { ContentRating, PublicationDemographic, UserRole } from "../prisma/client";

export type Author = components["schemas"]["Author"]
export type Cover = components["schemas"]["Cover"]
export type Manga = components["schemas"]["Manga"]
export type MangaList = components["schemas"]["MangaList"]
export type Relationship = components["schemas"]["Relationship"]
export type Tag = components["schemas"]["Tag"]

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

export type SourceLabel = { label: string, id: string, url: string, flags: Flags[] };

export enum UploadState {
  Pending,
  Uploading,
  Success,
  Fail,
  PendingRemoval,
  Removed,
}

type Resource<Type extends string, Attr, Rel = unknown> = {
  id: string;
  type: Type;
  attributes: Attr;
  relationships?: Rel[];
};

export type ScrapedManga = Resource<
  "scraped_manga",
  {
    mangadexId: string;
    sourceId: string;
    title: { en: string };
    altTitles: any;
    description: { en: string | null };
    originalLanguage: string | null;
    publicationDemographic: PublicationDemographic | null;
    status: string | null;
    year: number | null;
    contentRating: ContentRating | null;
    tags: {
      id: string;
      type: "tag";
      attributes: { name: { en: string } };
    }[];
    version: number;
    createdAt: string; //nuxt automatically serialize Date objs for us
    updatedAt: string;
  },
  (
    | { id: string; type: "author"; attributes: { name: string } }
    | { id: string; type: "artist"; attributes: { name: string } }
    | { id: string; type: "scraped_cover_art"; attributes: { url: string } }
  )
>;

export type ScrapedChapter = Resource<
  "scraped_chapter",
  {
    sourceId: string;
    title: string | null;
    volume: string | null;
    chapter: string | null;
    translatedLanguage: string;
    uploader: string | null;
    originalUrl: string;
    pages: ScrapedPage[];
    branch: string | null;
    createdAt: string;
    updatedAt: string;
    publishAt: string | null;
  },
  (
    | ScrapedManga
    | { id: string; type: "scraped_manga" }
    | ScrapedScanlationGroup
  )
>;

export type ScrapedPage = {
  originalUrl: string
  cid: string | null
}

export type ScrapedScanlationGroup = Resource<
  "scraped_scanlation_group",
  {
    name: string
  }
>

export type ScanlationGroup = Resource<
  "scanlation_group",
  {
    name: string;
    altNames: any;
    website: string | null;
    ircServer: string | null;
    ircChannel: string | null;
    discord: string | null;
    contactEmail: string | null;
    description: string | null;
    twitter: string | null;
    mangaUpdates: string | null;
    focusedLanguages: string[];
    locked: boolean;
    official: boolean;
    verified: boolean;
    inactive: boolean;
    exLicensed: boolean;
    publishDelay: string | null;
    version: number;
    createdAt: string;
    updatedAt: string;
  },
  {
    id: string;
    type: "leader" | "member";
    attributes: { username: string; roles: UserRole[] };
  }
>;

export type User = Resource<
  "user",
  {
    username: string;
    roles: UserRole[];
  },
  { id: string; type: string | "scanlation_group" }
>;

export type UploadedChapter = Resource<
  "chapter",
  {
    title: string
    volume: string
    chapter: string
    pages: any
    translatedLanguage: string
    uploader: string
    version: number
    createdAt: string
    updatedAt: string
    publishAt: string
    readableAt: string
  },
  (
    User |
    ScanlationGroup
  )
>;