import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
<StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);