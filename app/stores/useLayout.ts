interface Layout {
  menuActive: boolean;
  navbarFloating: boolean;
  showMOTD: boolean;
  oneRowChapters: boolean;
}

export const useLayout = defineStore("layout", {
  state: (): Layout => ({
    menuActive: true,
    navbarFloating: true,
    showMOTD: true,
    oneRowChapters: false,
  }),
  actions: {
    setMenu(bool: boolean) {
      this.menuActive = bool;
    },
    setMOTD(bool: boolean) {
      this.showMOTD = bool;
    },
  },
});
