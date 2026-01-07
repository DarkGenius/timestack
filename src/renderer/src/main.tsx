import './assets/main.css';
import './i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import App from './App';

const toaster = new Toaster();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToasterProvider toaster={toaster}>
      <App />
      <ToasterComponent />
    </ToasterProvider>
  </StrictMode>
);
