/**
 * Enhanced fetch functions with Next.js caching
 * Use these for external API calls that benefit from caching
 */

/**
 * Cached fetch with default Next.js caching
 */
export async function cachedFetch(
  url: string,
  options: RequestInit & {
    next?: {
      revalidate?: number;
      tags?: string[];
    };
  } = {}
) {
  const defaultOptions = {
    next: {
      revalidate: 3600, // 1 hour default
      ...options.next,
    },
  };

  return fetch(url, {
    ...options,
    next: defaultOptions.next,
  });
}

/**
 * Short-term cached fetch (5 minutes)
 */
export async function shortCachedFetch(url: string, options: RequestInit = {}) {
  return cachedFetch(url, {
    ...options,
    next: {
      revalidate: 300, // 5 minutes
    },
  });
}

/**
 * Long-term cached fetch (24 hours)
 */
export async function longCachedFetch(url: string, options: RequestInit = {}) {
  return cachedFetch(url, {
    ...options,
    next: {
      revalidate: 86400, // 24 hours
    },
  });
}

/**
 * No-cache fetch for dynamic content
 */
export async function noCacheFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    cache: 'no-store',
  });
}

/**
 * Force cache fetch - never revalidates
 */
export async function forceCachedFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    cache: 'force-cache',
  });
}