import type { scrapedChapters } from "~~/shared/prisma/client"

export const useScrapedChapterMeta = () => {
  const reader = useReaderStore()
  const readerCache = useReaderCache()
  const readerPageManager = useReaderPageManager()

  const mangaTitle: string = (() => {
    if (reader.chapterState === "pgonly") return "Unknown"
    if (!reader.manga) return ""
    if (!reader.manga.title) return "Data Error"
    return reader.manga.title
  })()

  const mangaLink = reader.manga ? `/title/${reader.manga.mangaDexId}/` : ""

  const chapterNo = reader.currentChapter?.chapter ?? null
  const volumeNo = reader.currentChapter?.volume ?? null

  const chapterTitle = (() => {
    if (reader.chapterState === "pgonly") return "Unknown"
    if (!reader.currentChapter) return ""
    const title = reader.currentChapter?.title?.trim() ?? ""
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

  const chapterGroups = reader.currentChapter?.scanlationGroup ?? null
  const chapterUploader = reader.currentChapter?.uploader ?? null

  const chapterPageCount = reader.currentChapter ?
    readerPageManager.imageData?.data.length : null

  const nextChapter: scrapedChapters | null = (() => {
    const translatedLanguage = (reader.currentChapter == null ? void 0 : reader.currentChapter.translatedLanguage) ?? "en"

    if (!reader._nextChapter) return null

    if (readerCache.existsChapter(reader._nextChapter.id)) {
      return readerCache.chapterCache.find(ch => ch.id === reader._nextChapter?.id) ?? null
    }
    return {
      id: reader._nextChapter.id,
      mangaId: '',
      sourceId: '',
      url: '',
      title: '',
      volume: '',
      uploader: '',
      scanlationGroup: '',
      branch: '',
      publishedAt: '',
      createdAt: new Date,
      updatedAt: new Date,
      chapter: reader._nextChapter.chapter,
      translatedLanguage: translatedLanguage
    }
  })()

  const prevChapter: scrapedChapters | null = (() => {
    const translatedLanguage = (reader.currentChapter == null ? void 0 : reader.currentChapter.translatedLanguage) ?? "en"

    if (!reader._prevChapter) return null

    if (readerCache.existsChapter(reader._prevChapter.id)) {
      return readerCache.chapterCache.find(ch => ch.id === reader._prevChapter?.id) ?? null
    }
    return {
      id: reader._prevChapter.id,
      mangaId: '',
      sourceId: '',
      url: '',
      title: '',
      volume: '',
      uploader: '',
      scanlationGroup: '',
      branch: '',
      publishedAt: '',
      createdAt: new Date,
      updatedAt: new Date,
      chapter: reader._prevChapter.chapter,
      translatedLanguage: translatedLanguage
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