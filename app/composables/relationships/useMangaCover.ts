export const useMangaCover = (manga: Manga) => {
    const cover = manga.relationships?.find(r => r.type === 'cover_art');
    const coverUrl256 = 
    `https://uploads.mangadex.org/covers/${manga.id}/${cover?.attributes?.fileName}.256.jpg`
    const coverUrl512 = 
    `https://uploads.mangadex.org/covers/${manga.id}/${cover?.attributes?.fileName}.512.jpg`
    return {
        coverUrl256,
        coverUrl512
    }
}
