import type { Manga } from "~~/shared/types/types"

export const useMangaTitle = (manga: Manga) => {
  const title = manga.attributes?.title?.en ?? 
  manga.attributes?.title?.["ja-ro"] ?? 
  manga.attributes?.title?.["ko-ro"] ?? 
  manga.attributes?.title?.["zh-ro"] ?? 
  "Untitled"
  return title
}