import type {
  Author,
  Comment,
  CoverArt,
  CustomList,
  Manga,
  MangaRelation,
  ScanlationGroup,
  ScrapedChapter,
  ScrapedManga,
  Tag,
  UploadedChapter,
} from "~~/shared/prisma/client";
import type { MangaRelType, UserRole } from "~~/shared/prisma/enums";
import { GroupRole } from "~~/shared/prisma/enums";

export type UserFromPrisma = {
  id: string;
  username: string;
  roles: UserRole[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  groupMemberships?: {
    groupId: string;
  }[];
};

const RELATION_TYPE_MAP = {
  monochrome: "monochrome",
  colored: "colored",
  preserialization: "preserialization",
  serialization: "serialization",
  prequel: "prequel",
  sequel: "sequel",
  mainStory: "main_story",
  sideStory: "side_story",
  adaptedFrom: "adapted_from",
  spinOff: "spin_off",
  basedOn: "based_on",
  doujinshi: "doujinshi",
  sameFranchise: "same_franchise",
  sharedUniverse: "shared_universe",
  alternateStory: "alternate_story",
  alternateVersion: "alternate_version",
} as const;

export function formatAuthor(
  author: Author & {
    mangaAuthored?: { id: string }[];
    mangaDrawn?: { id: string }[];
  },
  type: "author" | "artist" = "author",
) {
  const { id, mangaAuthored, mangaDrawn, ...rest } = author;

  const mangaMap = new Map<string, { id: string }>();
  mangaAuthored?.forEach((m) => mangaMap.set(m.id, m));
  mangaDrawn?.forEach((m) => mangaMap.set(m.id, mangaMap.get(m.id) || m));

  return {
    id,
    type,
    attributes: rest,
    relationships: Array.from(mangaMap.values()).map((m) => ({
      id: m.id,
      type: "manga" as const,
    })),
  };
}

export function formatCoverArt(cover: CoverArt) {
  const { id, mangaId, uploader, ...rest } = cover;
  return {
    id: id,
    type: "cover_art" as const,
    attributes: rest,
    relationships: [
      {
        id: mangaId,
        type: "manga" as const,
      },
      {
        id: uploader,
        type: "user" as const,
      },
    ],
  };
}

export function formatCustomList(
  list: CustomList & {
    manga?: {
      id: string;
    }[];
  },
) {
  const { id, userId, manga, ...rest } = list;
  return {
    id: id,
    type: "custom_list",
    attributes: rest,
    relationships: [
      ...(manga?.map((m) => ({
        id: m.id,
        type: "manga" as const,
      })) ?? []),
      {
        id: userId,
        type: "user" as const,
      },
    ],
  };
}

export function formatManga(
  manga: Manga & {
    authors?: { id: string }[];
    artists?: { id: string }[];
    primaryCover?: { id: string } | null;
    relationsTo?: MangaRelation[];
    chapters?: any; // we don't care about this here
    tags?: Tag[];
  },
  latestUploadedChapter: string | null = null,
  availableTranslatedLanguages: string[] = [],
) {
  const {
    id,
    authors,
    artists,
    primaryCover,
    primaryCoverId,
    relationsTo,
    chapters,
    tags: rawTags,
    ...rest
  } = manga;
  const tags = rawTags?.map((t) => {
    const { id, ...tagRest } = t;
    return {
      id,
      type: "tag" as const,
      attributes: tagRest,
    };
  });
  return {
    id: id,
    type: "manga" as const,
    attributes: {
      ...rest,
      tags,
      availableTranslatedLanguages,
      latestUploadedChapter,
    },
    relationships: [
      ...(authors?.map((a) => ({
        id: a.id,
        type: "author" as const,
      })) ?? []),
      ...(artists?.map((a) => ({
        id: a.id,
        type: "artist" as const,
      })) ?? []),
      ...(primaryCover
        ? [
            {
              id: primaryCover.id,
              type: "cover_art",
            },
          ]
        : []),
      ...(relationsTo?.map((a) => ({
        id: a.fromId,
        type: "manga" as const,
        related: RELATION_TYPE_MAP[a.type],
      })) ?? []),
    ],
  };
}

export function formatMangaRelation(manga: Manga, type: MangaRelType) {
  const { id, ...rest } = manga;
  return {
    id: id,
    type: "manga" as const,
    related: RELATION_TYPE_MAP[type],
    attributes: rest,
  };
}

export function formatScrapedManga(manga: ScrapedManga) {
  return {
    id: manga.id,
    type: "scraped_manga" as const,
    attributes: {
      mangadexId: manga.mangaDexId,
      sourceId: manga.sourceId,
      title: { en: manga.title },
      altTitles: manga.altTitles,
      description: { en: manga.description },
      originalLanguage: manga.originalLanguage,
      publicationDemographic: manga.publicationDemographic,
      status: manga.status,
      year: manga.year,
      contentRating: manga.contentRating,
      tags: manga.tags.map((t) => ({
        id: "scraped",
        type: "tag",
        attributes: {
          name: { en: t },
        },
      })),
      version: manga.version,
      createdAt: manga.createdAt,
      updatedAt: manga.updatedAt,
    },
    relationships: [
      ...manga.author.map((a) => ({
        id: "scraped",
        type: "author" as const,
        attributes: {
          name: a,
        },
      })),
      ...manga.artist.map((a) => ({
        id: "scraped",
        type: "artist" as const,
        attributes: {
          name: a,
        },
      })),
      {
        id: "scraped",
        type: "scraped_cover_art" as const,
        attributes: {
          url: manga.coverUrl,
        },
      },
    ],
  };
}

export function formatScrapedChapter(
  chapter: ScrapedChapter & { manga?: ScrapedManga },
) {
  return {
    id: chapter.id,
    type: "scraped_chapter" as const,
    attributes: {
      sourceId: chapter.sourceId,
      title: chapter.title,
      volume: chapter.volume,
      chapter: chapter.chapter,
      translatedLanguage: chapter.translatedLanguage,
      uploader: chapter.uploader,
      originalUrl: chapter.url,
      pages: chapter.pages,
      branch: chapter.branch,
      downloaded: chapter.downloaded,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      downloadedAt: chapter.downloadedAt,
      publishAt: chapter.publishedAt,
    },
    relationships: [
      chapter.manga
        ? formatScrapedManga(chapter.manga)
        : {
            id: chapter.mangaId,
            type: "scraped_manga" as const,
          },
      chapter.scanlationGroup && {
        id: "scraped",
        type: "scraped_scanlation_group" as const,
        attributes: {
          name: chapter.scanlationGroup,
        },
      },
    ].filter(Boolean),
  };
}

export function formatUploadedChapter(
  chapter: UploadedChapter & {
    groups?: { groupId: string }[];
  },
) {
  const { id, groups, uploader, mangaId, ...rest } = chapter;
  return {
    id: id,
    type: "chapter" as const,
    attributes: rest,
    relationships: [
      {
        id: mangaId,
        type: "manga" as const,
      },
      ...(uploader
        ? [
            {
              id: uploader,
              type: "user" as const,
            },
          ]
        : []),
      ...(groups
        ? groups.map((g) => ({
            id: g.groupId,
            type: "scanlation_group" as const,
          }))
        : []),
    ],
  };
}

export function formatGroup(
  group: ScanlationGroup & {
    members?: { userId: string; role: GroupRole }[];
  },
) {
  const { id, members, ...rest } = group;
  return {
    id: id,
    type: "scanlation_group" as const,
    attributes: rest,
    relationships: [
      ...(members?.map((m) => ({
        id: m.userId,
        type:
          m.role === GroupRole.leader
            ? ("leader" as const)
            : ("member" as const),
      })) || []),
    ],
  };
}

export function formatUser(user: UserFromPrisma) {
  const { id, groupMemberships, ...rest } = user;
  return {
    id: id,
    type: "user" as const,
    attributes: rest,
    relationships: [
      ...(user.groupMemberships?.map((g) => ({
        id: g.groupId,
        type: "scanlation_group" as const,
      })) || []),
    ],
  };
}

export function formatComment(
  comment: Comment & {
    user?: UserFromPrisma;
    votes?: { vote: number }[];
    _count?: { replies: number };
  },
) {
  const score = comment.votes?.reduce((sum, v) => sum + v.vote, 0) ?? 0;

  return {
    id: comment.id,
    type: "comment" as const,

    attributes: {
      body: comment.deleted ? null : comment.body,
      deleted: comment.deleted,
      createdAt: comment.createdAt,
      editedAt: comment.editedAt,
      score,
      replies: comment._count?.replies ?? 0,
    },

    relationships: [
      ...(comment.user
        ? [
            {
              id: comment.user.id,
              type: "user" as const,
              attributes: {
                username: comment.user.username,
                roles: comment.user.roles,
                version: comment.user.version,
                createdAt: comment.user.createdAt,
                updatedAt: comment.user.updatedAt,
              },
            },
          ]
        : []),

      ...(comment.parentId
        ? [
            {
              id: comment.parentId,
              type: "comment" as const,
              related: "parent" as const,
            },
          ]
        : []),
    ],
  };
}
