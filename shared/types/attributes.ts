import type { Tag } from ".";
import type { ContentRating, PublicationDemographic } from "../prisma/client";
import type { CoverData, LocalizedString, UploadedFiles } from "./common";

export type AuthorAttributes = {
  name: string;
  imageUrl: string | null;
  biography: LocalizedString;
  twitter: string | null;
  pixiv: string | null;
  melonBook: string | null;
  fanBox: string | null;
  booth: string | null;
  nicoVideo: string | null;
  skeb: string | null;
  fantia: string | null;
  tumblr: string | null;
  youtube: string | null;
  weibo: string | null;
  naver: string | null;
  namicomi: string | null;
  website: string | null;
  version: number;
  createdAt: string; // nuxt already serializes for us
  updatedAt: string;
};

export type ChapterAttributes = {
  title: string | null;
  volume: string | null;
  chapter: string | null;
  translatedLanguage: string;
  pages: UploadedFiles;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishAt: string;
  readableAt: string;
};

export type CoverAttributes = {
  volume: string | null;
  file: CoverData;
  description: string | null;
  locale: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomListAttributes = {
  name: string;
  visibility: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ScanlationGroupAttributes = {
  name: string;
  altNames: string[] | null;
  website: string | null;
  ircServer: string | null;
  ircChannel: string | null;
  discord: string | null;
  contactEmail: string | null;
  description: string | null;
  twitter: string | null;
  mangaUpdates: string | null;
  inactive: boolean;
  publishDelay: string | null;
  focusedLanguages: string[];
  locked: boolean;
  official: boolean;
  verified: boolean;
  exLicensed: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type TagAttributes = {
  name: LocalizedString;
  description?: LocalizedString | null;
  group: "content" | "format" | "theme" | "genre";
  version: number;
};

export type MangaAttributes = {
  title: LocalizedString;
  altTitles: LocalizedString[];
  description: LocalizedString;
  isLocked: boolean;
  links: Record<string, string>;
  originalLanguage: string | null;
  lastVolume: string | null;
  lastChapter: string | null;
  publicationDemographic: PublicationDemographic | null;
  status: string | null;
  year: number | null;
  contentRating: ContentRating | null;
  chapterNumbersResetOnNewVolume: boolean;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string | null;
  tags: Tag[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type UserAttributes = {
  username: string;
  roles: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ScrapedMangaAttributes = {
  mangaId: string;
  sourceId: string;
  title: LocalizedString;
  altTitles: LocalizedString[];
  description: LocalizedString | null;
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
  createdAt: string;
  updatedAt: string;
};

export type ScrapedChapterAttributes = {
  sourceId: string;
  title: string | null;
  volume: string | null;
  chapter: string | null;
  translatedLanguage: string;
  uploader: string | null;
  originalUrl: string;
  pages: {
    originalUrl: string;
    cid: string | null;
  }[];
  branch: string | null;
  createdAt: string;
  updatedAt: string;
  publishAt: string | null;
};
