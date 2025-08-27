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
  state: (): ReaderSettings => ({
    pageDisplayStyle: "singlePage",
    imageFit: "fitWidth",
    readingDirection: "ltr",
    headerVisibility: true,
    progressBarStyle: "normal",
    progressBarPosition: "bottom",
    progressBarSize: 4,
    cursorActionHints: "overlay",
    autoAdvance: true,
  }),

  persist: {
    storage: localStorage
  },
});
