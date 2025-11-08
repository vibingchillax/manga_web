export default defineEventHandler((event) => {
  const sourcesList: SourceLabel[] = availableSources.map((source) => ({
    label: source.name,
    id: source.id,
    url: source.url,
    flags: source.flags,
  }));
  return sourcesList;
});
