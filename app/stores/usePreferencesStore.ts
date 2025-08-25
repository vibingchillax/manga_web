interface UserPreferences {
  excludedTags: string[]
  filteredLanguages: string[]
  originLanguages: string[]
  showSafe: boolean
  showSuggestive: boolean
  showErotic: boolean
  showHentai: boolean
}

export const usePreferencesStore = defineStore('userPreferences', {
  state: (): UserPreferences => ({
    excludedTags: [],
    filteredLanguages: ["en"],
    originLanguages: [],
    showSafe: true,
    showSuggestive: true,
    showErotic: true,
    showHentai: true
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