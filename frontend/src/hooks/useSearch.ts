import { useQuery } from "react-query";
import {
  searchTorrents,
  fetchIndexers,
  fetchPublicConfig,
} from "@/api/search.api";
import { useSearchStore } from "@/store/search.store";
import {
  SearchResponse,
  Indexer,
  PublicConfig,
  SearchResult,
  SortField,
  SortDir,
} from "@/types";

export function useSearch() {
  const { query, categories, indexerIds, page, perPage, sortField, sortDir } =
    useSearchStore();

  const offset = (page - 1) * perPage;

  const result = useQuery<SearchResponse, Error>(
    ["search", query, categories, indexerIds, offset, perPage],
    () =>
      searchTorrents({
        query,
        categories: categories.length > 0 ? categories : undefined,
        indexerIds: indexerIds.length > 0 ? indexerIds : undefined,
        limit: perPage,
        offset,
      }),
    {
      enabled: query.trim().length > 0,
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      keepPreviousData: true,
      retry: 1,
    },
  );

  const sorted = sortResults(result.data?.results ?? [], sortField, sortDir);

  return {
    ...result,
    results: sorted,
    total: result.data?.total ?? 0,
    hasMore: result.data?.hasMore ?? false,
  };
}

export function useIndexers() {
  return useQuery<Indexer[], Error>("indexers", fetchIndexers, {
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function usePublicConfig() {
  return useQuery<PublicConfig, Error>("publicConfig", fetchPublicConfig, {
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 3,
  });
}

function sortResults(
  results: SearchResult[],
  field: SortField,
  dir: SortDir,
): SearchResult[] {
  return [...results].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (field) {
      case "seeders":
        aVal = a.seeders ?? -1;
        bVal = b.seeders ?? -1;
        break;
      case "leechers":
        aVal = a.leechers ?? -1;
        bVal = b.leechers ?? -1;
        break;
      case "size":
        aVal = a.size ?? 0;
        bVal = b.size ?? 0;
        break;
      case "publishDate":
        aVal = new Date(a.publishDate).getTime();
        bVal = new Date(b.publishDate).getTime();
        break;
      case "title":
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      default:
        return 0;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return dir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return dir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });
}
