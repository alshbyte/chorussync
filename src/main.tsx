import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { App } from './App'
import './styles/globals.css'

// Apply persisted theme before render to prevent flash
try {
  const stored = JSON.parse(localStorage.getItem('chorussync-ui') || '{}')
  const theme = stored?.state?.theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
} catch { /* use default (light) */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
