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
  const authors = await prisma.author.findMany({
    include: {
      mangaAuthored: { select: { id: true } },
      mangaDrawn: { select: { id: true } },
    },
  });

  const docs = authors.map((a) => formatAuthor(a));

  await bulkIndex("authors", docs);

  console.log(`Indexed ${docs.length} authors`);
}

async function indexChapters() {
  const chapters = await prisma.uploadedChapter.findMany({
    include: {
      groups: {
        select: {
          groupId: true,
        },
      },
    },
  });

  const docs = chapters.map((c) => formatUploadedChapter(c));

  await bulkIndex("chapters", docs);
  console.log(`Indexed ${docs.length} chapters`);
}

async function indexCovers() {
  const covers = await prisma.coverArt.findMany();

  const docs = covers.map((c) => formatCoverArt(c));

  await bulkIndex("covers", docs);
  console.log(`Indexed ${docs.length} covers`);
}

async function indexCustomList() {
  const lists = await prisma.customList.findMany({
    include: {
      manga: {
        select: {
          id: true,
        },
      },
    },
  });

  const docs = lists.map((c) => formatCustomList(c));

  await bulkIndex("custom_lists", docs);
  console.log(`Indexed ${docs.length} custom lists`);
}

async function indexManga() {
  const mangaList = await prisma.manga.findMany({
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

  const docs = mangaList.map((m) => {
    const { chapters } = m;

    const latestChapter = chapters.sort(
      (a, b) =>
        new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime(),
    )[0];

    const latest = latestChapter.id;
    const langs = [...new Set(chapters.map((c) => c.translatedLanguage))];

    return formatManga(m, latest, langs);
  });

  await bulkIndex("manga", docs);
  console.log(`Indexed ${docs.length} manga`);
}

async function indexScanlationGroups() {
  const groups = await prisma.scanlationGroup.findMany({
    include: {
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
  });

  const docs = groups.map((g) => formatGroup(g));

  await bulkIndex("scanlation_groups", docs);
  console.log(`Indexed ${docs.length} groups`);
}

async function indexUsers() {
  const users = await prisma.user.findMany({
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

  const docs = users.map((u) => formatUser(u));

  await bulkIndex("users", docs);
  console.log(`Indexed ${docs.length} users`);
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
