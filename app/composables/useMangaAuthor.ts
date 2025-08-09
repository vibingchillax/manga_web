import type { Manga } from "~~/shared/types/types"

export const useMangaAuthor = (manga: Manga) => {
  const authors = manga.relationships?.filter(r => r.type === 'author') ?? []
  const artists = manga.relationships?.filter(r => r.type === 'artist') ?? []

  const samePeople =
    authors.length === artists.length &&
    authors.every((a, i) => a.id === artists[i]?.id)

  return {
    authors,
    artists,
    samePeople,
  }
}
