import { defineConfig } from 'tsup';

// Two builds:
//  - ESM (main/module): `humument` stays external — it's a normal dependency
//    the consumer's bundler resolves (no duplication).
//  - IIFE (unpkg/jsdelivr `InhumumentLib` global): bundle `humument` in so the
//    single <script> is self-contained. `p5` is never imported at runtime
//    (type-only), so it's external in both.
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    external: ['p5', 'humument'],
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'InhumumentLib',
    sourcemap: true,
    clean: false,
    target: 'es2022',
    external: ['p5'],
  },
]);
