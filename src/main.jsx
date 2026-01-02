import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DiceProvider } from './context/DiceContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DiceProvider>
      <App />
    </DiceProvider>
  </StrictMode>,
)
