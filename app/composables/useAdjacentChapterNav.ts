export function useAdjacentChapterNav() {
  const router = useRouter();
  const reader = useReaderStore();

  const goAdjacentChapter = async (goPrev = false) => {
    if (!reader.adjacentPopulated) return;

    let success: boolean | undefined;

    if (goPrev) {
      success = await reader.switchChapter(reader._prevChapter?.id, true);
    } else {
      success = await reader.switchChapter(reader._nextChapter?.id, true);
    }

    if (!success && !reader.skipWarning) {
      await router.push(reader.chapterMeta.mangaLink);
    }

    reader._updateUrl();
  };

  return { goAdjacentChapter };
}