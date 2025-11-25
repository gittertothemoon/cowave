const AUTH_QUERY_KEYS = ['code', 'token', 'token_hash', 'type', 'redirect_to', 'error', 'error_description'];
const AUTH_HASH_KEYS = ['access_token', 'refresh_token', 'expires_in', 'token_type'];

export function getCanonicalUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

export function hasAuthNoise(url) {
  if (!url) return false;
  const queryParams = new URLSearchParams(url.search);
  const hashFragment = url.hash?.startsWith('#') ? url.hash.slice(1) : url.hash ?? '';
  const hashParams = hashFragment ? new URLSearchParams(hashFragment) : null;

  const hasQueryNoise = AUTH_QUERY_KEYS.some((key) => queryParams.has(key));
  const hasHashNoise = hashParams
    ? AUTH_HASH_KEYS.some((key) => hashParams.has(key))
    : false;

  return hasQueryNoise || hasHashNoise;
}

export function cleanAuthNoiseFromUrl() {
  if (typeof window === 'undefined') return;
  const currentUrl = new URL(window.location.href);
  if (!hasAuthNoise(currentUrl)) return;
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}
