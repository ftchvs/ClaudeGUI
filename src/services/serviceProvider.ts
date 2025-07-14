/**
 * Service Provider - Environment Detection & Service Initialization
 * 
 * Automatically detects whether we're running in Electron or browser
 * and provides the appropriate Claude Code service implementation
 */

import { claudeCodeService as browserService } from './claudeCodeService'
import { electronClaudeCodeService } from './electronClaudeCodeService'

// Re-export types
export type { ServiceStatus } from './claudeCodeService'

// Global service instance
let activeService: any = null

export function initializeClaudeCodeService() {
  // Detect if we're running in Electron
  const isElectron = !!(window as any).electronAPI?.isElectron
  
  if (isElectron) {
    console.log('🖥️ Initializing Electron Claude Code Service - Real CLI Integration Enabled')
    activeService = electronClaudeCodeService
  } else {
    console.log('🌐 Initializing Browser Claude Code Service - Mock Mode')
    activeService = browserService
  }
  
  return activeService
}

export function getClaudeCodeService() {
  if (!activeService) {
    return initializeClaudeCodeService()
  }
  return activeService
}

export function isElectronEnvironment(): boolean {
  return !!(window as any).electronAPI?.isElectron
}

export function isDevelopmentMode(): boolean {
  return (window as any).electronAPI?.isDev || process.env.NODE_ENV === 'development'
}

// Re-export for backward compatibility
export { electronClaudeCodeService, browserService as claudeCodeService }