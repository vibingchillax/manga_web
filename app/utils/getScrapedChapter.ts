export async function getScrapedChapter(
  chapterId: string,
  include: boolean = false,
) {
  const response = await $fetch<ScrapedChapter>(
    `/api/scraped/chapter/${chapterId}`,
    {
      query: {
        "includes[]": ["manga"],
      },
    },
  );
  return response;
}
