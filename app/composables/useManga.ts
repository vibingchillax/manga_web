export const useManga = (manga: Manga | undefined) => {
  const title = computed(() => {
    const titles = manga?.attributes?.title ?? {};
    const preferred = PREFERRED_ORDER.find((lang) => titles[lang]);
    return preferred ? titles[preferred] : "Untitled";
  });

  const altTitles = computed(() => manga?.attributes?.altTitles);

  const description = computed(() => manga?.attributes?.description);

  const detailsUrl = computed(() => {
    return `/title/${manga?.id}/${toKebabCase(title.value)}`;
  });

  const author = computed(() => {
    const authors =
      manga?.relationships?.filter((r) => r.type === "author") ?? [];
    const artists =
      manga?.relationships?.filter((r) => r.type === "artist") ?? [];

    const samePeople =
      authors.length === artists.length &&
      authors.every((a, i) => a.id === artists[i]?.id);

    return {
      authors,
      artists,
      samePeople,
    };
  });

  const cover = computed(() => {
    const coverRelation = manga?.relationships?.find(
      (r) => r.type === "cover_art",
    );

    const urlOriginal = `https://uploads.mangadex.org/covers/${manga?.id}/${coverRelation?.attributes?.fileName}`;
    const url256 = `https://uploads.mangadex.org/covers/${manga?.id}/${coverRelation?.attributes?.fileName}.256.jpg`;
    const url512 = `https://uploads.mangadex.org/covers/${manga?.id}/${coverRelation?.attributes?.fileName}.512.jpg`;
    return {
      urlOriginal,
      url256,
      url512,
    };
  });

  const publicationStatus = computed(() => manga?.attributes?.status);
  const publicationYear = computed(() => manga?.attributes?.year);
  const publicationDemographic = computed(
    () => manga?.attributes?.publicationDemographic,
  );
  const contentRating = computed(() => manga?.attributes?.contentRating);
  const links = computed(() => {
    const linkMap = manga?.attributes?.links ?? {};

    const read: { href: string; name: string; icon: string }[] = [];
    const buy: { href: string; name: string; icon: string }[] = [];
    const track: { href: string; name: string; icon: string }[] = [];

    OFFICIAL_SOURCES.forEach((o) => {
      if (linkMap[o.apiCode]) {
        read.push({
          name: o.name,
          href: o.constructUrl(linkMap[o.apiCode]!),
          icon: o.icon,
        });
      }
    });

    BOOK_STORES.forEach((o) => {
      if (linkMap[o.apiCode]) {
        buy.push({
          name: o.name,
          href: o.constructUrl(linkMap[o.apiCode]!),
          icon: o.icon,
        });
      }
    });

    TRACKING_SITES.forEach((o) => {
      if (linkMap[o.apiCode]) {
        track.push({
          name: o.name,
          href: o.constructUrl(linkMap[o.apiCode]!),
          icon: o.icon,
        });
      }
    });

    return {
      read,
      buy,
      track,
    };
  });

  const tags = computed(() => manga?.attributes?.tags ?? []);
  const originalLanguage = computed(() => manga?.attributes?.originalLanguage);

  return {
    title,
    altTitles,
    detailsUrl,
    description,
    author,
    cover,
    publicationStatus,
    publicationYear,
    publicationDemographic,
    contentRating,
    links,
    tags,
    originalLanguage,
  };
};

export const useScrapedManga = (manga: Ref<ScrapedManga | undefined>) => {
  const title = computed(() => manga.value?.attributes.title.en); //TODO

  const coverUrl = computed(
    () =>
      manga.value?.relationships?.find((r) => r.type === "scraped_cover_art")
        ?.attributes.url,
  );

  const detailsUrl = computed(
    () =>
      `/title/${manga.value?.attributes.mangadexId}/${toKebabCase(title.value)}`,
  );

  return {
    title,
    detailsUrl,
    coverUrl,
  };
};

export const toManga = (manga: ScrapedManga) => {
  const {
    id,
    type,
    attributes: { mangadexId, ...attrRest },
    ...rest
  } = manga;
  return {
    id: mangadexId,
    type: "manga",
    attributes: {
      ...attrRest,
    },
    ...rest,
  } as Manga;
};
