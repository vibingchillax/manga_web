import { targets, makeSimpleProxyFetcher, makeSources, makeStandardFetcher } from "@manga_web/sources";
import type { Source } from "@manga_web/sources";

const proxyBase = 'http://localhost:1265'; //TODO: use proxyurl from settings
const fetcher = makeStandardFetcher(fetch);
const proxiedFetcher = makeSimpleProxyFetcher(proxyBase, fetch);

export const sourcesInstance = makeSources({
  fetcher,
  proxiedFetcher,
  target: targets.BROWSER,
});

export const availableSources = sourcesInstance.listSources() as Source[];