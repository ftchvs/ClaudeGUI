import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  ClaudeCodeSession,
  ClaudeCodeCommand,
  ClaudeCodeConversation,
  ClaudeCodeFile,
  ClaudeCodeWorkspace,
  ClaudeCodeDiff,
  ClaudeCodeConfig,
  ClaudeCodeStats,
  ClaudeCodeMemory,
  ClaudeCodeTerminal,
  ClaudeCodeEvent,
  FileSystemEvent,
  GitStatus,
  PerformanceMetrics
} from '@/types/claude-code'

interface ClaudeCodeState {
  // Session Management
  currentSession: ClaudeCodeSession | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  
  // Workspace Management
  currentWorkspace: ClaudeCodeWorkspace | null
  availableWorkspaces: ClaudeCodeWorkspace[]
  
  // File System
  files: Record<string, ClaudeCodeFile>
  fileTree: ClaudeCodeFile[]
  watchedFiles: Set<string>
  openFiles: string[]
  activeFile: string | null
  
  // Terminal
  terminals: Record<string, ClaudeCodeTerminal>
  activeTerminalId: string | null
  
  // Commands & History
  commands: ClaudeCodeCommand[]
  commandHistory: string[]
  runningCommands: Set<string>
  
  // Conversations
  conversations: Record<string, ClaudeCodeConversation>
  activeConversationId: string | null
  
  // File Changes & Diffs
  pendingDiffs: ClaudeCodeDiff[]
  appliedDiffs: ClaudeCodeDiff[]
  autoApproveThreshold: number
  
  // Git Integration
  gitStatus: GitStatus | null
  
  // Configuration
  config: ClaudeCodeConfig
  
  // Statistics & Performance
  stats: ClaudeCodeStats
  performanceMetrics: PerformanceMetrics[]
  
  // Memory & Context
  memory: ClaudeCodeMemory
  
  // Events
  events: ClaudeCodeEvent[]
  
  // UI State
  ui: {
    sidebarOpen: boolean
    terminalOpen: boolean
    diffViewerOpen: boolean
    selectedPanel: 'files' | 'chat' | 'mcp' | 'settings'
    fileTreeExpanded: Record<string, boolean>
    searchQuery: string
    showHiddenFiles: boolean
  }
  
  // Loading States
  isLoading: {
    session: boolean
    workspace: boolean
    files: boolean
    git: boolean
  }
  
  // WebSocket connection
  ws: WebSocket | null
  
  // Actions - Connection Management
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  handleWSMessage: (message: any) => void
  
  // Actions - Session Management
  startSession: (workingDirectory: string) => Promise<void>
  endSession: () => void
  updateSessionStats: (stats: Partial<ClaudeCodeSession>) => void
  
  // Actions - Workspace Management
  switchWorkspace: (workspaceId: string) => Promise<void>
  addWorkspace: (path: string) => Promise<string>
  removeWorkspace: (workspaceId: string) => void
  refreshWorkspace: () => Promise<void>
  
  // Actions - File System
  loadFiles: (path?: string) => Promise<void>
  watchFile: (path: string) => void
  unwatchFile: (path: string) => void
  openFile: (path: string) => Promise<void>
  closeFile: (path: string) => void
  saveFile: (path: string, content: string) => Promise<void>
  createFile: (path: string, content?: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
  renameFile: (oldPath: string, newPath: string) => Promise<void>
  
  // Actions - Terminal
  createTerminal: (name?: string, cwd?: string) => string
  closeTerminal: (terminalId: string) => void
  executeCommand: (command: string, terminalId?: string) => Promise<string>
  sendToTerminal: (terminalId: string, input: string) => void
  clearTerminal: (terminalId: string) => void
  
  // Actions - Commands
  addCommand: (command: ClaudeCodeCommand) => void
  updateCommand: (commandId: string, updates: Partial<ClaudeCodeCommand>) => void
  cancelCommand: (commandId: string) => void
  replayCommand: (commandId: string) => Promise<void>
  
  // Actions - Conversations
  startConversation: () => string
  addMessage: (conversationId: string, message: Omit<ClaudeCodeConversation['messages'][0], 'id' | 'timestamp'>) => void
  endConversation: (conversationId: string) => void
  
  // Actions - Diffs
  createDiff: (diff: Omit<ClaudeCodeDiff, 'id' | 'timestamp'>) => string
  approveDiff: (diffId: string) => Promise<void>
  rejectDiff: (diffId: string) => void
  applyDiff: (diffId: string) => Promise<void>
  autoApproveDiff: (diffId: string) => boolean
  
  // Actions - Git
  refreshGitStatus: () => Promise<void>
  stageFile: (path: string) => Promise<void>
  unstageFile: (path: string) => Promise<void>
  commitChanges: (message: string) => Promise<void>
  pushChanges: () => Promise<void>
  pullChanges: () => Promise<void>
  
  // Actions - Configuration
  updateConfig: (section: keyof ClaudeCodeConfig, updates: any) => void
  saveConfig: () => Promise<void>
  loadConfig: () => Promise<void>
  
  // Actions - Memory
  updateMemory: (updates: Partial<ClaudeCodeMemory>) => void
  updateClaudeMd: (content: string) => Promise<void>
  
  // Actions - Events
  addEvent: (event: Omit<ClaudeCodeEvent, 'id' | 'timestamp'>) => void
  clearEvents: () => void
  subscribeToEvents: (callback: (event: ClaudeCodeEvent) => void) => () => void
  
  // Actions - UI
  toggleSidebar: () => void
  toggleTerminal: () => void
  toggleDiffViewer: () => void
  setSelectedPanel: (panel: ClaudeCodeState['ui']['selectedPanel']) => void
  setSearchQuery: (query: string) => void
  
  // Actions - Performance
  recordPerformanceMetrics: (metrics: PerformanceMetrics) => void
  
  // Actions - Initialization
  initialize: () => Promise<void>
  cleanup: () => void
}

const defaultConfig: ClaudeCodeConfig = {
  general: {
    autoSave: true,
    autoApproveSmallChanges: false,
    showFileTree: true,
    showTerminal: true,
    theme: 'auto'
  },
  editor: {
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    showLineNumbers: true,
    minimap: false
  },
  git: {
    autoCommit: false,
    commitTemplate: 'feat: ${description}\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>',
    showGitStatus: true,
    autoFetch: true
  },
  claude: {
    model: 'claude-3-sonnet',
    maxTokens: 4096,
    temperature: 0.1,
    contextFiles: ['CLAUDE.md', 'README.md', 'package.json']
  },
  terminal: {
    shell: process.env.SHELL || '/bin/bash',
    fontSize: 14,
    scrollback: 10000,
    bellStyle: 'none'
  }
}

const defaultStats: ClaudeCodeStats = {
  session: {
    duration: 0,
    commandsExecuted: 0,
    filesModified: 0,
    tokensUsed: 0,
    costIncurred: 0
  },
  workspace: {
    totalFiles: 0,
    linesOfCode: 0,
    gitCommits: 0,
    claudeInteractions: 0
  },
  performance: {
    averageResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0
  },
  daily: []
}

export const useClaudeCodeStore = create<ClaudeCodeState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    currentSession: null,
    isConnected: false,
    connectionStatus: 'disconnected',
    currentWorkspace: null,
    availableWorkspaces: [],
    files: {},
    fileTree: [],
    watchedFiles: new Set(),
    openFiles: [],
    activeFile: null,
    terminals: {},
    activeTerminalId: null,
    commands: [],
    commandHistory: [],
    runningCommands: new Set(),
    conversations: {},
    activeConversationId: null,
    pendingDiffs: [],
    appliedDiffs: [],
    autoApproveThreshold: 10, // lines
    gitStatus: null,
    config: defaultConfig,
    stats: defaultStats,
    performanceMetrics: [],
    memory: {
      claudeMd: { exists: false, sections: {} },
      conversationHistory: { total: 0, recent: [] },
      fileContext: { recentlyModified: [], frequentlyAccessed: [], watchedFiles: [] }
    },
    events: [],
    ui: {
      sidebarOpen: true,
      terminalOpen: false,
      diffViewerOpen: false,
      selectedPanel: 'files',
      fileTreeExpanded: {},
      searchQuery: '',
      showHiddenFiles: false
    },
    isLoading: {
      session: false,
      workspace: false,
      files: false,
      git: false
    },
    ws: null,

    // Connection Management
    connect: async () => {
      set({ connectionStatus: 'connecting' })
      
      try {
        // In a real implementation, this would establish WebSocket connection to Claude Code
        const ws = new WebSocket('ws://localhost:8080/claude-code')
        
        ws.onopen = () => {
          set({ 
            ws, 
            isConnected: true, 
            connectionStatus: 'connected' 
          })
          get().addEvent({
            type: 'session-started',
            data: { timestamp: new Date() }
          })
        }
        
        ws.onclose = () => {
          set({ 
            ws: null, 
            isConnected: false, 
            connectionStatus: 'disconnected' 
          })
        }
        
        ws.onerror = () => {
          set({ connectionStatus: 'error' })
        }
        
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          // Handle real-time updates from Claude Code
          get().handleWSMessage(message)
        }
        
      } catch (error) {
        set({ connectionStatus: 'error' })
        throw error
      }
    },

    disconnect: () => {
      const { ws } = get()
      if (ws) {
        ws.close()
      }
      set({ 
        ws: null, 
        isConnected: false, 
        connectionStatus: 'disconnected' 
      })
    },

    reconnect: async () => {
      get().disconnect()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await get().connect()
    },

    // Session Management
    startSession: async (workingDirectory) => {
      set({ isLoading: { ...get().isLoading, session: true } })
      
      try {
        const session: ClaudeCodeSession = {
          id: crypto.randomUUID(),
          workingDirectory,
          status: 'active',
          lastActivity: new Date(),
          totalCommands: 0,
          totalFiles: 0,
          sessionDuration: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
        
        set({ currentSession: session })
        await get().loadFiles(workingDirectory)
        await get().refreshGitStatus()
        
      } finally {
        set({ isLoading: { ...get().isLoading, session: false } })
      }
    },

    endSession: () => {
      const { currentSession } = get()
      if (currentSession) {
        get().addEvent({
          type: 'session-ended',
          data: { 
            sessionId: currentSession.id,
            duration: currentSession.sessionDuration
          }
        })
      }
      set({ currentSession: null })
    },

    updateSessionStats: (stats) => {
      set((state) => ({
        currentSession: state.currentSession 
          ? { ...state.currentSession, ...stats }
          : null
      }))
    },

    // Workspace Management
    switchWorkspace: async (workspaceId) => {
      const workspace = get().availableWorkspaces.find(w => w.id === workspaceId)
      if (!workspace) return
      
      set({ isLoading: { ...get().isLoading, workspace: true } })
      
      try {
        set({ currentWorkspace: workspace })
        await get().loadFiles(workspace.path)
        await get().refreshGitStatus()
        
        get().addEvent({
          type: 'workspace-switched',
          data: { workspaceId, path: workspace.path }
        })
      } finally {
        set({ isLoading: { ...get().isLoading, workspace: false } })
      }
    },

    addWorkspace: async (path) => {
      const workspaceId = crypto.randomUUID()
      const workspace: ClaudeCodeWorkspace = {
        id: workspaceId,
        name: path.split('/').pop() || path,
        path,
        isActive: false,
        stats: {
          totalFiles: 0,
          linesOfCode: 0,
          claudeInteractions: 0,
          lastActivity: new Date()
        }
      }
      
      set((state) => ({
        availableWorkspaces: [...state.availableWorkspaces, workspace]
      }))
      
      return workspaceId
    },

    removeWorkspace: (workspaceId) => {
      set((state) => ({
        availableWorkspaces: state.availableWorkspaces.filter(w => w.id !== workspaceId),
        currentWorkspace: state.currentWorkspace?.id === workspaceId 
          ? null 
          : state.currentWorkspace
      }))
    },

    refreshWorkspace: async () => {
      const { currentWorkspace } = get()
      if (!currentWorkspace) return
      
      await get().loadFiles(currentWorkspace.path)
      await get().refreshGitStatus()
    },

    // File System Operations
    loadFiles: async (path) => {
      set({ isLoading: { ...get().isLoading, files: true } })
      
      try {
        // Mock file loading - in real implementation, this would use Node.js fs APIs
        const mockFiles: ClaudeCodeFile[] = [
          {
            path: '/src/App.tsx',
            name: 'App.tsx',
            type: 'file',
            size: 2048,
            lastModified: new Date(),
            isGitTracked: true,
            gitStatus: 'modified',
            encoding: 'utf-8',
            language: 'typescript',
            isClaudeModified: true,
            lastClaudeEdit: new Date()
          },
          {
            path: '/package.json',
            name: 'package.json',
            type: 'file',
            size: 1024,
            lastModified: new Date(),
            isGitTracked: true,
            encoding: 'utf-8',
            language: 'json',
            isClaudeModified: false
          }
        ]
        
        const filesMap = mockFiles.reduce((acc, file) => {
          acc[file.path] = file
          return acc
        }, {} as Record<string, ClaudeCodeFile>)
        
        set({ 
          files: filesMap,
          fileTree: mockFiles
        })
        
      } finally {
        set({ isLoading: { ...get().isLoading, files: false } })
      }
    },

    openFile: async (path) => {
      const { openFiles } = get()
      if (!openFiles.includes(path)) {
        set((state) => ({
          openFiles: [...state.openFiles, path],
          activeFile: path
        }))
      } else {
        set({ activeFile: path })
      }
    },

    closeFile: (path) => {
      set((state) => ({
        openFiles: state.openFiles.filter(f => f !== path),
        activeFile: state.activeFile === path 
          ? state.openFiles.find(f => f !== path) || null
          : state.activeFile
      }))
    },

    saveFile: async (path, content) => {
      // Mock save operation
      set((state) => ({
        files: {
          ...state.files,
          [path]: {
            ...state.files[path],
            lastModified: new Date(),
            isClaudeModified: true,
            lastClaudeEdit: new Date()
          }
        }
      }))
      
      get().addEvent({
        type: 'file-changed',
        data: { path, type: 'modify' }
      })
    },

    // Terminal Operations
    createTerminal: (name, cwd) => {
      const terminalId = crypto.randomUUID()
      const terminal: ClaudeCodeTerminal = {
        id: terminalId,
        name: name || `Terminal ${Object.keys(get().terminals).length + 1}`,
        cwd: cwd || get().currentWorkspace?.path || process.cwd(),
        isActive: true,
        history: [],
        environment: process.env as Record<string, string>
      }
      
      set((state) => ({
        terminals: { ...state.terminals, [terminalId]: terminal },
        activeTerminalId: terminalId
      }))
      
      return terminalId
    },

    executeCommand: async (command, terminalId) => {
      const commandId = crypto.randomUUID()
      const cmd: ClaudeCodeCommand = {
        id: commandId,
        command,
        type: 'shell',
        timestamp: new Date(),
        status: 'running',
        workingDirectory: get().currentWorkspace?.path || process.cwd(),
        filesAffected: []
      }
      
      get().addCommand(cmd)
      
      try {
        // Mock command execution
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const output = `Mock output for: ${command}\nCommand completed successfully.`
        
        get().updateCommand(commandId, {
          status: 'completed',
          duration: 1000,
          output,
          exitCode: 0
        })
        
        return commandId
        
      } catch (error) {
        get().updateCommand(commandId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Command failed'
        })
        throw error
      }
    },

    // Command Management
    addCommand: (command) => {
      set((state) => ({
        commands: [command, ...state.commands.slice(0, 999)], // Keep last 1000 commands
        runningCommands: command.status === 'running' 
          ? new Set([...state.runningCommands, command.id])
          : state.runningCommands
      }))
    },

    updateCommand: (commandId, updates) => {
      set((state) => ({
        commands: state.commands.map(cmd => 
          cmd.id === commandId ? { ...cmd, ...updates } : cmd
        ),
        runningCommands: updates.status && updates.status !== 'running'
          ? new Set([...state.runningCommands].filter(id => id !== commandId))
          : state.runningCommands
      }))
    },

    // Diff Management
    createDiff: (diffData) => {
      const diffId = crypto.randomUUID()
      const diff: ClaudeCodeDiff = {
        ...diffData,
        id: diffId,
        timestamp: new Date(),
        approved: false,
        autoApprove: get().autoApproveDiff(diffId)
      }
      
      set((state) => ({
        pendingDiffs: [...state.pendingDiffs, diff]
      }))
      
      if (diff.autoApprove) {
        setTimeout(() => get().applyDiff(diffId), 0)
      }
      
      return diffId
    },

    approveDiff: async (diffId) => {
      set((state) => ({
        pendingDiffs: state.pendingDiffs.map(diff =>
          diff.id === diffId ? { ...diff, status: 'approved', approved: true } : diff
        )
      }))
      
      await get().applyDiff(diffId)
    },

    applyDiff: async (diffId) => {
      const diff = get().pendingDiffs.find(d => d.id === diffId)
      if (!diff) return
      
      try {
        // Mock diff application
        await new Promise(resolve => setTimeout(resolve, 500))
        
        set((state) => ({
          pendingDiffs: state.pendingDiffs.filter(d => d.id !== diffId),
          appliedDiffs: [...state.appliedDiffs, { ...diff, status: 'applied' as const }]
        }))
        
        get().addEvent({
          type: 'file-changed',
          data: { path: diff.filePath, diffId }
        })
        
      } catch (error) {
        set((state) => ({
          pendingDiffs: state.pendingDiffs.map(d =>
            d.id === diffId ? { ...d, status: 'pending' } : d
          )
        }))
        throw error
      }
    },

    autoApproveDiff: (diffId) => {
      const diff = get().pendingDiffs.find(d => d.id === diffId)
      if (!diff) return false
      
      const totalLines = diff.hunks.reduce((acc, hunk) => acc + hunk.newLines, 0)
      return totalLines <= get().autoApproveThreshold && get().config.general.autoApproveSmallChanges
    },

    // Git Operations
    refreshGitStatus: async () => {
      set({ isLoading: { ...get().isLoading, git: true } })
      
      try {
        // Mock git status
        const mockGitStatus: GitStatus = {
          branch: 'main',
          ahead: 0,
          behind: 0,
          staged: [],
          unstaged: ['/src/App.tsx'],
          untracked: [],
          conflicts: [],
          stashes: 0,
          hasUncommittedChanges: true
        }
        
        set({ gitStatus: mockGitStatus })
        
      } finally {
        set({ isLoading: { ...get().isLoading, git: false } })
      }
    },

    // Event Management
    addEvent: (eventData) => {
      const event: ClaudeCodeEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }
      
      set((state) => ({
        events: [event, ...state.events.slice(0, 999)] // Keep last 1000 events
      }))
    },

    clearEvents: () => {
      set({ events: [] })
    },

    subscribeToEvents: (callback) => {
      // This should use the store's built-in subscription
      // For now, return a no-op unsubscribe function
      return () => {}
    },

    // UI Actions
    toggleSidebar: () => {
      set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      }))
    },

    toggleTerminal: () => {
      set((state) => ({
        ui: { ...state.ui, terminalOpen: !state.ui.terminalOpen }
      }))
    },

    setSelectedPanel: (panel) => {
      set((state) => ({
        ui: { ...state.ui, selectedPanel: panel }
      }))
    },

    setSearchQuery: (query) => {
      set((state) => ({
        ui: { ...state.ui, searchQuery: query }
      }))
    },

    // Configuration
    updateConfig: (section, updates) => {
      set((state) => ({
        config: {
          ...state.config,
          [section]: { ...state.config[section], ...updates }
        }
      }))
    },

    saveConfig: async () => {
      // Mock save config
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    loadConfig: async () => {
      // Mock load config
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    updateMemory: (updates) => {
      set((state) => ({
        memory: { ...state.memory, ...updates }
      }))
    },

    updateClaudeMd: async (content) => {
      set((state) => ({
        memory: {
          ...state.memory,
          claudeMd: {
            ...state.memory.claudeMd,
            content,
            lastModified: new Date()
          }
        }
      }))
    },

    recordPerformanceMetrics: (metrics) => {
      set((state) => ({
        performanceMetrics: [metrics, ...state.performanceMetrics.slice(0, 999)]
      }))
    },

    // Placeholder implementations for required actions
    watchFile: (path) => {
      set((state) => ({
        watchedFiles: new Set([...state.watchedFiles, path])
      }))
    },

    unwatchFile: (path) => {
      set((state) => {
        const newWatchedFiles = new Set(state.watchedFiles)
        newWatchedFiles.delete(path)
        return { watchedFiles: newWatchedFiles }
      })
    },

    createFile: async (path, content = '') => {
      await get().saveFile(path, content)
    },

    deleteFile: async (path) => {
      set((state) => {
        const { [path]: deleted, ...remainingFiles } = state.files
        return { files: remainingFiles }
      })
    },

    renameFile: async (oldPath, newPath) => {
      const file = get().files[oldPath]
      if (file) {
        set((state) => {
          const { [oldPath]: oldFile, ...remainingFiles } = state.files
          return {
            files: {
              ...remainingFiles,
              [newPath]: { ...oldFile, path: newPath, name: newPath.split('/').pop() || newPath }
            }
          }
        })
      }
    },

    closeTerminal: (terminalId) => {
      set((state) => {
        const { [terminalId]: removed, ...remainingTerminals } = state.terminals
        return {
          terminals: remainingTerminals,
          activeTerminalId: state.activeTerminalId === terminalId ? null : state.activeTerminalId
        }
      })
    },

    sendToTerminal: (terminalId, input) => {
      // Mock implementation
    },

    clearTerminal: (terminalId) => {
      set((state) => ({
        terminals: {
          ...state.terminals,
          [terminalId]: {
            ...state.terminals[terminalId],
            history: []
          }
        }
      }))
    },

    cancelCommand: (commandId) => {
      get().updateCommand(commandId, { status: 'cancelled' })
    },

    replayCommand: async (commandId) => {
      const command = get().commands.find(c => c.id === commandId)
      if (command) {
        await get().executeCommand(command.command)
      }
    },

    startConversation: () => {
      const conversationId = crypto.randomUUID()
      const conversation: ClaudeCodeConversation = {
        id: conversationId,
        sessionId: get().currentSession?.id || '',
        messages: [],
        context: {
          files: get().openFiles,
          workingDirectory: get().currentWorkspace?.path || '',
          gitBranch: get().gitStatus?.branch
        },
        startTime: new Date(),
        totalTokens: 0,
        cost: 0
      }
      
      set((state) => ({
        conversations: { ...state.conversations, [conversationId]: conversation },
        activeConversationId: conversationId
      }))
      
      return conversationId
    },

    addMessage: (conversationId, messageData) => {
      const message = {
        ...messageData,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }
      
      set((state) => ({
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...state.conversations[conversationId],
            messages: [...state.conversations[conversationId].messages, message]
          }
        }
      }))
    },

    endConversation: (conversationId) => {
      set((state) => ({
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...state.conversations[conversationId],
            endTime: new Date()
          }
        }
      }))
    },

    rejectDiff: (diffId) => {
      set((state) => ({
        pendingDiffs: state.pendingDiffs.filter(d => d.id !== diffId)
      }))
    },

    stageFile: async (path) => {
      // Mock git stage
    },

    unstageFile: async (path) => {
      // Mock git unstage
    },

    commitChanges: async (message) => {
      // Mock git commit
    },

    pushChanges: async () => {
      // Mock git push
    },

    pullChanges: async () => {
      // Mock git pull
    },

    toggleDiffViewer: () => {
      set((state) => ({
        ui: { ...state.ui, diffViewerOpen: !state.ui.diffViewerOpen }
      }))
    },

    // Add missing handleWSMessage method
    handleWSMessage: (message: any) => {
      // Handle WebSocket messages from Claude Code
      const { type, data } = message
      
      switch (type) {
        case 'file-changed':
          get().addEvent({
            type: 'file-changed',
            data
          })
          break
        case 'command-executed':
          get().addEvent({
            type: 'command-executed',
            data
          })
          break
        // Add more message handlers as needed
      }
    },

    // Initialization
    initialize: async () => {
      await get().loadConfig()
      // Initialize default workspace if none exists
      if (get().availableWorkspaces.length === 0) {
        const currentDir = process.cwd()
        await get().addWorkspace(currentDir)
      }
    },

    cleanup: () => {
      get().disconnect()
      set({
        currentSession: null,
        isConnected: false,
        currentWorkspace: null,
        files: {},
        fileTree: [],
        terminals: {},
        commands: [],
        conversations: {},
        events: []
      })
    }
  }))
)