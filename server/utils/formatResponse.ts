import {
  Author,
  ScanlationGroup,
  ScrapedChapter,
  ScrapedManga,
  UploadedChapter,
  User
} from "~~/shared/prisma/client"
import { GroupRole, UserRole } from "~~/shared/prisma/enums"

export type SafeUser = {
  id: string
  username: string
  roles: UserRole[]
  groupRole?: GroupRole,
  groupMemberships?: {
    groupId: string
  }[]
}

export function formatAuthor(author: Author) {
  const { id, ...rest } = author
  return {
    id: author.id,
    type: "author" as const,
    attributes: {
      ...rest
    },
    relationships: []
  }
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
      tags: manga.tags.map(t => ({
        id: "scraped",
        type: "tag",
        attributes: {
          name: { en: t }
        }
      })),
      version: manga.version,
      createdAt: manga.createdAt,
      updatedAt: manga.updatedAt,
    },
    relationships: [
      ...manga.author.map(a => ({
        id: "scraped",
        type: "author" as const,
        attributes: {
          name: a
        }
      })),
      ...manga.artist.map(a => ({
        id: "scraped",
        type: "artist" as const,
        attributes: {
          name: a
        }
      })),
      {
        id: "scraped",
        type: "scraped_cover_art" as const,
        attributes: {
          url: manga.coverUrl
        }
      }
    ]
  }
}

export function formatScrapedChapter(chapter: ScrapedChapter & { manga?: ScrapedManga }) {
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
      chapter.manga ? formatScrapedManga(chapter.manga) : {
        id: chapter.mangaId,
        type: "scraped_manga" as const
      },
      chapter.scanlationGroup && {
        id: "scraped",
        type: "scraped_scanlation_group" as const,
        attributes: {
          name: chapter.scanlationGroup
        }
      }
    ].filter(Boolean)
  }
}

export function formatUploadedChapter(
  chapter: UploadedChapter & {
    user?: SafeUser
    groups?: ScanlationGroup[]
  }) {

  const { id, user, groups, mangaId, ...rest } = chapter
  return {
    id: id,
    type: "chapter" as const,
    attributes: rest,
    relationships: [
      ...(user
        ? [formatUser(user)]
        : []
      ),
      ...(groups
        ? groups.map((g) => {
          return formatGroup(g)
        })
        : []
      )
    ]
  }
}

export function formatGroup(group: ScanlationGroup & {
  members?: { user: SafeUser, role: GroupRole }[]
}) {

  const { id, members, ...rest } = group
  return {
    id: id,
    type: "scanlation_group" as const,
    attributes: rest,
    relationships: [
      ...members?.map(m => ({
        id: m.user.id,
        type: m.role === GroupRole.leader ? "leader" as const : "member" as const,
        attributes: {
          username: m.user.username,
          roles: m.user.roles
        }
      })) || []
    ]
  }
}

export function formatUser(user: SafeUser) {
  return {
    id: user.id,
    type: "user" as const,
    attributes: {
      username: user.username,
      roles: user.roles,
    },
    relationships: [
      ...user.groupMemberships?.map(g => ({
        id: g.groupId,
        type: "scanlation_group" as const
      })) || []
    ]
  }
}