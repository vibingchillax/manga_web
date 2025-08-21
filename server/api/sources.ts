import type { SourceLabel } from '#shared/types/types'

export default defineCachedEventHandler((event) => {
  const sourcesList: SourceLabel[] = availableSources.map(source => ({
    label: source.name,
    id: source.id,
    url: source.url,
    flags: source.flags
  }))
  return sourcesList
}, { maxAge: 60 * 60 * 24})