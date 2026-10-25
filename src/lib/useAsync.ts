'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fnRef.current());
      setError(null);
    } catch (e: any) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, deps);

  return { data, error, loading, reload, setData };
}

export function errorMessage(e: any): string {
  const msg: string = e?.message || String(e);
  if (e?.code === '42501' || /row-level security/i.test(msg)) return 'Permission denied — sign in with an admin account to make changes.';
  if (e?.code === '23505') return 'That value already exists (duplicate SKU or slug).';
  return msg;
}
