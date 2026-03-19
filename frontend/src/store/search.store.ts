import { create } from "zustand";
import { SearchState, SortField, SortDir } from "@/types";

interface SearchStore extends SearchState {
  setQuery: (query: string) => void;
  setCategories: (categories: number[]) => void;
  toggleCategory: (id: number) => void;
  setIndexerIds: (ids: number[]) => void;
  toggleIndexer: (id: number) => void;
  setSortField: (field: SortField) => void;
  setSortDir: (dir: SortDir) => void;
  toggleSort: (field: SortField) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  reset: () => void;
}

const DEFAULT_STATE: SearchState = {
  query: "",
  categories: [],
  indexerIds: [],
  sortField: "seeders",
  sortDir: "desc",
  page: 1,
  perPage: 25,
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...DEFAULT_STATE,

  setQuery: (query) => set({ query, page: 1 }),

  setCategories: (categories) => set({ categories, page: 1 }),

  toggleCategory: (id) => {
    const current = get().categories;
    if (id === 0) {
      set({ categories: [], page: 1 });
      return;
    }
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    set({ categories: next, page: 1 });
  },

  setIndexerIds: (ids) => set({ indexerIds: ids, page: 1 }),

  toggleIndexer: (id) => {
    const current = get().indexerIds;
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    set({ indexerIds: next, page: 1 });
  },

  setSortField: (sortField) => set({ sortField }),
  setSortDir: (sortDir) => set({ sortDir }),

  toggleSort: (field) => {
    const { sortField, sortDir } = get();
    if (sortField === field) {
      set({ sortDir: sortDir === "desc" ? "asc" : "desc" });
    } else {
      set({ sortField: field, sortDir: "desc" });
    }
  },

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage, page: 1 }),

  reset: () => set(DEFAULT_STATE),
}));
