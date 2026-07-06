import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { AboutApp } from '@/about/AboutApp';

createRoot(document.getElementById('about-root')!).render(
  <StrictMode>
    <AboutApp />
  </StrictMode>,
);
