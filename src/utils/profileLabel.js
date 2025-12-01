export function formatAuthorLabel(profile, fallback = 'Utente') {
  const displayName =
    typeof profile?.display_name === 'string'
      ? profile.display_name.trim()
      : '';
  if (displayName) return displayName;
  const handle =
    typeof profile?.handle === 'string' ? profile.handle.trim() : '';
  if (handle) return `@${handle}`;
  return fallback;
}
