import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { DocsApp } from '@/docs/DocsApp';

createRoot(document.getElementById('docs-root')!).render(
  <StrictMode>
    <DocsApp />
  </StrictMode>,
);
