/**
 * Parent ↔ preview-iframe message protocol.
 *
 * The iframe shims `console.*` and listens for `window.onerror` and
 * `unhandledrejection`. Each event is forwarded to the parent via
 * `postMessage` as a typed envelope.
 */

export type IframeMessage =
  | { kind: 'log'; level: 'log' | 'warn' | 'error' | 'info'; message: string; line?: number }
  | { kind: 'ready' }
  | { kind: 'sketch-error'; message: string; line?: number; column?: number };

export const PARENT_ORIGIN_TAG = 'inhumument-editor';
