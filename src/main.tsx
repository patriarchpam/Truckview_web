import React from 'react';
import './index.css'
import ReactDOM from 'react-dom/client'
import { App } from './App'

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
