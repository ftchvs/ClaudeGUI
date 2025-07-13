import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  AlertTriangle,
  Target,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useClaudeCodeStore } from '@/stores/claude-code'
import { useMcpStore } from '@/stores/mcp'

interface CostBreakdown {
  claudeCode: {
    tokens: number
    cost: number
    operations: number
  }
  mcp: {
    tokens: number
    cost: number
    operations: number
  }
  total: {
    tokens: number
    cost: number
    operations: number
  }
}

interface UsageLimits {
  dailyTokenLimit: number
  dailyCostLimit: number
  monthlyTokenLimit: number
  monthlyCostLimit: number
}

const CostTracker: React.FC<{ 
  compact?: boolean 
  showLimits?: boolean 
  refreshInterval?: number 
}> = ({ 
  compact = false, 
  showLimits = true, 
  refreshInterval = 30000 
}) => {
  const { stats, conversations } = useClaudeCodeStore()
  const { analytics } = useMcpStore()

  const [breakdown, setBreakdown] = useState<CostBreakdown>({
    claudeCode: { tokens: 0, cost: 0, operations: 0 },
    mcp: { tokens: 0, cost: 0, operations: 0 },
    total: { tokens: 0, cost: 0, operations: 0 }
  })

  const [limits] = useState<UsageLimits>({
    dailyTokenLimit: 50000,
    dailyCostLimit: 5.00,
    monthlyTokenLimit: 1000000,
    monthlyCostLimit: 100.00
  })

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')

  // Calculate breakdown
  useEffect(() => {
    const claudeTokens = stats.session.tokensUsed
    const claudeCost = stats.session.costIncurred
    const claudeOps = stats.session.commandsExecuted

    const mcpTokens = analytics.totalTokensUsed
    const mcpCost = analytics.estimatedCost
    const mcpOps = analytics.totalOperations

    setBreakdown({
      claudeCode: {
        tokens: claudeTokens,
        cost: claudeCost,
        operations: claudeOps
      },
      mcp: {
        tokens: mcpTokens,
        cost: mcpCost,
        operations: mcpOps
      },
      total: {
        tokens: claudeTokens + mcpTokens,
        cost: claudeCost + mcpCost,
        operations: claudeOps + mcpOps
      }
    })
  }, [stats, analytics])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger recalculation
      setBreakdown(prev => ({ ...prev }))
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(amount)
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min(100, (current / limit) * 100)
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'error'
    if (percentage >= 75) return 'warning'
    return 'good'
  }

  const getRateInfo = () => {
    const tokensPerSecond = breakdown.total.tokens / (stats.session.duration / 1000)
    const costPerHour = breakdown.total.cost * (3600000 / stats.session.duration)
    
    return {
      tokensPerSecond: isFinite(tokensPerSecond) ? tokensPerSecond : 0,
      costPerHour: isFinite(costPerHour) ? costPerHour : 0
    }
  }

  const rateInfo = getRateInfo()

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{formatTokens(breakdown.total.tokens)}</span>
                <span className="text-muted-foreground">tokens</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div>Claude Code: {formatTokens(breakdown.claudeCode.tokens)}</div>
                <div>MCP: {formatTokens(breakdown.mcp.tokens)}</div>
                <div>Total: {breakdown.total.tokens.toLocaleString()}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-medium">{formatCurrency(breakdown.total.cost)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div>Claude Code: {formatCurrency(breakdown.claudeCode.cost)}</div>
                <div>MCP: {formatCurrency(breakdown.mcp.cost)}</div>
                <div>Rate: {formatCurrency(rateInfo.costPerHour)}/hour</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showLimits && (
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              getUsageStatus(getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit)) === 'error' ? 'bg-red-500' :
              getUsageStatus(getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit)) === 'warning' ? 'bg-yellow-500' :
              'bg-green-500'
            }`} />
            <span className="text-xs text-muted-foreground">
              {Math.round(getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit))}% daily
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cost & Usage Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {timeRange}
            </Badge>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-blue-700">
              {formatTokens(breakdown.total.tokens)}
            </div>
            <div className="text-sm text-blue-600">Total Tokens</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(breakdown.total.cost)}
            </div>
            <div className="text-sm text-green-600">Total Cost</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-700">
              {breakdown.total.operations}
            </div>
            <div className="text-sm text-purple-600">Operations</div>
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium">Usage Breakdown</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Claude Code</span>
                <span>{formatTokens(breakdown.claudeCode.tokens)} tokens ({formatCurrency(breakdown.claudeCode.cost)})</span>
              </div>
              <Progress 
                value={breakdown.total.tokens > 0 ? (breakdown.claudeCode.tokens / breakdown.total.tokens) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>MCP Operations</span>
                <span>{formatTokens(breakdown.mcp.tokens)} tokens ({formatCurrency(breakdown.mcp.cost)})</span>
              </div>
              <Progress 
                value={breakdown.total.tokens > 0 ? (breakdown.mcp.tokens / breakdown.total.tokens) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        {showLimits && (
          <div className="space-y-4">
            <h4 className="font-medium">Daily Limits</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Token Usage</span>
                  <span>
                    {formatTokens(breakdown.total.tokens)} / {formatTokens(limits.dailyTokenLimit)}
                    <Badge 
                      variant={getUsageStatus(getUsagePercentage(breakdown.total.tokens, limits.dailyTokenLimit)) === 'error' ? 'destructive' : 'outline'} 
                      className="ml-2 text-xs"
                    >
                      {Math.round(getUsagePercentage(breakdown.total.tokens, limits.dailyTokenLimit))}%
                    </Badge>
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(breakdown.total.tokens, limits.dailyTokenLimit)} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cost Limit</span>
                  <span>
                    {formatCurrency(breakdown.total.cost)} / {formatCurrency(limits.dailyCostLimit)}
                    <Badge 
                      variant={getUsageStatus(getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit)) === 'error' ? 'destructive' : 'outline'} 
                      className="ml-2 text-xs"
                    >
                      {Math.round(getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit))}%
                    </Badge>
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit)} 
                  className="h-2" 
                />
                {getUsagePercentage(breakdown.total.cost, limits.dailyCostLimit) > 75 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                    <AlertTriangle className="h-3 w-3" />
                    Approaching daily limit
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rate Information */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{rateInfo.tokensPerSecond.toFixed(1)}/s</div>
                <div className="text-muted-foreground">Token rate</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{formatCurrency(rateInfo.costPerHour)}/hr</div>
                <div className="text-muted-foreground">Cost rate</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CostTracker