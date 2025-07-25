import React from 'react'
import ReactDOM from 'react-dom/client'
import EnhancedApp from './EnhancedApp.tsx'
import './index.css'

// Initialize Claude Code service based on environment
import { initializeClaudeCodeService } from './services/serviceProvider'
initializeClaudeCodeService()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EnhancedApp />
  </React.StrictMode>,
)