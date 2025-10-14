export const useManga = (manga: Manga | undefined) => {

  const title = computed(() => {
    const titles = manga?.attributes?.title ?? {}
    const preferred = PREFERRED_ORDER.find(lang => titles[lang])
    return preferred ? titles[preferred] : "Untitled"
  })

  const altTitles = computed(() => manga?.attributes?.altTitles)

  const description = computed(() => manga?.attributes?.description)

  const detailsUrl = computed(() => {
    return `/title/${manga?.id}/${toKebabCase(title.value)}`
  })

  const author = computed(() => {
    const authors = manga?.relationships?.filter(r => r.type === 'author') ?? []
    const artists = manga?.relationships?.filter(r => r.type === 'artist') ?? []

    const samePeople = authors.length === artists.length &&
      authors.every((a, i) => a.id === artists[i]?.id)

    return {
      authors,
      artists,
      samePeople
    }
  })

  const cover = computed(() => {
    const coverRelation = manga?.relationships?.find(r => r.type === 'cover_art');

    const urlOriginal =
      `https://uploads.mangadex.org/covers/${manga?.id}/${coverRelation?.attributes?.fileName}`
    const url256 =
      `https://uploads.mangadex.org/covers/${manga?.id}/${coverRelation?.attributes?.fileName}.256.jpg`
    const url512 =
      `https://uploads.mangadex.org/covers/${manga?.id}/${coverRelation?.attributes?.fileName}.512.jpg`
    return {
      urlOriginal,
      url256,
      url512
    }
  })

  const publicationStatus = computed(() => manga?.attributes?.status)
  const publicationDemographic = computed(() => manga?.attributes?.publicationDemographic)
  const contentRating = computed(() => manga?.attributes?.contentRating)
  const links = computed(() => manga?.attributes?.links ?? {})
  const tags = computed(() => manga?.attributes?.tags ?? [])

  return {
    title,
    altTitles,
    detailsUrl,
    description,
    author,
    cover,
    publicationStatus,
    publicationDemographic,
    contentRating,
    links,
    tags
  }
}