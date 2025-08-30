import type { scrapedPages } from "~~/shared/prisma/client"

export async function getImageData(chapterId: string) {
  try {
    const response = await $fetch<scrapedPages>(`/scraped/chapter/${chapterId}/pages`)
    return {
      ...response,
      requestedAt: Date.now()
    }
  } catch (error) {
    throw error
  }
}