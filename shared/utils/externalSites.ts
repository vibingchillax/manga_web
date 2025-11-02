export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return url;
  }
}

export function matchDomains(...domains: string[]): RegExp {
  const escaped = domains.map((d) => d.replace(/\./g, "\\."));
  return new RegExp(
    `https?:\\/\\/(?:www\\.)?(?:${escaped.join("|")})[\\/\\w-]*`,
    "i",
  );
}

const FAVICONS: Record<string, string> = {
  //todo
};

export function getFavicon(domain: string): string {
  return FAVICONS[domain.toLowerCase()] || "i-lucide-circle-question-mark";
}

export enum ExternalSiteCode {
  AMAZON = "amz",
  ANILIST = "al",
  ANIMEPLANET = "ap",
  BOOKWALKER = "bw",
  CDJAPAN = "cdj",
  EBOOKJAPAN = "ebj",
  OFFICIAL_ENGLISH = "engtl",
  KITSU = "kt",
  MANGAUPDATES = "mu",
  MYANIMELIST = "mal",
  NOVELUPDATES = "nu",
  OFFICIAL_RAW = "raw",
  DISCORD = "discord",
  TWITTER = "twitter",
  NAMICOMI = "namicomi",
  PIXIV = "pixiv",
  MELONBOOK = "melonBook",
  FANBOX = "fanBox",
  BOOTH = "booth",
  NICOVIDEO = "nicoVideo",
  SKEB = "skeb",
  FANTIA = "fantia",
  TUMBLR = "tumblr",
  YOUTUBE = "youtube",
  NAVER = "naver",
  WEIBO = "weibo",
  WEBSITE = "website",
  BLINKTOON = "bt",
  CRUNCHYROLL = "cr",
}

export interface ExternalSite {
  name: string;
  icon: string;
  apiCode: string;
  matcher: RegExp;
  placeholder?: string;
  getData: (url: string) => string;
  constructUrl: (id: string) => string;
}

export function createExternalSite(
  name: string,
  apiCode: string,
  domains: string | string[] = [],
  icon?: string,
  placeholder = "Paste full link",
  getData: (url: string) => string = (s) => s,
  constructUrl: (id: string) => string = (s) => sanitizeUrl(s),
): ExternalSite {
  let matcher: RegExp = /.*/;
  let resolvedIcon = "";

  if (Array.isArray(domains) && domains.length > 0) {
    matcher = matchDomains(...domains);
    resolvedIcon =
      getFavicon(domains[0]!) ||
      getFavicon("www." + domains[0]) ||
      "i-lucide-circle-question-mark";
  } else if (typeof domains === "string" && domains) {
    matcher = matchDomains(domains);
    resolvedIcon =
      getFavicon(domains) ||
      getFavicon("www." + domains) ||
      "i-lucide-circle-question-mark";
  }

  return {
    name,
    icon: icon || resolvedIcon || name,
    apiCode,
    matcher,
    placeholder,
    getData,
    constructUrl,
  };
}

export const EXTERNAL_SITES: ExternalSite[] = [
  {
    name: "Kitsu",
    icon: "brandKitsu",
    apiCode: "kt",
    matcher: /https?:\/\/kitsu\.app\/manga\/[\w-]+/,
    getData: (url) =>
      /https?:\/\/kitsu\.app\/manga\/([\w-]+)/.exec(url)?.[1] ?? url,
    constructUrl: (id) => `https://kitsu.app/manga/${id}`,
  },
  {
    name: "AniList",
    icon: "brandAnilist",
    apiCode: "al",
    matcher: /https?:\/\/anilist\.co\/manga\/\d+/,
    getData: (url) =>
      /https?:\/\/anilist\.co\/manga\/(\d+)/.exec(url)?.[1] ?? url,
    constructUrl: (id) => `https://anilist.co/manga/${id}`,
  },
  {
    name: "Anime-Planet",
    icon: "brandAnimePlanet",
    apiCode: "ap",
    matcher: /https?:\/\/www\.anime-planet\.com\/manga\/[\w-]+/,
    getData: (url) =>
      /https?:\/\/www\.anime-planet\.com\/manga\/([\w-]+)/.exec(url)?.[1] ??
      url,
    constructUrl: (id) => `https://www.anime-planet.com/manga/${id}`,
  },
  {
    name: "MangaUpdates",
    icon: "brandMangaUpdates",
    apiCode: "mu",
    matcher: /^https?:\/\/www\.mangaupdates\.com\/series(.html\?id=|\/)(\w+)/,
    getData: (url) =>
      /^https?:\/\/www\.mangaupdates\.com\/series(.html\?id=|\/)(\w+)/.exec(
        url,
      )?.[2] ?? url,
    constructUrl: (id) =>
      /^\d+$/.test(id)
        ? `https://www.mangaupdates.com/series.html?id=${id}`
        : `https://www.mangaupdates.com/series/${id}`,
  },
  {
    name: "NovelUpdates",
    icon: "brandNovelUpdates",
    apiCode: "nu",
    matcher: /https?:\/\/www\.novelupdates\.com\/series\/[\w-]+/,
    getData: (url) =>
      /https?:\/\/www\.novelupdates\.com\/series\/([\w-]+)/.exec(url)?.[1] ??
      url,
    constructUrl: (id) => `https://www.novelupdates.com/series/${id}`,
  },
  {
    name: "MyAnimeList",
    icon: "brandMyAnimeList",
    apiCode: "mal",
    matcher: /https?:\/\/myanimelist\.net\/manga\/\d+/,
    getData: (url) =>
      /https?:\/\/myanimelist\.net\/manga\/(\d+)/.exec(url)?.[1] ?? url,
    constructUrl: (id) => `https://myanimelist.net/manga/${id}`,
  },
  {
    name: "Book☆Walker",
    icon: "brandBookwalker",
    apiCode: "bw",
    matcher: /https?:\/\/(?:global\.)?bookwalker\.jp\/(?:series\/)?.+/,
    getData: (url) =>
      /https?:\/\/(?:global\.)?bookwalker\.jp\/((?:series\/)?.+)/
        .exec(url)?.[1]
        ?.replace(/\/$/, "") ?? url,
    constructUrl: (id) => `https://bookwalker.jp/${id}`,
  },

  createExternalSite(
    "Amazon",
    "amz",
    ["amazon.com", "amazon.co.jp", "amazon.cn"],
    "brandAmazon",
  ),
  createExternalSite(
    "eBookJapan",
    "ebj",
    "ebookjapan.yahoo.co.jp",
    "brandEBookJapan",
  ),
  createExternalSite("CDJapan", "cdj", "cdjapan.co.jp", "brandCdJapan"),
  createExternalSite("Twitter", "twitter", "twitter.com"),
  createExternalSite("Discord", "discord", "discord.gg"),
  createExternalSite("NamiComi", "namicomi", "namicomi.com"),
  createExternalSite("Pixiv", "pixiv", "pixiv.net"),
  createExternalSite("Fanbox", "fanBox", "fanbox.cc"),
  createExternalSite("Booth", "booth", "booth.pm"),
  createExternalSite("Skeb", "skeb", "skeb.jp"),
  createExternalSite("Fantia", "fantia", "fantia.jp"),
  createExternalSite("Melonbooks", "melonBook", "melonbooks.co.jp"),
  createExternalSite(
    "Nico Nico",
    "nicoVideo",
    "nicovideo.jp",
    "faviconSeigaNicovideoJp",
  ),
  createExternalSite("Tumblr", "tumblr", "tumblr.com"),
  createExternalSite("Naver", "naver", "blog.naver.com"),
  createExternalSite("Weibo", "weibo", ["m.weibo.cn", "weibo.com"]),
  createExternalSite("Website", "website", [], "globe"),
  createExternalSite("Official Raw", "raw", [], "kanji"),
  createExternalSite("Official English", "engtl", [], "latin"),
  createExternalSite("BlinkToon", "bt"),
  createExternalSite("Crunchyroll", "cr", [], "crunchyroll"),
  createExternalSite("YouTube", "youtube", "youtube.com", "youtube"),
];

export const BOOK_STORES = EXTERNAL_SITES.filter((s) =>
  ["amz", "bw", "ebj", "cdj"].includes(s.apiCode),
);
export const STREAMING_SITES = EXTERNAL_SITES.filter((s) =>
  ["bt", "cr", "youtube"].includes(s.apiCode),
);
export const TRACKING_SITES = EXTERNAL_SITES.filter((s) =>
  ["al", "ap", "mal", "mu", "nu", "kt"].includes(s.apiCode),
);
export const OFFICIAL_SOURCES = EXTERNAL_SITES.filter((s) =>
  ["raw", "engtl"].includes(s.apiCode),
);
export const SOCIAL_LINKS = EXTERNAL_SITES.filter((s) =>
  [
    "namicomi",
    "twitter",
    "pixiv",
    "melonBook",
    "fanBox",
    "booth",
    "nicoVideo",
    "skeb",
    "fantia",
    "tumblr",
    "youtube",
    "naver",
    "weibo",
    "website",
  ].includes(s.apiCode),
);
