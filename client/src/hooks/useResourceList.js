import { useCallback, useEffect, useMemo, useState } from "react";
import useDebounce from "./useDebounce";
import useFetch from "./useFetch";
import { cleanParams } from "../utils/format";

// Filter, sort, search and pagination state for a paginated list endpoint.
//  initial     - starting filter values, e.g. { search: "", category: "", sort: "-date" }
//  filterKeys  - which keys count as "filters" (used for the Clear filters button and empty-state wording)
// Changing any filter returns to page 1. Search is debounced; `pending` is true while the debounce is waiting.
export default function useResourceList(service, { initial, filterKeys = [], limit = 10 }) {
  const [filters, setFilters] = useState({ ...initial, page: 1 });
  const debouncedSearch = useDebounce(filters.search ?? "");

  const params = useMemo(
    () => cleanParams({ ...filters, search: debouncedSearch, limit }),
    [JSON.stringify(filters), debouncedSearch, limit] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const list = useFetch(() => service.list(params), [JSON.stringify(params)]);

  const items = list.data?.items || [];
  const pagination = list.data?.pagination;

  // Deleting the last item on a page steps back one page instead of showing an empty page.
  useEffect(() => {
    if (list.data && list.data.items.length === 0 && filters.page > 1) setFilters((f) => ({ ...f, page: f.page - 1 }));
  }, [list.data, filters.page]);

  const setFilter = useCallback((patch) => setFilters((f) => ({ ...f, ...patch, page: 1 })), []);
  const setPage = useCallback((page) => setFilters((f) => ({ ...f, page })), []);
  const reset = useCallback(() => setFilters({ ...initial, page: 1 }), []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...list, items, pagination, filters, params,
    setFilter, setPage, reset,
    hasFilters: filterKeys.some((k) => Boolean(filters[k])),
    pending: (filters.search ?? "") !== debouncedSearch,
  };
}
