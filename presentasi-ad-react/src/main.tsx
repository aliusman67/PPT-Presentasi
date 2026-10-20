import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/presentation.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Kontainer #root tidak ditemukan di index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
