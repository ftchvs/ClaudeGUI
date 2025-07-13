// MCP Server Type Definitions for ClaudeGUI

export type McpServerType = 'context7' | 'github' | 'firecrawl' | 'puppeteer' | 'ide'

export type McpServerStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'idle'

export interface McpServerConfig {
  id: string
  name: string
  type: McpServerType
  endpoint?: string
  apiKey?: string
  enabled: boolean
  autoConnect: boolean
  timeout: number
  retryAttempts: number
}

export interface McpServerHealth {
  status: McpServerStatus
  lastPing: Date
  responseTime: number
  uptime: number
  errorCount: number
  successRate: number
}

export interface McpServerMetrics {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  averageResponseTime: number
  tokensUsed: number
  costEstimate: number
  operationsToday: number
  operationsThisWeek: number
}

export interface McpServer {
  config: McpServerConfig
  health: McpServerHealth
  metrics: McpServerMetrics
  capabilities: string[]
  lastError?: string
}

export type McpOperationType = 
  // Context7 operations
  | 'resolve-library-id' 
  | 'get-library-docs'
  // GitHub operations  
  | 'search-repositories'
  | 'get-file-contents'
  | 'create-issue'
  | 'create-pull-request'
  | 'search-code'
  // Firecrawl operations
  | 'scrape'
  | 'crawl'
  | 'search'
  | 'extract'
  | 'map'
  // Puppeteer operations
  | 'navigate'
  | 'screenshot'
  | 'click'
  | 'fill'
  | 'evaluate'
  // IDE operations
  | 'get-diagnostics'
  | 'execute-code'

export interface McpOperation {
  id: string
  type: McpOperationType
  serverId: string
  parameters: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: Date
  endTime?: Date
  duration?: number
  result?: any
  error?: string
  tokensUsed?: number
  parentOperationId?: string // For operation chaining
}

export interface McpWorkflowStep {
  id: string
  operationType: McpOperationType
  serverId: string
  parameters: Record<string, any>
  dependsOn: string[] // Step IDs this step depends on
  condition?: string // JavaScript expression for conditional execution
  retryPolicy?: {
    maxAttempts: number
    delayMs: number
    backoffMultiplier: number
  }
}

export interface McpWorkflow {
  id: string
  name: string
  description: string
  steps: McpWorkflowStep[]
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused'
  currentStepId?: string
  results: Record<string, any> // Step ID -> result mapping
  createdAt: Date
  updatedAt: Date
}

export interface McpCache {
  key: string
  serverId: string
  operationType: McpOperationType
  parameters: Record<string, any>
  result: any
  expiresAt: Date
  hitCount: number
  lastAccessed: Date
}

export interface McpErrorContext {
  serverId: string
  operationType: McpOperationType
  parameters: Record<string, any>
  error: string
  timestamp: Date
  retryCount: number
  resolved: boolean
}

// Server-specific interfaces

export interface Context7LibraryInfo {
  id: string
  name: string
  description: string
  trustScore: number
  codeSnippets: number
}

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  description: string
  stargazerCount: number
  language: string
  updatedAt: string
}

export interface FirecrawlResult {
  url: string
  markdown?: string
  html?: string
  metadata: {
    title?: string
    description?: string
    language?: string
    statusCode?: number
  }
}

export interface PuppeteerScreenshot {
  name: string
  data: string
  width: number
  height: number
  timestamp: Date
}

export interface IdeExecutionResult {
  output?: string
  error?: string
  executionCount: number
  metadata: Record<string, any>
}

// Analytics and insights

export interface McpAnalytics {
  totalServers: number
  activeServers: number
  totalOperations: number
  operationsToday: number
  averageResponseTime: number
  totalTokensUsed: number
  estimatedCost: number
  topOperations: Array<{
    type: McpOperationType
    count: number
    averageTime: number
  }>
  serverPerformance: Array<{
    serverId: string
    successRate: number
    averageResponseTime: number
    operationCount: number
  }>
}

// Real-time updates

export interface McpEvent {
  id: string
  type: 'server-status-changed' | 'operation-completed' | 'operation-failed' | 'workflow-updated'
  serverId?: string
  operationId?: string
  workflowId?: string
  data: any
  timestamp: Date
}

// UI State interfaces

export interface McpUIState {
  selectedServerId?: string
  activeTab: 'dashboard' | 'servers' | 'operations' | 'workflows' | 'analytics'
  showPerformanceMetrics: boolean
  autoRefresh: boolean
  refreshInterval: number
  filters: {
    serverTypes: McpServerType[]
    operationTypes: McpOperationType[]
    statusFilter: McpServerStatus[]
    timeRange: 'hour' | 'day' | 'week' | 'month'
  }
}