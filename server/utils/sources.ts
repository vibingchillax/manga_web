import { makeSimpleProxyFetcher, makeSources, makeStandardFetcher, targets, type Source, type SourceChaptersOutput } from '@manga_web/sources';
const fetcher = makeStandardFetcher(fetch);

export const sourcesInstance = makeSources({
  fetcher,
  target: targets.ANY
})

export const availableSources = sourcesInstance.listSources()
