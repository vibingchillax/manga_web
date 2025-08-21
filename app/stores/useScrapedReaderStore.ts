import type { Page } from "@manga_web/sources";
import { defineStore } from "pinia";

interface ReaderState {
  mangas: ScrapedManga[];
  manga: ScrapedManga | null;
  titleEntry: Manga | null;
  chapters: ScrapedChapter[];
  currentChapterIndex: number;
  pages: Page[];
  currentPage: number;
  totalPages: number;
  useProxy: boolean;
}

export const useScrapedReaderStore = defineStore("scrapedReaderStore", {
  state: (): ReaderState => ({
    mangas: [],
    manga: null,
    titleEntry: null,
    chapters: [],
    currentChapterIndex: -1,
    pages: [],
    currentPage: -1,
    totalPages: -1,
    useProxy: false,
  }),

  getters: {
    currentChapter: (state) =>
      state.currentChapterIndex >= 0 ?
        state.chapters[state.currentChapterIndex]
        : null,
    nextChapter: (state) =>
      state.currentChapterIndex > 0
        ? state.chapters[state.currentChapterIndex - 1]
        : undefined,
    previousChapter: (state) =>
      state.currentChapterIndex < state.chapters.length - 1
        ? state.chapters[state.currentChapterIndex + 1]
        : undefined,
  },

  actions: {
    async fetchMangas(title: string, sourceId: string) {
      const mangas: ScrapedManga[] = await $fetch("/api/mangas", {
        method: "POST", body: { titleInput: title, sourceId: sourceId }
      })
      if (!mangas || !(mangas.length > 0)) throw new Error(`No title from ${sourceId} match with ${title}`)
      this.mangas = mangas;
      this.manga = mangas[0] ?? null;
    },
    async fetchChapters() {
      if (!this.manga) throw new Error('Manga not set');
      const chapters: ScrapedChapter[] = await $fetch("/api/chapters", {
        method: "POST", body: { manga: this.manga }
      });
      if (!chapters || !(chapters.length > 0)) throw new Error('Chapters are not fetched');
      this.chapters = chapters;
      this.currentChapterIndex = 0;
    },
    async fetchPages() {
      if (!this.currentChapter) throw new Error('Current chapter not set');
      const pages: Page[] = await $fetch("/api/pages", {
        method: "POST", body: { chapter: this.currentChapter }
      });
      if (!pages || !(pages.length > 0)) throw new Error('Pages are not fetched');
      this.pages = pages;
      this.currentPage = 0;
      this.totalPages = pages.length;
    },
    setMangas(mangas: ScrapedManga[]) {
      this.mangas = mangas;
    },
    setManga(manga: ScrapedManga | null) {
      if (manga) {
        this.manga = manga;
        this.chapters = [];
        this.currentChapterIndex = -1;
        this.pages = [];
        this.currentPage = -1;
        this.totalPages = -1;
      }
    },
    setChapters(chapters: ScrapedChapter[], startIndex = 0) {
      this.chapters = chapters;
      this.currentChapterIndex =
        chapters.length > 0
          ? Math.min(startIndex, chapters.length - 1)
          : -1;
      this.currentPage = this.currentChapterIndex >= 0 ? 0 : -1;
    },
    setChapter(chapter: ScrapedChapter) {
      const index = this.chapters.findIndex((c) => c.id === chapter.id);
      if (index !== -1) {
        this.currentChapterIndex = index;
      }
    },
    setPage(index: number) {
      this.currentPage = index;
    },
    goToNextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        return true;
      }
      return false;
    },
    goToPrevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        return true;
      }
      return false;
    },
    goToNextChapter() {
      if (this.currentChapterIndex > 0) {
        this.currentChapterIndex--;
      }
    },
    goToPrevChapter() {
      if (this.currentChapterIndex < this.chapters.length - 1) {
        this.currentChapterIndex++;
      }
    },
    setUseProxy(bool: boolean) {
      this.useProxy = bool;
    },
    reset() {
      this.mangas = [];
      this.manga = null;
      this.titleEntry = null;
      this.chapters = [];
      this.currentChapterIndex = -1;
      this.pages = [];
      this.currentPage = -1;
      this.totalPages = -1;
      this.useProxy = false;
    },
  },
});