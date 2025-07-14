/**
 * Claude Code CLI Bridge
 * 
 * Bridges the GUI with the actual Claude Code CLI running locally
 * Handles real CLI communication, file operations, and terminal integration
 */

interface CLIResponse {
  success: boolean
  output: string
  error?: string
  exitCode?: number
  duration: number
  files?: string[]
  tokens?: number
  cost?: number
}

interface CLISession {
  id: string
  workingDirectory: string
  environment: Record<string, string>
  isActive: boolean
  pid?: number
}

interface FileWatchEvent {
  type: 'created' | 'modified' | 'deleted'
  path: string
  timestamp: Date
}

export class ClaudeCodeCLIBridge {
  private isAvailable: boolean = false
  private cliPath: string = 'claude'
  private currentSession: CLISession | null = null
  private workingDirectory: string = typeof process !== 'undefined' && process.cwd ? process.cwd() : '/workspace'
  private fileWatchers: Map<string, any> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.initializeCLI()
  }

  /**
   * Initialize and detect Claude Code CLI
   */
  private async initializeCLI(): Promise<void> {
    try {
      // Check if Claude Code CLI is available
      const result = await this.executeCommand(['--version'])
      
      if (result.success && result.output.includes('claude')) {
        this.isAvailable = true
        console.log('✅ Claude Code CLI detected:', result.output.trim())
        
        // Create initial session
        this.currentSession = {
          id: this.generateSessionId(),
          workingDirectory: this.workingDirectory,
          environment: (typeof process !== 'undefined' ? process.env : {}) as Record<string, string>,
          isActive: true
        }
        
        this.emit('ready', { version: result.output.trim() })
      } else {
        throw new Error('Claude Code CLI not responding correctly')
      }
    } catch (error) {
      this.isAvailable = false
      console.warn('⚠️ Claude Code CLI not available:', error)
      this.emit('error', { 
        message: 'Claude Code CLI not found. Please install Claude Code CLI first.',
        suggestion: 'Visit https://docs.anthropic.com/claude-code for installation instructions'
      })
    }
  }

  /**
   * Execute a Claude Code CLI command
   */
  private async executeCommand(args: string[], input?: string): Promise<CLIResponse> {
    const startTime = Date.now()

    if (!this.isAvailable) {
      return {
        success: false,
        output: '',
        error: 'Claude Code CLI not available',
        duration: Date.now() - startTime
      }
    }

    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      return this.simulateCommand(args, input)
    }

    try {
      // Use dynamic import for Node.js modules (if available)
      const { spawn } = await import('child_process')
      
      return new Promise((resolve) => {
        const child = spawn(this.cliPath, args, {
          cwd: this.workingDirectory,
          env: this.currentSession?.environment || (typeof process !== 'undefined' ? process.env : {}),
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        child.stdout?.on('data', (data) => {
          stdout += data.toString()
          // Emit real-time output for streaming
          this.emit('output', { type: 'stdout', data: data.toString() })
        })

        child.stderr?.on('data', (data) => {
          stderr += data.toString()
          this.emit('output', { type: 'stderr', data: data.toString() })
        })

        // Send input if provided
        if (input && child.stdin) {
          child.stdin.write(input)
          child.stdin.end()
        }

        child.on('close', (code) => {
          const duration = Date.now() - startTime
          
          resolve({
            success: code === 0,
            output: stdout,
            error: stderr || undefined,
            exitCode: code || 0,
            duration
          })
        })

        child.on('error', (error) => {
          resolve({
            success: false,
            output: '',
            error: error.message,
            duration: Date.now() - startTime
          })
        })

        // Store PID for session management
        if (this.currentSession) {
          this.currentSession.pid = child.pid
        }
      })
    } catch (error) {
      // Fallback for web environment
      return this.simulateCommand(args, input)
    }
  }

  /**
   * Interactive chat with Claude Code CLI
   */
  async chat(message: string, options?: {
    files?: string[]
    stream?: boolean
    maxTokens?: number
  }): Promise<CLIResponse> {
    const args = ['chat']
    
    // Add file context if provided
    if (options?.files?.length) {
      for (const file of options.files) {
        args.push('--file', file)
      }
    }
    
    // Add streaming option
    if (options?.stream) {
      args.push('--stream')
    }
    
    // Add max tokens
    if (options?.maxTokens) {
      args.push('--max-tokens', options.maxTokens.toString())
    }

    // Execute chat command with message as input
    const result = await this.executeCommand(args, message)
    
    // Parse Claude's response for token usage (if available)
    if (result.success && result.output) {
      const tokenMatch = result.output.match(/(\d+) tokens/)
      if (tokenMatch) {
        result.tokens = parseInt(tokenMatch[1])
        result.cost = this.calculateCost(result.tokens)
      }
    }
    
    return result
  }

  /**
   * Edit files with Claude Code CLI
   */
  async editFile(filePath: string, instructions: string, options?: {
    backup?: boolean
    interactive?: boolean
  }): Promise<CLIResponse> {
    const args = ['edit', filePath]
    
    if (options?.backup) {
      args.push('--backup')
    }
    
    if (options?.interactive) {
      args.push('--interactive')
    }
    
    const result = await this.executeCommand(args, instructions)
    
    // Emit file change event
    if (result.success) {
      this.emit('fileChanged', {
        type: 'modified',
        path: filePath,
        timestamp: new Date()
      })
    }
    
    return result
  }

  /**
   * Generate code with Claude Code CLI
   */
  async generateCode(template: string, options?: {
    language?: string
    framework?: string
    output?: string
    parameters?: Record<string, string>
  }): Promise<CLIResponse> {
    const args = ['generate', template]
    
    if (options?.language) {
      args.push('--language', options.language)
    }
    
    if (options?.framework) {
      args.push('--framework', options.framework)
    }
    
    if (options?.output) {
      args.push('--output', options.output)
    }
    
    // Add parameters
    if (options?.parameters) {
      for (const [key, value] of Object.entries(options.parameters)) {
        args.push('--param', `${key}=${value}`)
      }
    }
    
    return await this.executeCommand(args)
  }

  /**
   * Analyze project with Claude Code CLI
   */
  async analyzeProject(path?: string, options?: {
    depth?: number
    include?: string[]
    exclude?: string[]
    format?: 'json' | 'markdown' | 'text'
  }): Promise<CLIResponse> {
    const args = ['analyze']
    
    if (path) {
      args.push(path)
    }
    
    if (options?.depth) {
      args.push('--depth', options.depth.toString())
    }
    
    if (options?.include?.length) {
      args.push('--include', options.include.join(','))
    }
    
    if (options?.exclude?.length) {
      args.push('--exclude', options.exclude.join(','))
    }
    
    if (options?.format) {
      args.push('--format', options.format)
    }
    
    return await this.executeCommand(args)
  }

  /**
   * Run tests with Claude Code CLI
   */
  async runTests(testPath?: string, options?: {
    watch?: boolean
    coverage?: boolean
    parallel?: boolean
  }): Promise<CLIResponse> {
    const args = ['test']
    
    if (testPath) {
      args.push(testPath)
    }
    
    if (options?.watch) {
      args.push('--watch')
    }
    
    if (options?.coverage) {
      args.push('--coverage')
    }
    
    if (options?.parallel) {
      args.push('--parallel')
    }
    
    return await this.executeCommand(args)
  }

  /**
   * Execute arbitrary terminal commands through Claude Code CLI
   */
  async executeTerminalCommand(command: string, options?: {
    shell?: string
    env?: Record<string, string>
    timeout?: number
  }): Promise<CLIResponse> {
    const args = ['exec', '--', command]
    
    if (options?.shell) {
      args.splice(-2, 0, '--shell', options.shell)
    }
    
    // Set environment variables
    if (options?.env && this.currentSession) {
      this.currentSession.environment = {
        ...this.currentSession.environment,
        ...options.env
      }
    }
    
    return await this.executeCommand(args)
  }

  /**
   * Start file watching
   */
  startFileWatching(paths: string[]): void {
    if (typeof window !== 'undefined') {
      console.warn('File watching not available in browser environment')
      return
    }

    try {
      import('chokidar').then(({ default: chokidar }) => {
      for (const path of paths) {
        if (!this.fileWatchers.has(path)) {
          const watcher = chokidar.watch(path, {
            ignoreInitial: true,
            ignored: /node_modules|\.git/
          })

          watcher
            .on('add', (filePath) => this.handleFileEvent('created', filePath))
            .on('change', (filePath) => this.handleFileEvent('modified', filePath))
            .on('unlink', (filePath) => this.handleFileEvent('deleted', filePath))

          this.fileWatchers.set(path, watcher)
        }
      }
      }).catch(() => {
        console.warn('File watching requires chokidar package')
      })
    } catch (error) {
      console.warn('File watching not available in this environment')
    }
  }

  /**
   * Stop file watching
   */
  stopFileWatching(path?: string): void {
    if (path && this.fileWatchers.has(path)) {
      this.fileWatchers.get(path)?.close()
      this.fileWatchers.delete(path)
    } else {
      // Stop all watchers
      for (const [watchPath, watcher] of this.fileWatchers) {
        watcher.close()
      }
      this.fileWatchers.clear()
    }
  }

  /**
   * Handle file system events
   */
  private handleFileEvent(type: 'created' | 'modified' | 'deleted', path: string): void {
    const event: FileWatchEvent = {
      type,
      path,
      timestamp: new Date()
    }
    
    this.emit('fileChanged', event)
  }

  /**
   * Change working directory
   */
  changeDirectory(newPath: string): void {
    this.workingDirectory = newPath
    if (this.currentSession) {
      this.currentSession.workingDirectory = newPath
    }
    this.emit('directoryChanged', { path: newPath })
  }

  /**
   * Get current session info
   */
  getSession(): CLISession | null {
    return this.currentSession
  }

  /**
   * Get CLI status and capabilities
   */
  async getStatus(): Promise<{
    available: boolean
    version?: string
    session?: CLISession
    capabilities: string[]
  }> {
    const capabilities = [
      'chat',
      'edit',
      'generate',
      'analyze',
      'test',
      'exec'
    ]

    if (!this.isAvailable) {
      return {
        available: false,
        capabilities: []
      }
    }

    try {
      const result = await this.executeCommand(['--help'])
      return {
        available: this.isAvailable,
        version: await this.getVersion(),
        session: this.currentSession || undefined,
        capabilities
      }
    } catch {
      return {
        available: false,
        capabilities: []
      }
    }
  }

  /**
   * Get Claude Code CLI version
   */
  private async getVersion(): Promise<string> {
    const result = await this.executeCommand(['--version'])
    return result.success ? result.output.trim() : 'unknown'
  }

  /**
   * Calculate estimated cost based on tokens
   */
  private calculateCost(tokens: number): number {
    // Approximate Claude pricing (adjust based on actual model used)
    return tokens * 0.000015 // $15 per million tokens
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `claude-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Fallback simulation for web environment
   */
  private async simulateCommand(args: string[], input?: string): Promise<CLIResponse> {
    console.log(`🌐 Simulating CLI command: claude ${args.join(' ')}`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    return {
      success: true,
      output: `Simulated response for: claude ${args.join(' ')}\n\nInput: ${input || 'none'}\n\nNote: Running in simulation mode. Real CLI integration requires Node.js environment.`,
      duration: 1500
    }
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
    this.stopFileWatching()
    this.eventListeners.clear()
    
    if (this.currentSession) {
      this.currentSession.isActive = false
    }
  }
}

// Singleton instance
export const claudeCodeCLI = new ClaudeCodeCLIBridge()

// Export types
export type { CLIResponse, CLISession, FileWatchEvent }