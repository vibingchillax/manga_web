export const useScrapedChapter = (ch: Ref<ScrapedChapter | undefined>) => {
  const id = computed(() => ch.value?.id)
  const sourceId = computed(() => ch.value?.attributes.sourceId)

  const title = computed(() => ch.value?.attributes.title)
  const volume = computed(() => ch.value?.attributes.volume)
  const chapter = computed(() => ch.value?.attributes.chapter)
  const translatedLanguage = computed(() => ch.value?.attributes.translatedLanguage.toLowerCase() ?? 'en')
  const uploader = computed(() => ch.value?.attributes.uploader)
  const originalUrl = computed(() => ch.value?.attributes.originalUrl)
  const readUrl = computed(() => `/chapter/scraped/${id.value}`)
  const branch = computed(() => ch.value?.attributes.branch)
  const createdAt = computed(() => ch.value?.attributes.createdAt)
  const updatedAt = computed(() => ch.value?.attributes.updatedAt)
  const publishAt = computed(() => ch.value?.attributes.publishAt)

  const manga = computed(() => ch.value?.relationships?.find(m => m.type === 'scraped_manga'))
  const scanlationGroup = computed(() => ch.value?.relationships?.filter(m => m.type === 'scraped_scanlation_group'))

  return {
    id,
    sourceId,
    title,
    volume,
    chapter,
    translatedLanguage,
    uploader,
    originalUrl,
    readUrl,
    branch,
    createdAt,
    updatedAt,
    publishAt,
    manga,
    scanlationGroup
  }
}

export const useScrapedChapterMeta = () => {
  const reader = useReaderStore()
  const readerCache = useReaderCache()
  const readerPageManager = useReaderPageManager()

  const mangaTitle: string = (() => {
    if (reader.chapterState === "pgonly") return "Unknown"
    if (!reader.manga) return ""
    if (!reader.manga.attributes.title) return "Data Error"
    return reader.manga.attributes.title.en //TODO
  })()

  const mangaLink = reader.manga ? `/title/${reader.manga.attributes.mangadexId}/` : ""

  const chapterNo = reader.currentChapter?.attributes.chapter ?? null
  const volumeNo = reader.currentChapter?.attributes.volume ?? null

  const chapterTitle = (() => {
    if (reader.chapterState === "pgonly") return "Unknown"
    if (!reader.currentChapter) return ""
    const title = reader.currentChapter?.attributes.title?.trim() ?? ""
    return title || (chapterNo ? `Chapter ${chapterNo}` : "Oneshot")
  })()

  const chapterIdentifier = (() => {
    if (reader.chapterState === "pgonly") return "Unknown"
    if (!reader.currentChapter) return ""
    let identifier = ""
    if (volumeNo) identifier += `Vol ${volumeNo}, `
    identifier += chapterNo ? `Ch. ${chapterNo}` : "Oneshot"
    return identifier
  })()

  const chapterGroups = reader.currentChapter?.relationships?.filter(r => r.type === 'scraped_scanlation_group') ?? null
  const chapterUploader = reader.currentChapter?.attributes.uploader ?? null

  const chapterPageCount = reader.currentChapter ?
    readerPageManager.imageData?.data.length : null

  const nextChapter: ScrapedChapter | null = (() => {
    const translatedLanguage = (reader.currentChapter == null ? void 0 : reader.currentChapter.attributes.translatedLanguage) ?? "en"

    if (!reader._nextChapter) return null

    if (readerCache.existsChapter(reader._nextChapter.id)) {
      return readerCache.chapterCache.find(ch => ch.id === reader._nextChapter?.id) ?? null
    }
    return {
      id: reader._nextChapter.id,
      type: "scraped_chapter",
      attributes: {
        sourceId: '',
        originalUrl: '',
        title: '',
        volume: '',
        chapter: reader._nextChapter.chapter,
        uploader: '',
        branch: '',
        translatedLanguage: translatedLanguage,
        publishAt: '',
        createdAt: '',
        updatedAt: ''
      },
      relationships: [],
    }
  })()

  const prevChapter: ScrapedChapter | null = (() => {
    const translatedLanguage = (reader.currentChapter == null ? void 0 : reader.currentChapter.attributes.translatedLanguage) ?? "en"

    if (!reader._prevChapter) return null

    if (readerCache.existsChapter(reader._prevChapter.id)) {
      return readerCache.chapterCache.find(ch => ch.id === reader._prevChapter?.id) ?? null
    }
    return {
      id: reader._prevChapter.id,
      type: "scraped_chapter",
      attributes: {
        sourceId: '',
        originalUrl: '',
        title: '',
        volume: '',
        chapter: reader._prevChapter.chapter,
        uploader: '',
        branch: '',
        translatedLanguage: translatedLanguage,
        publishAt: '',
        createdAt: '',
        updatedAt: ''
      },
      relationships: [],
    }
  })()

  return {
    nextChapter,
    prevChapter,
    mangaTitle,
    mangaLink,
    chapterNo,
    volumeNo,
    chapterTitle,
    chapterIdentifier,
    chapterGroups,
    chapterUploader,
    chapterPageCount
  }
}