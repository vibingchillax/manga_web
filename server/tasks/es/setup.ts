import { esClient } from "~~/server/utils/elastic";

async function createAuthorIndex() {
  await esClient.indices.delete({ index: "authors" }, { ignore: [404] });

  await esClient.indices.create({
    index: "authors",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword", index: false },
        attributes: {
          properties: {
            name: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            imageUrl: { type: "text", index: false },
            biography: { type: "object", enabled: false },
            twitter: { type: "keyword", index: false },
            pixiv: { type: "keyword", index: false },
            melonBook: { type: "keyword", index: false },
            fanBox: { type: "keyword", index: false },
            booth: { type: "keyword", index: false },
            nicoVideo: { type: "keyword", index: false },
            skeb: { type: "keyword", index: false },
            fantia: { type: "keyword", index: false },
            tumblr: { type: "keyword", index: false },
            youtube: { type: "keyword", index: false },
            weibo: { type: "keyword", index: false },
            naver: { type: "keyword", index: false },
            namicomi: { type: "keyword", index: false },
            website: { type: "keyword", index: false },
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
  await esClient.indices.delete({ index: "chapters" }, { ignore: [404] });

  await esClient.indices.create({
    index: "chapters",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword", index: false },
        attributes: {
          properties: {
            title: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            volume: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            chapter: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            translatedLanguage: { type: "keyword" },
            pages: { type: "object", enabled: false },
            version: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
            publishAt: { type: "date" },
            readableAt: { type: "date" },
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
  await esClient.indices.delete({ index: "covers" }, { ignore: [404] });

  await esClient.indices.create({
    index: "covers",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword", index: false },
        attributes: {
          properties: {
            volume: { type: "text" },
            file: { type: "object", enabled: false },
            description: { type: "text", index: false },
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
  await esClient.indices.delete({ index: "custom_lists" }, { ignore: [404] });

  await esClient.indices.create({
    index: "custom_lists",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword", index: false },
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
  await esClient.indices.delete({ index: "scanlation_groups" }, { ignore: [404] });

  await esClient.indices.create({
    index: "scanlation_groups",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword", index: false },
        attributes: {
          properties: {
            name: { type: "text", fields: { keyword: { type: "keyword" } } },
            altNames: {
              type: "text",
              fields: { keyword: { type: "keyword" } },
            },
            website: { type: "keyword", index: false },
            ircServer: { type: "keyword", index: false },
            ircChannel: { type: "keyword", index: false },
            discord: { type: "keyword", index: false },
            contactEmail: { type: "keyword", index: false },
            description: { type: "text", index: false },
            twitter: { type: "keyword", index: false },
            mangaUpdates: { type: "keyword", index: false },
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
  await esClient.indices.delete({ index: "manga" }, { ignore: [404] });

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
        type: { type: "keyword", index: false },
        attributes: {
          properties: {
            title: { type: "object", dynamic: true },
            altTitles: { type: "nested", dynamic: true },
            description: { type: "object", enabled: false },
            isLocked: { type: "boolean" },
            links: { type: "object", enabled: false },
            originalLanguage: { type: "keyword" },
            lastVolume: { type: "keyword" },
            lastChapter: { type: "keyword" },
            publicationDemographic: { type: "keyword" },
            status: { type: "keyword" },
            year: { type: "integer" },
            contentRating: { type: "keyword" },
            chapterNumbersResetOnNewVolume: { type: "boolean" },
            availableTranslatedLanguages: { type: "keyword" },
            latestUploadedChapter: { type: "keyword" },
            tags: {
              type: "nested",
              properties: {
                id: { type: "keyword" },
                type: { type: "keyword", index: false },
                attributes: {
                  properties: {
                    name: { type: "object", enabled: false },
                    description: { type: "object", enabled: false },
                    group: { type: "keyword", index: false },
                    version: { type: "integer", index: false },
                  },
                },
                relationships: {
                  type: "nested",
                  enabled: false
                }
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
            related: { type: "keyword" },
          },
        },
      },
    },
  });
}

async function createUserIndex() {
  await esClient.indices.delete({ index: "users" }, { ignore: [404] });

  await esClient.indices.create({
    index: "users",
    mappings: {
      properties: {
        id: { type: "keyword" },
        type: { type: "keyword", index: false },
        attributes: {
          properties: {
            username: {
              type: "text",
              fields: { keyword: { type: "keyword" } },
            },
            roles: { type: "keyword" },
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

export default defineTask({
  meta: {
    name: "es:setup",
    description: "Setup Elasticsearch indices (this will remove existing indices)",
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
