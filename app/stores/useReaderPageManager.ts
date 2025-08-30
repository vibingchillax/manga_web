import { getImageData } from "~/utils/getImageData";
import { ReadStyleEnum, ViewStyleEnum } from "./useReaderMenu";

function debug(...e: any[]) {
  console.debug("%c[Reader Page Manager]", "color: #5a6", ...arguments)
}

async function fetchImage(
  url: string,
  controller?: AbortController,
  abortList?: AbortController[]
) {
  try {
    const start = Date.now();
    const blob = await $fetch<Blob>(url, {
      signal: controller?.signal,
      responseType: "blob"
    })

    abortList?.forEach((c) => c.abort());
    const duration = Date.now() - start;
    return blob
  } catch {
    return null;
  }
}

async function tryLoadImage(
  image: ManagedImage,
  controller: AbortController,
  abortList?: AbortController[]
): Promise<Blob | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (controller.signal.aborted) return null;
    const result = await fetchImage(image.pageSrc, controller, abortList);
    if (result) return result;
  }
  return null;
}

const loadImage = async (image: ManagedImage): Promise<Blob | null> => {
  const abort = new AbortController()
  const blob = await tryLoadImage(image, abort)
  return blob
}

interface FetchErrorItem {
  id: string;
  title: string;
  status: number;
  detail: string;
  faked?: boolean;
}

interface FetchError {
  result: string;
  errors: FetchErrorItem[];
}

interface ImageData {
  chapterId: string;
  data: string[];
  requestedAt: number;
}

export interface ManagedImage {
  fetching: boolean;
  loaded: boolean;
  blobUrl: string | null;
  spread: boolean;
  pageNum: string;
  pageSrc: string;
  w: number;
  h: number;
  destroy: () => void;
  retry: () => void | boolean;
  load: () => boolean;
}

interface ReaderPageManagerState {
  imageData: ImageData | null;
  nextImageData: ImageData | null;
  preloading: boolean;
  pages: ManagedImage[];
  expired: boolean;
  lastFetchTime: number;
  fetchError: FetchError | null;
  _loadQueue: ManagedImage[];
}

export const loadTimeout = 1e3 * 60 * 4
export const maxQueue = 5
export const preloadAhead = 4
export const preloadBehind = 2

export const useReaderPageManager = defineStore("readerPageManager", {
  state: (): ReaderPageManagerState => ({
    imageData: null,
    nextImageData: null,
    preloading: false,
    pages: [],
    expired: false,
    lastFetchTime: 0,
    fetchError: null,
    _loadQueue: [],
  }),
  actions: {
    reset() {
      this.evictPages();
      this.$reset();
    },
    evictPages() {
      this.pages.forEach((p) => p.destroy());
      this.pages = [];
    },
    async loadImagesFromId(chapterId: string) {
      if (this.fetchError) this.fetchError = null;

      if (this.imageData?.chapterId === chapterId) {
        debug("Server load ignored, requesting same chapter");
        return;
      }

      if (this.nextImageData?.chapterId === chapterId) {
        this.loadImagesFromData(this.nextImageData);
        this.nextImageData = null;
        return;
      }

      try {
        const serverData = await getImageData(chapterId);
        this.loadImagesFromData(serverData);
      } catch (err: any) {
        switch (err.status) {
          case 429:
            this.fetchError = {
              result: "error",
              errors: [
                {
                  id: "",
                  title: "",
                  status: 429,
                  detail: "Rate limit exceeded, please try again later",
                  faked: true,
                },
              ],
            };
            break;
          case 404:
            this.fetchError = {
              result: "error",
              errors: [
                {
                  id: "",
                  title: "",
                  status: 404,
                  detail: "Pages for the provided chapter don't exist",
                  faked: true,
                },
              ],
            };
            break;
          default:
            this.fetchError = err.data;
        }
      }
    },

    async preloadImageData(chapterId: string) {
      if (this.preloading || this.nextImageData?.chapterId === chapterId) {
        debug("Images already preloading/preloaded");
        return;
      }
      debug("Preloading next chapter with id", chapterId);
      this.preloading = true;
      const serverData = await getImageData(chapterId);
      // this.nextImageData = { chapterId, ...serverData };
      this.nextImageData = serverData;
      this.preloading = false;
    },

    loadImagesFromData(imageData: ImageData) {
      this.expired = false;
      this.evictPages();
      this.imageData = imageData;

      const ttl = loadTimeout + (imageData.requestedAt - Date.now());
      setTimeout(() => {
        this.expired = true;
      }, ttl);
      debug("Server loaded with ", ttl, "ms left");

      this.pages = (this.imageData.data! as string[]).map(
        (url, index) => this._constructManagedImage(url, `${index + 1}`)
      );
    },
    _constructManagedImage(url: string, pageNum: string): ManagedImage {
      const img: ManagedImage = {
        fetching: false,
        loaded: false,
        blobUrl: null,
        spread: false,
        pageNum,
        pageSrc: useProxy().proxyUrl + '/?destination=' +  url,
        w: 0,
        h: 0,
        destroy: () => {
          if (img.blobUrl) URL.revokeObjectURL(img.blobUrl);
        },
        retry: () => this._performImageFetch(img, false),
        load: () => this._performImageFetch(img) !== false,
      };
      return img;
    },

    _performImageFetch(img: ManagedImage, allowQueue: boolean = true) {
      if (img.blobUrl) {
        img.loaded = true;
        return;
      } else if ((img.loaded && allowQueue) || img.fetching) return;
      if (allowQueue && this._loadQueue.length > maxQueue) return false;

      if (!this._loadQueue.find((n) => n.pageSrc === img.pageSrc)) this._loadQueue.push(img);

      img.loaded = false;
      img.fetching = true;

      loadImage(img).then((result) => {
        img.loaded = true;
        img.fetching = false;

        if (!result) {
          debug("Failed to load image for", img.pageSrc);
          return;
        }
        // if (winner === cs.Fallback) console.log("Fallback node won the race against", img.pageSrc);

        img.blobUrl = URL.createObjectURL(result);
        const s = new Image();
        s.src = img.blobUrl;
        s.onload = () => {
          img.w = s.naturalWidth;
          img.h = s.naturalHeight;
          if (s.naturalHeight / s.naturalWidth < 1) img.spread = true;
        };
        s.remove();
      });
    },

    beginPreloadPages() {
      const currentPage = useReaderStore().currentPageNumber;
      this.pages
        .slice(Math.max(0, currentPage - 1 - preloadBehind), currentPage + preloadAhead)
        .filter((img) => !img.loaded && !img.blobUrl && !img.fetching)
        .forEach((img) => img.retry());
    },

    _pageLoaded(img: ManagedImage) {
      const { cancelStartingPageSwitch, startingPage, currentPageNumber, goToPage } = useReaderStore();

      if (useReaderMenu().viewStyle === ViewStyleEnum.LongStrip
        && !cancelStartingPageSwitch && startingPage !== 0
        && parseInt(img.pageNum) === startingPage) {
        goToPage(parseInt(img.pageNum));
      }

      this._loadQueue.splice(this._loadQueue.findIndex((i) => i.pageSrc === img.pageSrc), 1);

      if (this._loadQueue.length <= maxQueue) {
        // i dont know if the actual unminified code is like this
        for (let index = currentPageNumber - 1; index < this.pages.length; index++) {
          const nextIndex = Math.min(index + 1, this.pages.length - 1)
          const nextPage = this.pages[nextIndex]
          if (!nextPage || !nextPage.load()) return
        }
        for (let index = currentPageNumber - 1; index > 0; index--) {
          const prevIndex = Math.max(index - 1, 0)
          const prevPage = this.pages[prevIndex]
          if (!prevPage || !prevPage.load()) return
        }
      }
    },
  },
  getters: {
    pageState(state) {
      if (state.fetchError) {
        return state.fetchError.errors?.some((err) => err.status === 404) ? "error404" : "error";
      }
      if (state.imageData) {
        return state.imageData.data?.length === 0 ? "nopages" : "loaded";
      }
      return "waiting";
    },
    pageItems(): {
      text: string;
      value: number;
      loaded: (string | boolean)[];
    }[] {
      return this.pageGroups
        .filter((group) => !!group[0]?.pageNum)
        .map((group, groupIndex) => {
          const firstPage = group[0];
          const lastPage = group[group.length - 1];
          let pageRange = firstPage?.pageNum ?? "";
          let loadedPages = [firstPage?.blobUrl ?? firstPage?.loaded ?? false];

          if (group.length > 1) {
            pageRange = `${pageRange}-${lastPage?.pageNum ?? ""}`;
            loadedPages.push(group[1]?.blobUrl ?? group[1]?.loaded ?? false);
          }
          return { text: pageRange, value: groupIndex, loaded: loadedPages };
        });
    },
    pageGroups(): ManagedImage[][] {
      const extraGroups: ManagedImage[] = [];
      const settings = useReaderMenu();
      const context = useReaderStore();
      let offsetDoublePage = false;

      const mangaId = context.manga?.id ?? "no-title";

      if (mangaId) {
        offsetDoublePage = settings.offsetDoubles[mangaId] ?? false;
      }

      // If view style is not DoublePage, return each page as its own group
      if (settings.viewStyle !== ViewStyleEnum.DoublePage) {
        return this.pages.map(page => [page]).concat(extraGroups);
      }

      const groupedPages: ManagedImage[][] = [];
      let pageCounter = 0;
      const pagesPerSpread = 2;

      this.pages.forEach(page => {
        pageCounter += page.spread ? 2 : 1;

        const lastGroup = groupedPages[groupedPages.length - 1];

        const shouldStartNewGroup =
          !lastGroup ||                     // no group yet
          page.spread ||                    // current page is a spread
          pageCounter % pagesPerSpread === (offsetDoublePage ? 0 : 1) || // based on offset
          lastGroup.some((p: ManagedImage) => p.spread) ||  // last group has a spread
          lastGroup.length === pagesPerSpread; // last group already full

        if (shouldStartNewGroup) {
          groupedPages.push([page]);
        } else {
          if (settings.readStyle === ReadStyleEnum.LTR) {
            lastGroup.push(page);
          } else {
            lastGroup.unshift(page);
          }
        }
      });

      return groupedPages.concat(extraGroups);
    },
    totalPageHeight: (state) => state.pages.reduce((sum, p) => sum + p.h, 0),
    totalPageWidth: (state) => state.pages.reduce((sum, p) => sum + p.w, 0),
  },
});
