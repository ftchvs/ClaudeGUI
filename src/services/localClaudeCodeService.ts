/**
 * Local Claude Code CLI Service
 * 
 * Integrates with locally installed Claude Code CLI without requiring API keys
 * Supports session management, project detection, and command execution
 * Inspired by Claudia's approach to Claude Code integration
 * 
 * Uses Electron IPC for Node.js operations when available, falls back to browser mode
 */

export interface ClaudeProject {
  id: string
  name: string
  path: string
  lastModified: Date
  sessionCount: number
  sessions: ClaudeSession[]
}

export interface ClaudeSession {
  id: string
  projectId: string
  firstMessage: string
  timestamp: Date
  messageCount: number
  duration?: number
  isActive: boolean
  metadata?: SessionMetadata
}

export interface SessionMetadata {
  model?: string
  tokens?: number
  cost?: number
  files?: string[]
  gitBranch?: string
  errorCount?: number
}

export interface ClaudeCodeStatus {
  isInstalled: boolean
  version?: string
  isAuthenticated: boolean
  projectsPath: string
  currentProject?: ClaudeProject
  error?: string
}

export interface CommandResult {
  success: boolean
  output: string
  error?: string
  duration: number
  exitCode?: number
}

// ElectronAPI interface is already defined in electronClaudeCodeService.ts

export class LocalClaudeCodeService {
  private claudeCliPath: string = 'claude'
  private projectsPath: string
  private isElectron: boolean
  private sessionId: string | null = null

  constructor() {
    this.isElectron = !!(window as any).electronAPI?.isElectron
    this.projectsPath = this.isElectron 
      ? '' // Will be determined dynamically in Electron 
      : '~/.claude/projects' // Fallback for non-Electron
  }

  /**
   * Check if Claude Code CLI is installed and accessible
   */
  async checkInstallation(): Promise<ClaudeCodeStatus> {
    if (!this.isElectron) {
      return {
        isInstalled: false,
        isAuthenticated: false,
        projectsPath: this.projectsPath,
        error: 'Electron environment required for local CLI integration'
      }
    }

    try {
      // Use Electron API to check Claude availability
      const availability = await window.electronAPI!.claudeCode.checkAvailability()
      
      if (!availability.available) {
        return {
          isInstalled: false,
          isAuthenticated: false,
          projectsPath: this.projectsPath,
          error: availability.error
        }
      }

      // Get current working directory to determine projects path
      const cwd = await window.electronAPI!.process.cwd()
      const projectsDir = `${process.env.HOME || '~'}/.claude/projects`
      this.projectsPath = projectsDir

      const status: ClaudeCodeStatus = {
        isInstalled: true,
        version: availability.version,
        isAuthenticated: false,
        projectsPath: projectsDir
      }

      // Check authentication status by trying a simple command
      try {
        const authCheck = await window.electronAPI!.terminal.execute('claude --help')
        status.isAuthenticated = authCheck.success && !authCheck.output.includes('login')
      } catch (authError) {
        status.isAuthenticated = false
      }

      return status
    } catch (error) {
      return {
        isInstalled: false,
        isAuthenticated: false,
        projectsPath: this.projectsPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute a Claude Code CLI command
   */
  async executeCommand(command: string, options?: {
    cwd?: string
    timeout?: number
    env?: Record<string, string>
  }): Promise<CommandResult> {
    if (!this.isElectron) {
      return {
        success: false,
        output: '',
        error: 'Electron environment required for CLI commands',
        duration: 0
      }
    }

    try {
      const result = await window.electronAPI!.terminal.execute(command, {
        cwd: options?.cwd,
        env: options?.env
      })

      return {
        success: result.success,
        output: result.output || '',
        error: result.error,
        duration: result.duration || 0,
        exitCode: result.exitCode
      }
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message || 'Command execution failed',
        duration: 0
      }
    }
  }

  /**
   * Start an interactive Claude Code session
   */
  async startInteractiveSession(projectPath?: string): Promise<{
    success: boolean
    sessionId?: string
    error?: string
  }> {
    if (!this.isElectron) {
      return {
        success: false,
        error: 'Electron environment required for interactive sessions'
      }
    }

    try {
      // Terminate any existing session
      if (this.sessionId) {
        await this.terminate()
      }

      // Change to project directory if specified
      if (projectPath) {
        const chdirResult = await window.electronAPI!.process.chdir(projectPath)
        if (!chdirResult.success) {
          return {
            success: false,
            error: `Failed to change to project directory: ${chdirResult.error}`
          }
        }
      }

      // Start Claude session using Electron API
      const args = projectPath ? [projectPath] : []
      const sessionResult = await window.electronAPI!.claudeCode.execute('', args)
      
      if (sessionResult.success) {
        this.sessionId = `session_${Date.now()}`
        return {
          success: true,
          sessionId: this.sessionId
        }
      } else {
        return {
          success: false,
          error: sessionResult.error || 'Failed to start Claude session'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start session'
      }
    }
  }

  /**
   * Send a message to the active Claude Code session
   */
  async sendMessage(message: string): Promise<CommandResult> {
    if (!this.isElectron || !this.sessionId) {
      return {
        success: false,
        output: '',
        error: 'No active Claude Code session',
        duration: 0
      }
    }

    try {
      // Send message via Claude Code CLI
      const result = await window.electronAPI!.claudeCode.execute(message, [])
      
      return {
        success: result.success,
        output: result.output || '',
        error: result.error,
        duration: result.duration || 0
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Failed to send message',
        duration: 0
      }
    }
  }

  /**
   * Discover Claude projects in ~/.claude/projects/
   */
  async discoverProjects(): Promise<ClaudeProject[]> {
    if (!this.isElectron) {
      return []
    }

    try {
      const projects: ClaudeProject[] = []
      
      // Check if projects directory exists
      const projectsExist = await window.electronAPI!.file.exists(this.projectsPath)
      if (!projectsExist.exists) {
        console.log('Projects directory does not exist yet:', this.projectsPath)
        return []
      }

      const dirResult = await window.electronAPI!.directory.list(this.projectsPath)
      if (!dirResult.success) {
        console.error('Failed to list projects directory:', dirResult.error)
        return []
      }

      for (const item of dirResult.items) {
        if (item.type === 'directory') {
          try {
            const project = await this.loadProject(item.name)
            if (project) {
              projects.push(project)
            }
          } catch (error) {
            console.warn(`Failed to load project ${item.name}:`, error)
          }
        }
      }

      // Sort by last modified date
      return projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    } catch (error) {
      console.error('Failed to discover projects:', error)
      return []
    }
  }

  /**
   * Load a specific Claude project
   */
  async loadProject(projectName: string): Promise<ClaudeProject | null> {
    if (!this.isElectron) {
      return null
    }

    try {
      const projectPath = `${this.projectsPath}/${projectName}`
      
      // Check if project directory exists
      const projectExists = await window.electronAPI!.file.exists(projectPath)
      if (!projectExists.exists) {
        return null
      }

      // Get directory info
      const dirResult = await window.electronAPI!.directory.list(projectPath)
      if (!dirResult.success) {
        console.error(`Failed to read project directory ${projectName}:`, dirResult.error)
        return null
      }

      // Find the most recent modification time
      let lastModified = new Date(0)
      for (const item of dirResult.items) {
        const itemModified = new Date(item.modified)
        if (itemModified > lastModified) {
          lastModified = itemModified
        }
      }

      // Look for session files
      const sessions = await this.loadProjectSessions(projectName)

      return {
        id: projectName,
        name: projectName,
        path: projectPath,
        lastModified,
        sessionCount: sessions.length,
        sessions
      }
    } catch (error) {
      console.error(`Failed to load project ${projectName}:`, error)
      return null
    }
  }

  /**
   * Load sessions for a specific project
   */
  async loadProjectSessions(projectName: string): Promise<ClaudeSession[]> {
    if (!this.isElectron) {
      return []
    }

    try {
      const projectPath = `${this.projectsPath}/${projectName}`
      const sessions: ClaudeSession[] = []

      const dirResult = await window.electronAPI!.directory.list(projectPath)
      if (!dirResult.success) {
        return []
      }

      for (const item of dirResult.items) {
        if (item.type === 'file' && (item.name.endsWith('.json') || item.name.includes('session'))) {
          try {
            const filePath = `${projectPath}/${item.name}`
            const fileResult = await window.electronAPI!.file.read(filePath)
            
            if (!fileResult.success) {
              continue
            }

            const content = fileResult.content

            // Try to extract first message (simplified)
            let firstMessage = 'Session started'
            try {
              const data = JSON.parse(content)
              if (data.messages && data.messages.length > 0) {
                firstMessage = data.messages[0].content?.slice(0, 100) + '...'
              }
            } catch {
              // Not JSON or different format
              firstMessage = content.slice(0, 100) + '...'
            }

            sessions.push({
              id: item.name,
              projectId: projectName,
              firstMessage,
              timestamp: new Date(item.modified),
              messageCount: content.split('\n').length, // Rough estimate
              isActive: false
            })
          } catch (error) {
            console.warn(`Failed to load session file ${item.name}:`, error)
          }
        }
      }

      return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error(`Failed to load sessions for project ${projectName}:`, error)
      return []
    }
  }

  /**
   * Create a new Claude project
   */
  async createProject(name: string, path?: string): Promise<CommandResult> {
    if (!this.isElectron) {
      return {
        success: false,
        output: '',
        error: 'Electron environment required for project creation',
        duration: 0
      }
    }

    try {
      const cwd = await window.electronAPI!.process.cwd()
      const projectPath = path || `${cwd}/${name}`
      
      // Create project using Claude CLI if possible
      const result = await this.executeCommand(`claude --project ${projectPath}`)
      
      if (result.success) {
        // Refresh projects cache
        await this.discoverProjects()
      }

      return result
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Failed to create project',
        duration: 0
      }
    }
  }

  /**
   * Switch to a different project
   */
  async switchProject(projectName: string): Promise<CommandResult> {
    if (!this.isElectron) {
      return {
        success: false,
        output: '',
        error: 'Electron environment required for project switching',
        duration: 0
      }
    }

    try {
      const projectPath = `${this.projectsPath}/${projectName}`
      
      // Terminate current session if active
      if (this.sessionId) {
        await this.terminate()
      }

      // Start new session in project directory
      const sessionResult = await this.startInteractiveSession(projectPath)
      
      return {
        success: sessionResult.success,
        output: sessionResult.success ? `Switched to project: ${projectName}` : '',
        error: sessionResult.error,
        duration: 0
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Failed to switch project',
        duration: 0
      }
    }
  }

  /**
   * Install Claude Code CLI if not present
   */
  async installClaudeCode(): Promise<CommandResult> {
    try {
      const result = await this.executeCommand('npm install -g @anthropic-ai/claude-code', {
        timeout: 120000 // 2 minutes timeout for installation
      })

      return result
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Installation failed',
        duration: 0
      }
    }
  }

  /**
   * Check authentication status and guide user through login
   */
  async checkAuthentication(): Promise<{
    isAuthenticated: boolean
    loginRequired: boolean
    instructions?: string
  }> {
    try {
      // Try to execute a simple command that requires authentication
      const result = await this.executeCommand('claude --help')
      
      if (result.success && !result.output.includes('login')) {
        return { isAuthenticated: true, loginRequired: false }
      }

      return {
        isAuthenticated: false,
        loginRequired: true,
        instructions: 'Run "claude" in terminal and follow the /login process to authenticate'
      }
    } catch {
      return {
        isAuthenticated: false,
        loginRequired: true,
        instructions: 'Claude Code CLI not accessible. Please install and authenticate first.'
      }
    }
  }

  /**
   * Terminate any active sessions
   */
  async terminate(): Promise<void> {
    if (this.sessionId) {
      // Terminate Claude session via Electron API
      try {
        await window.electronAPI?.terminal.execute('exit', {})
      } catch (error) {
        console.warn('Failed to terminate session gracefully:', error)
      }
      this.sessionId = null
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): {
    isActive: boolean
    sessionId?: string
  } {
    return {
      isActive: this.sessionId !== null && this.isElectron,
      sessionId: this.sessionId || undefined
    }
  }
}

export default LocalClaudeCodeService