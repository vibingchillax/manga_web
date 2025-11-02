type ChapterReadMarker = {
  chapterId: string;
  type: "uploaded" | "scraped";
};

export const useReadMarkers = defineStore("readMarkers", {
  state: () => ({
    markers: [] as { mangaId: string; read: ChapterReadMarker[] }[],
  }),

  getters: {
    getMarkers:
      (state) =>
      (mangaId: string): ChapterReadMarker[] => {
        const entry = state.markers.find((m) => m.mangaId === mangaId);
        return entry?.read ?? [];
      },
  },

  actions: {
    setMarkers(mangaId: string, chapters: ChapterReadMarker[]) {
      const entry = this.markers.find((m) => m.mangaId === mangaId);
      if (entry) {
        entry.read = chapters;
      } else {
        this.markers.push({ mangaId: mangaId, read: chapters });
      }
    },
  },
  persist: {
    storage: localStorage,
  },
});
