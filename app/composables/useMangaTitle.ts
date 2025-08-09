import type { Manga } from "~/shared/types/types"

export const useMangaTitle = (manga: Manga) => {
  const title = manga.attributes?.title?.en ?? manga.attributes?.title?.["ja-ro"] ?? "Untitled"
  return title
}