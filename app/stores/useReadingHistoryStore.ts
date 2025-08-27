export interface ReadingHistory {
  _readingHistory: {
    chapterId: string
    time: string
  }[] | {
    titleEntry?: string
    sourceId: string
    title: string
    chapterId: string
    time: string
  }[]
}

export const useReadingHistoryStore = defineStore('readingHistory', {
  state: (): ReadingHistory => ({
    _readingHistory: []
  }),
  persist: {
    storage: localStorage
  }
})