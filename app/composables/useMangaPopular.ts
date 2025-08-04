export const useMangaPopular = () => {
    const createdAtSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const isoDate = createdAtSince.toISOString().slice(0, 19)

    const { data, pending, error } = useAsyncData('popular', () =>
        getSearchManga({
            'includes[]': ['cover_art', 'artist', 'author'],
            order: { followedCount: 'desc' },
            'contentRating[]': ['safe', 'suggestive'], //TODO user settings
            hasAvailableChapters: "true",
            createdAtSince: isoDate,
            limit: 10
        })
    )
    const mangas = computed(() => data.value?.data)
    return {
        mangas,
        pending,
        error
    }
}