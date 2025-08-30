export async function getScrapedMangaAggregate(mangaId: string, params: {}) {
  return $fetch<MangaAggregateResponse>(`/scraped/manga/${mangaId}/aggregate`, {
    params: params
  })
}