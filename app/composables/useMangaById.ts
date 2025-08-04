export const useMangaById = (id: string) => {
  const { data, pending, error } = useAsyncData(`manga-${id}`, () =>
    getMangaId(id, {
      "includes[]": ['cover_art', 'author', 'artist'],
    })
  )

  const manga = computed(() => data.value?.data)

  return {
    manga,
    pending,
    error,
  }
}
