import React from 'react'
import ReactDOM from 'react-dom/client'
import { GridSettings } from '@carbon/react'
import './styles.scss'
import './App.css'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GridSettings mode="css-grid">
      <App />
    </GridSettings>
  </React.StrictMode>,
)
