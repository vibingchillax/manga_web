const batchSize = 2000;

export async function bulkIndex(index: string, docs: any[]) {
  if (docs.length === 0) return;

  const operations = docs.flatMap((doc) => [
    { index: { _index: index, _id: doc.id } },
    doc,
  ]);

  await esClient.bulk({
    refresh: true,
    operations,
  });
}

async function indexAuthors() {
  for (let skip = 0; ; skip += batchSize) {
    const authors = await prisma.author.findMany({
      skip,
      take: batchSize,
      include: {
        mangaAuthored: { select: { id: true } },
        mangaDrawn: { select: { id: true } },
      },
    });
    if (authors.length === 0) break;

    const docs = authors.map((a) => formatAuthor(a));
    await bulkIndex("authors", docs);
    console.log(`Indexed ${docs.length} authors`);
  }
}

async function indexChapters() {
  for (let skip = 0; ; skip += batchSize) {
    const chapters = await prisma.uploadedChapter.findMany({
      skip,
      take: batchSize,
      include: {
        groups: {
          select: {
            groupId: true,
          },
        },
      },
    });
    if (chapters.length === 0) break;

    const docs = chapters.map((c) => formatUploadedChapter(c));
    await bulkIndex("chapters", docs);
    console.log(`Indexed ${docs.length} chapters`);
  }
}

async function indexCovers() {
  for (let skip = 0; ; skip += batchSize) {
    const covers = await prisma.coverArt.findMany({
      skip,
      take: batchSize,
    });
    if (covers.length === 0) break;

    const docs = covers.map((c) => formatCoverArt(c));
    await bulkIndex("covers", docs);
    console.log(`Indexed ${docs.length} covers`);
  }
}

async function indexCustomList() {
  for (let skip = 0; ; skip += batchSize) {
    const lists = await prisma.customList.findMany({
      skip,
      take: batchSize,
      include: {
        manga: {
          select: { id: true },
        },
      },
    });
    if (lists.length === 0) break;

    const docs = lists.map((c) => formatCustomList(c));
    await bulkIndex("custom_lists", docs);
    console.log(`Indexed ${docs.length} custom lists`);
  }
}

async function indexManga() {
  for (let skip = 0; ; skip += batchSize) {
    const mangaList = await prisma.manga.findMany({
      skip,
      take: batchSize,
      include: {
        authors: { select: { id: true } },
        artists: { select: { id: true } },
        primaryCover: { select: { id: true } },
        relationsTo: true,
        chapters: {
          select: { translatedLanguage: true, publishAt: true, id: true },
        },
      },
    });
    if (mangaList.length === 0) break;

    const docs = mangaList.map((m) => {
      const { chapters } = m;
      const latestChapter = chapters.sort(
        (a, b) =>
          new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime(),
      )[0];
      const latest = latestChapter?.id;
      const langs = [...new Set(chapters.map((c) => c.translatedLanguage))];

      return formatManga(m, latest, langs);
    });

    await bulkIndex("manga", docs);
    console.log(`Indexed ${docs.length} manga`);
  }
}

async function indexScanlationGroups() {
  for (let skip = 0; ; skip += batchSize) {
    const groups = await prisma.scanlationGroup.findMany({
      skip,
      take: batchSize,
      include: {
        members: { select: { userId: true, role: true } },
      },
    });
    if (groups.length === 0) break;

    const docs = groups.map((g) => formatGroup(g));
    await bulkIndex("scanlation_groups", docs);
    console.log(`Indexed ${docs.length} groups`);
  }
}

async function indexUsers() {
  for (let skip = 0; ; skip += batchSize) {
    const users = await prisma.user.findMany({
      skip,
      take: batchSize,
      select: {
        id: true,
        username: true,
        roles: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        groupMemberships: true,
      },
    });
    if (users.length === 0) break;

    const docs = users.map((u) => formatUser(u));
    await bulkIndex("users", docs);
    console.log(`Indexed ${docs.length} users`);
  }
}

export default defineTask({
  meta: {
    name: "es:reindex",
    description: "Reindex Elasticsearch from scratch",
  },
  async run() {
    await indexAuthors();
    await indexChapters();
    await indexCovers();
    await indexCustomList();
    await indexManga();
    await indexScanlationGroups();
    await indexUsers();
    return {
      result: "ok",
    };
  },
});
