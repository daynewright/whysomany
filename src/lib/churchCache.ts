import type { Church } from '../data/defaultChurches';

export const CHURCH_CACHE_KEY = 'wsm_churches_cache_v1';
const CHURCH_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

type ChurchCachePayload = {
  cachedAt: number;
  churches: Church[];
};

function isChurchArray(value: unknown): value is Church[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const church = item as Record<string, unknown>;
    return (
      typeof church.name === 'string' &&
      typeof church.denomination === 'string' &&
      typeof church.address === 'string'
    );
  });
}

export function readCachedChurches(): Church[] | null {
  try {
    const raw = localStorage.getItem(CHURCH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChurchCachePayload;
    if (!parsed || typeof parsed.cachedAt !== 'number' || !isChurchArray(parsed.churches)) {
      return null;
    }
    if (Date.now() - parsed.cachedAt > CHURCH_CACHE_TTL_MS) {
      return null;
    }
    return parsed.churches;
  } catch {
    return null;
  }
}

export function writeCachedChurches(churches: Church[]) {
  try {
    const payload: ChurchCachePayload = { cachedAt: Date.now(), churches };
    localStorage.setItem(CHURCH_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures (private mode/quota/etc).
  }
}

/** Call after a successful admin save so the public page refetches instead of waiting for TTL. */
export function invalidateChurchCache() {
  try {
    localStorage.removeItem(CHURCH_CACHE_KEY);
  } catch {
    // ignore
  }
}
