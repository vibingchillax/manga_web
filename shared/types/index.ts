import type { Flags } from "@manga_web/sources";
import type { Entity, MangaRelated } from "./common";
import type {
  AuthorAttributes,
  ChapterAttributes,
  CoverAttributes,
  CustomListAttributes,
  MangaAttributes,
  ScanlationGroupAttributes,
  ScrapedChapterAttributes,
  ScrapedMangaAttributes,
  TagAttributes,
  UserAttributes,
} from "./attributes";

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

export type SourceLabel = {
  label: string;
  id: string;
  url: string;
  flags: Flags[];
};

export enum UploadState {
  Pending,
  Uploading,
  Success,
  Fail,
  PendingRemoval,
  Removed,
}

export type Author = Entity<
  "author",
  AuthorAttributes,
  { id: string; type: "manga"; attributes?: MangaAttributes }
>;

export type UploadedChapter = Entity<
  "chapter",
  ChapterAttributes,
  | {
      id: string;
      type: "user";
      attributes?: UserAttributes;
    }
  | {
      id: string;
      type: "manga";
      attributes?: MangaAttributes;
    }
  | {
      id: string;
      type: "scanlation_group";
      attributes?: ScanlationGroupAttributes;
    }
>;

export type Cover = Entity<
  "cover_art",
  CoverAttributes,
  | {
      id: string;
      type: "manga";
      attributes?: MangaAttributes;
    }
  | {
      id: string;
      type: "user";
      attributes?: UserAttributes;
    }
>;

export type CustomList = Entity<
  "custom_list",
  CustomListAttributes,
  | {
      id: string;
      type: "user";
      attributes?: UserAttributes;
    }
  | {
      id: string;
      type: "manga";
      attributes?: MangaAttributes;
    }
>;

export type ScanlationGroup = Entity<
  "scanlation_group",
  ScanlationGroupAttributes,
  {
    id: string;
    type: "leader" | "member";
    attributes?: UserAttributes;
  }
>;

export type Tag = Entity<"tag", TagAttributes>;

export type Manga = Entity<
  "manga",
  MangaAttributes,
  | {
      id: string;
      type: "author";
      attributes?: AuthorAttributes;
    }
  | {
      id: string;
      type: "artist";
      attributes?: AuthorAttributes;
    }
  | {
      id: string;
      type: "cover_art";
      attributes?: CoverAttributes;
    }
  | {
      id: string;
      type: "manga";
      related: MangaRelated;
      attributes?: MangaAttributes;
    }
>;

export type User = Entity<
  "user",
  UserAttributes,
  {
    id: string;
    type: "scanlation_group";
  }
>;

export type ScrapedManga = Entity<
  "scraped_manga",
  ScrapedMangaAttributes,
  | { id: string; type: "author"; attributes: { name: string } }
  | { id: string; type: "artist"; attributes: { name: string } }
  | { id: string; type: "scraped_cover_art"; attributes: { url: string } }
>;

export type ScrapedChapter = Entity<
  "scraped_chapter",
  ScrapedChapterAttributes,
  ScrapedManga | { id: string; type: "scraped_manga" } | ScrapedScanlationGroup
>;

export type ScrapedScanlationGroup = Entity<
  "scraped_scanlation_group",
  {
    name: string;
  }
>;

export type ChapterStatistics = {
  views: number;
  comments: number;
};
