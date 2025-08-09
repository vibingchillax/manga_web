import { Chapter } from "@manga_web/sources";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const chapter = JSON.parse(query.chapter as string) as Chapter;
  if (!query || !query.chapter) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: chapter'
    })
  } 

  return sourcesInstance.runSourceForPages({
    chapter: chapter
  })
})