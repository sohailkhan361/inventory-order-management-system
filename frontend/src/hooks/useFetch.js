import { useState, useEffect, useCallback } from 'react';

/**
 * Generic fetch hook.
 * @param {Function} fetchFn  — async function returning an axios response
 */
export function useFetch(fetchFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // The current callers pass a request with no changing inputs. Keep `load`
  // stable so the effect runs once and `refetch` remains safe to call later.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial data loading is the external synchronization performed by this hook.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}
