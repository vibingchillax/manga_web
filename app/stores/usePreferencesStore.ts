interface UserPreferences {
  excludedTags: string[]
  filteredLanguages: string[]
  originLanguages: string[]
  showSafe: boolean
  showSuggestive: boolean
  showErotic: boolean
  showHentai: boolean
  proxyUrl: string
}

export const usePreferencesStore = defineStore('userPreferences', {
  state: (): UserPreferences => ({
    excludedTags: [],
    filteredLanguages: [],
    originLanguages: [],
    showSafe: true,
    showSuggestive: true,
    showErotic: true,
    showHentai: false,
    proxyUrl: useAppConfig().proxyUrl
  }),
  persist: {
    storage: localStorage
  },
  getters: {
    contentRating(): ("safe" | "suggestive" | "erotica" | "pornographic")[] {
      const ratings: ("safe" | "suggestive" | "erotica" | "pornographic")[] = []
      if (this.showSafe) ratings.push('safe')
      if (this.showSuggestive) ratings.push('suggestive')
      if (this.showErotic) ratings.push('erotica')
      if (this.showHentai) ratings.push('pornographic')
      return ratings;
    }
  }
})