/**
 * Zero-Crash Payload Hygiene & Defensive Utilities
 * Adheres to Production Directive #6 (Database Persistence, Clean Payloads, & Transaction Integrity)
 */

/**
 * Recursively strips all `undefined` values from an object, array, or nested structure.
 * Guaranteed to produce clean, JSON-safe payloads for Firestore and database drivers.
 */
export function stripUndefined<T>(input: T): T {
  if (input === null || input === undefined) {
    return (input === undefined ? null : input) as T;
  }

  if (Array.isArray(input)) {
    return input
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as unknown as T;
  }

  if (typeof input === 'object' && input !== null) {
    // Preserve Date or RegExp if any
    if (input instanceof Date || input instanceof RegExp) {
      return input;
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        cleaned[key] = stripUndefined(value);
      }
    }
    return cleaned as T;
  }

  return input;
}

/**
 * Defensive null-safe payload extractor with fallback defaults
 */
export function safeExtractPayload<T extends Record<string, unknown>>(
  reqBody: unknown,
  defaults: T
): T {
  if (!reqBody || typeof reqBody !== 'object' || Array.isArray(reqBody)) {
    return { ...defaults };
  }

  const raw = reqBody as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (raw[key] !== undefined && raw[key] !== null) {
      result[key] = raw[key];
    } else {
      result[key] = defaultValue;
    }
  }

  return stripUndefined(result as T);
}
