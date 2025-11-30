const batchSize = 2000;

export async function bulkIndex(index: string, docs: any[]) {
  if (docs.length === 0) return;

  const operations = docs.flatMap((doc) => [
    { index: { _index: index, _id: doc.id } },
    doc,
  ]);

  const res = await esClient.bulk({
    refresh: false,
    operations,
  });

  if (res.errors) {
    for (const item of res.items) {
      const error = item.index?.error;
      if (error) {
        console.error(
          `Bulk index error in index=${index}, id=${item.index?._id}:`,
          JSON.stringify(error, null, 2)
        );
      }
    }
    throw new Error("Bulk index failed — see logs above");
  }
}


async function indexAuthors() {
  let cursorId: string | undefined;

  while (true) {
    const authors = await prisma.author.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
      include: {
        mangaAuthored: { select: { id: true } },
        mangaDrawn: { select: { id: true } },
      },
    });

    if (authors.length === 0) break;
    cursorId = authors[authors.length - 1].id;

    const docs = authors.map((a) => formatAuthor(a));
    await bulkIndex("authors", docs);
    console.log(`Indexed ${docs.length} authors`);
  }
}

async function indexChapters() {
  let cursorId: string | undefined;

  while (true) {
    const chapters = await prisma.uploadedChapter.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
      include: {
        groups: {
          select: {
            groupId: true,
          },
        },
      },
    });

    if (chapters.length === 0) break;
    cursorId = chapters[chapters.length - 1].id;

    const docs = chapters.map((c) => formatUploadedChapter(c));
    await bulkIndex("chapters", docs);
    console.log(`Indexed ${docs.length} chapters`);
  }
}

async function indexCovers() {
  let cursorId: string | undefined;

  while (true) {
    const covers = await prisma.coverArt.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
    });

    if (covers.length === 0) break;
    cursorId = covers[covers.length - 1].id;

    const docs = covers.map((c) => formatCoverArt(c));
    await bulkIndex("covers", docs);
    console.log(`Indexed ${docs.length} covers`);
  }
}

async function indexCustomList() {
  let cursorId: string | undefined;

  while (true) {
    const lists = await prisma.customList.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
      include: {
        manga: {
          select: { id: true },
        },
      },
    });

    if (lists.length === 0) break;
    cursorId = lists[lists.length - 1].id;

    const docs = lists.map((c) => formatCustomList(c));
    await bulkIndex("custom_lists", docs);
    console.log(`Indexed ${docs.length} custom lists`);
  }
}

async function indexManga() {
  let cursorId: string | undefined;

  while (true) {
    const mangaList = await prisma.manga.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
      include: {
        authors: { select: { id: true } },
        artists: { select: { id: true } },
        primaryCover: { select: { id: true } },
        relationsTo: true,
        chapters: {
          select: { translatedLanguage: true, publishAt: true, id: true },
          orderBy: { publishAt: "desc" },
          take: 1,
        },
        tags: true, // This will now work without timing out
      },
    });

    if (mangaList.length === 0) break;
    cursorId = mangaList[mangaList.length - 1].id;

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
  let cursorId: string | undefined;

  while (true) {
    const groups = await prisma.scanlationGroup.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
      include: {
        members: { select: { userId: true, role: true } },
      },
    });

    if (groups.length === 0) break;
    cursorId = groups[groups.length - 1].id;

    const docs = groups.map((g) => formatGroup(g));
    await bulkIndex("scanlation_groups", docs);
    console.log(`Indexed ${docs.length} groups`);
  }
}

async function indexUsers() {
  let cursorId: string | undefined;

  while (true) {
    const users = await prisma.user.findMany({
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: { id: "asc" },
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
    cursorId = users[users.length - 1].id;

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
    const indexes = [
      "authors",
      "chapters",
      "covers",
      "custom_lists",
      "manga",
      "scanlation_groups",
      "users",
    ];
    await Promise.all(
      indexes.map((index) => esClient.indices.refresh({ index })),
    );
    return {
      result: "ok",
    };
  },
});