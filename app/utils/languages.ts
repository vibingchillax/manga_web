export interface Language {
  code: string;
  name: {
    inLocale: string;
    inEnglish: string;
  };
  display: {
    flag: string;
    script?: string;
  };
}

export const LANGUAGES: Language[] = [
  {
    code: "ar",
    name: {
      inLocale: "العربية",
      inEnglish: "Arabic",
    },
    display: {
      flag: "sa",
    },
  },
  {
    code: "af",
    name: {
      inLocale: "Afrikaans",
      inEnglish: "Afrikaans",
    },
    display: {
      flag: "za",
    },
  },
  {
    code: "az",
    name: {
      inLocale: "Azərbaycan Dili",
      inEnglish: "Azerbaijani",
    },
    display: {
      flag: "az",
    },
  },
  {
    code: "be",
    name: {
      inLocale: "беларуская мова",
      inEnglish: "Belarusian",
    },
    display: {
      flag: "by",
    },
  },
  {
    code: "bg",
    name: {
      inLocale: "български",
      inEnglish: "Bulgarian",
    },
    display: {
      flag: "bg",
    },
  },
  {
    code: "bn",
    name: {
      inLocale: "বাংলা",
      inEnglish: "Bengali",
    },
    display: {
      flag: "bd",
    },
  },
  {
    code: "ca",
    name: {
      inLocale: "Català",
      inEnglish: "Catalan",
    },
    display: {
      flag: "ad",
    },
  },
  {
    code: "cs",
    name: {
      inLocale: "Čeština",
      inEnglish: "Czech",
    },
    display: {
      flag: "cz",
    },
  },
  {
    code: "cv",
    name: {
      inLocale: "Çăvašla",
      inEnglish: "Chuvash",
    },
    display: {
      flag: "ru-cu",
    },
  },
  {
    code: "da",
    name: {
      inLocale: "Dansk",
      inEnglish: "Danish",
    },
    display: {
      flag: "dk",
    },
  },
  {
    code: "de",
    name: {
      inLocale: "Deutsche",
      inEnglish: "German",
    },
    display: {
      flag: "de",
    },
  },
  {
    code: "el",
    name: {
      inLocale: "ελληνικά",
      inEnglish: "Greek",
    },
    display: {
      flag: "gr",
    },
  },
  {
    code: "en",
    name: {
      inLocale: "English",
      inEnglish: "English",
    },
    display: {
      flag: "gb",
    },
  },
  {
    code: "eo",
    name: {
      inLocale: "Esperanto",
      inEnglish: "Esperanto",
    },
    display: {
      flag: "eo",
    },
  },
  {
    code: "es",
    name: {
      inLocale: "Español",
      inEnglish: "Spanish",
    },
    display: {
      flag: "es",
    },
  },
  {
    code: "es-la",
    name: {
      inLocale: "Español (LATAM)",
      inEnglish: "Spanish (LATAM)",
    },
    display: {
      flag: "mx",
    },
  },
  {
    code: "et",
    name: {
      inLocale: "Eesti keel",
      inEnglish: "Estonian",
    },
    display: {
      flag: "et",
    },
  },
  {
    code: "eu",
    name: {
      inLocale: "Euskara",
      inEnglish: "Basque",
    },
    display: {
      flag: "eu",
    },
  },
  {
    code: "fa",
    name: {
      inLocale: "فارسی",
      inEnglish: "Persian",
    },
    display: {
      flag: "ir",
    },
  },
  {
    code: "fi",
    name: {
      inLocale: "Suomi",
      inEnglish: "Finnish",
    },
    display: {
      flag: "fi",
    },
  },
  {
    code: "fr",
    name: {
      inLocale: "Français",
      inEnglish: "French",
    },
    display: {
      flag: "fr",
    },
  },
  {
    code: "ga",
    name: {
      inLocale: "Gaeilge",
      inEnglish: "Irish",
    },
    display: {
      flag: "ie",
    },
  },
  {
    code: "he",
    name: {
      inLocale: "עִבְרִית",
      inEnglish: "Hebrew",
    },
    display: {
      flag: "il",
    },
  },
  {
    code: "hi",
    name: {
      inLocale: "हिन्दी",
      inEnglish: "Hindi",
    },
    display: {
      flag: "in",
    },
  },
  {
    code: "hr",
    name: {
      inLocale: "Hrvatski",
      inEnglish: "Croatian",
    },
    display: {
      flag: "hr",
    },
  },
  {
    code: "id",
    name: {
      inLocale: "Indonesia",
      inEnglish: "Indonesian",
    },
    display: {
      flag: "id",
    },
  },
  {
    code: "it",
    name: {
      inLocale: "Italiano",
      inEnglish: "Italian",
    },
    display: {
      flag: "it",
    },
  },
  {
    code: "ja",
    name: {
      inLocale: "日本語",
      inEnglish: "Japanese",
    },
    display: {
      flag: "jp",
      script: "kanji",
    },
  },
  {
    code: "ja-ro",
    name: {
      inLocale: "ローマ字",
      inEnglish: "Japanese (Romanized)",
    },
    display: {
      flag: "jp",
      script: "latin",
    },
  },
  {
    code: "jv",
    name: {
      inLocale: "båså Jåwå",
      inEnglish: "Javanese",
    },
    display: {
      flag: "id",
    },
  },
  {
    code: "ka",
    name: {
      inLocale: "ქართული ენა",
      inEnglish: "Georgian",
    },
    display: {
      flag: "ka",
    },
  },
  {
    code: "ko",
    name: {
      inLocale: "한국어",
      inEnglish: "Korean",
    },
    display: {
      flag: "kr",
      script: "kanji",
    },
  },
  {
    code: "ko-ro",
    name: {
      inLocale: "국어의 로마자 표기법",
      inEnglish: "Korean (Romanized)",
    },
    display: {
      flag: "kr",
      script: "latin",
    },
  },
  {
    code: "la",
    name: {
      inLocale: "Latīnum",
      inEnglish: "Latin",
    },
    display: {
      flag: "ri",
    },
  },
  {
    code: "lt",
    name: {
      inLocale: "Lietuvių",
      inEnglish: "Lithuanian",
    },
    display: {
      flag: "lt",
    },
  },
  {
    code: "mn",
    name: {
      inLocale: "Монгол",
      inEnglish: "Mongolian",
    },
    display: {
      flag: "mn",
    },
  },
  {
    code: "ms",
    name: {
      inLocale: "Melayu",
      inEnglish: "Malay",
    },
    display: {
      flag: "my",
    },
  },
  {
    code: "my",
    name: {
      inLocale: "မြန်မာစာ",
      inEnglish: "Burmese",
    },
    display: {
      flag: "mm",
    },
  },
  {
    code: "ne",
    name: {
      inLocale: "नेपाली",
      inEnglish: "Nepali",
    },
    display: {
      flag: "np",
    },
  },
  {
    code: "nl",
    name: {
      inLocale: "Nederlands",
      inEnglish: "Dutch",
    },
    display: {
      flag: "nl",
    },
  },
  {
    code: "no",
    name: {
      inLocale: "Norsk",
      inEnglish: "Norwegian",
    },
    display: {
      flag: "no",
    },
  },
  {
    code: "pl",
    name: {
      inLocale: "Polski",
      inEnglish: "Polish",
    },
    display: {
      flag: "pl",
    },
  },
  {
    code: "pt",
    name: {
      inLocale: "Portuguese",
      inEnglish: "Portuguese",
    },
    display: {
      flag: "pt",
    },
  },
  {
    code: "pt-br",
    name: {
      inLocale: "Portuguese (Br)",
      inEnglish: "Portuguese (Br)",
    },
    display: {
      flag: "br",
    },
  },
  {
    code: "ro",
    name: {
      inLocale: "Românește",
      inEnglish: "Romanian",
    },
    display: {
      flag: "ro",
    },
  },
  {
    code: "ru",
    name: {
      inLocale: "Pусский",
      inEnglish: "Russian",
    },
    display: {
      flag: "ru",
    },
  },
  {
    code: "sk",
    name: {
      inLocale: "Slovenčina",
      inEnglish: "Slovak",
    },
    display: {
      flag: "sk",
    },
  },
  {
    code: "sl",
    name: {
      inLocale: "slovenščina",
      inEnglish: "Slovenian",
    },
    display: {
      flag: "si",
    },
  },
  {
    code: "sq",
    name: {
      inLocale: "Shqipja",
      inEnglish: "Albanian",
    },
    display: {
      flag: "sq",
    },
  },
  {
    code: "sr",
    name: {
      inLocale: "Cрпски",
      inEnglish: "Serbian",
    },
    display: {
      flag: "rs",
    },
  },
  {
    code: "sv",
    name: {
      inLocale: "Svenska",
      inEnglish: "Swedish",
    },
    display: {
      flag: "se",
    },
  },
  {
    code: "ta",
    name: {
      inLocale: "தமிழ்",
      inEnglish: "Tamil",
    },
    display: {
      flag: "tam",
    },
  },
  {
    code: "te",
    name: {
      inLocale: "తెలుగు",
      inEnglish: "Telugu",
    },
    display: {
      flag: "tel",
    },
  },
  {
    code: "th",
    name: {
      inLocale: "ภาษาไทย",
      inEnglish: "Thai",
    },
    display: {
      flag: "th",
    },
  },
  {
    code: "tl",
    name: {
      inLocale: "Filipino",
      inEnglish: "Filipino",
    },
    display: {
      flag: "ph",
    },
  },
  {
    code: "tr",
    name: {
      inLocale: "Türkçe",
      inEnglish: "Turkish",
    },
    display: {
      flag: "tr",
    },
  },
  {
    code: "uk",
    name: {
      inLocale: "Українська",
      inEnglish: "Ukrainian",
    },
    display: {
      flag: "ua",
    },
  },
  {
    code: "ur",
    name: {
      inLocale: "اُردُو",
      inEnglish: "Urdu",
    },
    display: {
      flag: "pk",
    },
  },
  {
    code: "uz",
    name: {
      inLocale: "Oʻzbekcha",
      inEnglish: "Uzbek",
    },
    display: {
      flag: "uz",
    },
  },
  {
    code: "vi",
    name: {
      inLocale: "Việt",
      inEnglish: "Vietnamese",
    },
    display: {
      flag: "vn",
    },
  },
  {
    code: "hu",
    name: {
      inLocale: "Magyar",
      inEnglish: "Hungarian",
    },
    display: {
      flag: "hu",
    },
  },
  {
    code: "kk",
    name: {
      inLocale: "қазақша",
      inEnglish: "Kazakh",
    },
    display: {
      flag: "kz",
    },
  },
  {
    code: "zh",
    name: {
      inLocale: "简体中文",
      inEnglish: "Chinese (Simplified)",
    },
    display: {
      flag: "cn",
      script: "kanji",
    },
  },
  {
    code: "zh-hk",
    name: {
      inLocale: "繁體中文",
      inEnglish: "Chinese (Traditional)",
    },
    display: {
      flag: "hk",
      script: "kanji",
    },
  },
  {
    code: "zh-ro",
    name: {
      inLocale: "汉语拼音",
      inEnglish: "Chinese (Romanized)",
    },
    display: {
      flag: "cn",
      script: "latin",
    },
  },
  {
    code: "NULL",
    name: {
      inLocale: "Other",
      inEnglish: "Other",
    },
    display: {
      flag: "unknown",
    },
  },
];

export const LANGUAGES_BY_CODE: Map<string, Language> = new Map(
  LANGUAGES.map((lang) => [lang.code, lang]),
);

export const LANGUAGE_CODES: string[] = Array.from(LANGUAGES_BY_CODE.keys());

export function isValidLanguageCode(code: string): boolean {
  return LANGUAGE_CODES.includes(code);
}

export const ALPHABETICAL_LANGUAGES: { label: string; value: string }[] =
  LANGUAGES.filter((lang) => lang.code !== "NULL")
    .map((lang) => ({ label: lang.name.inEnglish, value: lang.code }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const PREFERRED_ORDER = [
  "ja",
  "ja-ro",
  "ko",
  "ko-ro",
  "zh",
  "zh-hk",
  "zh-ro",
  "en",
];

function toDropdownOption(lang?: Language) {
  if (!lang) return { label: "Unknown", value: "NULL" };
  return { label: lang.name.inEnglish, value: lang.code };
}

export const LANGUAGE_LISTS = {
  ALPHABETICAL: ALPHABETICAL_LANGUAGES,
  ENGLISH_FIRST: [
    toDropdownOption(LANGUAGES_BY_CODE.get("en")),
    ...ALPHABETICAL_LANGUAGES.filter((opt) => opt.value !== "en"),
  ],
  ORIGINAL_LANGUAGES: [
    ...PREFERRED_ORDER.map((code) =>
      toDropdownOption(LANGUAGES_BY_CODE.get(code)),
    ),
    ...ALPHABETICAL_LANGUAGES.filter(
      (opt) => !PREFERRED_ORDER.includes(opt.value),
    ),
  ],
};

export function filterNonLatin(options: { label: string; value: string }[]) {
  return options.filter(
    (opt) => LANGUAGES_BY_CODE.get(opt.value)?.display.script !== "latin",
  );
}

export const LANGUAGE_OPTIONS = {
  ALPHABETICAL: {
    WITH_SCRIPTS: LANGUAGE_LISTS.ALPHABETICAL,
    WITHOUT_SCRIPTS: filterNonLatin(LANGUAGE_LISTS.ALPHABETICAL),
  },
  ENGLISH_FIRST: {
    WITH_SCRIPTS: LANGUAGE_LISTS.ENGLISH_FIRST,
    WITHOUT_SCRIPTS: filterNonLatin(LANGUAGE_LISTS.ENGLISH_FIRST),
  },
  ORIGINAL_LANGUAGES: {
    WITH_SCRIPTS: LANGUAGE_LISTS.ORIGINAL_LANGUAGES,
    WITHOUT_SCRIPTS: filterNonLatin(LANGUAGE_LISTS.ORIGINAL_LANGUAGES),
  },
};
