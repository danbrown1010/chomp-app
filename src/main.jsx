import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply persisted theme before first render; write default so it's
// always set after first visit (prevents blank localStorage on reload)
const savedTheme = localStorage.getItem('chomp-theme') || 'dark'
if (!localStorage.getItem('chomp-theme')) localStorage.setItem('chomp-theme', 'dark')
document.documentElement.classList.add(savedTheme)

// --color-accent is the Tailwind v4 @theme variable; overriding it on
// the root element cascades to any utility that reads var(--color-accent)
const savedAccent = localStorage.getItem('chomp-accent') || '#f97316'
if (!localStorage.getItem('chomp-accent')) localStorage.setItem('chomp-accent', '#f97316')
document.documentElement.style.setProperty('--color-accent', savedAccent)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
