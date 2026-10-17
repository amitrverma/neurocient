"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminResource<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Admin request failed: ${response.status}`);
        }
        setData(await response.json());
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("Admin data request failed:", requestError);
        setError("This operational data could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [url, reloadKey]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);
  return { data, loading, error, retry };
}
