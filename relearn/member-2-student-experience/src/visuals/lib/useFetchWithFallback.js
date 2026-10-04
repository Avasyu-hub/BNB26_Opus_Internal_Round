import { useEffect, useState } from 'react';

export const API_BASE = import.meta.env?.VITE_API_BASE || import.meta.env?.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetches `path` from the backend; on any failure falls back to `mock`.
 * `source` is 'loading' | 'live' | 'mock' so the UI can label mock data honestly.
 */
export function useFetchWithFallback(path, mock, { skip = false } = {}) {
  const [state, setState] = useState({ data: null, source: 'loading' });

  useEffect(() => {
    if (skip || !path) { setState({ data: mock, source: 'mock' }); return undefined; }
    let alive = true;
    const ctrl = new AbortController();
    fetch(`${API_BASE}${path}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => alive && setState({ data, source: 'live' }))
      .catch(() => alive && setState({ data: mock, source: 'mock' }));
    return () => { alive = false; ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, skip]);

  return state;
}
