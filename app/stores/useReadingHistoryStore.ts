const length = 69420; //mangadex picked this not my fault

export interface ReadingHistory {
  _readingHistory: {
    chapterId: string;
    time: string;
    type: "uploaded" | "scraped";
  }[];
}

export const useReadingHistoryStore = defineStore("readingHistory", {
  state: (): ReadingHistory => ({
    _readingHistory: [],
  }),
  actions: {
    pushChapterRead(entry: {
      chapterId: string;
      type: "uploaded" | "scraped";
    }) {
      this._readingHistory = this._readingHistory.filter(
        (item) =>
          !(item.chapterId === entry.chapterId && item.type === entry.type),
      );

      this._readingHistory.unshift({
        chapterId: entry.chapterId,
        time: new Date().toISOString(),
        type: entry.type,
      });

      if (this._readingHistory.length > length) {
        this._readingHistory.splice(length);
      }
    },
  },
  persist: {
    storage: localStorage,
  },
});
