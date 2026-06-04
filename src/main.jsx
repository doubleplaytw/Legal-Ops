import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import IntakePage from './pages/IntakePage.jsx'

const isIntake = window.location.pathname === '/intake'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isIntake ? <IntakePage /> : <App />}
  </StrictMode>,
)
