import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary onError={(error, info) => console.error("Logged to telemetry:", error, info)}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
