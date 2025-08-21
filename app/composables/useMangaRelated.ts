import type { components } from "#open-fetch-schemas/mangadex"

type Relationship = components["schemas"]["Relationship"]

function isManga(r: Relationship) {
  return r.type === "manga"
}

const relatedLabels: Record<string, string> = {
  monochrome: "Monochrome",
  colored: "Colored",
  preserialization: "Pre-serialization",
  serialization: "Serialization",
  prequel: "Prequel",
  sequel: "Sequel",
  main_story: "Main Story",
  side_story: "Side Story",
  adapted_from: "Adapted From",
  spin_off: "Spin Off",
  based_on: "Based On",
  doujinshi: "Doujinshi",
  same_franchise: "Same Franchise",
  shared_universe: "Shared Universe",
  alternate_story: "Alternate Story",
  alternate_version: "Alternate Version",
  other: "Other",
}

const relatedOrder = [
  "monochrome",
  "colored",
  "preserialization",
  "serialization",
  "prequel",
  "sequel",
  "main_story",
  "side_story",
  "adapted_from",
  "spin_off",
  "based_on",
  "doujinshi",
  "same_franchise",
  "shared_universe",
  "alternate_story",
  "alternate_version",
  "other",
]

export const useRelatedMangas = async (manga: Manga) => {
  const pref = usePreferencesStore()

  const relatedMangas = manga.relationships?.filter(isManga) ?? []
  const grouped = relatedMangas.reduce<Record<string, Relationship[]>>((acc, r) => {
    const key = r.related ?? "other"
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const relatedGroups = relatedOrder
    .filter(type => grouped[type])
    .map(type => ({
      type,
      label: relatedLabels[type] ?? type,
      mangas: grouped[type],
    }))

  const ids = relatedGroups.flatMap(r => r.mangas!.map(m => m.id!))
  const { data, pending, error } = await useMangadex("/manga", {
    query: {
      "ids[]": ids,
      "includes[]": ["cover_art"],
      "contentRating[]": pref.contentRating,
      limit: 100
    },
  })

  const mangaMap = new Map<string, Manga>()
  data.value?.data?.forEach((m: Manga) => mangaMap.set(m.id!, m))

  const result = relatedGroups.map(r => ({
    ...r,
    mangas: r.mangas!.map(m => mangaMap.get(m.id!)).filter(Boolean),
  }))

  return { related: result, pending, error }
}
