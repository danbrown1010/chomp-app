import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply persisted theme and accent before first render
const savedTheme = localStorage.getItem('chomp-theme') || 'dark'
document.documentElement.classList.add(savedTheme)

const savedAccent = localStorage.getItem('chomp-accent') || '#f97316'
document.documentElement.style.setProperty('--chomp-accent', savedAccent)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
