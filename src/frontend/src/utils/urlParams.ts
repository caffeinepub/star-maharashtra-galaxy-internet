/**
 * Parse URL parameters from both search and hash
 */
export function parseUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};

  // Parse search params
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // Parse hash params (for hash-based routing)
  const hash = window.location.hash;
  if (hash.includes('?')) {
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    hashParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return params;
}

/**
 * Get a specific URL parameter
 */
export function getUrlParam(key: string): string | null {
  const params = parseUrlParams();
  return params[key] || null;
}

/**
 * Store sensitive parameters in sessionStorage and remove from URL
 */
export function storeAndRemoveSensitiveParams(sensitiveKeys: string[]): void {
  const params = parseUrlParams();
  let hasChanges = false;

  sensitiveKeys.forEach((key) => {
    if (params[key]) {
      sessionStorage.setItem(key, params[key]);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    // Remove sensitive params from URL
    const url = new URL(window.location.href);
    sensitiveKeys.forEach((key) => {
      url.searchParams.delete(key);
    });

    // Update URL without reload
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Store a single parameter in sessionStorage
 */
export function storeSessionParameter(key: string, value: string): void {
  sessionStorage.setItem(key, value);
}

/**
 * Get a parameter from sessionStorage (for sensitive params)
 */
export function getStoredParam(key: string): string | null {
  return sessionStorage.getItem(key);
}

/**
 * Get secret parameter from sessionStorage or URL
 */
export function getSecretParameter(key: string): string | null {
  // First check sessionStorage
  const stored = sessionStorage.getItem(key);
  if (stored) {
    return stored;
  }

  // Then check URL params
  return getUrlParam(key);
}

/**
 * Clear a stored parameter
 */
export function clearStoredParam(key: string): void {
  sessionStorage.removeItem(key);
}

/**
 * Sanitize URL for printing by removing sensitive parameters
 * Returns the sanitized URL string
 */
export function sanitizeUrlForPrint(): string {
  const sensitiveParams = ['caffeineAdminToken', 'adminSetupCode', 'token', 'secret'];
  const url = new URL(window.location.href);
  
  sensitiveParams.forEach((param) => {
    url.searchParams.delete(param);
  });

  return url.toString();
}

/**
 * Restore URL after printing
 */
export function restoreUrlAfterPrint(originalUrl: string): void {
  window.history.replaceState({}, '', originalUrl);
}
