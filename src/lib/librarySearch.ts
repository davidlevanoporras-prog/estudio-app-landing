/**
 * Filtrado en tiempo real para mazos (Flashcards / Simulador).
 */

export function normalizeSearchQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** `true` si la query vacía o coincide con alguno de los campos. */
export function matchesLibrarySearch(
  query: string,
  parts: Array<string | number | null | undefined>,
): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;

  const haystack = parts
    .filter((part) => part !== null && part !== undefined && String(part).length > 0)
    .map((part) => normalizeSearchQuery(String(part)).replace(/^#/, ""))
    .join(" ");

  const needle = q.replace(/^#/, "");
  return haystack.includes(needle);
}

export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform);
}
