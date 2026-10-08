"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Fires a PageView on every client-side route change for both pixels.
 * The initial page load is already tracked by the pixel base codes.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      window.fbq?.("track", "PageView");
      window.ttq?.page?.();
    } catch {
      /* noop */
    }
  }, [pathname, searchParams]);

  return null;
}
