let cachedPromise: Promise<{ status: boolean }> | null = null;
let cachedResult: { status: boolean } | null = null;

export function getCheckStatusCache() {
  return { cachedPromise, cachedResult };
}

export function setCheckStatusCache(
  promise: Promise<{ status: boolean }> | null,
  result: { status: boolean } | null
) {
  cachedPromise = promise;
  cachedResult = result;
}

export function invalidateCheckStatus(): void {
  cachedPromise = null;
  cachedResult = null;
}
