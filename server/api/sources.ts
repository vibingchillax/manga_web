import type { SourceLabel } from '#shared/types/types'

export default defineEventHandler((event) => {
  const sourcesList: SourceLabel[] = availableSources.map(source => ({
    label: source.name,
    id: source.id,
    url: source.url    
  }))
  return sourcesList
})