import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  McpServer,
  McpServerConfig,
  McpOperation,
  McpWorkflow,
  McpCache,
  McpErrorContext,
  McpAnalytics,
  McpEvent,
  McpUIState,
  McpServerType,
  McpOperationType,
  McpServerStatus
} from '@/types/mcp'

interface McpState {
  // Server Management
  servers: Record<string, McpServer>
  serverConfigs: Record<string, McpServerConfig>
  
  // Operations & Workflows
  operations: Record<string, McpOperation>
  activeOperations: string[]
  workflows: Record<string, McpWorkflow>
  
  // Performance & Analytics
  cache: Record<string, McpCache>
  errors: McpErrorContext[]
  analytics: McpAnalytics
  events: McpEvent[]
  
  // UI State
  ui: McpUIState
  
  // Loading States
  isInitializing: boolean
  isRefreshing: boolean
  
  // Actions - Server Management
  addServer: (config: McpServerConfig) => void
  removeServer: (serverId: string) => void
  updateServerConfig: (serverId: string, config: Partial<McpServerConfig>) => void
  updateServerHealth: (serverId: string, health: Partial<McpServer['health']>) => void
  updateServerMetrics: (serverId: string, metrics: Partial<McpServer['metrics']>) => void
  connectServer: (serverId: string) => Promise<void>
  disconnectServer: (serverId: string) => Promise<void>
  testServerConnection: (serverId: string) => Promise<boolean>
  
  // Actions - Operations
  executeOperation: (operation: Omit<McpOperation, 'id' | 'status' | 'startTime'>) => Promise<string>
  cancelOperation: (operationId: string) => void
  retryOperation: (operationId: string) => Promise<void>
  clearCompletedOperations: () => void
  getOperationHistory: (serverId?: string, type?: McpOperationType) => McpOperation[]
  
  // Actions - Workflows
  createWorkflow: (workflow: Omit<McpWorkflow, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string
  executeWorkflow: (workflowId: string) => Promise<void>
  pauseWorkflow: (workflowId: string) => void
  resumeWorkflow: (workflowId: string) => Promise<void>
  cancelWorkflow: (workflowId: string) => void
  deleteWorkflow: (workflowId: string) => void
  
  // Actions - Cache & Performance
  getCachedResult: (key: string) => any | null
  setCachedResult: (key: string, serverId: string, type: McpOperationType, params: Record<string, any>, result: any, ttl: number) => void
  clearCache: (serverId?: string) => void
  optimizeCache: () => void
  
  // Actions - Analytics & Monitoring
  refreshAnalytics: () => void
  getServerAnalytics: (serverId: string) => Partial<McpAnalytics>
  exportAnalytics: (format: 'json' | 'csv') => string
  
  // Actions - Error Handling
  addError: (error: Omit<McpErrorContext, 'timestamp' | 'retryCount' | 'resolved'>) => void
  resolveError: (errorIndex: number) => void
  clearErrors: () => void
  
  // Actions - Events & Real-time Updates
  addEvent: (event: Omit<McpEvent, 'id' | 'timestamp'>) => void
  clearEvents: () => void
  subscribeToEvents: (callback: (event: McpEvent) => void) => () => void
  
  // Actions - UI State
  setSelectedServer: (serverId: string | undefined) => void
  setActiveTab: (tab: McpUIState['activeTab']) => void
  updateFilters: (filters: Partial<McpUIState['filters']>) => void
  togglePerformanceMetrics: () => void
  toggleAutoRefresh: () => void
  setRefreshInterval: (interval: number) => void
  
  // Actions - Initialization
  initialize: () => Promise<void>
  reset: () => void
}

const defaultAnalytics: McpAnalytics = {
  totalServers: 0,
  activeServers: 0,
  totalOperations: 0,
  operationsToday: 0,
  averageResponseTime: 0,
  totalTokensUsed: 0,
  estimatedCost: 0,
  topOperations: [],
  serverPerformance: []
}

const defaultUIState: McpUIState = {
  activeTab: 'dashboard',
  showPerformanceMetrics: true,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  filters: {
    serverTypes: [],
    operationTypes: [],
    statusFilter: [],
    timeRange: 'day'
  }
}

export const useMcpStore = create<McpState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    servers: {},
    serverConfigs: {},
    operations: {},
    activeOperations: [],
    workflows: {},
    cache: {},
    errors: [],
    analytics: defaultAnalytics,
    events: [],
    ui: defaultUIState,
    isInitializing: false,
    isRefreshing: false,

    // Server Management Actions
    addServer: (config) => {
      const serverId = config.id
      const server: McpServer = {
        config,
        health: {
          status: 'disconnected',
          lastPing: new Date(),
          responseTime: 0,
          uptime: 0,
          errorCount: 0,
          successRate: 100
        },
        metrics: {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          averageResponseTime: 0,
          tokensUsed: 0,
          costEstimate: 0,
          operationsToday: 0,
          operationsThisWeek: 0
        },
        capabilities: []
      }
      
      set((state) => ({
        servers: { ...state.servers, [serverId]: server },
        serverConfigs: { ...state.serverConfigs, [serverId]: config }
      }))
      
      if (config.autoConnect) {
        get().connectServer(serverId)
      }
    },

    removeServer: (serverId) => {
      set((state) => {
        const { [serverId]: removedServer, ...remainingServers } = state.servers
        const { [serverId]: removedConfig, ...remainingConfigs } = state.serverConfigs
        
        return {
          servers: remainingServers,
          serverConfigs: remainingConfigs,
          selectedServerId: state.ui.selectedServerId === serverId ? undefined : state.ui.selectedServerId
        }
      })
    },

    updateServerConfig: (serverId, configUpdate) => {
      set((state) => ({
        serverConfigs: {
          ...state.serverConfigs,
          [serverId]: { ...state.serverConfigs[serverId], ...configUpdate }
        },
        servers: {
          ...state.servers,
          [serverId]: {
            ...state.servers[serverId],
            config: { ...state.servers[serverId].config, ...configUpdate }
          }
        }
      }))
    },

    updateServerHealth: (serverId, healthUpdate) => {
      set((state) => ({
        servers: {
          ...state.servers,
          [serverId]: {
            ...state.servers[serverId],
            health: { ...state.servers[serverId].health, ...healthUpdate }
          }
        }
      }))
    },

    updateServerMetrics: (serverId, metricsUpdate) => {
      set((state) => ({
        servers: {
          ...state.servers,
          [serverId]: {
            ...state.servers[serverId],
            metrics: { ...state.servers[serverId].metrics, ...metricsUpdate }
          }
        }
      }))
    },

    connectServer: async (serverId) => {
      const { updateServerHealth, addEvent } = get()
      
      updateServerHealth(serverId, { status: 'connecting' })
      
      try {
        // Simulate connection logic - in real implementation, this would connect to actual MCP server
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        updateServerHealth(serverId, { 
          status: 'connected',
          lastPing: new Date(),
          responseTime: Math.random() * 100 + 50
        })
        
        addEvent({
          type: 'server-status-changed',
          serverId,
          data: { status: 'connected' }
        })
      } catch (error) {
        updateServerHealth(serverId, { 
          status: 'error',
          errorCount: get().servers[serverId].health.errorCount + 1
        })
        
        addEvent({
          type: 'server-status-changed',
          serverId,
          data: { status: 'error', error: error instanceof Error ? error.message : 'Connection failed' }
        })
      }
    },

    disconnectServer: async (serverId) => {
      const { updateServerHealth, addEvent } = get()
      
      updateServerHealth(serverId, { status: 'disconnected' })
      
      addEvent({
        type: 'server-status-changed',
        serverId,
        data: { status: 'disconnected' }
      })
    },

    testServerConnection: async (serverId) => {
      try {
        await get().connectServer(serverId)
        return get().servers[serverId].health.status === 'connected'
      } catch {
        return false
      }
    },

    // Operation Actions
    executeOperation: async (operationData) => {
      const operationId = crypto.randomUUID()
      const operation: McpOperation = {
        ...operationData,
        id: operationId,
        status: 'pending',
        startTime: new Date()
      }
      
      set((state) => ({
        operations: { ...state.operations, [operationId]: operation },
        activeOperations: [...state.activeOperations, operationId]
      }))
      
      // Update operation status to running
      set((state) => ({
        operations: {
          ...state.operations,
          [operationId]: { ...state.operations[operationId], status: 'running' }
        }
      }))
      
      try {
        // Simulate operation execution - in real implementation, this would call actual MCP server
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
        
        const endTime = new Date()
        const duration = endTime.getTime() - operation.startTime.getTime()
        
        set((state) => ({
          operations: {
            ...state.operations,
            [operationId]: {
              ...state.operations[operationId],
              status: 'completed',
              endTime,
              duration,
              result: { success: true, data: `Mock result for ${operationData.type}` }
            }
          },
          activeOperations: state.activeOperations.filter(id => id !== operationId)
        }))
        
        get().addEvent({
          type: 'operation-completed',
          operationId,
          serverId: operationData.serverId,
          data: { type: operationData.type, duration }
        })
        
      } catch (error) {
        set((state) => ({
          operations: {
            ...state.operations,
            [operationId]: {
              ...state.operations[operationId],
              status: 'failed',
              endTime: new Date(),
              error: error instanceof Error ? error.message : 'Operation failed'
            }
          },
          activeOperations: state.activeOperations.filter(id => id !== operationId)
        }))
        
        get().addEvent({
          type: 'operation-failed',
          operationId,
          serverId: operationData.serverId,
          data: { type: operationData.type, error: error instanceof Error ? error.message : 'Operation failed' }
        })
      }
      
      return operationId
    },

    cancelOperation: (operationId) => {
      set((state) => ({
        operations: {
          ...state.operations,
          [operationId]: {
            ...state.operations[operationId],
            status: 'cancelled',
            endTime: new Date()
          }
        },
        activeOperations: state.activeOperations.filter(id => id !== operationId)
      }))
    },

    retryOperation: async (operationId) => {
      const operation = get().operations[operationId]
      if (!operation) return
      
      const { serverId, type, parameters } = operation
      await get().executeOperation({ serverId, type, parameters })
    },

    clearCompletedOperations: () => {
      set((state) => {
        const activeIds = new Set(state.activeOperations)
        const filteredOperations = Object.fromEntries(
          Object.entries(state.operations).filter(([id, op]) => 
            activeIds.has(id) || op.status === 'running' || op.status === 'pending'
          )
        )
        
        return { operations: filteredOperations }
      })
    },

    getOperationHistory: (serverId, type) => {
      const operations = Object.values(get().operations)
      return operations.filter(op => 
        (!serverId || op.serverId === serverId) &&
        (!type || op.type === type)
      ).sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    },

    // Workflow Actions (simplified for now)
    createWorkflow: (workflowData) => {
      const workflowId = crypto.randomUUID()
      const workflow: McpWorkflow = {
        ...workflowData,
        id: workflowId,
        status: 'draft',
        results: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      set((state) => ({
        workflows: { ...state.workflows, [workflowId]: workflow }
      }))
      
      return workflowId
    },

    executeWorkflow: async (workflowId) => {
      // Simplified workflow execution - in real implementation, this would handle step dependencies
      const workflow = get().workflows[workflowId]
      if (!workflow) return
      
      set((state) => ({
        workflows: {
          ...state.workflows,
          [workflowId]: { ...workflow, status: 'running', updatedAt: new Date() }
        }
      }))
    },

    pauseWorkflow: (workflowId) => {
      set((state) => ({
        workflows: {
          ...state.workflows,
          [workflowId]: { 
            ...state.workflows[workflowId], 
            status: 'paused',
            updatedAt: new Date()
          }
        }
      }))
    },

    resumeWorkflow: async (workflowId) => {
      await get().executeWorkflow(workflowId)
    },

    cancelWorkflow: (workflowId) => {
      set((state) => ({
        workflows: {
          ...state.workflows,
          [workflowId]: { 
            ...state.workflows[workflowId], 
            status: 'failed',
            updatedAt: new Date()
          }
        }
      }))
    },

    deleteWorkflow: (workflowId) => {
      set((state) => {
        const { [workflowId]: removed, ...remaining } = state.workflows
        return { workflows: remaining }
      })
    },

    // Cache Actions
    getCachedResult: (key) => {
      const cached = get().cache[key]
      if (!cached || cached.expiresAt < new Date()) {
        return null
      }
      
      // Update hit count and last accessed
      set((state) => ({
        cache: {
          ...state.cache,
          [key]: {
            ...cached,
            hitCount: cached.hitCount + 1,
            lastAccessed: new Date()
          }
        }
      }))
      
      return cached.result
    },

    setCachedResult: (key, serverId, type, params, result, ttl) => {
      const expiresAt = new Date(Date.now() + ttl)
      
      set((state) => ({
        cache: {
          ...state.cache,
          [key]: {
            key,
            serverId,
            operationType: type,
            parameters: params,
            result,
            expiresAt,
            hitCount: 0,
            lastAccessed: new Date()
          }
        }
      }))
    },

    clearCache: (serverId) => {
      if (serverId) {
        set((state) => ({
          cache: Object.fromEntries(
            Object.entries(state.cache).filter(([_, cached]) => cached.serverId !== serverId)
          )
        }))
      } else {
        set({ cache: {} })
      }
    },

    optimizeCache: () => {
      const now = new Date()
      set((state) => ({
        cache: Object.fromEntries(
          Object.entries(state.cache).filter(([_, cached]) => cached.expiresAt > now)
        )
      }))
    },

    // Analytics Actions
    refreshAnalytics: () => {
      const { servers, operations } = get()
      const serverList = Object.values(servers)
      const operationList = Object.values(operations)
      
      const analytics: McpAnalytics = {
        totalServers: serverList.length,
        activeServers: serverList.filter(s => s.health.status === 'connected').length,
        totalOperations: operationList.length,
        operationsToday: operationList.filter(op => 
          op.startTime.toDateString() === new Date().toDateString()
        ).length,
        averageResponseTime: serverList.reduce((acc, s) => acc + s.health.responseTime, 0) / serverList.length || 0,
        totalTokensUsed: serverList.reduce((acc, s) => acc + s.metrics.tokensUsed, 0),
        estimatedCost: serverList.reduce((acc, s) => acc + s.metrics.costEstimate, 0),
        topOperations: [],
        serverPerformance: serverList.map(s => ({
          serverId: s.config.id,
          successRate: s.health.successRate,
          averageResponseTime: s.health.responseTime,
          operationCount: s.metrics.totalOperations
        }))
      }
      
      set({ analytics })
    },

    getServerAnalytics: (serverId) => {
      const server = get().servers[serverId]
      if (!server) return {}
      
      return {
        totalServers: 1,
        activeServers: server.health.status === 'connected' ? 1 : 0,
        totalOperations: server.metrics.totalOperations,
        averageResponseTime: server.health.responseTime,
        totalTokensUsed: server.metrics.tokensUsed,
        estimatedCost: server.metrics.costEstimate,
        serverPerformance: [{
          serverId: server.config.id,
          successRate: server.health.successRate,
          averageResponseTime: server.health.responseTime,
          operationCount: server.metrics.totalOperations
        }]
      }
    },

    exportAnalytics: (format) => {
      const analytics = get().analytics
      if (format === 'json') {
        return JSON.stringify(analytics, null, 2)
      }
      // Simplified CSV export
      return `Total Servers,${analytics.totalServers}\nActive Servers,${analytics.activeServers}\nTotal Operations,${analytics.totalOperations}\n`
    },

    // Error Handling Actions
    addError: (errorData) => {
      const error: McpErrorContext = {
        ...errorData,
        timestamp: new Date(),
        retryCount: 0,
        resolved: false
      }
      
      set((state) => ({
        errors: [...state.errors, error]
      }))
    },

    resolveError: (errorIndex) => {
      set((state) => ({
        errors: state.errors.map((error, index) => 
          index === errorIndex ? { ...error, resolved: true } : error
        )
      }))
    },

    clearErrors: () => {
      set({ errors: [] })
    },

    // Event Actions
    addEvent: (eventData) => {
      const event: McpEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }
      
      set((state) => ({
        events: [event, ...state.events.slice(0, 99)] // Keep last 100 events
      }))
    },

    clearEvents: () => {
      set({ events: [] })
    },

    subscribeToEvents: (callback) => {
      // In a real implementation, this would set up WebSocket or EventSource
      // For now, return a no-op unsubscribe function
      return () => {}
    },

    // UI Actions
    setSelectedServer: (serverId) => {
      set((state) => ({
        ui: { ...state.ui, selectedServerId: serverId }
      }))
    },

    setActiveTab: (tab) => {
      set((state) => ({
        ui: { ...state.ui, activeTab: tab }
      }))
    },

    updateFilters: (filters) => {
      set((state) => ({
        ui: { 
          ...state.ui, 
          filters: { ...state.ui.filters, ...filters }
        }
      }))
    },

    togglePerformanceMetrics: () => {
      set((state) => ({
        ui: { 
          ...state.ui, 
          showPerformanceMetrics: !state.ui.showPerformanceMetrics 
        }
      }))
    },

    toggleAutoRefresh: () => {
      set((state) => ({
        ui: { 
          ...state.ui, 
          autoRefresh: !state.ui.autoRefresh 
        }
      }))
    },

    setRefreshInterval: (interval) => {
      set((state) => ({
        ui: { ...state.ui, refreshInterval: interval }
      }))
    },

    // Initialization
    initialize: async () => {
      set({ isInitializing: true })
      
      // Initialize default servers
      const defaultServers: McpServerConfig[] = [
        {
          id: 'context7',
          name: 'Context7 Documentation',
          type: 'context7',
          enabled: true,
          autoConnect: true,
          timeout: 30000,
          retryAttempts: 3
        },
        {
          id: 'github',
          name: 'GitHub Integration',
          type: 'github',
          enabled: true,
          autoConnect: true,
          timeout: 30000,
          retryAttempts: 3
        },
        {
          id: 'firecrawl',
          name: 'Firecrawl Web Scraper',
          type: 'firecrawl',
          enabled: true,
          autoConnect: true,
          timeout: 60000,
          retryAttempts: 2
        },
        {
          id: 'puppeteer',
          name: 'Puppeteer Browser Control',
          type: 'puppeteer',
          enabled: true,
          autoConnect: false,
          timeout: 30000,
          retryAttempts: 3
        },
        {
          id: 'ide',
          name: 'IDE Integration',
          type: 'ide',
          enabled: true,
          autoConnect: true,
          timeout: 15000,
          retryAttempts: 5
        }
      ]
      
      // Add default servers
      defaultServers.forEach(config => {
        get().addServer(config)
      })
      
      // Initialize analytics
      get().refreshAnalytics()
      
      set({ isInitializing: false })
    },

    reset: () => {
      set({
        servers: {},
        serverConfigs: {},
        operations: {},
        activeOperations: [],
        workflows: {},
        cache: {},
        errors: [],
        analytics: defaultAnalytics,
        events: [],
        ui: defaultUIState,
        isInitializing: false,
        isRefreshing: false
      })
    }
  }))
)