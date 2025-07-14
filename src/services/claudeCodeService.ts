/**
 * Claude Code Service - Universal Interface
 * 
 * Automatically detects environment and uses appropriate service:
 * - Desktop/Electron: Real Claude Code CLI integration
 * - Web Browser: Anthropic API with simulated CLI features
 * - Tauri: Native CLI bridge (future)
 */

import { claudeCodeCLI, type CLIResponse, type CLISession } from './claudeCodeCLIBridge'
import { webClaudeCodeService } from './webClaudeCodeService'

type ServiceEnvironment = 'cli' | 'web' | 'electron' | 'tauri'

interface UniversalClaudeService {
  chat(message: string, options?: ChatOptions): Promise<CLIResponse>
  createFile(filePath: string, content: string, options?: CreateFileOptions): Promise<CLIResponse>
  editFile(filePath: string, instructions: string, options?: EditOptions): Promise<CLIResponse>
  generateCode(template: string, options?: GenerateOptions): Promise<CLIResponse>
  analyzeProject(path?: string, options?: AnalyzeOptions): Promise<CLIResponse>
  runTests(testPath?: string, options?: TestOptions): Promise<CLIResponse>
  executeTerminalCommand(command: string, options?: ExecOptions): Promise<CLIResponse>
  performFileOperation(operation: any): Promise<CLIResponse>
  getStatus(): Promise<ServiceStatus>
  setApiKey(apiKey: string): void
  startFileWatching(paths: string[]): void
  stopFileWatching(path?: string): void
}

interface ChatOptions {
  files?: string[]
  stream?: boolean
  maxTokens?: number
  conversationHistory?: any[]
  currentDirectory?: string
}

interface CreateFileOptions {
  overwrite?: boolean
  createDirectories?: boolean
}

interface EditOptions {
  backup?: boolean
  interactive?: boolean
}

interface GenerateOptions {
  language?: string
  framework?: string
  output?: string
  parameters?: Record<string, string>
}

interface AnalyzeOptions {
  depth?: number
  include?: string[]
  exclude?: string[]
  format?: 'json' | 'markdown' | 'text'
}

interface TestOptions {
  watch?: boolean
  coverage?: boolean
  parallel?: boolean
}

interface ExecOptions {
  shell?: string
  env?: Record<string, string>
  timeout?: number
}

interface ServiceStatus {
  environment: ServiceEnvironment
  available: boolean
  version?: string
  hasApiKey?: boolean
  session?: CLISession
  capabilities: string[]
  features: {
    realCLI: boolean
    fileWatching: boolean
    terminalExec: boolean
    projectAnalysis: boolean
    codeGeneration: boolean
  }
}

class ClaudeCodeService implements UniversalClaudeService {
  private environment: ServiceEnvironment
  private isCliAvailable: boolean = false
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.environment = this.detectEnvironment()
    this.initializeService()
  }

  /**
   * Detect the current environment
   */
  private detectEnvironment(): ServiceEnvironment {
    // Check for Tauri
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return 'tauri'
    }
    
    // Check for Electron
    if (typeof window !== 'undefined' && (window as any).require) {
      return 'electron'
    }
    
    // Check for Node.js/CLI environment
    if (typeof process !== 'undefined' && process.versions?.node) {
      return 'cli'
    }
    
    // Default to web
    return 'web'
  }

  /**
   * Initialize the appropriate service
   */
  private async initializeService(): Promise<void> {
    console.log(`🔧 Initializing Claude Code Service for ${this.environment} environment`)
    
    switch (this.environment) {
      case 'cli':
      case 'electron':
        await this.initializeCLIService()
        break
        
      case 'tauri':
        await this.initializeTauriService()
        break
        
      case 'web':
      default:
        await this.initializeWebService()
        break
    }
  }

  /**
   * Initialize CLI service
   */
  private async initializeCLIService(): Promise<void> {
    try {
      const status = await claudeCodeCLI.getStatus()
      this.isCliAvailable = status.available
      
      if (this.isCliAvailable) {
        console.log('✅ Real Claude Code CLI integration active')
        
        // Set up event forwarding
        claudeCodeCLI.on('fileChanged', (event) => this.emit('fileChanged', event))
        claudeCodeCLI.on('output', (event) => this.emit('output', event))
        claudeCodeCLI.on('ready', (event) => this.emit('ready', event))
        claudeCodeCLI.on('error', (event) => this.emit('error', event))
      } else {
        console.warn('⚠️ Claude Code CLI not available, falling back to web service')
      }
    } catch (error) {
      console.warn('❌ Failed to initialize CLI service:', error)
      this.isCliAvailable = false
    }
  }

  /**
   * Initialize Tauri service (future implementation)
   */
  private async initializeTauriService(): Promise<void> {
    console.log('🦀 Tauri environment detected - implementing native bridge...')
    // TODO: Implement Tauri-specific CLI bridge
    this.isCliAvailable = false
  }

  /**
   * Initialize web service
   */
  private async initializeWebService(): Promise<void> {
    console.log('🌐 Web environment - using Anthropic API service')
    this.isCliAvailable = false
  }

  /**
   * Get the appropriate service instance
   */
  private getActiveService() {
    return this.isCliAvailable ? claudeCodeCLI : webClaudeCodeService
  }

  /**
   * Chat with Claude
   */
  async chat(message: string, options?: ChatOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      return await claudeCodeCLI.chat(message, {
        files: options?.files,
        stream: options?.stream,
        maxTokens: options?.maxTokens
      })
    } else {
      // Adapt web service to CLI interface
      const result = await webClaudeCodeService.chat(message, {
        files: options?.files,
        currentDirectory: options?.currentDirectory,
        conversationHistory: options?.conversationHistory
      })
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration,
        tokens: result.tokens,
        cost: result.cost
      }
    }
  }

  /**
   * Create files
   */
  async createFile(filePath: string, content: string, options?: CreateFileOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      // Use CLI to create file
      const command = `echo '${content.replace(/'/g, "'\\''")}' > '${filePath}'`
      return await claudeCodeCLI.executeTerminalCommand(command)
    } else {
      // Use web service to simulate file creation
      const result = await webClaudeCodeService.performFileOperation({
        type: 'write',
        path: filePath,
        content: content
      })
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration
      }
    }
  }

  /**
   * Edit files with Claude
   */
  async editFile(filePath: string, instructions: string, options?: EditOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      return await claudeCodeCLI.editFile(filePath, instructions, options)
    } else {
      // Simulate file editing in web environment
      const result = await webClaudeCodeService.performFileOperation({
        type: 'write',
        path: filePath,
        content: `// File edited with instructions: ${instructions}`
      })
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration
      }
    }
  }

  /**
   * Generate code with Claude
   */
  async generateCode(template: string, options?: GenerateOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      return await claudeCodeCLI.generateCode(template, options)
    } else {
      // Use web service to simulate code generation
      const prompt = `Generate ${template} code with the following options:
${options?.language ? `Language: ${options.language}` : ''}
${options?.framework ? `Framework: ${options.framework}` : ''}
${options?.parameters ? `Parameters: ${JSON.stringify(options.parameters)}` : ''}

Please provide a complete, working implementation.`

      const result = await webClaudeCodeService.chat(prompt)
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration,
        tokens: result.tokens,
        cost: result.cost
      }
    }
  }

  /**
   * Analyze project with Claude
   */
  async analyzeProject(path?: string, options?: AnalyzeOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      return await claudeCodeCLI.analyzeProject(path, options)
    } else {
      // Use web service for project analysis
      const prompt = `Analyze the project structure and provide insights:
${path ? `Focus on: ${path}` : 'Analyze entire project'}
${options?.include ? `Include: ${options.include.join(', ')}` : ''}
${options?.exclude ? `Exclude: ${options.exclude.join(', ')}` : ''}

Provide analysis of:
1. Code quality and architecture
2. Potential improvements
3. Security considerations
4. Performance optimizations
5. Best practices recommendations`

      const result = await webClaudeCodeService.chat(prompt)
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration,
        tokens: result.tokens,
        cost: result.cost
      }
    }
  }

  /**
   * Run tests with Claude
   */
  async runTests(testPath?: string, options?: TestOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      return await claudeCodeCLI.runTests(testPath, options)
    } else {
      // Simulate test execution in web environment
      const result = await webClaudeCodeService.executeTerminalCommand(
        `npm test ${testPath || ''} ${options?.coverage ? '--coverage' : ''}`
      )
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration
      }
    }
  }

  /**
   * Perform file operations
   */
  async performFileOperation(operation: any): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      // Use CLI for file operations
      const commands = {
        read: `cat '${operation.path}'`,
        write: `echo '${operation.content?.replace(/'/g, "'\\''")}' > '${operation.path}'`,
        delete: `rm '${operation.path}'`,
        create: `touch '${operation.path}'`
      }
      
      const command = commands[operation.type as keyof typeof commands] || commands.read
      return await claudeCodeCLI.executeTerminalCommand(command)
    } else {
      const result = await webClaudeCodeService.performFileOperation(operation)
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration
      }
    }
  }

  /**
   * Execute terminal commands
   */
  async executeTerminalCommand(command: string, options?: ExecOptions): Promise<CLIResponse> {
    if (this.isCliAvailable) {
      return await claudeCodeCLI.executeTerminalCommand(command, options)
    } else {
      const result = await webClaudeCodeService.executeTerminalCommand(command)
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        duration: result.duration
      }
    }
  }

  /**
   * Get comprehensive service status
   */
  async getStatus(): Promise<ServiceStatus> {
    if (this.isCliAvailable) {
      const cliStatus = await claudeCodeCLI.getStatus()
      return {
        environment: this.environment,
        available: cliStatus.available,
        version: cliStatus.version,
        session: cliStatus.session,
        capabilities: cliStatus.capabilities,
        features: {
          realCLI: true,
          fileWatching: this.environment !== 'web',
          terminalExec: true,
          projectAnalysis: true,
          codeGeneration: true
        }
      }
    } else {
      const webStatus = webClaudeCodeService.getStatus()
      return {
        environment: this.environment,
        available: webStatus.available,
        version: webStatus.version,
        hasApiKey: webStatus.hasApiKey,
        capabilities: ['chat', 'analyze', 'generate', 'simulate'],
        features: {
          realCLI: false,
          fileWatching: false,
          terminalExec: false,
          projectAnalysis: true,
          codeGeneration: true
        }
      }
    }
  }

  /**
   * Set API key (for web service)
   */
  setApiKey(apiKey: string): void {
    webClaudeCodeService.setApiKey(apiKey)
  }

  /**
   * Start file watching
   */
  startFileWatching(paths: string[]): void {
    if (this.isCliAvailable) {
      claudeCodeCLI.startFileWatching(paths)
    } else {
      console.warn('🌐 File watching not available in web environment')
    }
  }

  /**
   * Stop file watching
   */
  stopFileWatching(path?: string): void {
    if (this.isCliAvailable) {
      claudeCodeCLI.stopFileWatching(path)
    }
  }

  /**
   * Check if real CLI is available
   */
  isRealCLI(): boolean {
    return this.isCliAvailable
  }

  /**
   * Get current environment
   */
  getEnvironment(): ServiceEnvironment {
    return this.environment
  }

  /**
   * Event emitter functionality
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isCliAvailable) {
      claudeCodeCLI.destroy()
    }
    this.eventListeners.clear()
  }
}

// Singleton instance
export const claudeCodeService = new ClaudeCodeService()

// Export types and interfaces
export type { 
  UniversalClaudeService, 
  ServiceEnvironment, 
  ServiceStatus,
  ChatOptions,
  EditOptions, 
  GenerateOptions,
  AnalyzeOptions,
  TestOptions,
  ExecOptions
}

export default claudeCodeService