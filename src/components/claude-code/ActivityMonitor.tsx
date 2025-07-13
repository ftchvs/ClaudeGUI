import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Brain,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader,
  Eye,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClaudeCodeStore } from '@/stores/claude-code'
import { useMcpStore } from '@/stores/mcp'

interface ThinkingProcessProps {
  process: {
    id: string
    type: 'analyzing' | 'generating' | 'planning' | 'executing'
    description: string
    progress: number
    subSteps: string[]
    currentStep: string
    startTime: Date
    estimatedDuration: number
  }
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ process }) => {
  const getTypeIcon = () => {
    switch (process.type) {
      case 'analyzing':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'generating':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'planning':
        return <Brain className="h-4 w-4 text-purple-500" />
      case 'executing':
        return <Zap className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = () => {
    switch (process.type) {
      case 'analyzing':
        return 'border-l-blue-500 bg-blue-50'
      case 'generating':
        return 'border-l-green-500 bg-green-50'
      case 'planning':
        return 'border-l-purple-500 bg-purple-50'
      case 'executing':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const elapsed = Date.now() - process.startTime.getTime()
  const remaining = Math.max(0, process.estimatedDuration - elapsed)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-l-4 p-4 rounded-lg ${getTypeColor()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <span className="font-medium capitalize">{process.type}</span>
          <Badge variant="outline" className="text-xs">
            {Math.round(process.progress)}%
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.round(remaining / 1000)}s remaining
        </div>
      </div>

      <p className="text-sm mb-3">{process.description}</p>

      <div className="space-y-2">
        <Progress value={process.progress} className="h-2" />
        
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Current: {process.currentStep}</div>
          
          <div className="space-y-1">
            {process.subSteps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 ${
                  step === process.currentStep ? 'text-blue-600 font-medium' : 'text-muted-foreground'
                }`}
              >
                {index < process.subSteps.indexOf(process.currentStep) ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : index === process.subSteps.indexOf(process.currentStep) ? (
                  <Loader className="h-3 w-3 animate-spin" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                )}
                <span className="text-xs">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface OperationItemProps {
  operation: {
    id: string
    type: string
    description: string
    status: 'running' | 'completed' | 'failed'
    progress?: number
    startTime: Date
    endTime?: Date
    result?: any
    error?: string
    tokensUsed?: number
    cost?: number
  }
}

const OperationItem: React.FC<OperationItemProps> = ({ operation }) => {
  const getStatusIcon = () => {
    switch (operation.status) {
      case 'running':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const duration = operation.endTime 
    ? operation.endTime.getTime() - operation.startTime.getTime()
    : Date.now() - operation.startTime.getTime()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="font-medium text-sm">{operation.type}</div>
          <div className="text-xs text-muted-foreground">{operation.description}</div>
          {operation.status === 'running' && operation.progress !== undefined && (
            <Progress value={operation.progress} className="w-32 h-1 mt-1" />
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{Math.round(duration / 1000)}s</span>
        {operation.tokensUsed && (
          <Badge variant="outline" className="text-xs">
            {operation.tokensUsed} tokens
          </Badge>
        )}
        {operation.cost && (
          <Badge variant="outline" className="text-xs">
            ${operation.cost.toFixed(4)}
          </Badge>
        )}
      </div>
    </motion.div>
  )
}

const RealTimeMetrics: React.FC = () => {
  const { performanceMetrics } = useClaudeCodeStore()
  const { analytics } = useMcpStore()

  const latestMetrics = performanceMetrics[0]

  if (!latestMetrics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No performance data available</p>
      </div>
    )
  }

  const metrics = [
    {
      icon: <Cpu className="h-4 w-4" />,
      label: 'CPU Usage',
      value: latestMetrics.cpu.usage,
      unit: '%',
      color: 'blue'
    },
    {
      icon: <HardDrive className="h-4 w-4" />,
      label: 'Memory',
      value: latestMetrics.memory.percentage,
      unit: '%',
      color: 'green'
    },
    {
      icon: <HardDrive className="h-4 w-4" />,
      label: 'Disk',
      value: latestMetrics.disk.percentage,
      unit: '%',
      color: 'orange'
    },
    {
      icon: <Network className="h-4 w-4" />,
      label: 'Network',
      value: (latestMetrics.network.bytesReceived + latestMetrics.network.bytesSent) / 1024 / 1024,
      unit: 'MB',
      color: 'purple'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`text-${metric.color}-500`}>{metric.icon}</div>
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metric.value.toFixed(1)}{metric.unit}
              </div>
              <Progress 
                value={metric.unit === '%' ? metric.value : Math.min(100, metric.value)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const TokenUsageChart: React.FC = () => {
  const { stats, conversations } = useClaudeCodeStore()
  const { analytics } = useMcpStore()

  const conversationList = Object.values(conversations)
  const totalTokens = stats.session.tokensUsed + analytics.totalTokensUsed
  const totalCost = stats.session.costIncurred + analytics.estimatedCost

  const breakdown = [
    {
      label: 'Claude Code',
      tokens: stats.session.tokensUsed,
      cost: stats.session.costIncurred,
      percentage: totalTokens > 0 ? (stats.session.tokensUsed / totalTokens) * 100 : 0
    },
    {
      label: 'MCP Operations',
      tokens: analytics.totalTokensUsed,
      cost: analytics.estimatedCost,
      percentage: totalTokens > 0 ? (analytics.totalTokensUsed / totalTokens) * 100 : 0
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Tokens</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {breakdown.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">
                {item.tokens.toLocaleString()} tokens (${item.cost.toFixed(4)})
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

const ActivityMonitor: React.FC = () => {
  const { commands, runningCommands } = useClaudeCodeStore()
  const { operations } = useMcpStore()

  const [filterType, setFilterType] = useState<'all' | 'running' | 'completed' | 'failed'>('all')
  const [showThinking, setShowThinking] = useState(true)

  // Mock thinking processes for demonstration
  const [thinkingProcesses, setThinkingProcesses] = useState([
    {
      id: '1',
      type: 'analyzing' as const,
      description: 'Analyzing codebase structure and dependencies',
      progress: 75,
      subSteps: [
        'Scanning files',
        'Building dependency graph',
        'Analyzing patterns',
        'Generating recommendations'
      ],
      currentStep: 'Analyzing patterns',
      startTime: new Date(Date.now() - 30000),
      estimatedDuration: 45000
    }
  ])

  // Mock operations
  const recentOperations = [
    ...commands.slice(0, 5).map(cmd => ({
      id: cmd.id,
      type: cmd.type,
      description: cmd.command,
      status: cmd.status as 'running' | 'completed' | 'failed',
      progress: cmd.status === 'running' ? Math.random() * 100 : undefined,
      startTime: cmd.timestamp,
      endTime: cmd.status !== 'running' ? new Date(cmd.timestamp.getTime() + (cmd.duration || 0)) : undefined,
      tokensUsed: Math.floor(Math.random() * 500 + 100),
      cost: Math.random() * 0.01 + 0.001
    })),
    ...Object.values(operations).slice(0, 3).map(op => ({
      id: op.id,
      type: op.type,
      description: `MCP ${op.type} operation`,
      status: op.status as 'running' | 'completed' | 'failed',
      progress: op.status === 'running' ? Math.random() * 100 : undefined,
      startTime: op.startTime,
      endTime: op.endTime,
      tokensUsed: op.tokensUsed,
      cost: (op.tokensUsed || 0) * 0.000002
    }))
  ].filter(op => {
    if (filterType === 'all') return true
    return op.status === filterType
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Activity Monitor</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={showThinking ? "default" : "outline"}
              size="sm"
              onClick={() => setShowThinking(!showThinking)}
            >
              <Brain className="h-4 w-4 mr-2" />
              Thinking
            </Button>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="operations" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tokens">Tokens & Cost</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="operations" className="flex-1 p-4">
          <div className="space-y-6">
            {/* Thinking Processes */}
            <AnimatePresence>
              {showThinking && thinkingProcesses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className="font-medium mb-3">Thinking Processes</h3>
                  <div className="space-y-3">
                    {thinkingProcesses.map(process => (
                      <ThinkingProcess key={process.id} process={process} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Operations List */}
            <div>
              <h3 className="font-medium mb-3">Recent Operations</h3>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {recentOperations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No operations found</p>
                    </div>
                  ) : (
                    recentOperations.map(operation => (
                      <OperationItem key={operation.id} operation={operation} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="flex-1 p-4">
          <RealTimeMetrics />
        </TabsContent>

        <TabsContent value="tokens" className="flex-1 p-4">
          <TokenUsageChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ActivityMonitor