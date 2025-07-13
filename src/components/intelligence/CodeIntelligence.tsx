import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Eye, 
  Lightbulb, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Network, 
  Layers, 
  GitBranch, 
  FileText, 
  Search, 
  Play, 
  Pause, 
  RotateCcw,
  Cpu,
  Activity,
  Gauge,
  Workflow,
  Map,
  Sparkles,
  Microscope,
  Scan,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Download,
  Share2,
  BookOpen,
  Code2,
  Bug,
  TestTube,
  Lock,
  Unlock,
  Star,
  Heart,
  MessageCircle,
  Wand2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CodeInsight {
  id: string
  type: 'suggestion' | 'warning' | 'error' | 'optimization' | 'pattern' | 'architecture'
  title: string
  description: string
  code?: string
  line?: number
  file?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  impact: string
  suggestion?: string
  autoFixAvailable?: boolean
}

interface ArchitectureNode {
  id: string
  name: string
  type: 'component' | 'service' | 'database' | 'api' | 'module'
  dependencies: string[]
  complexity: number
  health: 'good' | 'warning' | 'error'
  position: { x: number; y: number }
}

interface TaskStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  estimatedTime: number
  dependencies: string[]
  code?: string
  files?: string[]
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  history: number[]
}

export const CodeIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('insights')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Real-time code insights
  const [codeInsights, setCodeInsights] = useState<CodeInsight[]>([
    {
      id: '1',
      type: 'optimization',
      title: 'Inefficient Loop Detected',
      description: 'The loop in UserList.tsx can be optimized using React.memo and useMemo',
      file: 'src/components/UserList.tsx',
      line: 45,
      severity: 'medium',
      confidence: 0.92,
      impact: 'Performance improvement: ~40% faster rendering',
      suggestion: 'Wrap component in React.memo and memoize the filtered users array',
      autoFixAvailable: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Potential Memory Leak',
      description: 'useEffect cleanup function missing for event listener',
      file: 'src/hooks/useWebSocket.ts',
      line: 23,
      severity: 'high',
      confidence: 0.88,
      impact: 'Memory usage will increase over time',
      suggestion: 'Add cleanup function to remove event listener',
      autoFixAvailable: true
    },
    {
      id: '3',
      type: 'architecture',
      title: 'Circular Dependency Risk',
      description: 'Components have complex interdependencies that could lead to issues',
      file: 'src/components/',
      severity: 'medium',
      confidence: 0.75,
      impact: 'Bundle size increase and potential runtime issues',
      suggestion: 'Extract shared logic into separate utility modules'
    },
    {
      id: '4',
      type: 'pattern',
      title: 'Design Pattern Opportunity',
      description: 'Multiple components share similar state logic - perfect for custom hook',
      file: 'src/components/',
      severity: 'low',
      confidence: 0.95,
      impact: 'Code reusability and maintainability improvement',
      suggestion: 'Create useFormValidation custom hook'
    }
  ])

  // Architecture visualization
  const [architectureNodes, setArchitectureNodes] = useState<ArchitectureNode[]>([
    {
      id: 'app',
      name: 'App',
      type: 'component',
      dependencies: ['workspace', 'stores'],
      complexity: 6,
      health: 'good',
      position: { x: 400, y: 100 }
    },
    {
      id: 'workspace',
      name: 'MainWorkspace',
      type: 'component',
      dependencies: ['chat', 'editor', 'terminal'],
      complexity: 8,
      health: 'warning',
      position: { x: 400, y: 200 }
    },
    {
      id: 'chat',
      name: 'ChatInterface',
      type: 'component',
      dependencies: ['api'],
      complexity: 5,
      health: 'good',
      position: { x: 200, y: 300 }
    },
    {
      id: 'editor',
      name: 'CodeEditor',
      type: 'component',
      dependencies: ['monaco', 'syntax'],
      complexity: 9,
      health: 'error',
      position: { x: 400, y: 300 }
    },
    {
      id: 'terminal',
      name: 'Terminal',
      type: 'component',
      dependencies: ['pty'],
      complexity: 7,
      health: 'good',
      position: { x: 600, y: 300 }
    }
  ])

  // Task orchestration
  const [currentTask, setCurrentTask] = useState<TaskStep[]>([
    {
      id: 'analyze',
      title: 'Analyze Codebase',
      description: 'Deep analysis of code patterns, dependencies, and potential issues',
      status: 'completed',
      estimatedTime: 30,
      dependencies: []
    },
    {
      id: 'optimize',
      title: 'Generate Optimizations',
      description: 'Create specific optimization suggestions with code examples',
      status: 'in-progress',
      estimatedTime: 45,
      dependencies: ['analyze']
    },
    {
      id: 'test',
      title: 'Generate Tests',
      description: 'Auto-generate unit tests for critical components',
      status: 'pending',
      estimatedTime: 60,
      dependencies: ['optimize']
    },
    {
      id: 'docs',
      title: 'Update Documentation',
      description: 'Generate and update API documentation and code comments',
      status: 'pending',
      estimatedTime: 25,
      dependencies: ['test']
    }
  ])

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Bundle Size',
      value: 2.4,
      unit: 'MB',
      trend: 'up',
      status: 'warning',
      history: [2.1, 2.2, 2.3, 2.4]
    },
    {
      name: 'Build Time',
      value: 12.5,
      unit: 'sec',
      trend: 'down',
      status: 'good',
      history: [15.2, 14.1, 13.3, 12.5]
    },
    {
      name: 'Code Coverage',
      value: 78,
      unit: '%',
      trend: 'up',
      status: 'good',
      history: [72, 75, 76, 78]
    },
    {
      name: 'Complexity Score',
      value: 6.8,
      unit: '',
      trend: 'stable',
      status: 'warning',
      history: [6.9, 6.8, 6.8, 6.8]
    }
  ])

  // Simulate analysis
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAnalyzing && analysisProgress < 100) {
        setAnalysisProgress(prev => Math.min(100, prev + Math.random() * 15))
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [isAnalyzing, analysisProgress])

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }, 5000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const renderInsights = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Microscope className="h-5 w-5" />
          Code Intelligence
        </h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Scan className="h-3 w-3 mr-2" />
                Deep Scan
              </>
            )}
          </Button>
        </div>
      </div>

      {isAnalyzing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing codebase...</span>
                <span>{analysisProgress.toFixed(0)}%</span>
              </div>
              <Progress value={analysisProgress} />
              <div className="text-xs text-muted-foreground">
                Examining patterns, dependencies, and potential optimizations
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {codeInsights.map(insight => (
          <Card key={insight.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {insight.type === 'optimization' && <Zap className="h-4 w-4 text-blue-500" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {insight.type === 'error' && <Bug className="h-4 w-4 text-red-500" />}
                  {insight.type === 'pattern' && <Sparkles className="h-4 w-4 text-purple-500" />}
                  {insight.type === 'architecture' && <Network className="h-4 w-4 text-green-500" />}
                  
                  <h4 className="font-medium">{insight.title}</h4>
                </div>
                <Badge className={getSeverityColor(insight.severity)}>
                  {insight.severity}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

              {insight.file && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <FileText className="h-3 w-3" />
                  {insight.file}
                  {insight.line && <span>:{insight.line}</span>}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs mb-3">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {insight.impact}
                </div>
              </div>

              {insight.suggestion && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800 text-sm">Suggestion</div>
                      <div className="text-blue-700 text-sm">{insight.suggestion}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {insight.autoFixAvailable && (
                  <Button size="sm" variant="default">
                    <Wand2 className="h-3 w-3 mr-2" />
                    Auto Fix
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-2" />
                  View Code
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3 mr-2" />
                  Discuss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderArchitecture = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Network className="h-5 w-5" />
          Architecture Map
        </h3>
        <Button size="sm" variant="outline">
          <Map className="h-3 w-3 mr-2" />
          3D View
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative h-96 bg-muted/10 rounded-lg overflow-hidden">
            {/* Architecture visualization */}
            <svg className="w-full h-full">
              {/* Connections */}
              {architectureNodes.map(node => 
                node.dependencies.map(depId => {
                  const depNode = architectureNodes.find(n => n.id === depId)
                  if (!depNode) return null
                  return (
                    <line
                      key={`${node.id}-${depId}`}
                      x1={node.position.x}
                      y1={node.position.y}
                      x2={depNode.position.x}
                      y2={depNode.position.y}
                      stroke="#e5e7eb"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })
              )}
              
              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#e5e7eb" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {architectureNodes.map(node => (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: node.position.x,
                  top: node.position.y
                }}
              >
                <div className={`p-3 bg-white border-2 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                  node.health === 'good' ? 'border-green-200' :
                  node.health === 'warning' ? 'border-yellow-200' :
                  'border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(node.health)}`} />
                    <span className="font-medium text-sm">{node.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Complexity: {node.complexity}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Components</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">+2 this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-sm">Avg Complexity</span>
            </div>
            <div className="text-2xl font-bold">6.8</div>
            <div className="text-xs text-muted-foreground">Stable</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Health Score</span>
            </div>
            <div className="text-2xl font-bold">85%</div>
            <div className="text-xs text-muted-foreground">Good</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Task Orchestration
        </h3>
        <Button size="sm">
          <Play className="h-3 w-3 mr-2" />
          Execute Plan
        </Button>
      </div>

      <div className="space-y-3">
        {currentTask.map((task, index) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' :
                    task.status === 'failed' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <Badge variant={
                  task.status === 'completed' ? 'default' :
                  task.status === 'in-progress' ? 'default' :
                  'secondary'
                }>
                  {task.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedTime}s
                </div>
                {task.dependencies.length > 0 && (
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    Depends on: {task.dependencies.join(', ')}
                  </div>
                )}
              </div>

              {task.status === 'in-progress' && (
                <div className="mt-3">
                  <Progress value={65} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderMetrics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Dashboard
        </h3>
        <Button size="sm" variant="outline">
          <Download className="h-3 w-3 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {performanceMetrics.map(metric => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{metric.name}</span>
                <Badge variant={
                  metric.status === 'good' ? 'default' :
                  metric.status === 'warning' ? 'secondary' :
                  'destructive'
                }>
                  {metric.status}
                </Badge>
              </div>
              
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold">
                  {metric.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </span>
                <div className={`flex items-center text-xs ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                </div>
              </div>

              {/* Mini chart */}
              <div className="h-8 flex items-end gap-1">
                {metric.history.map((value, i) => (
                  <div
                    key={i}
                    className="bg-blue-200 rounded-sm flex-1"
                    style={{
                      height: `${(value / Math.max(...metric.history)) * 100}%`
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Vulnerability Scan</span>
            <Badge variant="default">0 Critical</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dependency Check</span>
            <Badge variant="secondary">2 Updates</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Code Quality</span>
            <Badge variant="default">A Grade</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <TabsContent value="insights" className="mt-0">
              {renderInsights()}
            </TabsContent>
            
            <TabsContent value="architecture" className="mt-0">
              {renderArchitecture()}
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-0">
              {renderTasks()}
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-0">
              {renderMetrics()}
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  )
}

export default CodeIntelligence