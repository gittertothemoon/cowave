const AUTH_STORAGE_KEY = 'isAuthenticated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function setAuthenticated() {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
}

export function clearAuthenticated() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getIsAuthenticated() {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export { AUTH_STORAGE_KEY };
