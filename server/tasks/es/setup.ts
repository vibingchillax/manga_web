import { esClient } from "~~/server/utils/elastic";

async function createAuthorIndex() {
  const exists = await esClient.indices.exists({ index: "authors" });

  if (exists) {
    console.log("Author index already exists");
    return;
  }

  await esClient.indices.create({
    index: "authors",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            name: { type: "text" },
            imageUrl: { type: "text" },
            biography: { type: "text" },
            twitter: { type: "keyword" },
            pixiv: { type: "keyword" },
            melonBook: { type: "keyword" },
            fanBox: { type: "keyword" },
            booth: { type: "keyword" },
            nicoVideo: { type: "keyword" },
            skeb: { type: "keyword" },
            fantia: { type: "keyword" },
            tumblr: { type: "keyword" },
            youtube: { type: "keyword" },
            weibo: { type: "keyword" },
            naver: { type: "keyword" },
            namicomi: { type: "keyword" },
            website: { type: "keyword" },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createChapterIndex() {
  const exists = await esClient.indices.exists({ index: "chapters" });

  if (exists) {
    console.log("Chapter index already exists");
    return;
  }

  await esClient.indices.create({
    index: "chapters",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            title: { type: "text" },
            volume: { type: "text" },
            chapter: { type: "text" },
            translatedLanguage: { type: "keyword" },
            pages: { type: "object", enabled: false },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
            publishAt: { type: "date" },
            readableAt: { type: "date" },
            viewCount: { type: "integer" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createCoverArtIndex() {
  const exists = await esClient.indices.exists({ index: "covers" });

  if (exists) {
    console.log("Cover index already exists");
    return;
  }

  await esClient.indices.create({
    index: "covers",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            volume: { type: "text" },
            file: { type: "object", enabled: false },
            description: { type: "text" },
            locale: { type: "keyword" },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createCustomListIndex() {
  const exists = await esClient.indices.exists({ index: "custom_lists" });

  if (exists) {
    console.log("Custom List index already exists");
    return;
  }

  await esClient.indices.create({
    index: "custom_lists",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            name: { type: "text" },
            visibility: { type: "keyword" },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createScanlationGroupIndex() {
  const exists = await esClient.indices.exists({ index: "scanlation_groups" });

  if (exists) {
    console.log("Scanlation Group index already exists");
    return;
  }

  await esClient.indices.create({
    index: "scanlation_groups",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            name: { type: "text", fields: { keyword: { type: "keyword" } } },
            altNames: {
              type: "text",
              fields: { keyword: { type: "keyword" } },
            },
            website: { type: "keyword" },
            ircServer: { type: "keyword" },
            ircChannel: { type: "keyword" },
            discord: { type: "keyword" },
            contactEmail: { type: "keyword" },
            description: { type: "text" },
            twitter: { type: "keyword" },
            mangaUpdates: { type: "keyword" },
            inactive: { type: "boolean" },
            publishDelay: { type: "keyword" },
            focusedLanguages: { type: "keyword" },
            locked: { type: "boolean" },
            official: { type: "boolean" },
            verified: { type: "boolean" },
            exLicensed: { type: "boolean" },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createMangaIndex() {
  const exists = await esClient.indices.exists({ index: "manga" });

  if (exists) {
    console.log("Manga index already exists");
    return;
  }

  await esClient.indices.create({
    index: "manga",
    mappings: {
      dynamic_templates: [
        {
          strings_as_text: {
            match_mapping_type: "string",
            mapping: {
              type: "text",
              fields: {
                keyword: { type: "keyword" },
              },
            },
          },
        },
      ],
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            title: { type: "object", dynamic: true },
            altTitles: { type: "nested", dynamic: true },
            // description: { type: "object", dynamic: true }, //should we allow search with description?
            description: { type: "object", enabled: false },
            isLocked: { type: "boolean" },
            links: { type: "object", enabled: false },
            originalLanguage: { type: "keyword" },
            lastVolume: { type: "text" },
            lastChapter: { type: "text" },
            publicationDemographic: { type: "keyword" },
            status: { type: "keyword" },
            year: { type: "integer" },
            contentRating: { type: "keyword" },
            tags: {
              type: "nested",
              properties: {
                id: { type: "keyword" },
                type: { type: "keyword" },
                attributes: {
                  properties: {
                    name: { type: "text" },
                    group: { type: "keyword" },
                  },
                },
              },
            },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createUserIndex() {
  const exists = await esClient.indices.exists({ index: "users" });

  if (exists) {
    console.log("User index already exists");
    return;
  }

  await esClient.indices.create({
    index: "users",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword" },
        attributes: {
          properties: {
            username: {
              type: "text",
              fields: { keyword: { type: "keyword" } },
            },
            roles: { type: "keyword" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        relationships: {
          type: "nested",
          properties: {
            id: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    },
  });
}

export default defineTask({
  meta: {
    name: "es:setup",
    description: "Setup Elasticsearch indices",
  },
  async run() {
    await createAuthorIndex();
    await createChapterIndex();
    await createCoverArtIndex();
    await createCustomListIndex();
    await createScanlationGroupIndex();
    await createMangaIndex();
    await createUserIndex();
    return {
      result: "ok",
    };
  },
});
