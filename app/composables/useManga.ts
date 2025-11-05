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

  const authors = computed(
    () => manga?.relationships?.filter((r) => r.type === "author") ?? [],
  );
  const artists = computed(
    () => manga?.relationships?.filter((r) => r.type === "artist") ?? [],
  );

  const authorsList = computed(() => {
    const list = [...authors.value, ...artists.value];
    return [...new Set(list.map((a) => a.attributes?.name))]
      .filter(Boolean)
      .sort()
      .join(", ");
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

  const groupedTags = computed(() => {
    const content: Tag[] = [];
    const format: Tag[] = [];
    const genre: Tag[] = [];
    const theme: Tag[] = [];

    for (const tag of tags.value) {
      const group = tag?.attributes?.group;
      if (group === "content") content.push(tag);
      else if (group === "format") format.push(tag);
      else if (group === "genre") genre.push(tag);
      else theme.push(tag);
    }

    return {
      content,
      format,
      genre,
      theme,
    };
  });

  const originalLanguage = computed(() => manga?.attributes?.originalLanguage);

  return {
    title,
    altTitles,
    detailsUrl,
    description,
    authors,
    artists,
    authorsList,
    cover,
    publicationStatus,
    publicationYear,
    publicationDemographic,
    contentRating,
    links,
    tags,
    groupedTags,
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
