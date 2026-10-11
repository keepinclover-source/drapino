import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { hydrateFromServer } from './utils/serverSync';
import './index.css';

// ابتدا داده‌ها از دیتابیس سرور بارگذاری می‌شوند (در صورت در دسترس بودن) و سپس برنامه رندر می‌شود
hydrateFromServer().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
