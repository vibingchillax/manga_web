interface UserPreferences {
  excludedTags: string[];
  filteredLanguages: string[];
  originLanguages: string[];
  paginationCount: number;
  listMultiplier: number;
  showSafe: boolean;
  showSuggestive: boolean;
  showErotic: boolean;
  showHentai: boolean;
  groupBlacklist: string[];
  userBlacklist: string[];
  proxyUrl: string;
  gatewayUrl: string;
  gatewayUrls: string[];
}

export const usePreferencesStore = defineStore("userPreferences", {
  state: (): UserPreferences => ({
    excludedTags: [],
    filteredLanguages: [],
    originLanguages: [],
    paginationCount: 32,
    listMultiplier: 3,
    showSafe: true,
    showSuggestive: true,
    showErotic: true,
    showHentai: false,
    groupBlacklist: [],
    userBlacklist: [],
    proxyUrl: useAppConfig().proxyUrl,
    gatewayUrl: useAppConfig().kuboGatewayUrl,
    gatewayUrls: [useAppConfig().kuboGatewayUrl, "https://ipfs.io/ipfs"],
  }),
  persist: {
    storage: localStorage,
  },
  getters: {
    contentRating(): ("safe" | "suggestive" | "erotica" | "pornographic")[] {
      const ratings: ("safe" | "suggestive" | "erotica" | "pornographic")[] =
        [];
      if (this.showSafe) ratings.push("safe");
      if (this.showSuggestive) ratings.push("suggestive");
      if (this.showErotic) ratings.push("erotica");
      if (this.showHentai) ratings.push("pornographic");
      return ratings;
    },
  },
});
