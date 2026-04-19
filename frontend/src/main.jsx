import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(22, 28, 42, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: '14px',
            fontSize: '0.85rem',
            padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { borderLeft: '3px solid #10b981' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { borderLeft: '3px solid #ef4444' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
