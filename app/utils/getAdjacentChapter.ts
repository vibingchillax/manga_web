const safeCompare = (a?: string, b?: string) => {
  if (!a) return -1;
  if (!b) return 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};

const isSkipped = (direction: number,
  chapterA: { chapter: string; volume: string },
  chapterB: { chapter: string; volume: string }) => {
  if (
    direction === -1 ||
    !chapterA ||
    !chapterB ||
    chapterA.chapter === "none" ||
    chapterB.chapter === "none" ||
    (
      chapterA.chapter === chapterB.chapter &&
      (
        chapterA.volume === chapterB.volume ||
        !chapterA.volume ||
        !chapterB.volume ||
        chapterA.volume === "none" ||
        chapterB.volume === "none"
      )
    )
  ) {
    return false;
  }

  const chapterANum = parseFloat(chapterA.chapter);
  const chapterBNum = parseFloat(chapterB.chapter);
  const volumeANum = parseInt(chapterA.volume) || 0;
  const volumeBNum = parseInt(chapterB.volume) || 0;

  if (isNaN(chapterANum) || isNaN(chapterBNum)) {
    return false;
  }

  // Consider skipped if volume difference is at least 1
  if (
    chapterA.volume && chapterA.volume !== "none" &&
    chapterB.volume && chapterB.volume !== "none" &&
    Math.abs(volumeANum - volumeBNum) >= 1.100005
  ) {
    return true;
  }

  return !(
    Math.abs(chapterANum - chapterBNum) <= 1.100005 ||
    (direction === 1 && volumeBNum === 0 && Math.abs(chapterANum - chapterBNum) <= 1.100005) ||
    (direction === 1 && volumeANum === 0 && Math.abs(chapterANum - chapterBNum) <= 1.100005) ||
    (direction === 1 && volumeBNum === volumeANum + 1 && chapterBNum <= 1.1) ||
    (direction === 1 && volumeANum === volumeBNum + 1 && chapterANum <= 1.1)
  );
}

export const getAdjacentChapter = (
  aggregate: MangaAggregateResponse, volumeNum: string | null, chapterNum: string | null, direction: 1 | -1):
  AdjacentChapter | null => {

  volumeNum ??= "none"
  chapterNum ??= "none"

  const sortedVolumes = Object.entries(aggregate).sort((a, b) => safeCompare(a[0], b[0]));

  let volumeIndex = sortedVolumes.map(v => v[0]).indexOf(volumeNum);
  if (volumeIndex === -1) return null;

  let chapterIndex;

  do {
    const volumeEntry = sortedVolumes[volumeIndex];
    if (!volumeEntry) return null;

    const chapters = Object.entries(volumeEntry[1].chapters).sort((a, b) => safeCompare(a[0], b[0]));

    if (chapterIndex === undefined) {
      chapterIndex = chapters.map(c => c[0]).indexOf(chapterNum);
      if (chapterIndex === -1) return null;
      chapterIndex += direction;
    }

    // If no chapters in this volume, move to previous/next volume
    if (chapters.length === 0) {
      const volumeEntry = sortedVolumes[--volumeIndex];
      if (!volumeEntry) return null;
      chapterIndex = volumeEntry[1].count - 1;
      continue;
    }

    // Return chapter if found
    if (chapterIndex >= 0 && chapterIndex < chapters.length) {
      const chapterEntry = chapters[chapterIndex];
      if (!chapterEntry) return null;
      const chapter = chapterEntry[1];
      const volumeEntry = sortedVolumes[volumeIndex];
      if (!volumeEntry) return null;
      return {
        chapter: chapter.chapter,
        id: chapter.id,
        skipped: isSkipped(direction, { chapter: chapter.chapter, volume: volumeEntry[0] }, { chapter: chapterNum, volume: volumeNum })
      };
    }

    // Move to next/previous chapter
    chapterIndex += direction;
    if (direction > 0) chapterIndex = 0, volumeIndex++;
    else {
      if (volumeIndex === 0) return null;
      const volumeEntry = sortedVolumes[--volumeIndex];
      if (!volumeEntry) return null;
      chapterIndex = Object.entries(volumeEntry[1].chapters).length - 1;
    }
  } while (volumeIndex < sortedVolumes.length);
  return null
}