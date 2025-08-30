const viewStyles = [
  { name: "Single Page", icon: "page" },
  { name: "Double Page", icon: "bookOpen" },
  { name: "Long Strip", icon: "longStrip" },
  { name: "Wide Strip", icon: "wideStrip" },
];

const readStyles = [
  { name: "Left To Right", icon: "arrowRightCircle" },
  { name: "Right To Left", icon: "arrowLeftCircle" },
];

const sizeModes = [
  [
    { name: "No Limit", icon: "cancel" },
    { name: "Fit Height", icon: "arrowUpDown" },
  ],
  [
    { name: "Fit Width", icon: "arrowLeftRight" },
    { name: "Fit Both", icon: "arrowExpandAll" },
  ],
];

const headerStyles = [
  { name: "Header Hidden", icon: "headerHidden" },
  { name: "Header Shown", icon: "header" },
];

const progressModes = [
  { name: "Progress Hidden", icon: "progressHidden" },
  { name: "Progress Lightbar", icon: "progressLightbar" },
  { name: "Normal Progress", icon: "progressNormal" },
];

const progressSides = [
  { name: "Bottom", icon: "chevronUp" },
  { name: "Left", icon: "chevronRight" },
  { name: "Right", icon: "chevronLeft" },
];

const cursorHints = [
  { name: "None", icon: "cancel" },
  { name: "Overlay", icon: "overlay" },
  { name: "Cursor", icon: "mousePointer" },
];

const defaultKeys = {
  toggleMenu: ["KeyM:0"],
  pageForward: ["ArrowRight:0", "KeyD:0", "Numpad6:0"],
  pageBackward: ["ArrowLeft:0", "KeyA:0", "Numpad4:0"],
  scrollUp: ["KeyW:0", "Numpad8:0"],
  scrollDown: ["KeyS:0", "Numpad2:0"],
  chapterForward: ["Period:0"],
  chapterBackward: ["Comma:0"],
  immersiveMode: ["KeyF:0"],
  switchSizeMode: ["KeyI:0"],
  offsetSpread: ["KeyO:0"],
};

const defaultScrollLock = { width: true, height: true, none: true };
const defaultLongStripMargin = 4;

export const settings = {
  viewStyle: viewStyles,
  readStyle: readStyles,
  sizeMode: sizeModes,
  headerStyle: headerStyles,
  progressMode: progressModes,
  progressSide: progressSides,
  cursorHint: cursorHints,
}

const stateKeyMap = {
  viewStyle: "_viewStyle",
  readStyle: "readStyle",
  headerStyle: "headerStyle",
  progressMode: "_progressMode",
  progressSide: "_progressSide",
  cursorHint: "cursorHint",
} as const;

export enum ViewStyleEnum { SinglePage, DoublePage, LongStrip, WideStrip }
export enum ReadStyleEnum { LTR, RTL }
export enum HeaderStyleEnum { Hidden, Shown }
export enum ProgressModeEnum { None, LightBar, Normal }
export enum ProgressSideEnum { Bottom, Left, Right }
export enum CursorHintsEnum { None, Overlay, Cursor }
export enum TurnPagesEnum { Directional, None }
export enum TurnPagesByScrollingEnum { Disabled, Enabled }
export enum HistoryModeEnum { Both, ChaptersOnly, PagesOnly }

// --- State Interface ---
export interface ReaderMenuState {
  readStyle: ReadStyleEnum;
  headerStyle: HeaderStyleEnum;
  _viewStyle: ViewStyleEnum;
  _limitWidth: boolean;
  _limitHeight: boolean;
  _scrollLock: typeof defaultScrollLock;
  _longStripMargin: number;
  maxWidth: number;
  maxHeight: number;
  limitMaxWidth: boolean;
  limitMaxHeight: boolean;
  dimPages: boolean;
  dimWithDark: boolean;
  pageDim: number;
  progressHeight: number;
  _progressMode: ProgressModeEnum;
  _progressSide: ProgressSideEnum;
  backgroundColor: string;
  cursorHints: CursorHintsEnum;
  doAutoAdvance: number;
  _growPages: boolean;
  historyMode: HistoryModeEnum;
  immersiveTap: number;
  keys: typeof defaultKeys;
  lockOffset: number;
  showPageNumber: boolean;
  turnPages: TurnPagesEnum;
  turnPagesByScrolling: TurnPagesByScrollingEnum;
  hasImmersiveBefore: boolean;
  _showMenuButton: boolean;
  menuOpen: boolean;
  menuPinned: boolean;
  offsetDoubles: Record<string, boolean>;
}

export const useReaderMenu = defineStore("readerMenu", {
  state: (): ReaderMenuState => ({
    readStyle: ReadStyleEnum.LTR,
    headerStyle: HeaderStyleEnum.Hidden,
    _viewStyle: ViewStyleEnum.SinglePage,
    _limitWidth: true,
    _limitHeight: true,
    _scrollLock: defaultScrollLock,
    _longStripMargin: defaultLongStripMargin,
    maxWidth: -1,
    maxHeight: -1,
    limitMaxWidth: false,
    limitMaxHeight: false,
    dimPages: false,
    dimWithDark: false,
    pageDim: 0.2,
    progressHeight: 4,
    _progressMode: ProgressModeEnum.Normal,
    _progressSide: ProgressSideEnum.Bottom,
    backgroundColor: "transparent",
    cursorHints: CursorHintsEnum.None,
    doAutoAdvance: 1,
    _growPages: false,
    historyMode: HistoryModeEnum.Both,
    immersiveTap: 1,
    keys: defaultKeys,
    lockOffset: 0,
    showPageNumber: false,
    turnPages: TurnPagesEnum.Directional,
    turnPagesByScrolling: TurnPagesByScrollingEnum.Disabled,
    hasImmersiveBefore: false,
    _showMenuButton: true,
    menuOpen: false,
    menuPinned: false,
    offsetDoubles: {},
  }),

  actions: {
    switchStyles(styleKey: keyof typeof settings) {
      const key = styleKey === "viewStyle" ? "_viewStyle" : styleKey;
      (this as any)[key] = ((this as any)[key] + 1) % settings[styleKey].length; //bruh
    },
    setStyle({
      style,
      value
    }: {
      style: string
      value: ViewStyleEnum | ReadStyleEnum | HeaderStyleEnum | ProgressModeEnum | ProgressSideEnum | CursorHintsEnum | TurnPagesEnum | TurnPagesByScrollingEnum | HistoryModeEnum
    }) {
      const key = style === "viewStyle" ? "_viewStyle" : style;
      (this as any)[key] = value; //temp
    },
    switchSizeMode() {
      this._limitWidth && (this._limitHeight = !this._limitHeight);
      this._limitWidth = !this._limitWidth;
    },
    setLimitWidth(val: boolean) { this._limitWidth = val; },
    setLimitHeight(val: boolean) { this._limitHeight = val; },
    setGrowPages(val: boolean) { this._growPages = val; },
    setLock({ style, value }: { style: keyof typeof defaultScrollLock; value: boolean }) {
      this._scrollLock[style] = value;
    },
    resetLock() { this._scrollLock = defaultScrollLock; },
    setMaxWidth(val: number) { this.maxWidth = val; },
    setMaxHeight(val: number) { this.maxHeight = val; },
    setLimitMaxWidth(val: boolean) { this.limitMaxWidth = val; },
    setLimitMaxHeight(val: boolean) { this.limitMaxHeight = val; },
    setAutoAdvance(val: number) { this.doAutoAdvance = val; },
    setHistoryMode(val: HistoryModeEnum) { this.historyMode = val; },
    setLockOffset(val: number) { this.lockOffset = val; },
    setLongStripMargin(val: number) { this._longStripMargin = Math.max(0, val); },
    setKeybindings(bindings: Partial<typeof defaultKeys>) {
      this.keys = { ...this.keys, ...bindings };
    },
    setOffsetDoubles([key, val]: [string, boolean]) {
      const clone = { ...this.offsetDoubles };
      val ? (clone[key] = true) : delete clone[key];
      this.offsetDoubles = clone;
    },
    setHasImmersiveBefore() {
      this.hasImmersiveBefore = true
    },
    setBackgroundColor(color: string) {
      this.backgroundColor = color;
    },
    setMenuPinned(val: boolean) { this.menuPinned = val; },
    setTurnPages(val: TurnPagesEnum) { this.turnPages = val; },
    setTurnPagesByScrolling(val: TurnPagesByScrollingEnum) { this.turnPagesByScrolling = val; },
    setCursorHints(val: CursorHintsEnum) { this.cursorHints = val; },
    setImmersiveTap(val: number) { this.immersiveTap = val; },
    setMenuOpen(val: boolean) { this.menuOpen = val; },
    toggleMenuOpen() { this.menuOpen = !this.menuOpen; },
    setShowMenuButton(val: boolean) { this._showMenuButton = val; },
    setShowPageNumber(val: boolean) { this.showPageNumber = val; },
    setDimPages(val: boolean) { this.dimPages = val; },
    setDimWithDark(val: boolean) { this.dimWithDark = val; },
    setPageDim(val: number) { this.pageDim = val; },
    setProgressMode(mode: ProgressModeEnum) { this._progressMode = mode; },
    switchProgressMode() {
      switch (this.progressMode) {
        case ProgressModeEnum.LightBar:
          this._progressMode = ProgressModeEnum.Normal
          break
        case ProgressModeEnum.Normal:
          this._progressMode = ProgressModeEnum.None
          break
        default:
          this._progressMode = ProgressModeEnum.LightBar
          break
      }
    },
    setProgressSide(side: ProgressSideEnum) { this._progressSide = side; },
    setProgressHeight(height: number) { this.progressHeight = height; },
    setViewStyle(val: ViewStyleEnum) { this._viewStyle = val; },
  },

  getters: {
    readStyleLabel: (state) => readStyles[state.readStyle],
    viewStyleLabel: (state) => viewStyles[state._viewStyle],
    headerStyleLabel: (state) => headerStyles[state.headerStyle],
    progressSide: (state) => useNuxtApp().$isMobileApp ? ProgressSideEnum.Bottom : state._progressSide,
    progressMode: (state) => useNuxtApp().$isMobileApp ? ProgressModeEnum.None : state._progressMode,
    progressModeLabel: (state) => progressModes[state._progressMode],
    progressSideLabel: (state) => progressSides[state._progressSide],
    sizeModeLabel: (state) => settings.sizeMode[+state._limitWidth]?.[+state._limitHeight],
    viewStyle: (state) => state._viewStyle,
    limitWidth: (state) => state._limitWidth,
    limitHeight: (state) => state._limitHeight,
    longStripMargin: (state) => state._longStripMargin,
    scrollLock: (state) => state._scrollLock,
    shouldAutoScroll() {
      this.scrollLock.width && this.limitWidth || this.scrollLock.height && this.limitHeight || this.scrollLock.none && !(this.limitHeight || this.limitWidth) || this.viewStyle === ViewStyleEnum.LongStrip || this.viewStyle === ViewStyleEnum.WideStrip
    },
    growPages: (state) => state._growPages && (state._limitWidth || state._limitHeight),
    maxWidthPixels(state) {
      if (state.limitMaxWidth) return `${state.maxWidth}px`
    },
    maxHeightPixels(state) {
      if (state.limitMaxHeight) return `${state.maxHeight}px`
    },
    navbarHoverMode(state) {
      return state.headerStyle === HeaderStyleEnum.Hidden && state.menuPinned
    },
    squeezeNavbar(state) {
      return state.menuOpen && (state.headerStyle === HeaderStyleEnum.Shown || state.menuPinned)
    },
    showMenuButton(state) {
      return state.menuPinned && !state.menuOpen && state.headerStyle === HeaderStyleEnum.Hidden && state._showMenuButton
    },
    keyBindingToActions(state) {
      return
    }
  },

  persist: {
    storage: localStorage
  },
});
