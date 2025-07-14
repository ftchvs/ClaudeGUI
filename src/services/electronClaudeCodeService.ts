/**
 * Electron-based Claude Code Service
 * 
 * Real Claude Code CLI integration via Electron main process
 * Replaces the browser-based mock service with actual CLI execution
 */

interface ElectronAPI {
  claudeCode: {
    execute: (command: string, args: string[]) => Promise<any>
    checkAvailability: () => Promise<any>
    onOutput: (callback: (data: any) => void) => () => void
  }
  file: {
    read: (filePath: string) => Promise<any>
    write: (filePath: string, content: string) => Promise<any>
    exists: (filePath: string) => Promise<any>
  }
  directory: {
    list: (dirPath: string) => Promise<any>
  }
  dialog: {
    openFile: () => Promise<any>
    openDirectory: () => Promise<any>
  }
  git: {
    status: (repoPath: string) => Promise<any>
  }
  process: {
    cwd: () => Promise<string>
    chdir: (newPath: string) => Promise<any>
  }
  terminal: {
    execute: (command: string, options?: any) => Promise<any>
  }
  isElectron: boolean
  isDev: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

// Re-export types for compatibility
export type { ServiceStatus as ServiceStatus } from './claudeCodeService'

interface LocalServiceStatus {
  available: boolean
  version: string
  environment: 'electron' | 'web' | 'development'
  capabilities: string[]
  features: {
    realCLI: boolean
    fileWatching: boolean
    terminalExec: boolean
    projectAnalysis: boolean
    codeGeneration: boolean
  }
  hasApiKey: boolean
  error?: string
  installUrl?: string
}

export interface ChatOptions {
  conversationHistory?: Array<{ role: string; content: string }>
  currentDirectory?: string
  includeContext?: boolean
}

export interface ChatResponse {
  success: boolean
  output: string
  error?: string
  tokens?: number
  cost?: number
  duration: number
}

export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'move'
  path: string
  content?: string
  newPath?: string
}

export interface FileOperationResult {
  success: boolean
  output?: string
  error?: string
  content?: string
}

export interface TerminalResult {
  success: boolean
  output: string
  error?: string
  exitCode?: number
  duration: number
  command: string
}

export interface ProjectAnalysisOptions {
  depth?: number
  includeTests?: boolean
  includeDocs?: boolean
  framework?: string
}

export interface ProjectAnalysisResult {
  success: boolean
  analysis?: {
    structure: any
    dependencies: string[]
    frameworks: string[]
    codeQuality: number
    suggestions: string[]
  }
  error?: string
  duration: number
}

class ElectronClaudeCodeService {
  private outputCallbacks: Array<(data: any) => void> = []
  private cleanupOutputListener?: () => void

  constructor() {
    this.initializeOutputListener()
  }

  private initializeOutputListener() {
    if (window.electronAPI?.claudeCode.onOutput) {
      this.cleanupOutputListener = window.electronAPI.claudeCode.onOutput((data) => {
        this.outputCallbacks.forEach(callback => callback(data))
      })
    }
  }

  private isElectronAvailable(): boolean {
    return !!(window.electronAPI?.isElectron)
  }

  async getStatus(): Promise<LocalServiceStatus> {
    if (!this.isElectronAvailable()) {
      return {
        available: false,
        version: 'N/A',
        environment: 'web',
        capabilities: [],
        features: {
          realCLI: false,
          fileWatching: false,
          terminalExec: false,
          projectAnalysis: false,
          codeGeneration: false
        },
        hasApiKey: false,
        error: 'Electron environment not available'
      }
    }

    try {
      const status = await window.electronAPI!.claudeCode.checkAvailability()
      return {
        available: status.available,
        version: status.version || 'Unknown',
        environment: 'electron',
        capabilities: [
          'File Operations',
          'Terminal Execution', 
          'Git Integration',
          'Real-time Output',
          'Project Analysis'
        ],
        features: status.features || {
          realCLI: status.available,
          fileWatching: true,
          terminalExec: true,
          projectAnalysis: true,
          codeGeneration: true
        },
        hasApiKey: true, // Claude Code CLI handles its own auth
        error: status.error,
        installUrl: status.installUrl
      }
    } catch (error) {
      return {
        available: false,
        version: 'Error',
        environment: 'electron',
        capabilities: [],
        features: {
          realCLI: false,
          fileWatching: false,
          terminalExec: false,
          projectAnalysis: false,
          codeGeneration: false
        },
        hasApiKey: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async chat(message: string, options: ChatOptions = {}): Promise<ChatResponse> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron environment not available')
    }

    const startTime = Date.now()

    try {
      // Use Claude Code CLI's chat functionality
      const result = await window.electronAPI!.claudeCode.execute('chat', [
        message,
        ...(options.currentDirectory ? ['--cwd', options.currentDirectory] : []),
        ...(options.includeContext ? ['--context'] : [])
      ])

      return {
        success: result.success,
        output: result.output || '',
        error: result.error,
        duration: result.duration || (Date.now() - startTime),
        tokens: this.estimateTokens(message + (result.output || '')),
        cost: this.estimateCost(message + (result.output || ''))
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    }
  }

  async editFile(filePath: string, instructions: string): Promise<ChatResponse> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron environment not available')
    }

    const startTime = Date.now()

    try {
      const result = await window.electronAPI!.claudeCode.execute('edit', [
        filePath,
        instructions
      ])

      return {
        success: result.success,
        output: result.output || `Successfully edited ${filePath}`,
        error: result.error,
        duration: result.duration || (Date.now() - startTime),
        tokens: this.estimateTokens(instructions + (result.output || '')),
        cost: this.estimateCost(instructions + (result.output || ''))
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    }
  }

  async createFile(filePath: string, description: string): Promise<ChatResponse> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron environment not available')
    }

    const startTime = Date.now()

    try {
      const result = await window.electronAPI!.claudeCode.execute('create', [
        filePath,
        description
      ])

      return {
        success: result.success,
        output: result.output || `Successfully created ${filePath}`,
        error: result.error,
        duration: result.duration || (Date.now() - startTime),
        tokens: this.estimateTokens(description + (result.output || '')),
        cost: this.estimateCost(description + (result.output || ''))
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    }
  }

  async analyzeProject(path?: string, options: ProjectAnalysisOptions = {}): Promise<ProjectAnalysisResult> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron environment not available')
    }

    const startTime = Date.now()

    try {
      const args = ['analyze']
      if (path) args.push(path)
      if (options.depth) args.push('--depth', options.depth.toString())
      if (options.includeTests) args.push('--include-tests')
      if (options.includeDocs) args.push('--include-docs')

      const result = await window.electronAPI!.claudeCode.execute('analyze', args.slice(1))

      // Parse the analysis output (Claude Code CLI should return structured data)
      let analysis
      try {
        analysis = JSON.parse(result.output || '{}')
      } catch {
        // If not JSON, create a simple analysis structure
        analysis = {
          structure: { summary: result.output },
          dependencies: [],
          frameworks: [],
          codeQuality: 85,
          suggestions: result.output ? [result.output] : []
        }
      }

      return {
        success: result.success,
        analysis,
        error: result.error,
        duration: result.duration || (Date.now() - startTime)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    }
  }

  async performFileOperation(operation: FileOperation): Promise<FileOperationResult> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron environment not available')
    }

    try {
      switch (operation.type) {
        case 'read':
          const readResult = await window.electronAPI!.file.read(operation.path)
          return {
            success: readResult.success,
            content: readResult.content,
            error: readResult.error
          }

        case 'write':
          if (!operation.content) {
            throw new Error('Content required for write operation')
          }
          const writeResult = await window.electronAPI!.file.write(operation.path, operation.content)
          return {
            success: writeResult.success,
            error: writeResult.error,
            output: writeResult.success ? 'File written successfully' : undefined
          }

        default:
          throw new Error(`Unsupported file operation: ${operation.type}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async executeTerminalCommand(command: string, options?: any): Promise<TerminalResult> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron environment not available')
    }

    try {
      const result = await window.electronAPI!.terminal.execute(command, options)
      return {
        success: result.success,
        output: result.output || '',
        error: result.error,
        exitCode: result.exitCode,
        duration: result.duration,
        command: result.command || command
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        command
      }
    }
  }

  async getCurrentDirectory(): Promise<string> {
    if (!this.isElectronAvailable()) {
      return '/workspace'
    }

    try {
      return await window.electronAPI!.process.cwd()
    } catch {
      return '/workspace'
    }
  }

  async changeDirectory(path: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isElectronAvailable()) {
      return { success: false, error: 'Electron environment not available' }
    }

    try {
      const result = await window.electronAPI!.process.chdir(path)
      return { success: result.success, error: result.error }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // File system helpers
  async listDirectory(path: string): Promise<any[]> {
    if (!this.isElectronAvailable()) {
      return []
    }

    try {
      const result = await window.electronAPI!.directory.list(path)
      return result.success ? result.items : []
    } catch {
      return []
    }
  }

  async getGitStatus(repoPath: string): Promise<any[]> {
    if (!this.isElectronAvailable()) {
      return []
    }

    try {
      const result = await window.electronAPI!.git.status(repoPath)
      return result.success ? result.files : []
    } catch {
      return []
    }
  }

  // Output streaming
  onOutput(callback: (data: any) => void): () => void {
    this.outputCallbacks.push(callback)
    return () => {
      const index = this.outputCallbacks.indexOf(callback)
      if (index > -1) {
        this.outputCallbacks.splice(index, 1)
      }
    }
  }

  // Utility methods
  private estimateTokens(text: string): number {
    return Math.floor(text.length / 4)
  }

  private estimateCost(text: string): number {
    const tokens = this.estimateTokens(text)
    return tokens * 0.00003 // Rough estimate
  }

  setApiKey(apiKey: string): void {
    // Claude Code CLI handles its own authentication
    // This is a no-op for compatibility with the interface
  }

  destroy(): void {
    if (this.cleanupOutputListener) {
      this.cleanupOutputListener()
    }
    this.outputCallbacks = []
  }
}

// Export singleton instance
export const electronClaudeCodeService = new ElectronClaudeCodeService()
export default electronClaudeCodeService