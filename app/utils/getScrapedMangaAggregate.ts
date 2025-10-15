export async function getScrapedMangaAggregate(mangaId: string, params: {}) {
  return $fetch<MangaAggregateResponse>(`/api/scraped/manga/${mangaId}/aggregate`, {
    params: params
  })
}