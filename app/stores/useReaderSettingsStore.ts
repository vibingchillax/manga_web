export interface ReaderSettings {
  pageDisplayStyle: "singlePage" | "doublePage" | "longStrip" | "wideStrip";
  imageFit: "fitWidth" | "fitHeight" | "fitBoth" | "noLimit";
  readingDirection: "ltr" | "rtl";
  headerVisibility: boolean;
  progressBarStyle: "hidden" | "lightbar" | "normal";
  progressBarPosition: "bottom" | "left" | "right";
  progressBarSize: number;
  cursorActionHints: "none" | "overlay" | "cursor";
  autoAdvance: boolean;
}

export const useReaderSettingsStore = defineStore("readerSettings", {
  state: (): { settings: ReaderSettings } => ({
    settings: {
      pageDisplayStyle: "singlePage",
      imageFit: "fitWidth",
      readingDirection: "ltr",
      headerVisibility: true,
      progressBarStyle: "normal",
      progressBarPosition: "bottom",
      progressBarSize: 4,
      cursorActionHints: "overlay",
      autoAdvance: true,
    },
  }),

  getters: {
    pageDisplayStyle: (state) => state.settings.pageDisplayStyle,
    imageFit: (state) => state.settings.imageFit,
    readingDirection: (state) => state.settings.readingDirection,
    headerVisibility: (state) => state.settings.headerVisibility,
    progressBarStyle: (state) => state.settings.progressBarStyle,
    progressBarPosition: (state) => state.settings.progressBarPosition,
    progressBarSize: (state) => state.settings.progressBarSize,
    cursorActionHints: (state) => state.settings.cursorActionHints,
    autoAdvance: (state) => state.settings.autoAdvance,
  },

  actions: {
    setPageDisplayStyle(style: ReaderSettings["pageDisplayStyle"]) {
      this.settings.pageDisplayStyle = style;
    },
    setImageFit(fit: ReaderSettings["imageFit"]) {
      this.settings.imageFit = fit;
    },
    setReadingDirection(dir: ReaderSettings["readingDirection"]) {
      this.settings.readingDirection = dir;
    },
    setHeaderVisibility(visible: boolean) {
      this.settings.headerVisibility = visible;
    },
    setProgressBarStyle(style: ReaderSettings["progressBarStyle"]) {
      this.settings.progressBarStyle = style;
    },
    setProgressBarPosition(pos: ReaderSettings["progressBarPosition"]) {
      this.settings.progressBarPosition = pos;
    },
    setProgressBarSize(size: number) {
      this.settings.progressBarSize = size;
    },
    setCursorActionHints(hint: ReaderSettings["cursorActionHints"]) {
      this.settings.cursorActionHints = hint;
    },
    setAutoAdvance(value: boolean) {
      this.settings.autoAdvance = value;
    },
  },

  persist: {
    storage: localStorage
  },
});
