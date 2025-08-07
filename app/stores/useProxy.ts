const defaultProxyUrl = useAppConfig().proxyUrl

export const useProxy = defineStore('proxyStore', {
  state: () => ({
    proxyUrl: defaultProxyUrl
  }),
  actions: {
    async setProxy(proxyUrl: string) {
      this.proxyUrl = proxyUrl
    },
    async reset() {
      this.proxyUrl = defaultProxyUrl
    }
  }
})