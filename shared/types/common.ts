export type LocalizedString = Record<string, string>;

export type Relationship<T extends string, U> = {
  id: string;
  type: T;
  related?: U;
  attributes?: Record<string, any>;
};

export type Entity<
  T extends string,
  Attributes extends Record<string, any>,
  Relationships extends Relationship<any, any> = never,
> = {
  id: string;
  type: T;
  attributes: Attributes;
  relationships: Relationships[];
};

export type SingleResponse<T> = {
  result: "ok";
  data: T;
};

export type CollectionResponse<T> = {
  result: "ok";
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export enum MangaRelated {
  MONOCHROME = "monochrome",
  MAIN_STORY = "main_story",
  ADAPTED_FROM = "adapted_from",
  BASED_ON = "based_on",
  PREQUEL = "prequel",
  SIDE_STORY = "side_story",
  DOUJINSHI = "doujinshi",
  SAME_FRANCHISE = "same_franchise",
  SHARED_UNIVERSE = "shared_universe",
  SEQUEL = "sequel",
  SPIN_OFF = "spin_off",
  ALTERNATE_STORY = "alternate_story",
  ALTERNATE_VERSION = "alternate_version",
  PRESERIALIZATION = "preserialization",
  COLORED = "colored",
  SERIALIZATION = "serialization",
}

export type IPFSData = {
  cid: string;
  fileSize?: number | null;
  mimeType?: string | null;
};

export type CoverData = {
  originalUrl: string;
  data: {
    cid: string;
    cid256: string;
    cid512: string;
    fileSize?: number | null;
    mimeType?: string | null;
  };
};

export type UploadedFiles = {
  originalUrl: string;
  data: IPFSData[];
};
