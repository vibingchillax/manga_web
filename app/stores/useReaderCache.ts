interface ChapterCache {
  chapterId: string
  pages: string[]
}

function debug(...e: any[]) {
    console.debug("%c[Reader Cache]", "color: #5a6", ...arguments)
}

export const useReaderCache = defineStore('readerCache', () => {
  const serverCache = ref<ChapterCache[]>([]), 
  chapterCache = ref<ScrapedChapter[]>([]), 
  aggCache = ref<MangaAggregateResponse[]>([])

  return {
    serverCache,
    chapterCache,
    existsChapter: (id: string) => false,
    appendChapterCache: (chapter: ScrapedChapter) => {},
    getChapter: async (chapterId: string) => (
      serverCache.value.find(c => c.chapterId === chapterId),
      debug("Chapter cache miss, fetching: ", chapterId),
      await getScrapedChapter(chapterId, true)
    ),
    aggCache,
    existsAggregate: () => false,
    appendAggregateCache: (a: any, b: any) => {},
    getAggregate: async (chapter: ScrapedChapter, mangaId: string) => {
      debug("Aggregate cache miss, fetching: ", chapter.id, mangaId)
      return await getScrapedMangaAggregate(mangaId, {
        'translatedLanguage[]': [chapter.attributes.translatedLanguage ?? "en"]
      })
    },
    $reset: () => {
      serverCache.value.splice(0, serverCache.value.length)
      chapterCache.value.splice(0, chapterCache.value.length)
      aggCache.value.splice(0, aggCache.value.length)
    }
  }
})