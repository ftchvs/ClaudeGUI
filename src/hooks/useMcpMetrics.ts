import { useCallback, useMemo, useEffect } from 'react'
import { useMcpStore } from '@/stores/mcp'
import type { McpAnalytics, McpServerType, McpOperationType } from '@/types/mcp'

export interface TimeSeriesDataPoint {
  timestamp: Date
  value: number
  label?: string
}

export interface PerformanceMetric {
  name: string
  value: number
  change: number
  changePercentage: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  category: 'performance' | 'usage' | 'cost' | 'reliability'
}

export const useMcpMetrics = () => {
  const {
    analytics,
    servers,
    operations,
    ui,
    refreshAnalytics,
    getServerAnalytics,
    exportAnalytics,
    isRefreshing
  } = useMcpStore()

  // Auto-refresh analytics
  useEffect(() => {
    if (ui.autoRefresh) {
      const interval = setInterval(refreshAnalytics, ui.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [ui.autoRefresh, ui.refreshInterval, refreshAnalytics])

  // Time series data generation
  const generateTimeSeries = useCallback((
    metric: 'operations' | 'responseTime' | 'errors' | 'tokens',
    serverId?: string,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): TimeSeriesDataPoint[] => {
    const now = new Date()
    const points: TimeSeriesDataPoint[] = []
    
    let intervals: number
    let intervalMs: number
    
    switch (timeRange) {
      case 'hour':
        intervals = 60 // 60 minutes
        intervalMs = 60 * 1000 // 1 minute
        break
      case 'day':
        intervals = 24 // 24 hours
        intervalMs = 60 * 60 * 1000 // 1 hour
        break
      case 'week':
        intervals = 7 // 7 days
        intervalMs = 24 * 60 * 60 * 1000 // 1 day
        break
      case 'month':
        intervals = 30 // 30 days
        intervalMs = 24 * 60 * 60 * 1000 // 1 day
        break
    }

    for (let i = intervals - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMs))
      const rangeStart = new Date(timestamp.getTime() - intervalMs)
      const rangeEnd = timestamp

      const relevantOperations = Object.values(operations).filter(op => {
        const inTimeRange = op.startTime >= rangeStart && op.startTime <= rangeEnd
        const matchesServer = !serverId || op.serverId === serverId
        return inTimeRange && matchesServer
      })

      let value = 0
      switch (metric) {
        case 'operations':
          value = relevantOperations.length
          break
        case 'responseTime':
          const completedOps = relevantOperations.filter(op => op.status === 'completed')
          value = completedOps.length > 0 
            ? completedOps.reduce((acc, op) => acc + (op.duration || 0), 0) / completedOps.length
            : 0
          break
        case 'errors':
          value = relevantOperations.filter(op => op.status === 'failed').length
          break
        case 'tokens':
          value = relevantOperations.reduce((acc, op) => acc + (op.tokensUsed || 0), 0)
          break
      }

      points.push({ timestamp, value })
    }

    return points
  }, [operations])

  // Key performance metrics
  const keyMetrics = useMemo((): PerformanceMetric[] => {
    const serverList = Object.values(servers)
    const operationList = Object.values(operations)
    
    // Calculate previous period values for comparison
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    
    const todayOps = operationList.filter(op => op.startTime >= dayAgo)
    const yesterdayOps = operationList.filter(op => op.startTime >= twoDaysAgo && op.startTime < dayAgo)
    
    const todayCompleted = todayOps.filter(op => op.status === 'completed')
    const yesterdayCompleted = yesterdayOps.filter(op => op.status === 'completed')
    
    const todayFailed = todayOps.filter(op => op.status === 'failed')
    const yesterdayFailed = yesterdayOps.filter(op => op.status === 'failed')

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const getTrend = (change: number): 'up' | 'down' | 'stable' => {
      if (Math.abs(change) < 5) return 'stable'
      return change > 0 ? 'up' : 'down'
    }

    const metrics: PerformanceMetric[] = [
      {
        name: 'Operations Today',
        value: todayOps.length,
        change: todayOps.length - yesterdayOps.length,
        changePercentage: calculateChange(todayOps.length, yesterdayOps.length),
        trend: getTrend(calculateChange(todayOps.length, yesterdayOps.length)),
        unit: 'count',
        category: 'usage'
      },
      {
        name: 'Success Rate',
        value: todayOps.length > 0 ? (todayCompleted.length / todayOps.length) * 100 : 100,
        change: yesterdayOps.length > 0 
          ? ((todayCompleted.length / todayOps.length) - (yesterdayCompleted.length / yesterdayOps.length)) * 100
          : 0,
        changePercentage: calculateChange(
          todayOps.length > 0 ? todayCompleted.length / todayOps.length : 1,
          yesterdayOps.length > 0 ? yesterdayCompleted.length / yesterdayOps.length : 1
        ),
        trend: getTrend(calculateChange(
          todayOps.length > 0 ? todayCompleted.length / todayOps.length : 1,
          yesterdayOps.length > 0 ? yesterdayCompleted.length / yesterdayOps.length : 1
        )),
        unit: '%',
        category: 'reliability'
      },
      {
        name: 'Avg Response Time',
        value: todayCompleted.length > 0 
          ? todayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / todayCompleted.length
          : 0,
        change: yesterdayCompleted.length > 0 
          ? (todayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / todayCompleted.length) -
            (yesterdayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / yesterdayCompleted.length)
          : 0,
        changePercentage: calculateChange(
          todayCompleted.length > 0 ? todayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / todayCompleted.length : 0,
          yesterdayCompleted.length > 0 ? yesterdayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / yesterdayCompleted.length : 0
        ),
        trend: getTrend(calculateChange(
          todayCompleted.length > 0 ? todayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / todayCompleted.length : 0,
          yesterdayCompleted.length > 0 ? yesterdayCompleted.reduce((acc, op) => acc + (op.duration || 0), 0) / yesterdayCompleted.length : 0
        )),
        unit: 'ms',
        category: 'performance'
      },
      {
        name: 'Active Servers',
        value: serverList.filter(s => s.health.status === 'connected').length,
        change: 0, // Would need historical data
        changePercentage: 0,
        trend: 'stable',
        unit: 'count',
        category: 'usage'
      },
      {
        name: 'Tokens Used Today',
        value: todayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0),
        change: todayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0) - 
                yesterdayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0),
        changePercentage: calculateChange(
          todayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0),
          yesterdayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0)
        ),
        trend: getTrend(calculateChange(
          todayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0),
          yesterdayOps.reduce((acc, op) => acc + (op.tokensUsed || 0), 0)
        )),
        unit: 'tokens',
        category: 'cost'
      },
      {
        name: 'Error Rate',
        value: todayOps.length > 0 ? (todayFailed.length / todayOps.length) * 100 : 0,
        change: yesterdayOps.length > 0 
          ? ((todayFailed.length / todayOps.length) - (yesterdayFailed.length / yesterdayOps.length)) * 100
          : 0,
        changePercentage: calculateChange(
          todayOps.length > 0 ? todayFailed.length / todayOps.length : 0,
          yesterdayOps.length > 0 ? yesterdayFailed.length / yesterdayOps.length : 0
        ),
        trend: getTrend(calculateChange(
          todayOps.length > 0 ? todayFailed.length / todayOps.length : 0,
          yesterdayOps.length > 0 ? yesterdayFailed.length / yesterdayOps.length : 0
        )),
        unit: '%',
        category: 'reliability'
      }
    ]

    return metrics
  }, [servers, operations])

  // Server comparison metrics
  const serverComparison = useMemo(() => {
    return Object.values(servers).map(server => {
      const serverOps = Object.values(operations).filter(op => op.serverId === server.config.id)
      const completedOps = serverOps.filter(op => op.status === 'completed')
      const failedOps = serverOps.filter(op => op.status === 'failed')
      
      return {
        id: server.config.id,
        name: server.config.name,
        type: server.config.type,
        status: server.health.status,
        totalOperations: serverOps.length,
        successRate: serverOps.length > 0 ? (completedOps.length / serverOps.length) * 100 : 100,
        averageResponseTime: server.health.responseTime,
        tokensUsed: server.metrics.tokensUsed,
        errorCount: failedOps.length,
        uptime: server.health.uptime,
        lastPing: server.health.lastPing
      }
    }).sort((a, b) => b.totalOperations - a.totalOperations)
  }, [servers, operations])

  // Operation type analysis
  const operationTypeAnalysis = useMemo(() => {
    const typeStats: Record<McpOperationType, {
      count: number
      successRate: number
      averageDuration: number
      totalTokens: number
    }> = {} as any

    Object.values(operations).forEach(op => {
      if (!typeStats[op.type]) {
        typeStats[op.type] = {
          count: 0,
          successRate: 0,
          averageDuration: 0,
          totalTokens: 0
        }
      }

      typeStats[op.type].count++
      typeStats[op.type].totalTokens += op.tokensUsed || 0
    })

    // Calculate success rates and average durations
    Object.keys(typeStats).forEach(type => {
      const typeOps = Object.values(operations).filter(op => op.type === type)
      const completed = typeOps.filter(op => op.status === 'completed')
      const failed = typeOps.filter(op => op.status === 'failed')
      
      typeStats[type as McpOperationType].successRate = 
        typeOps.length > 0 ? (completed.length / (completed.length + failed.length)) * 100 : 100
      
      typeStats[type as McpOperationType].averageDuration = 
        completed.length > 0 
          ? completed.reduce((acc, op) => acc + (op.duration || 0), 0) / completed.length
          : 0
    })

    return Object.entries(typeStats).map(([type, stats]) => ({
      type: type as McpOperationType,
      ...stats
    })).sort((a, b) => b.count - a.count)
  }, [operations])

  // Cost analysis
  const costAnalysis = useMemo(() => {
    const totalTokens = analytics.totalTokensUsed
    const estimatedCost = analytics.estimatedCost
    
    // Simple cost calculation - in real implementation, this would use actual pricing
    const tokenCostUSD = 0.000002 // $0.002 per 1K tokens (example)
    const calculatedCost = (totalTokens / 1000) * tokenCostUSD
    
    const serverCosts = Object.values(servers).map(server => ({
      serverId: server.config.id,
      serverName: server.config.name,
      tokensUsed: server.metrics.tokensUsed,
      estimatedCost: (server.metrics.tokensUsed / 1000) * tokenCostUSD,
      percentage: totalTokens > 0 ? (server.metrics.tokensUsed / totalTokens) * 100 : 0
    })).sort((a, b) => b.tokensUsed - a.tokensUsed)

    return {
      totalTokens,
      estimatedCost: calculatedCost,
      averageTokensPerOperation: analytics.totalOperations > 0 ? totalTokens / analytics.totalOperations : 0,
      costTrend: 'stable' as 'up' | 'down' | 'stable', // Would calculate from historical data
      serverCosts,
      dailyBurnRate: calculatedCost, // Simplified - would be actual daily rate
      monthlyProjection: calculatedCost * 30
    }
  }, [analytics, servers])

  // Performance insights
  const insights = useMemo(() => {
    const insights: string[] = []
    
    // Check for slow servers
    const slowServers = serverComparison.filter(s => s.averageResponseTime > 2000)
    if (slowServers.length > 0) {
      insights.push(`${slowServers.length} server(s) have response times over 2 seconds`)
    }
    
    // Check for low success rates
    const unreliableServers = serverComparison.filter(s => s.successRate < 90)
    if (unreliableServers.length > 0) {
      insights.push(`${unreliableServers.length} server(s) have success rates below 90%`)
    }
    
    // Check for high token usage
    const highTokenOperations = operationTypeAnalysis.filter(op => op.totalTokens > 10000)
    if (highTokenOperations.length > 0) {
      insights.push(`${highTokenOperations.length} operation type(s) using high token counts`)
    }
    
    // Check for disconnected servers
    const disconnectedServers = serverComparison.filter(s => s.status === 'disconnected')
    if (disconnectedServers.length > 0) {
      insights.push(`${disconnectedServers.length} server(s) are currently disconnected`)
    }
    
    if (insights.length === 0) {
      insights.push('All systems operating normally')
    }
    
    return insights
  }, [serverComparison, operationTypeAnalysis])

  // Export functions
  const exportMetrics = useCallback((format: 'json' | 'csv' | 'xlsx' = 'json') => {
    const data = {
      analytics,
      keyMetrics,
      serverComparison,
      operationTypeAnalysis,
      costAnalysis,
      insights,
      exportedAt: new Date().toISOString()
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        // Simplified CSV export - in real implementation, would use proper CSV library
        let csv = 'Metric,Value,Unit,Change%\n'
        keyMetrics.forEach(metric => {
          csv += `${metric.name},${metric.value},${metric.unit},${metric.changePercentage}\n`
        })
        return csv
      default:
        return JSON.stringify(data, null, 2)
    }
  }, [analytics, keyMetrics, serverComparison, operationTypeAnalysis, costAnalysis, insights])

  return {
    // Core analytics
    analytics,
    keyMetrics,
    serverComparison,
    operationTypeAnalysis,
    costAnalysis,
    insights,
    isRefreshing,
    
    // Time series data
    generateTimeSeries,
    
    // Server-specific metrics
    getServerMetrics: getServerAnalytics,
    
    // Actions
    refresh: refreshAnalytics,
    export: exportMetrics,
    exportAnalytics,
    
    // Utilities
    formatMetricValue: (value: number, unit: string) => {
      switch (unit) {
        case 'ms':
          return `${Math.round(value)}ms`
        case '%':
          return `${Math.round(value * 100) / 100}%`
        case 'tokens':
          return value > 1000 ? `${Math.round(value / 1000)}K` : value.toString()
        case 'count':
          return value.toString()
        default:
          return value.toString()
      }
    },
    
    formatDuration: (ms: number) => {
      if (ms < 1000) return `${Math.round(ms)}ms`
      if (ms < 60000) return `${Math.round(ms / 1000)}s`
      return `${Math.round(ms / 60000)}m`
    },
    
    getMetricTrendColor: (trend: 'up' | 'down' | 'stable', category: PerformanceMetric['category']) => {
      if (trend === 'stable') return 'text-gray-500'
      
      // For performance and reliability metrics, down is good, up is bad
      if (category === 'performance' || category === 'reliability') {
        return trend === 'down' ? 'text-green-500' : 'text-red-500'
      }
      
      // For usage and cost metrics, up might be neutral or bad depending on context
      return trend === 'up' ? 'text-blue-500' : 'text-gray-500'
    }
  }
}