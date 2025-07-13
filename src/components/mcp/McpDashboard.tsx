import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Server, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  BarChart3,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useMcpServers } from '@/hooks/useMcpServers'
import { useMcpOperations } from '@/hooks/useMcpOperations'
import { useMcpMetrics } from '@/hooks/useMcpMetrics'
import { useMcpStore } from '@/stores/mcp'
import type { McpServerStatus } from '@/types/mcp'

const McpDashboard: React.FC = () => {
  const { 
    servers, 
    stats: serverStats, 
    connectedServers, 
    connectAll, 
    disconnectAll,
    isInitializing 
  } = useMcpServers()
  
  const { 
    operations, 
    activeOperations, 
    stats: operationStats, 
    insights: operationInsights,
    cancelAll 
  } = useMcpOperations()
  
  const { 
    keyMetrics, 
    serverComparison, 
    costAnalysis, 
    insights,
    refresh,
    formatMetricValue,
    getMetricTrendColor 
  } = useMcpMetrics()
  
  const { ui, setActiveTab, toggleAutoRefresh, togglePerformanceMetrics } = useMcpStore()
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day')

  // Auto-refresh effect
  useEffect(() => {
    if (ui.autoRefresh) {
      const interval = setInterval(refresh, ui.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [ui.autoRefresh, ui.refreshInterval, refresh])

  const getStatusIcon = (status: McpServerStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: McpServerStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-gray-400'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your Model Context Protocol servers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={ui.autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${ui.autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={togglePerformanceMetrics}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMetricValue(metric.value, metric.unit)}
                    </p>
                  </div>
                  <div className={`flex items-center ${getMetricTrendColor(metric.trend, metric.category)}`}>
                    {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                    {metric.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                    {metric.trend === 'stable' && <Minus className="h-4 w-4" />}
                    <span className="text-xs ml-1">
                      {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={ui.activeTab} onValueChange={(tab) => setActiveTab(tab as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Server Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {serverStats.connected}
                      </div>
                      <div className="text-sm text-muted-foreground">Connected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {serverStats.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {/* Server List */}
                  <div className="space-y-2">
                    {servers.slice(0, 5).map((server) => (
                      <div
                        key={server.config.id}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(server.health.status)}
                          <div>
                            <p className="font-medium">{server.config.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {server.config.type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={server.health.status === 'connected' ? 'default' : 'secondary'}>
                            {server.health.status}
                          </Badge>
                          {server.health.status === 'connected' && (
                            <div className="text-xs text-muted-foreground">
                              {Math.round(server.health.responseTime)}ms
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={connectAll}
                      disabled={isInitializing}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Connect All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={disconnectAll}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Disconnect All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operations Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Operations Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Operation Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {operationStats.running}
                      </div>
                      <div className="text-sm text-muted-foreground">Running</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {operationStats.completed}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {operationStats.failed}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {operationStats.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={operationStats.successRate} className="h-2" />
                  </div>

                  {/* Recent Operations */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Operations</h4>
                    {operations.slice(0, 3).map((operation) => (
                      <div
                        key={operation.id}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            operation.status === 'completed' ? 'bg-green-500' :
                            operation.status === 'running' ? 'bg-blue-500' :
                            operation.status === 'failed' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{operation.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {operation.serverId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {operation.duration ? `${Math.round(operation.duration)}ms` : '...'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  {activeOperations.length > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={cancelAll}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel All Operations
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          {ui.showPerformanceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cost Analysis */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Cost Analysis</h4>
                    <p className="text-2xl font-bold">
                      ${costAnalysis.estimatedCost.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {costAnalysis.totalTokens.toLocaleString()} tokens used
                    </p>
                  </div>

                  {/* Average Response Time */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Avg Response Time</h4>
                    <p className="text-2xl font-bold">
                      {serverStats.averageResponseTime.toFixed(0)}ms
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Across all servers
                    </p>
                  </div>

                  {/* Success Rate */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Overall Success Rate</h4>
                    <p className="text-2xl font-bold">
                      {serverStats.averageSuccessRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      System reliability
                    </p>
                  </div>
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">System Insights</h4>
                    <ul className="space-y-1">
                      {insights.map((insight, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="servers">
          <Card>
            <CardHeader>
              <CardTitle>Server Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Server management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Operation history and monitoring interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Workflow builder and management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics and reporting interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default McpDashboard