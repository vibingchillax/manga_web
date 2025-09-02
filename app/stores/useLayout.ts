interface Layout {
  menuActive: boolean
  navbarFloating: boolean
}

export const useLayout = defineStore("layout", {
  state: (): Layout => ({
    menuActive: true,
    navbarFloating: true
  })
})