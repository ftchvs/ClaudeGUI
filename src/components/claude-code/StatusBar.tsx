import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Brain,
  Cpu,
  DollarSign,
  Zap,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Loader,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  EyeOff,
  Settings,
  MoreHorizontal,
  Server,
  GitBranch,
  FolderOpen,
  Terminal,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useClaudeCodeStore } from '@/stores/claude-code'
import { useMcpStore } from '@/stores/mcp'

interface StatusIndicatorProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  status?: 'good' | 'warning' | 'error'
  tooltip?: string
  onClick?: () => void
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  icon,
  label,
  value,
  trend,
  status,
  tooltip,
  onClick
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const content = (
    <div 
      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={onClick}
    >
      <div className={getStatusColor()}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs font-medium">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {getTrendIcon()}
    </div>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

interface ThinkingIndicatorProps {
  isThinking: boolean
  currentThought?: string
  progress?: number
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  isThinking,
  currentThought,
  progress
}) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isThinking) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isThinking])

  if (!isThinking) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-700">
            Claude is thinking{dots}
          </span>
          <Loader className="h-3 w-3 text-blue-500 animate-spin" />
        </div>
        {currentThought && (
          <span className="text-xs text-blue-600 italic">{currentThought}</span>
        )}
        {progress !== undefined && (
          <Progress value={progress} className="w-24 h-1 mt-1" />
        )}
      </div>
    </motion.div>
  )
}

const StatusBar: React.FC = () => {
  const {
    isConnected,
    connectionStatus,
    currentSession,
    runningCommands,
    pendingDiffs,
    stats,
    currentWorkspace,
    gitStatus,
    performanceMetrics
  } = useClaudeCodeStore()

  const {
    analytics: mcpAnalytics,
    servers: mcpServers,
    activeOperations
  } = useMcpStore()

  const [showDetails, setShowDetails] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  // Mock thinking state for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setIsThinking(Math.random() > 0.7)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const latestMetrics = performanceMetrics[0]
  const tokensToday = stats.session.tokensUsed || 0
  const costToday = stats.session.costIncurred || 0
  const activeCommands = runningCommands.size
  const activeMcpOps = activeOperations.length
  const connectedMcpServers = Object.values(mcpServers).filter(s => s.health.status === 'connected').length

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { status: 'good' as const, text: 'Connected' }
      case 'connecting':
        return { status: 'warning' as const, text: 'Connecting' }
      case 'error':
        return { status: 'error' as const, text: 'Error' }
      default:
        return { status: 'error' as const, text: 'Disconnected' }
    }
  }

  const connection = getConnectionStatus()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="border-t bg-background/95 backdrop-blur">
      {/* Main Status Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Connection & Session Status */}
        <div className="flex items-center gap-4">
          <StatusIndicator
            icon={isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            label="Connection"
            value={connection.text}
            status={connection.status}
            tooltip={`Claude Code ${connection.text.toLowerCase()}`}
          />

          {currentSession && (
            <StatusIndicator
              icon={<Activity className="h-4 w-4" />}
              label="Session"
              value={`${Math.floor(currentSession.sessionDuration / 60000)}m`}
              status="good"
              tooltip={`Session ID: ${currentSession.id.slice(0, 8)}`}
            />
          )}

          {currentWorkspace && (
            <StatusIndicator
              icon={<FolderOpen className="h-4 w-4" />}
              label="Workspace"
              value={currentWorkspace.name}
              status="good"
              tooltip={currentWorkspace.path}
            />
          )}

          {gitStatus && (
            <StatusIndicator
              icon={<GitBranch className="h-4 w-4" />}
              label="Branch"
              value={gitStatus.branch}
              status={gitStatus.hasUncommittedChanges ? 'warning' : 'good'}
              tooltip={`${gitStatus.unstaged.length + gitStatus.staged.length} changes`}
            />
          )}
        </div>

        {/* Center: Thinking Indicator */}
        <AnimatePresence>
          <ThinkingIndicator
            isThinking={isThinking}
            currentThought="Analyzing file structure and dependencies..."
            progress={65}
          />
        </AnimatePresence>

        {/* Right: Performance & Operations */}
        <div className="flex items-center gap-4">
          <StatusIndicator
            icon={<Zap className="h-4 w-4" />}
            label="Tokens"
            value={formatNumber(tokensToday)}
            trend={tokensToday > 1000 ? 'up' : 'stable'}
            tooltip={`${tokensToday.toLocaleString()} tokens used today`}
          />

          <StatusIndicator
            icon={<DollarSign className="h-4 w-4" />}
            label="Cost"
            value={formatCurrency(costToday)}
            trend={costToday > 0.01 ? 'up' : 'stable'}
            tooltip={`Total cost today: ${formatCurrency(costToday)}`}
          />

          {(activeCommands > 0 || activeMcpOps > 0) && (
            <StatusIndicator
              icon={<Terminal className="h-4 w-4" />}
              label="Active"
              value={activeCommands + activeMcpOps}
              status={activeCommands + activeMcpOps > 0 ? 'warning' : 'good'}
              tooltip={`${activeCommands} commands, ${activeMcpOps} MCP operations`}
            />
          )}

          <StatusIndicator
            icon={<Server className="h-4 w-4" />}
            label="MCP"
            value={`${connectedMcpServers}/${Object.keys(mcpServers).length}`}
            status={connectedMcpServers > 0 ? 'good' : 'warning'}
            tooltip={`${connectedMcpServers} MCP servers connected`}
          />

          {latestMetrics && (
            <StatusIndicator
              icon={<Cpu className="h-4 w-4" />}
              label="CPU"
              value={`${Math.round(latestMetrics.cpu.usage)}%`}
              status={latestMetrics.cpu.usage > 80 ? 'warning' : 'good'}
              tooltip={`CPU usage: ${Math.round(latestMetrics.cpu.usage)}%`}
            />
          )}

          {pendingDiffs.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-orange-100 border border-orange-300 rounded-full"
            >
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">
                  {pendingDiffs.length} pending
                </span>
              </div>
            </motion.div>
          )}

          <Popover open={showDetails} onOpenChange={setShowDetails}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <DetailedStatusPanel />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Progress Bars for Active Operations */}
      {(activeCommands > 0 || activeMcpOps > 0) && (
        <div className="px-4 pb-2">
          <div className="grid grid-cols-1 gap-1">
            {activeCommands > 0 && (
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-blue-500" />
                <Progress value={Math.random() * 100} className="flex-1 h-1" />
                <span className="text-xs text-muted-foreground">
                  {activeCommands} command{activeCommands > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {activeMcpOps > 0 && (
              <div className="flex items-center gap-2">
                <Server className="h-3 w-3 text-green-500" />
                <Progress value={Math.random() * 100} className="flex-1 h-1" />
                <span className="text-xs text-muted-foreground">
                  {activeMcpOps} MCP operation{activeMcpOps > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const DetailedStatusPanel: React.FC = () => {
  const { stats, performanceMetrics, conversations } = useClaudeCodeStore()
  const { analytics } = useMcpStore()

  const latestMetrics = performanceMetrics[0]
  const totalConversations = Object.keys(conversations).length

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Session Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <div className="font-medium">{Math.floor(stats.session.duration / 60000)}m</div>
          </div>
          <div>
            <span className="text-muted-foreground">Commands:</span>
            <div className="font-medium">{stats.session.commandsExecuted}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Files:</span>
            <div className="font-medium">{stats.session.filesModified}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Conversations:</span>
            <div className="font-medium">{totalConversations}</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Token Usage</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today:</span>
            <span className="font-medium">{stats.session.tokensUsed.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>MCP Total:</span>
            <span className="font-medium">{analytics.totalTokensUsed.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cost Today:</span>
            <span className="font-medium">${stats.session.costIncurred.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {latestMetrics && (
        <div>
          <h4 className="font-medium mb-2">Performance</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory:</span>
                <span>{Math.round(latestMetrics.memory.percentage)}%</span>
              </div>
              <Progress value={latestMetrics.memory.percentage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU:</span>
                <span>{Math.round(latestMetrics.cpu.usage)}%</span>
              </div>
              <Progress value={latestMetrics.cpu.usage} className="h-2" />
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium mb-2">MCP Servers</h4>
        <div className="flex justify-between text-sm">
          <span>Active:</span>
          <span className="font-medium">{analytics.activeServers}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Operations:</span>
          <span className="font-medium">{analytics.totalOperations}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Avg Response:</span>
          <span className="font-medium">{Math.round(analytics.averageResponseTime)}ms</span>
        </div>
      </div>
    </div>
  )
}

export default StatusBar