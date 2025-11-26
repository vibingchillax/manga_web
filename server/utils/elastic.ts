import { Client } from "@elastic/elasticsearch";

const REL_INDEX_MAP: Record<string, string> = {
  author: "authors",
  artist: "authors",
  chapter: "chapters",
  cover_art: "covers",
  custom_list: "custom_lists",
  scanlation_group: "scanlation_groups",
  manga: "manga",
  user: "users",
  leader: "users",
  member: "users",
};

export const esClient = new Client({
  node:
    process.env.NODE_ENV === "production"
      ? "http://elasticsearch:9200"
      : "http://localhost:9200",
  auth: {
    username: "elastic",
    password: useRuntimeConfig().esPassword,
  },
});

export async function esGetById(index: string, id: string) {
  try {
    const doc = await esClient.get({ index, id });
    return doc._source;
  } catch {
    return null;
  }
}

export async function esSearch(index: string, query: any) {
  const result = await esClient.search({
    index,
    size: query.size ?? 10,
    from: query.from ?? 0,
    query: query.query,
  });

  return {
    hits: result.hits.hits.map((h) => h._source),
    total: result.hits.total ?? 0,
  };
}

export async function esIndex(index: string, id: string, document: any) {
  try {
    const result = await esClient.update({
      index,
      id,
      doc: document,
      doc_as_upsert: true,
      refresh: "wait_for",
    });

    return result;
  } catch (err) {
    console.error(`[ES] Failed to index ${index}/${id}`, err);
    throw err;
  }
}

export async function esDelete(index: string, id: string) {
  try {
    return esClient.delete({
      index,
      id,
      refresh: "wait_for",
    });
  } catch (err) {
    console.error(`[ES] Failed to delete ${id} from ${index}`);
  }
}

export async function expandRelationships(
  item: any,
  includes: any[] | undefined,
) {
  if (!includes?.length) return item;

  const out = { ...item };

  const expanded: any[] = [];

  for (const rel of item.relationships ?? []) {
    if (!includes.includes(rel.type)) {
      expanded.push(rel);
      continue;
    }
    const index = REL_INDEX_MAP[rel.type];
    if (!index) {
      expanded.push(rel);
      continue;
    }

    const obj: any = await esGetById(index, rel.id);
    obj.type = rel.type;
    expanded.push(obj ?? rel);
  }

  out.relationships = expanded;

  return out;
}

export function nestedRelationship(type: string, ids: string[]) {
  return {
    nested: {
      path: "relationships",
      query: {
        bool: {
          filter: [
            { term: { "relationships.type": type } },
            { terms: { "relationships.id": ids } },
          ],
        },
      },
    },
  };
}
