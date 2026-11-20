import type { CSSProperties } from 'react';

/** Inline style with custom properties. */
export function vars(v: Record<string, string | number>): CSSProperties {
  return v as CSSProperties;
}
