import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs `fn` whenever `deps` change; ignores stale responses. Returns { data, loading, error, reload }. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((res) => active && setState({ data: res, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
