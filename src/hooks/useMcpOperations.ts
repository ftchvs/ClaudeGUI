import { useCallback, useMemo, useRef } from 'react'
import { useMcpStore } from '@/stores/mcp'
import type { McpOperation, McpOperationType, McpServerType } from '@/types/mcp'

export const useMcpOperations = () => {
  const {
    operations,
    activeOperations,
    servers,
    executeOperation,
    cancelOperation,
    retryOperation,
    clearCompletedOperations,
    getOperationHistory,
    getCachedResult,
    setCachedResult
  } = useMcpStore()

  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  // Computed values
  const operationList = useMemo(() => Object.values(operations), [operations])
  
  const runningOperations = useMemo(() => 
    operationList.filter(op => op.status === 'running'),
    [operationList]
  )
  
  const completedOperations = useMemo(() => 
    operationList.filter(op => op.status === 'completed'),
    [operationList]
  )
  
  const failedOperations = useMemo(() => 
    operationList.filter(op => op.status === 'failed'),
    [operationList]
  )

  const operationsByType = useMemo(() => {
    const grouped: Partial<Record<McpOperationType, McpOperation[]>> = {}
    operationList.forEach(operation => {
      const type = operation.type
      if (!grouped[type]) grouped[type] = []
      grouped[type]!.push(operation)
    })
    return grouped
  }, [operationList])

  const operationsByServer = useMemo(() => {
    const grouped: Record<string, McpOperation[]> = {}
    operationList.forEach(operation => {
      const serverId = operation.serverId
      if (!grouped[serverId]) grouped[serverId] = []
      grouped[serverId].push(operation)
    })
    return grouped
  }, [operationList])

  // Operation execution
  const execute = useCallback(async <T = any>(
    serverId: string,
    type: McpOperationType,
    parameters: Record<string, any>,
    options?: {
      useCache?: boolean
      cacheTTL?: number
      timeout?: number
      retryAttempts?: number
    }
  ): Promise<{ operationId: string; result?: T; fromCache?: boolean }> => {
    const { useCache = true, cacheTTL = 300000, timeout = 30000 } = options || {}
    
    // Check cache first
    if (useCache) {
      const cacheKey = `${serverId}:${type}:${JSON.stringify(parameters)}`
      const cachedResult = getCachedResult(cacheKey)
      if (cachedResult) {
        return { 
          operationId: '', 
          result: cachedResult, 
          fromCache: true 
        }
      }
    }

    // Check if server is connected
    const server = servers[serverId]
    if (!server || server.health.status !== 'connected') {
      throw new Error(`Server ${serverId} is not connected`)
    }

    // Create abort controller for timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), timeout)

    try {
      const operationId = await executeOperation({
        serverId,
        type,
        parameters
      })

      abortControllers.current.set(operationId, abortController)

      // Wait for operation to complete or fail
      const result = await new Promise<T>((resolve, reject) => {
        const checkStatus = () => {
          const op = operations[operationId]
          if (!op) {
            reject(new Error('Operation not found'))
            return
          }

          if (op.status === 'completed') {
            resolve(op.result)
          } else if (op.status === 'failed') {
            reject(new Error(op.error || 'Operation failed'))
          } else if (op.status === 'cancelled') {
            reject(new Error('Operation was cancelled'))
          } else if (abortController.signal.aborted) {
            cancelOperation(operationId)
            reject(new Error('Operation timed out'))
          } else {
            // Check again in 100ms
            setTimeout(checkStatus, 100)
          }
        }
        checkStatus()
      })

      // Cache the result if successful
      if (useCache) {
        const cacheKey = `${serverId}:${type}:${JSON.stringify(parameters)}`
        setCachedResult(cacheKey, serverId, type, parameters, result, cacheTTL)
      }

      return { operationId, result }

    } finally {
      clearTimeout(timeoutId)
      abortControllers.current.delete(operationId)
    }
  }, [servers, operations, executeOperation, cancelOperation, getCachedResult, setCachedResult])

  // Specialized execution methods for different server types
  const executeContext7 = useCallback(async (
    operation: 'resolve-library-id' | 'get-library-docs',
    parameters: Record<string, any>
  ) => {
    return execute('context7', operation, parameters)
  }, [execute])

  const executeGitHub = useCallback(async (
    operation: 'search-repositories' | 'get-file-contents' | 'create-issue' | 'create-pull-request' | 'search-code',
    parameters: Record<string, any>
  ) => {
    return execute('github', operation, parameters)
  }, [execute])

  const executeFirecrawl = useCallback(async (
    operation: 'scrape' | 'crawl' | 'search' | 'extract' | 'map',
    parameters: Record<string, any>
  ) => {
    return execute('firecrawl', operation, parameters, { 
      timeout: 60000, // Longer timeout for web scraping
      cacheTTL: 600000 // 10 minutes cache for web content
    })
  }, [execute])

  const executePuppeteer = useCallback(async (
    operation: 'navigate' | 'screenshot' | 'click' | 'fill' | 'evaluate',
    parameters: Record<string, any>
  ) => {
    return execute('puppeteer', operation, parameters, { 
      timeout: 45000, // Longer timeout for browser operations
      useCache: false // Don't cache browser interactions
    })
  }, [execute])

  const executeIDE = useCallback(async (
    operation: 'get-diagnostics' | 'execute-code',
    parameters: Record<string, any>
  ) => {
    return execute('ide', operation, parameters, { 
      timeout: 15000,
      useCache: false // Don't cache IDE operations
    })
  }, [execute])

  // Batch operations
  const executeBatch = useCallback(async (
    operations: Array<{
      serverId: string
      type: McpOperationType
      parameters: Record<string, any>
    }>,
    options?: {
      parallel?: boolean
      stopOnError?: boolean
    }
  ) => {
    const { parallel = false, stopOnError = true } = options || {}

    if (parallel) {
      const results = await Promise.allSettled(
        operations.map(op => execute(op.serverId, op.type, op.parameters))
      )
      return results.map((result, index) => ({
        operation: operations[index],
        success: result.status === 'fulfilled',
        result: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }))
    } else {
      const results = []
      for (const op of operations) {
        try {
          const result = await execute(op.serverId, op.type, op.parameters)
          results.push({
            operation: op,
            success: true,
            result,
            error: null
          })
        } catch (error) {
          const errorResult = {
            operation: op,
            success: false,
            result: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          results.push(errorResult)
          
          if (stopOnError) {
            break
          }
        }
      }
      return results
    }
  }, [execute])

  // Operation management
  const cancel = useCallback((operationId: string) => {
    const abortController = abortControllers.current.get(operationId)
    if (abortController) {
      abortController.abort()
      abortControllers.current.delete(operationId)
    }
    cancelOperation(operationId)
  }, [cancelOperation])

  const cancelAll = useCallback(() => {
    activeOperations.forEach(operationId => {
      cancel(operationId)
    })
  }, [activeOperations, cancel])

  const retry = useCallback(async (operationId: string) => {
    return retryOperation(operationId)
  }, [retryOperation])

  const getOperation = useCallback((operationId: string) => {
    return operations[operationId] || null
  }, [operations])

  const getHistory = useCallback((serverId?: string, type?: McpOperationType) => {
    return getOperationHistory(serverId, type)
  }, [getOperationHistory])

  // Statistics
  const stats = useMemo(() => {
    const total = operationList.length
    const completed = completedOperations.length
    const failed = failedOperations.length
    const running = runningOperations.length
    
    const totalDuration = completedOperations.reduce((acc, op) => acc + (op.duration || 0), 0)
    const averageDuration = completed > 0 ? totalDuration / completed : 0
    
    const successRate = total > 0 ? (completed / (completed + failed)) * 100 : 100
    
    const totalTokens = operationList.reduce((acc, op) => acc + (op.tokensUsed || 0), 0)

    return {
      total,
      completed,
      failed,
      running,
      pending: operationList.filter(op => op.status === 'pending').length,
      cancelled: operationList.filter(op => op.status === 'cancelled').length,
      successRate,
      averageDuration,
      totalTokens,
      operationsToday: operationList.filter(op => 
        op.startTime.toDateString() === new Date().toDateString()
      ).length
    }
  }, [operationList, completedOperations, failedOperations, runningOperations])

  // Performance insights
  const insights = useMemo(() => {
    const serverPerformance = Object.entries(operationsByServer).map(([serverId, ops]) => {
      const completed = ops.filter(op => op.status === 'completed')
      const failed = ops.filter(op => op.status === 'failed')
      const totalDuration = completed.reduce((acc, op) => acc + (op.duration || 0), 0)
      
      return {
        serverId,
        serverName: servers[serverId]?.config.name || serverId,
        totalOps: ops.length,
        completed: completed.length,
        failed: failed.length,
        successRate: ops.length > 0 ? (completed.length / (completed.length + failed.length)) * 100 : 100,
        averageDuration: completed.length > 0 ? totalDuration / completed.length : 0
      }
    })

    const typePerformance = Object.entries(operationsByType).map(([type, ops]) => {
      const completed = ops.filter(op => op.status === 'completed')
      const failed = ops.filter(op => op.status === 'failed')
      const totalDuration = completed.reduce((acc, op) => acc + (op.duration || 0), 0)
      
      return {
        type: type as McpOperationType,
        totalOps: ops.length,
        completed: completed.length,
        failed: failed.length,
        successRate: ops.length > 0 ? (completed.length / (completed.length + failed.length)) * 100 : 100,
        averageDuration: completed.length > 0 ? totalDuration / completed.length : 0
      }
    })

    return {
      serverPerformance,
      typePerformance,
      slowestOperations: completedOperations
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 10),
      fastestOperations: completedOperations
        .sort((a, b) => (a.duration || 0) - (b.duration || 0))
        .slice(0, 10)
    }
  }, [operationsByServer, operationsByType, completedOperations, servers])

  return {
    // Data
    operations: operationList,
    activeOperations: runningOperations,
    completedOperations,
    failedOperations,
    operationsByType,
    operationsByServer,
    stats,
    insights,
    
    // Execution
    execute,
    executeContext7,
    executeGitHub,
    executeFirecrawl,
    executePuppeteer,
    executeIDE,
    executeBatch,
    
    // Management
    cancel,
    cancelAll,
    retry,
    getOperation,
    getHistory,
    clearCompleted: clearCompletedOperations,
    
    // Utils
    isRunning: (operationId: string) => activeOperations.includes(operationId),
    getOperationsByServer: (serverId: string) => operationsByServer[serverId] || [],
    getOperationsByType: (type: McpOperationType) => operationsByType[type] || []
  }
}