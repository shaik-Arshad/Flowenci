import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1a1612',
                        color: '#f0ebe4',
                        border: '1px solid #2a2520',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#f97c0a', secondary: '#0e0c0a' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#0e0c0a' } },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
)
