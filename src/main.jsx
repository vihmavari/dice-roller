import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DiceProvider } from './context/DiceContext';
import { RollProvider } from './context/RollContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DiceProvider>
      <RollProvider>
        <App />
      </RollProvider>
    </DiceProvider>
  </StrictMode>,
)
