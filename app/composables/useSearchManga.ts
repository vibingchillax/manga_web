export const useSearchManga = (title: string) => {
  const { data, pending, error } = useAsyncData(`search-${title}`, () =>
    getSearchManga({
        title,
        order: {
            followedCount: 'desc',
            relevance: 'desc',
        },
        "contentRating[]": ['safe', 'suggestive'] //TODO user settings
    })
  )

  const mangaList = computed(() => data.value?.data)

  return {
    mangaList,
    pending,
    error,
  }
}

