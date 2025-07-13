// Claude Code Integration Type Definitions

export interface ClaudeCodeSession {
  id: string
  workingDirectory: string
  status: 'active' | 'idle' | 'busy' | 'error' | 'disconnected'
  lastActivity: Date
  totalCommands: number
  totalFiles: number
  sessionDuration: number
  memoryUsage: number
  cpuUsage: number
}

export interface ClaudeCodeCommand {
  id: string
  command: string
  type: 'shell' | 'file-operation' | 'git' | 'mcp' | 'claude-specific'
  timestamp: Date
  duration?: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  output?: string
  error?: string
  workingDirectory: string
  filesAffected: string[]
  exitCode?: number
}

export interface ClaudeCodeConversation {
  id: string
  sessionId: string
  messages: ClaudeCodeMessage[]
  context: {
    files: string[]
    workingDirectory: string
    gitBranch?: string
    lastCommand?: string
  }
  startTime: Date
  endTime?: Date
  totalTokens: number
  cost: number
}

export interface ClaudeCodeMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata: {
    command?: string
    filesReferenced: string[]
    toolsUsed: string[]
    tokensUsed?: number
  }
  attachments?: ClaudeCodeAttachment[]
}

export interface ClaudeCodeAttachment {
  type: 'file' | 'image' | 'diff' | 'output'
  name: string
  path?: string
  content?: string
  size: number
  mimeType: string
}

export interface ClaudeCodeFile {
  path: string
  name: string
  type: 'file' | 'directory'
  size: number
  lastModified: Date
  isGitTracked: boolean
  gitStatus?: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  encoding: string
  language?: string
  isClaudeModified: boolean
  lastClaudeEdit?: Date
}

export interface ClaudeCodeWorkspace {
  id: string
  name: string
  path: string
  isActive: boolean
  gitRepository?: {
    remote: string
    branch: string
    hasUncommittedChanges: boolean
    lastCommit: {
      hash: string
      message: string
      author: string
      date: Date
    }
  }
  claudeConfig?: {
    hasClaudeMd: boolean
    claudeMdPath?: string
    lastUpdated?: Date
  }
  projectType?: 'node' | 'python' | 'rust' | 'go' | 'web' | 'other'
  stats: {
    totalFiles: number
    linesOfCode: number
    claudeInteractions: number
    lastActivity: Date
  }
}

export interface ClaudeCodeDiff {
  id: string
  filePath: string
  type: 'create' | 'modify' | 'delete' | 'rename'
  status: 'pending' | 'approved' | 'rejected' | 'applied'
  oldContent?: string
  newContent?: string
  hunks: DiffHunk[]
  timestamp: Date
  commandId?: string
  approved: boolean
  autoApprove: boolean
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface ClaudeCodeConfig {
  general: {
    autoSave: boolean
    autoApproveSmallChanges: boolean
    showFileTree: boolean
    showTerminal: boolean
    theme: 'light' | 'dark' | 'auto'
  }
  editor: {
    fontSize: number
    tabSize: number
    wordWrap: boolean
    showLineNumbers: boolean
    minimap: boolean
  }
  git: {
    autoCommit: boolean
    commitTemplate: string
    showGitStatus: boolean
    autoFetch: boolean
  }
  claude: {
    model: string
    maxTokens: number
    temperature: number
    systemPrompt?: string
    contextFiles: string[]
  }
  terminal: {
    shell: string
    fontSize: number
    scrollback: number
    bellStyle: 'none' | 'visual' | 'sound'
  }
}

export interface ClaudeCodeStats {
  session: {
    duration: number
    commandsExecuted: number
    filesModified: number
    tokensUsed: number
    costIncurred: number
  }
  workspace: {
    totalFiles: number
    linesOfCode: number
    gitCommits: number
    claudeInteractions: number
  }
  performance: {
    averageResponseTime: number
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
  daily: {
    date: Date
    commands: number
    files: number
    tokens: number
    cost: number
  }[]
}

export interface ClaudeCodeMemory {
  claudeMd: {
    exists: boolean
    path?: string
    content?: string
    lastModified?: Date
    sections: {
      projectOverview?: string
      commands?: string[]
      architecture?: string
      conventions?: string[]
      currentGoals?: string[]
    }
  }
  conversationHistory: {
    total: number
    recent: ClaudeCodeConversation[]
  }
  fileContext: {
    recentlyModified: ClaudeCodeFile[]
    frequentlyAccessed: ClaudeCodeFile[]
    watchedFiles: string[]
  }
}

export interface ClaudeCodeTerminal {
  id: string
  name: string
  cwd: string
  isActive: boolean
  process?: {
    pid: number
    command: string
    status: 'running' | 'stopped' | 'completed'
  }
  history: TerminalEntry[]
  environment: Record<string, string>
}

export interface TerminalEntry {
  id: string
  type: 'command' | 'output' | 'error' | 'system'
  content: string
  timestamp: Date
  exitCode?: number
}

export interface ClaudeCodeQuickAction {
  id: string
  name: string
  description: string
  category: 'file' | 'git' | 'terminal' | 'claude' | 'workspace'
  icon: string
  keybinding?: string
  command: string
  requiresConfirmation: boolean
  contextDependent: boolean
}

export interface ClaudeCodeExtension {
  id: string
  name: string
  version: string
  description: string
  author: string
  enabled: boolean
  category: 'productivity' | 'development' | 'integration' | 'ui'
  permissions: string[]
  settings?: Record<string, any>
  lastUpdated: Date
}

// Event types for real-time updates
export type ClaudeCodeEventType = 
  | 'session-started'
  | 'session-ended'
  | 'command-executed'
  | 'file-changed'
  | 'file-created'
  | 'file-deleted'
  | 'git-status-changed'
  | 'conversation-updated'
  | 'workspace-switched'
  | 'terminal-output'
  | 'diff-created'
  | 'config-changed'

export interface ClaudeCodeEvent {
  id: string
  type: ClaudeCodeEventType
  timestamp: Date
  data: any
  sessionId?: string
  workspaceId?: string
}

// WebSocket message types for real-time communication
export interface ClaudeCodeWSMessage {
  type: 'subscribe' | 'unsubscribe' | 'command' | 'event' | 'ping' | 'pong'
  id?: string
  channel?: string
  data?: any
  timestamp: Date
}

// Claude Code API response types
export interface ClaudeCodeAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
  requestId: string
}

// File system watcher events
export interface FileSystemEvent {
  type: 'create' | 'modify' | 'delete' | 'rename'
  path: string
  oldPath?: string
  isDirectory: boolean
  timestamp: Date
}

// Git integration types
export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: string[]
  unstaged: string[]
  untracked: string[]
  conflicts: string[]
  stashes: number
  hasUncommittedChanges: boolean
}

export interface GitCommit {
  hash: string
  shortHash: string
  message: string
  author: {
    name: string
    email: string
  }
  date: Date
  files: string[]
  insertions: number
  deletions: number
}

// Claude Code specific error types
export interface ClaudeCodeError {
  code: string
  message: string
  details?: any
  timestamp: Date
  context?: {
    command?: string
    file?: string
    workspace?: string
  }
  recoverable: boolean
  suggestions?: string[]
}

// Performance monitoring
export interface PerformanceMetrics {
  timestamp: Date
  cpu: {
    usage: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
    readSpeed: number
    writeSpeed: number
  }
  network: {
    bytesReceived: number
    bytesSent: number
    requests: number
  }
  claude: {
    responseTime: number
    tokensPerSecond: number
    requestsPerMinute: number
  }
}