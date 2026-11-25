import { useCallback, useEffect, useRef, useState } from "react";

// Runs `fetcher` on mount and whenever `deps` change. Stale responses are ignored.
// Returns { data, loading, error, reload }. Existing data stays visible while reloading, and
// `error` is set (with data still present) when a refresh fails, so pages can say the data may be out of date.
// options.refetchOnFocus: reload when the tab becomes visible again after `minAge` ms, so data does not go stale.
export default function useFetch(fetcher, deps = [], { refetchOnFocus = false, minAge = 30000 } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const requestId = useRef(0);
  const lastLoaded = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (id === requestId.current) {
        lastLoaded.current = Date.now();
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (id === requestId.current) setState((s) => ({ data: s.data, loading: false, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => { requestId.current += 1; };
  }, [load]);

  useEffect(() => {
    if (!refetchOnFocus) return undefined;
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastLoaded.current > minAge) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refetchOnFocus, minAge, load]);

  return { ...state, reload: load };
}
