interface Layout {
  menuActive: boolean;
  navbarFloating: boolean;
  showMOTD: boolean;
}

export const useLayout = defineStore("layout", {
  state: (): Layout => ({
    menuActive: true,
    navbarFloating: true,
    showMOTD: true,
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
