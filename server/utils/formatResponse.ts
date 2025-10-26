import { ScanlationGroup, ScrapedChapter, ScrapedManga, User } from "~~/shared/prisma/client"
import { GroupRole, UserRole } from "~~/shared/prisma/enums"

type SafeUser = {
  id: string
  username: string
  roles: UserRole[]
  groupRole?: GroupRole,
  groupMemberships?: {
    groupId: string
  }[]
}

export function formatScrapedManga(manga: ScrapedManga) {
  return {
    id: manga.id,
    type: "scraped_manga",
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
        type: "author",
        attributes: {
          name: a
        }
      })),
      ...manga.artist.map(a => ({
        id: "scraped",
        type: "artist",
        attributes: {
          name: a
        }
      })),
      {
        id: "scraped",
        type: "scraped_cover_art",
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
    type: "scraped_chapter",
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
        type: "scraped_manga"
      },
      chapter.scanlationGroup && {
        id: "scraped",
        type: "scraped_scanlation_group",
        attributes: {
          name: chapter.scanlationGroup
        }
      }
    ].filter(Boolean)
  }
}

export function formatGroup(group: ScanlationGroup & {
  members?: { user: SafeUser, role: GroupRole }[]
}) {
  return {
    id: group.id,
    type: "scanlation_group",
    attributes: {
      name: group.name,
      altNames: group.altNames,
      website: group.website,
      ircServer: group.ircServer,
      ircChannel: group.ircChannel,
      discord: group.discord,
      contactEmail: group.contactEmail,
      description: group.description,
      twitter: group.twitter,
      mangaUpdates: group.mangaUpdates,
      focusedLanguage: group.focusedLanguages,
      locked: group.locked,
      official: group.official,
      verified: group.verified,
      inactive: group.inactive,
      exLicensed: group.exLicensed,
      publishDelay: group.publishDelay,
      version: group.version,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    },
    relationships: [
      ...group.members?.map(m => ({
        id: m.user.id,
        type: m.role === GroupRole.leader ? "leader" : "member",
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
    type: "user",
    attributes: {
      username: user.username,
      roles: user.roles,
    },
    relationships: [
      ...user.groupMemberships?.map(g => ({
        id: g.groupId,
        type: "scanlation_group"
      })) || []
    ]
  }
}