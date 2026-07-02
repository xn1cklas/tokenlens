"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogSource, CatalogViewState } from "./types";

const PAGE_SIZE = 60;
const SEARCH_DEBOUNCE_MS = 250;

type CatalogLoadMode = "replace" | "append";

function queryMatches(
  a: CatalogViewState["query"],
  b: CatalogViewState["query"],
) {
  return (
    (a.search ?? "") === (b.search ?? "") &&
    (a.provider ?? "") === (b.provider ?? "")
  );
}

function queryForControls(args: {
  search: string;
  provider: string | null;
  offset?: number;
}): CatalogViewState["query"] {
  const trimmedSearch = args.search.trim();
  return {
    offset: args.offset ?? 0,
    limit: PAGE_SIZE,
    ...(trimmedSearch ? { search: trimmedSearch } : {}),
    ...(args.provider ? { provider: args.provider } : {}),
  };
}

function errorCatalogState(args: {
  source: CatalogSource;
  query: CatalogViewState["query"];
}): CatalogViewState {
  return {
    source: args.source,
    models: [],
    totalModels: 0,
    sourceTotalModels: 0,
    providers: [],
    modelsCountByProvider: {},
    status: "error",
    error: "Catalog is unavailable.",
    lastUpdated: Date.now(),
    query: args.query,
  };
}

export function useModelCatalog(initialCatalog: CatalogViewState) {
  const [source, setSource] = useState<CatalogSource>(initialCatalog.source);
  const [catalog, setCatalog] = useState<CatalogViewState>(initialCatalog);
  const [loadingMode, setLoadingMode] = useState<CatalogLoadMode | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const activeRequestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCatalog = catalog.source === source ? catalog : undefined;
  const models = activeCatalog?.models ?? [];
  const isLoading = loadingMode === "replace";
  const isLoadingMore = loadingMode === "append";

  const loadCatalog = useCallback(
    async (args: {
      nextSource: CatalogSource;
      nextSearch: string;
      nextProvider: string | null;
      offset: number;
      mode: CatalogLoadMode;
    }) => {
      const requestId = activeRequestRef.current + 1;
      const controller = new AbortController();
      activeRequestRef.current = requestId;
      abortRef.current?.abort();
      abortRef.current = controller;
      setLoadingMode(args.mode);

      const query = queryForControls({
        search: args.nextSearch,
        provider: args.nextProvider,
        offset: args.offset,
      });
      const params = new URLSearchParams({
        source: args.nextSource,
        offset: String(query.offset),
        limit: String(query.limit),
      });
      if (query.search) params.set("search", query.search);
      if (query.provider) params.set("provider", query.provider);

      try {
        const response = await fetch(
          `/api/model-catalog?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error("Catalog request failed.");
        }
        const nextCatalog = (await response.json()) as CatalogViewState;
        if (activeRequestRef.current !== requestId) return;

        setCatalog((current) => {
          if (
            args.mode === "append" &&
            current.source === nextCatalog.source &&
            queryMatches(current.query, nextCatalog.query)
          ) {
            return {
              ...nextCatalog,
              models: [...current.models, ...nextCatalog.models],
            };
          }
          return nextCatalog;
        });
      } catch {
        if (
          controller.signal.aborted ||
          activeRequestRef.current !== requestId
        ) {
          return;
        }

        setCatalog((current) => {
          if (args.mode === "append" && current.source === args.nextSource) {
            return {
              ...current,
              status: "error",
              error: "More models could not be loaded.",
            };
          }

          return errorCatalogState({
            source: args.nextSource,
            query,
          });
        });
      } finally {
        if (activeRequestRef.current === requestId) {
          setLoadingMode(null);
          if (abortRef.current === controller) {
            abortRef.current = null;
          }
        }
      }
    },
    [],
  );

  const currentControlsQuery = queryForControls({
    search,
    provider: selectedProvider,
  });
  const isCatalogQueryCurrent =
    activeCatalog !== undefined &&
    queryMatches(activeCatalog.query, currentControlsQuery);

  const clearSearchTimer = useCallback(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }, []);

  const cancelActiveRequest = useCallback(() => {
    activeRequestRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setLoadingMode(null);
  }, []);

  const handleSourceChange = useCallback(
    (nextSource: CatalogSource) => {
      clearSearchTimer();
      setSource(nextSource);
      setSelectedProvider(null);
      void loadCatalog({
        nextSource,
        nextSearch: search,
        nextProvider: null,
        offset: 0,
        mode: "replace",
      });
    },
    [clearSearchTimer, loadCatalog, search],
  );

  const handleSearchChange = useCallback(
    (nextSearch: string) => {
      setSearch(nextSearch);
      clearSearchTimer();
      cancelActiveRequest();
      searchTimerRef.current = setTimeout(() => {
        void loadCatalog({
          nextSource: source,
          nextSearch,
          nextProvider: selectedProvider,
          offset: 0,
          mode: "replace",
        });
      }, SEARCH_DEBOUNCE_MS);
    },
    [
      cancelActiveRequest,
      clearSearchTimer,
      loadCatalog,
      selectedProvider,
      source,
    ],
  );

  const handleProviderSelect = useCallback(
    (provider: string | null) => {
      clearSearchTimer();
      setSelectedProvider(provider);
      void loadCatalog({
        nextSource: source,
        nextSearch: search,
        nextProvider: provider,
        offset: 0,
        mode: "replace",
      });
    },
    [clearSearchTimer, loadCatalog, search, source],
  );

  const loadMore = useCallback(() => {
    if (!isCatalogQueryCurrent) {
      clearSearchTimer();
      void loadCatalog({
        nextSource: source,
        nextSearch: search,
        nextProvider: selectedProvider,
        offset: 0,
        mode: "replace",
      });
      return;
    }

    void loadCatalog({
      nextSource: source,
      nextSearch: search,
      nextProvider: selectedProvider,
      offset: models.length,
      mode: "append",
    });
  }, [
    clearSearchTimer,
    isCatalogQueryCurrent,
    loadCatalog,
    models.length,
    search,
    selectedProvider,
    source,
  ]);

  useEffect(() => {
    if (
      selectedProvider &&
      activeCatalog &&
      !activeCatalog.providers.includes(selectedProvider)
    ) {
      setSelectedProvider(null);
    }
  }, [activeCatalog, selectedProvider]);

  useEffect(
    () => () => {
      clearSearchTimer();
      abortRef.current?.abort();
    },
    [clearSearchTimer],
  );

  return {
    activeCatalog,
    handleProviderSelect,
    handleSearchChange,
    handleSourceChange,
    isCatalogQueryCurrent,
    isLoading,
    isLoadingMore,
    loadMore,
    models,
    search,
    selectedProvider,
    source,
  };
}
