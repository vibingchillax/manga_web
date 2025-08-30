import type { Router } from "vue-router"
import type { scrapedChapters, scrapedMangas } from "~~/shared/prisma/client"
import { ReadStyleEnum, ViewStyleEnum } from "./useReaderMenu"

function debug(...e: any[]) {
  console.debug("%c[Reader Store]", "color: #d3d", ...arguments)
}

export const PRELOAD_THRESHOLD = 2
export const PROGRESS_PRELOAD_THRESHOLD = 0.9

export type AdjacentChapter = {
  chapter: string
  id: string
  skipped: boolean
}

export interface ReaderState {
  startingPage: number
  cancelStartingPageSwitch: boolean
  currentChapter: ScrapedChapterWithManga | null
  _nextChapter: AdjacentChapter | null
  _prevChapter: AdjacentChapter | null
  chapterLoadError: { status: number, message: string } | null
  adjacentPopulated: boolean
  oldCurrentChapter: ScrapedChapterWithManga | null
  isClickFromPage: boolean
  serverLoadError: any | null
  currentPageGroup: number
  currentProgress: number
  manga: scrapedMangas | null
  aggregate: MangaAggregateResponse | null
  chapterMeta: {
    nextChapter: scrapedChapters | null
    prevChapter: scrapedChapters | null
    mangaTitle: string
    mangaLink: string
    chapterNo: string | null
    volumeNo: string | null
    chapterTitle: string
    chapterIdentifier: string
    chapterGroups: string | null
    chapterUploader: string | null
    chapterPageCount: number | null | undefined
  }
  immersive: boolean
  _immersionBreak: boolean
  immersionBreakTimeout: ReturnType<typeof setTimeout> | null
  skipWarning: boolean | { chapter: string; prev: string; next: string | null }
  atTop: boolean
  scrollbarOffset: number
  scrolling: boolean
  commentsOpen: boolean
  showContentWarning: boolean
  greyscale: boolean
}

export const useReaderStore = defineStore("reader", {
  state: (): ReaderState => ({
    startingPage: 0,
    cancelStartingPageSwitch: false,
    currentChapter: null,
    _nextChapter: null,
    _prevChapter: null,
    chapterLoadError: null,
    adjacentPopulated: false,
    oldCurrentChapter: null,
    isClickFromPage: false,
    serverLoadError: null,
    currentPageGroup: 0,
    currentProgress: 0,
    manga: null,
    aggregate: null,
    chapterMeta: {
      nextChapter: null,
      prevChapter: null,
      mangaTitle: "",
      mangaLink: "",
      chapterNo: null,
      volumeNo: null,
      chapterTitle: "",
      chapterIdentifier: "",
      chapterGroups: null,
      chapterUploader: null,
      chapterPageCount: null,
    },
    immersive: false,
    _immersionBreak: false,
    immersionBreakTimeout: null,
    skipWarning: false,
    atTop: false,
    scrollbarOffset: 0,
    scrolling: false,
    commentsOpen: false,
    showContentWarning: false,
    greyscale: false
  }),
  actions: {
    async initializeReader(chapterId: string, startPage?: string, contentWarn: boolean = true) {
      const readerCache = useReaderCache()
      const readerPageManager = useReaderPageManager()

      readerPageManager.reset()
      this.$reset()
      readerCache.$reset()

      const preferences = usePreferencesStore()
      const { $isMobileApp: isMobileApp } = useNuxtApp()
      if (isMobileApp) {
        this._immersionBreak = true
        this.immersionBreakTimeout = setTimeout(() => {
          this._immersionBreak = false
        }, 3000)
      }

      readerPageManager.loadImagesFromId(chapterId).then(() => {
        if (startPage && !isNaN(parseInt(startPage))) {
          const page = parseInt(startPage)

          if (useReaderMenu().viewStyle === ViewStyleEnum.LongStrip) {
            this.startingPage = page

            setTimeout(() => {
              this.cancelStartingPageSwitch = true
            }, 10000)

            this.goToPage(page)
          }
        }
        readerPageManager.beginPreloadPages()
      })

      try {
        const chapter = await getScrapedChapter(chapterId, true)
        this.currentChapter = chapter

        this._markChapterRead(chapter)

        if (chapter.scrapedMangas.contentRating && !preferences.contentRating.includes(chapter.scrapedMangas.contentRating)) {
          this.showContentWarning = contentWarn
        }
      } catch (error: any) {
        if (error.response.status === 429) {
          this.chapterLoadError = {
            status: 429,
            message: "Rate limit exceeded"
          }
        } else { //case 404, default
          this.chapterLoadError = {
            status: 404,
            message: "That chapter could not be found"
          }
        }
      }

      if (this.currentChapter) {
        if (!this.manga) this.manga = this.currentChapter.scrapedMangas
        if (this.manga) this.refreshAggregate()
        this.chapterMeta = useScrapedChapterMeta()
      }
    },
    async switchChapter(chapterId: string | undefined, isJump: boolean = false, keepCurrentPage: boolean = false) {
      const readerCache = useReaderCache()
      if (!this.manga || !chapterId || chapterId == this.currentChapter?.id) return false
      debug("Attempting to switch to chapter with id:", chapterId)
      let direction = 1

      if (isJump) {
        let targetChapter
        if (this._prevChapter && chapterId === this._prevChapter.id) {
          targetChapter = this._prevChapter
          direction = -1
        } else if (this._nextChapter && chapterId === this._nextChapter.id) {
          targetChapter = this._nextChapter
        }

        if (targetChapter?.skipped && direction === 1) {
          this.skipWarning = {
            chapter: targetChapter.id,
            prev: this.chapterMeta.chapterNo + "",
            next: targetChapter.chapter
          }
          return false
        }
      }

      if (!(direction < 0 && keepCurrentPage)) {
        this.currentPageGroup = 0;
      }

      this._setCurrentChapter(null)

      const pageManager = useReaderPageManager()
      await pageManager.loadImagesFromId(chapterId)

      if (direction < 0) {
        this.currentPageGroup = pageManager.pageGroups.length - 1
        this._updateUrl()
      } else if (useReaderMenu().viewStyle === ViewStyleEnum.LongStrip) {
        window.scrollTo(0, 0)
      }

      pageManager.beginPreloadPages()

      this._setCurrentChapter(await readerCache.getChapter(chapterId))

      if (useNuxtApp().$isMobileApp) {
        this._immersionBreak = true
        this.immersionBreakTimeout = setTimeout(() => {
          this._immersionBreak = false
        }, 3000)
      }

      this.chapterMeta = useScrapedChapterMeta()
      return true
    },
    async _fetchAggregate(mangaId?: string) {
      const id = mangaId || this.manga?.id
      if (!id || !this.currentChapter) return

      const readerCache = useReaderCache()
      debug("Fetching aggregate for", this.currentChapter.id)
      this.aggregate = await readerCache.getAggregate(this.currentChapter, id)
    },
    async _setAdjacentChapters() {
      const readerCache = useReaderCache() //mangadex init this, i am not thinking about if it really does anything

      if (!this.aggregate || !this.currentChapter) return

      this.adjacentPopulated = false

      this._nextChapter = getAdjacentChapter(this.aggregate, this.currentChapter?.volume, this.currentChapter?.chapter, 1) ?? null
      this._prevChapter = getAdjacentChapter(this.aggregate, this.currentChapter?.volume, this.currentChapter?.chapter, -1) ?? null
      this.chapterMeta = useScrapedChapterMeta()

      this.adjacentPopulated = true
    },
    async refreshAggregate(mangaId?: string) {
      await this._fetchAggregate(mangaId)
      this._setAdjacentChapters()
    },

    _setCurrentChapter(chapter: ScrapedChapterWithManga | null) {
      if (!chapter) {
        if (this.currentChapter) {
          this.oldCurrentChapter = this.currentChapter
        }

        this.currentChapter = null
        this.chapterLoadError = null
        useReaderPageManager().reset()
        this.chapterMeta = useScrapedChapterMeta()
        return
      }

      this.currentChapter = chapter
      this.adjacentPopulated = false

      this._markChapterRead(chapter)

      this._setAdjacentChapters().then(() => (this.oldCurrentChapter = null))

      this.chapterMeta = useScrapedChapterMeta()
    },
    async _preloadNextChapter() {
      if (this.chapterState === "pgonly") return
      const readerMenu = useReaderMenu()
      if (!this._nextChapter) {
        debug("No next chapter, nothing to preload")
        return
      }
      if (!readerMenu.doAutoAdvance) {
        debug("Auto advance disabled, nothing to preload")
        return
      }
      useReaderPageManager().preloadImageData(this._nextChapter.id)
    },
    _updateUrl() {
      const router = useRouter()
      if (!this.currentChapter) return
      const readerMenu = useReaderMenu()
      const chapterId = this.currentChapter.id
      // const refId = ref(chapterId)
      if (chapterId !== location.pathname) {
        router.push({
          path: chapterId
        })
      }
      // let i
      // switch (readerMenu.historyMode) {
      //   case HistoryModeEnum.None:
      //     i = ref(chapterId)
      //     if (i.value !== location.pathname) {
      //       router.push({
      //         path: i
      //       })
      //       break
      //     }
      //   case HistoryModeEnum.ChaptersOnly:
      //   case HistoryModeEnum.PagesOnly:
      // }
    },
    goToPage(pageNumber: number, chapterId?: string) {
      if (chapterId && chapterId !== this.currentChapter?.id) {
        this.switchChapter(chapterId).then(success => {
          if (success) this.goToPage(pageNumber)
        })
        return
      }

      const pageManager = useReaderPageManager()
      let totalPages = 0, groupIndex = 0

      while (groupIndex < pageManager.pageGroups.length && totalPages < pageNumber) {
        const pageGroup = pageManager.pageGroups[groupIndex]
        if (!pageGroup) break
        totalPages += pageGroup.length
        groupIndex++
      }

      this.setCurrentPageGroup(groupIndex)
    },
    async _markChapterRead(chapter: scrapedChapters) {
      const history = useReadingHistoryStore()
      debug(`Marking C:${chapter.id} read`)
      history.pushChapterRead({ chapterId: chapter.id, type: "scraped" })
    },
    setCurrentPageGroup(groupIndex: number, router?: Router) {
      const readerMenu = useReaderMenu()
      const pageManager = useReaderPageManager()

      if (pageManager.pageState !== "loaded" ||
        groupIndex === this.currentPageGroup &&
        this.currentPageGroup !== pageManager.pageGroups.length) {
        debug("Page change to", groupIndex, "dropped", groupIndex === this.currentPageGroup ? ", no change was made" : " because there are no pages")
        return
      }

      let direction = 0
      if (groupIndex >= pageManager.pageGroups.length) direction = 1
      else if (groupIndex < 0) direction = -1

      if (!readerMenu.doAutoAdvance || !this.adjacentPopulated || direction === 0) {
        if (direction === 0) {
          debug(`Jumping to page G:${groupIndex}`)
          this.currentPageGroup = groupIndex
        }

        pageManager.pageGroups[this.currentPageGroup]?.forEach(p => p.retry())

        if (groupIndex > pageManager.pageGroups.length - 1 - PRELOAD_THRESHOLD) {
          this._preloadNextChapter()
        }

        this._updateUrl();
        return;
      }

      if (router && this.adjacentPopulated) {
        const onSwitchComplete = (success: boolean) => {
          if (success) this._updateUrl()
          else if (!success && !this.skipWarning) {
            debug("Returning to manga")
            router.push(this.chapterMeta.mangaLink)
          }
        }

        if (direction === -1) {
          debug("Jumping to prev chapter")
          this.switchChapter(this.chapterMeta.prevChapter?.id, true, true).then(onSwitchComplete)
        } else if (direction === 1) {
          debug("Jumping to next chapter")
          this.currentPageGroup = pageManager.pageGroups.length - 1
          this.switchChapter(this.chapterMeta.nextChapter?.id, true, true).then(onSwitchComplete)
        }
      }
    },
    incrementPageGroup(step: number, router?: Router, useLTR: boolean = false) {
      const direction = useLTR || useReaderMenu().readStyle === ReadStyleEnum.LTR ? 1 : -1
      this.setCurrentPageGroup(this.currentPageGroup + step * direction, router)
    },
    setIsClickFromPage(bool: boolean) {
      this.isClickFromPage = bool
    },
    closeSkipWarning() {
      this.skipWarning = false
    },
    setScrolling(bool: boolean) {
      this.scrolling = bool
    },
    setCurrentProgress(progress: number) {
      if (progress > PROGRESS_PRELOAD_THRESHOLD) this._preloadNextChapter()
      this.currentProgress = progress
    },
    setScrollbarOffset(offset: number) {
      this.scrollbarOffset = offset
    },
    setImmersive(bool: boolean) {
      if (bool) {
        useReaderMenu().setMenuOpen(false)
      } else {
        this.setImmersionBreak(false)
      }
      this.immersive = bool
    },
    toggleImmersive() {
      this.setImmersive(!this.immersive)
    },
    setImmersionBreak(bool: boolean) {
      if (this.immersionBreakTimeout) clearTimeout(this.immersionBreakTimeout)
      this._immersionBreak = bool
    },
    toggleImmersionBreak() {
      this.setImmersionBreak(!this._immersionBreak)
    },
    showImagePage(pageGroup: number) {
      const readerMenu = useReaderMenu()
      return readerMenu.viewStyle === ViewStyleEnum.LongStrip || 
      readerMenu.viewStyle === ViewStyleEnum.WideStrip ||
      pageGroup === this.currentPageGroup
    },
    setCommentsOpen(bool: boolean) {
      this.commentsOpen = bool
    },
    closeContentWarning() {
      this.showContentWarning = false
    },
    setGreyScale(bool: boolean) {
      this.greyscale = bool
    },
    setAtTop(bool: boolean) {
      this.atTop = bool
    }

  },
  getters: {
    immersionBreak(): boolean {
      return this.immersive && this._immersionBreak
    },
    chapterState() {
      if (!this.currentChapter && !this.chapterLoadError) return "waiting"
      if (this.chapterLoadError?.status === 404 && this.serverLoadError.status === 404) {
        return "error404"
      }
      if (this.chapterLoadError?.status === 404 && useReaderPageManager().imageData) {
        return "pgonly"
      }

      if (this.chapterLoadError) return "error"
      return "loaded"
    },
    currentPageNumber() {
      const pageManager = useReaderPageManager()
      let page = 0
      for (let n = 0; n < this.currentPageGroup; n++) {
        const group = pageManager.pageGroups[n]
        if (!group) {
          page--
          break
        }
        page += group.length
      }
      return page + 1
    }
  }
})