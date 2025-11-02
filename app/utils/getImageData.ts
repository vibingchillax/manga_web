export async function getImageData(chapterId: string) {
  try {
    const response = await $fetch(`/api/scraped/chapter/${chapterId}/pages`);
    return {
      ...response,
      requestedAt: Date.now(),
    };
  } catch (error) {
    throw error;
  }
}
