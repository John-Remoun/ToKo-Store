import { useCallback, useEffect, useState } from 'react';
import api, { apiError, unwrap } from '../lib/api';

/**
 * Fetches `url` (with optional axios `config`) whenever `deps` change.
 * Returns { data, loading, error, refetch }.
 */
export default function useFetch(url, { deps = [], config, skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (skip || !url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, config);
      setData(unwrap(res));
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [url, skip, JSON.stringify(config)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, ...deps]);

  return { data, loading, error, refetch: load };
}
