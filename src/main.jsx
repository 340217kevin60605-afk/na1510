import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // 👈 這行超重要！就是它負責載入所有漂亮排版和圓角
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)