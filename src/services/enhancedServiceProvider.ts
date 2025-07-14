/**
 * Enhanced Service Provider - Multi-Mode Claude Code Integration
 * 
 * Supports three modes:
 * 1. Local CLI Mode - Direct integration with locally installed Claude Code CLI
 * 2. Electron Mode - Electron-enhanced features with file system access
 * 3. Browser Mock Mode - Development and fallback mode
 */

import { claudeCodeService as browserService } from './claudeCodeService'
import { electronClaudeCodeService } from './electronClaudeCodeService'
import LocalClaudeCodeService, { type ClaudeCodeStatus } from './localClaudeCodeService'

// Re-export types
export type { ServiceStatus } from './claudeCodeService'
export type { ClaudeCodeStatus, ClaudeProject, ClaudeSession } from './localClaudeCodeService'

export type ServiceMode = 'local-cli' | 'electron' | 'browser-mock'

export interface EnhancedServiceStatus {
  mode: ServiceMode
  claudeCodeStatus?: ClaudeCodeStatus
  isElectron: boolean
  isDevelopment: boolean
  capabilities: {
    realCLI: boolean
    fileSystem: boolean
    projectManagement: boolean
    sessionHistory: boolean
    mcpServers: boolean
  }
}

// Global service instances
let activeService: any = null
let localClaudeService: LocalClaudeCodeService | null = null
let serviceMode: ServiceMode = 'browser-mock'

/**
 * Initialize the most appropriate Claude Code service
 */
export async function initializeEnhancedClaudeCodeService(): Promise<any> {
  // Detect environment
  const isElectron = !!(window as any).electronAPI?.isElectron
  const isDev = (window as any).electronAPI?.isDev || process.env.NODE_ENV === 'development'

  console.log('🔍 Detecting Claude Code environment...')

  // Try to initialize local CLI service first (highest priority)
  if (isElectron) {
    try {
      localClaudeService = new LocalClaudeCodeService()
      const claudeStatus = await localClaudeService.checkInstallation()

      if (claudeStatus.isInstalled) {
        console.log('✅ Local Claude Code CLI detected - Using Local CLI Mode')
        serviceMode = 'local-cli'
        activeService = createEnhancedLocalService(localClaudeService)
        return activeService
      } else {
        console.log('⚠️ Claude Code CLI not found locally')
      }
    } catch (error) {
      console.warn('Failed to initialize local Claude Code service:', error)
    }
  }

  // Fallback to Electron mode if available
  if (isElectron) {
    console.log('🖥️ Using Electron Mode - Enhanced file system features')
    serviceMode = 'electron'
    activeService = electronClaudeCodeService
    return activeService
  }

  // Final fallback to browser mock mode
  console.log('🌐 Using Browser Mock Mode - Limited functionality')
  serviceMode = 'browser-mock'
  activeService = browserService
  return activeService
}

/**
 * Create an enhanced service that wraps the local Claude Code service
 */
function createEnhancedLocalService(localService: LocalClaudeCodeService) {
  return {
    // Standard Claude Code service interface
    async chat(message: string, options?: any) {
      try {
        // Start interactive session if not active
        const sessionStatus = localService.getSessionStatus()
        if (!sessionStatus.isActive) {
          const sessionResult = await localService.startInteractiveSession(options?.currentDirectory)
          if (!sessionResult.success) {
            throw new Error(sessionResult.error || 'Failed to start Claude session')
          }
        }

        // Send message and get response
        const result = await localService.sendMessage(message)
        
        return {
          output: result.output,
          success: result.success,
          error: result.error,
          tokens: estimateTokens(message + result.output),
          cost: estimateCost(message + result.output),
          duration: result.duration
        }
      } catch (error) {
        return {
          output: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: 0
        }
      }
    },

    async executeTerminalCommand(command: string) {
      const result = await localService.executeCommand(command)
      return {
        output: result.output,
        success: result.success,
        error: result.error,
        duration: result.duration
      }
    },

    async getStatus() {
      const claudeStatus = await localService.checkInstallation()
      const authStatus = await localService.checkAuthentication()

      return {
        available: claudeStatus.isInstalled && authStatus.isAuthenticated,
        version: claudeStatus.version || 'Unknown',
        environment: serviceMode,
        capabilities: ['real-cli', 'project-management', 'session-history'],
        features: {
          realCLI: true,
          fileWatching: true,
          terminalExec: true,
          projectAnalysis: true,
          codeGeneration: true
        },
        hasApiKey: authStatus.isAuthenticated,
        claudeCodeStatus: claudeStatus,
        authenticationStatus: authStatus
      }
    },

    setApiKey(apiKey: string) {
      // Local CLI doesn't use API keys directly - authentication is handled via claude login
      console.log('Local CLI mode: Use "claude" command in terminal to authenticate')
    },

    // Enhanced local-specific methods
    async getProjects() {
      return await localService.discoverProjects()
    },

    async switchProject(projectName: string) {
      return await localService.switchProject(projectName)
    },

    async createProject(name: string, path?: string) {
      return await localService.createProject(name, path)
    },

    async installClaudeCode() {
      return await localService.installClaudeCode()
    },

    // File system operations (inherited from electron service when available)
    async createFile(path: string, content: string) {
      if ((window as any).electronAPI?.createFile) {
        return await (window as any).electronAPI.createFile(path, content)
      }
      throw new Error('File operations not available in current environment')
    },

    async editFile(path: string, content: string) {
      if ((window as any).electronAPI?.editFile) {
        return await (window as any).electronAPI.editFile(path, content)
      }
      throw new Error('File operations not available in current environment')
    },

    async analyzeProject(path?: string, options?: any) {
      // Use Claude to analyze the project
      const analysisPrompt = `Please analyze this project structure and provide insights about the codebase, architecture, and potential improvements. Focus on: ${JSON.stringify(options || {})}`
      return await this.chat(analysisPrompt, { currentDirectory: path })
    },

    // Session management
    getSessionStatus() {
      return localService.getSessionStatus()
    },

    async terminate() {
      await localService.terminate()
    }
  }
}

/**
 * Get the active Claude Code service
 */
export function getClaudeCodeService() {
  if (!activeService) {
    // Return a promise that resolves to the service
    return initializeEnhancedClaudeCodeService()
  }
  return activeService
}

/**
 * Get enhanced service status
 */
export async function getEnhancedServiceStatus(): Promise<EnhancedServiceStatus> {
  const isElectron = !!(window as any).electronAPI?.isElectron
  const isDev = (window as any).electronAPI?.isDev || process.env.NODE_ENV === 'development'

  let claudeCodeStatus: ClaudeCodeStatus | undefined

  if (localClaudeService) {
    claudeCodeStatus = await localClaudeService.checkInstallation()
  }

  return {
    mode: serviceMode,
    claudeCodeStatus,
    isElectron,
    isDevelopment: isDev,
    capabilities: {
      realCLI: serviceMode === 'local-cli',
      fileSystem: isElectron,
      projectManagement: serviceMode === 'local-cli',
      sessionHistory: serviceMode === 'local-cli',
      mcpServers: serviceMode === 'local-cli' || serviceMode === 'electron'
    }
  }
}

/**
 * Switch service mode (for testing/debugging)
 */
export async function switchServiceMode(mode: ServiceMode) {
  serviceMode = mode
  activeService = null
  return await initializeEnhancedClaudeCodeService()
}

/**
 * Get local Claude Code service instance (if available)
 */
export function getLocalClaudeCodeService(): LocalClaudeCodeService | null {
  return localClaudeService
}

// Utility functions
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

function estimateCost(text: string): number {
  // Rough estimate based on Claude pricing
  const tokens = estimateTokens(text)
  return tokens * 0.00003 // Approximate cost per token
}

// Re-export original services for backward compatibility
export { electronClaudeCodeService, browserService as claudeCodeService }
export { isElectronEnvironment, isDevelopmentMode } from './serviceProvider'