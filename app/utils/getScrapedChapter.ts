import type { ScrapedChapterWithManga } from "~~/shared/types"

export async function getScrapedChapter(chapterId: string, include: boolean = false) {
  const response = await $fetch<ScrapedChapterWithManga>(`/api/scraped/chapter/${chapterId}`, {
    query: {
      'includes[]': ['manga']
    }
  })
  return response
}