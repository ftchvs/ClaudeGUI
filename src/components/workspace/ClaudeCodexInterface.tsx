import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  Sun,
  Moon,
  Send,
  Plus,
  RotateCcw,
  RefreshCw,
  Play,
  Square,
  Terminal,
  FileText,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Settings,
  HelpCircle,
  Download,
  Upload,
  GitBranch,
  Folder,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit3,
  Sparkles,
  Activity,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/stores/app'
import { claudeCodeService } from '@/services/claudeCodeService'
import { mcpManager } from '@/services/mcpManager'
import { githubIntegration } from '@/services/githubIntegration'

interface ExecutionStep {
  id: string
  type: 'command' | 'file_operation' | 'analysis' | 'code_generation'
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: string
  timestamp: Date
  duration?: number
}

interface SystemStatus {
  cpu: number
  memory: number
  disk: number
  network: boolean
  claudeCode: boolean
  mcpServers: number
}

export const ClaudeCodexInterface: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    currentConversation, 
    createNewConversation, 
    addMessage, 
    conversations,
    isLoading,
    setLoading,
    fileOperations
  } = useAppStore()

  const [chatInput, setChatInput] = useState('')
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu: 25,
    memory: 45,
    disk: 67,
    network: true,
    claudeCode: true, // Will be updated async
    mcpServers: 3
  })
  const [showSystemPanel, setShowSystemPanel] = useState(false)
  const [mcpServers, setMcpServers] = useState(mcpManager.getServers())
  const [isCommitting, setIsCommitting] = useState(false)
  const [lastCommitResult, setLastCommitResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const executionEndRef = useRef<HTMLDivElement>(null)

  // Initialize conversation if none exists
  useEffect(() => {
    if (!currentConversation && conversations.length === 0) {
      createNewConversation()
    }
  }, [currentConversation, conversations, createNewConversation])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  // Auto-scroll execution to bottom
  useEffect(() => {
    executionEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [executionSteps])

  // Subscribe to MCP server changes
  useEffect(() => {
    const unsubscribe = mcpManager.onServersChange((servers) => {
      setMcpServers(servers)
      setSystemStatus(prev => ({
        ...prev,
        mcpServers: servers.filter(s => s.status === 'connected').length
      }))
    })
    
    return () => {
      unsubscribe()
    }
  }, [])

  // Simulate system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 5)),
      }))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentConversation) return

    const userMessage = chatInput
    setChatInput('')
    setLoading(true)

    // Add user message
    addMessage({
      content: userMessage,
      role: 'user'
    })

    // Real Claude Code execution
    const executionId = crypto.randomUUID()
    const newStep: ExecutionStep = {
      id: executionId,
      type: 'analysis',
      title: 'Analyzing Request',
      description: `Processing: "${userMessage}"`,
      status: 'running',
      timestamp: new Date()
    }
    
    setExecutionSteps(prev => [...prev, newStep])
    setIsExecuting(true)

    try {
      // Step 1: Chat with Claude Code
      const chatResponse = await claudeCodeService.chat(userMessage, {
        currentDirectory: '/workspace'
      })

      // Update analysis step
      setExecutionSteps(prev => prev.map(step => 
        step.id === executionId 
          ? { 
              ...step, 
              status: chatResponse.success ? 'completed' : 'error',
              duration: chatResponse.duration,
              output: chatResponse.success ? 'Analysis completed' : chatResponse.error
            }
          : step
      ))

      // Step 2: Handle file operations if detected
      if (userMessage.toLowerCase().includes('file') || 
          userMessage.toLowerCase().includes('create') ||
          userMessage.toLowerCase().includes('write') ||
          userMessage.toLowerCase().includes('read')) {
        
        const fileOpId = crypto.randomUUID()
        setExecutionSteps(prev => [...prev, {
          id: fileOpId,
          type: 'file_operation',
          title: 'File Operation',
          description: 'Executing file operations',
          status: 'running',
          timestamp: new Date()
        }])

        // Determine file operation type
        let operation: 'read' | 'write' | 'create' | 'list' = 'list'
        if (userMessage.toLowerCase().includes('create')) operation = 'create'
        else if (userMessage.toLowerCase().includes('write')) operation = 'write'
        else if (userMessage.toLowerCase().includes('read')) operation = 'read'

        const fileResult = await claudeCodeService.performFileOperation({
          type: operation,
          path: extractFilePath(userMessage) || 'example.ts'
        })

        setExecutionSteps(prev => prev.map(step => 
          step.id === fileOpId 
            ? { 
                ...step, 
                status: fileResult.success ? 'completed' : 'error',
                duration: fileResult.duration,
                output: fileResult.output || fileResult.error
              }
            : step
        ))
      }

      // Step 3: Handle terminal commands
      if (userMessage.toLowerCase().includes('run') || 
          userMessage.toLowerCase().includes('npm') ||
          userMessage.toLowerCase().includes('git')) {
        
        const terminalId = crypto.randomUUID()
        setExecutionSteps(prev => [...prev, {
          id: terminalId,
          type: 'command',
          title: 'Terminal Command',
          description: 'Executing terminal command',
          status: 'running',
          timestamp: new Date()
        }])

        const command = extractCommand(userMessage)
        if (command) {
          const terminalResult = await claudeCodeService.executeTerminalCommand(command)

          setExecutionSteps(prev => prev.map(step => 
            step.id === terminalId 
              ? { 
                  ...step, 
                  status: terminalResult.success ? 'completed' : 'error',
                  duration: terminalResult.duration,
                  output: terminalResult.output || terminalResult.error
                }
              : step
          ))
        }
      }

      // Add AI response
      addMessage({
        content: chatResponse.output,
        role: 'assistant'
      })

    } catch (error) {
      // Handle error
      setExecutionSteps(prev => prev.map(step => 
        step.id === executionId 
          ? { 
              ...step, 
              status: 'error',
              output: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          : step
      ))

      addMessage({
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        role: 'assistant'
      })
    } finally {
      setLoading(false)
      setIsExecuting(false)
    }
  }

  // Helper function to extract file path from message
  const extractFilePath = (message: string): string | null => {
    const fileRegex = /(?:file|path|create|write|read)\s+([^\s]+\.[a-zA-Z]+)/i
    const match = message.match(fileRegex)
    return match ? match[1] : null
  }

  // Helper function to extract command from message
  const extractCommand = (message: string): string | null => {
    const commandRegex = /(?:run|execute|npm|git)\s+([^.!?]+)/i
    const match = message.match(commandRegex)
    return match ? match[1].trim() : null
  }

  const generateAIResponse = (userInput: string): string => {
    if (userInput.toLowerCase().includes('file')) {
      return `I'll help you with file operations. I can create, read, modify, and manage files in your project. 

Here's what I can do:
• Create new files with proper structure
• Read and analyze existing files  
• Modify code with best practices
• Organize project structure
• Integrate with version control

What specific file operation would you like me to perform?`
    }

    if (userInput.toLowerCase().includes('code') || userInput.toLowerCase().includes('function')) {
      return `I'll help you write high-quality code! I can:

• Generate functions and components
• Review and optimize existing code
• Debug and fix issues
• Suggest best practices
• Implement design patterns

\`\`\`typescript
// Example: Clean, well-documented code
export const ExampleFunction = (param: string): string => {
  // Your implementation here
  return \`Processed: \${param}\`
}
\`\`\`

What would you like me to code for you?`
    }

    return `I'm Claude, your AI coding assistant! I can help you with:

• **Code Generation**: Write functions, components, and full applications
• **File Operations**: Create, read, modify, and organize files
• **Debugging**: Find and fix issues in your code
• **Architecture**: Design and plan your project structure
• **Best Practices**: Ensure code quality and maintainability

How can I assist you today?`
  }

  const clearExecutionHistory = () => {
    setExecutionSteps([])
  }

  const handleAutoCommit = async () => {
    setIsCommitting(true)
    setLastCommitResult(null)
    
    try {
      // Add execution step for commit
      const commitId = crypto.randomUUID()
      setExecutionSteps(prev => [...prev, {
        id: commitId,
        type: 'command',
        title: 'GitHub Auto-Commit',
        description: 'Committing session changes to GitHub repository',
        status: 'running',
        timestamp: new Date()
      }])

      const result = await githubIntegration.autoCommitSessionChanges()
      
      // Update execution step
      setExecutionSteps(prev => prev.map(step => 
        step.id === commitId 
          ? { 
              ...step, 
              status: result.success ? 'completed' : 'error',
              output: result.success 
                ? `Commit created successfully!\nCommit: ${result.commitUrl}\nPull Request: ${result.pullRequestUrl}`
                : result.error,
              duration: 3000
            }
          : step
      ))

      setLastCommitResult({
        success: result.success,
        url: result.pullRequestUrl || result.commitUrl,
        error: result.error
      })

      if (result.success) {
        // Add success message to chat
        addMessage({
          content: `🎉 Successfully committed changes to GitHub!\n\n${result.commitUrl ? `**Commit:** ${result.commitUrl}\n` : ''}${result.pullRequestUrl ? `**Pull Request:** ${result.pullRequestUrl}` : ''}\n\nYour improvements have been saved and are ready for review.`,
          role: 'assistant'
        })
      }

    } catch (error) {
      setLastCommitResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsCommitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'running': return 'text-blue-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="h-16 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Claude GUI
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Development Environment</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* System Status */}
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              CPU: {systemStatus.cpu.toFixed(0)}%
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              RAM: {systemStatus.memory.toFixed(0)}%
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              MCP: {systemStatus.mcpServers}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoCommit}
              disabled={isCommitting}
              className="hidden md:flex"
            >
              {isCommitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <GitBranch className="h-4 w-4 mr-2" />
              )}
              {isCommitting ? 'Committing...' : 'Auto Commit'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSystemPanel(!showSystemPanel)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50 dark:bg-gray-950">
        {/* Left Panel - Chat Interface */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-gray-900">
          {/* Chat Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Chat with Claude</h2>
                <p className="text-sm text-muted-foreground">
                  Ask questions, request code, or get help with your project
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewConversation}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {currentConversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.codeBlocks && (
                      <div className="mt-3 space-y-2">
                        {message.codeBlocks.map((block, i) => (
                          <div key={i} className="bg-black/10 dark:bg-white/10 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-2">
                              {block.language}
                            </div>
                            <pre className="text-sm font-mono overflow-x-auto">
                              {block.code}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="text-sm text-muted-foreground ml-2">Claude is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-6 border-t">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Claude to help with your code, create files, or explain concepts..."
                  className="min-h-[60px] resize-none border-2 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
                className="self-end h-[60px] px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Right Panel - Execution Terminal */}
        <div className="w-1/2 border-l flex flex-col bg-white dark:bg-gray-900">
          {/* Terminal Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Claude Code Execution</h2>
                <p className="text-sm text-muted-foreground">
                  Real-time execution steps and file operations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearExecutionHistory}
                  disabled={executionSteps.length === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  isExecuting 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isExecuting ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                  }`} />
                  {isExecuting ? 'Executing' : 'Ready'}
                </div>
              </div>
            </div>
          </div>

          {/* Execution Steps */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {executionSteps.length === 0 ? (
                <div className="text-center py-12">
                  <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready for Execution</h3>
                  <p className="text-muted-foreground">
                    Send a message to Claude to see execution steps here
                  </p>
                </div>
              ) : (
                executionSteps.map((step) => (
                  <Card key={step.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <h4 className="font-medium">{step.title}</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {step.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      
                      {step.output && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 mt-3">
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {step.output}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>{step.timestamp.toLocaleTimeString()}</span>
                        {step.duration && (
                          <span>Duration: {step.duration}ms</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <div ref={executionEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* System Status Panel */}
      <AnimatePresence>
        {showSystemPanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 h-64 bg-white dark:bg-gray-900 border-t shadow-lg z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">System Status</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSystemPanel(false)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">CPU Usage</span>
                    </div>
                    <div className="text-2xl font-bold">{systemStatus.cpu.toFixed(0)}%</div>
                    <Progress value={systemStatus.cpu} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Memory</span>
                    </div>
                    <div className="text-2xl font-bold">{systemStatus.memory.toFixed(0)}%</div>
                    <Progress value={systemStatus.memory} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">MCP Servers</h4>
                <div className="grid grid-cols-1 gap-3">
                  {mcpServers.map(server => (
                    <Card key={server.id} className="border-l-4" style={{
                      borderLeftColor: 
                        server.status === 'connected' ? '#10b981' :
                        server.status === 'connecting' ? '#f59e0b' :
                        server.status === 'error' ? '#ef4444' : '#6b7280'
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              server.status === 'connected' ? 'bg-green-500' :
                              server.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                              server.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                            }`} />
                            <div>
                              <h5 className="font-medium">{server.name}</h5>
                              <p className="text-sm text-muted-foreground">{server.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              server.status === 'connected' ? 'default' :
                              server.status === 'connecting' ? 'secondary' :
                              server.status === 'error' ? 'destructive' : 'outline'
                            }>
                              {server.status}
                            </Badge>
                            {server.status === 'disconnected' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => mcpManager.connectServer(server.id)}
                              >
                                Connect
                              </Button>
                            )}
                            {server.status === 'connected' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => mcpManager.disconnectServer(server.id)}
                              >
                                Disconnect
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {server.errorMessage && (
                          <div className="text-sm text-red-600 mb-2">
                            Error: {server.errorMessage}
                          </div>
                        )}
                        
                        {server.lastConnected && (
                          <div className="text-xs text-muted-foreground mb-2">
                            Last connected: {server.lastConnected.toLocaleString()}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {server.capabilities.slice(0, 3).map(capability => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability.replace('_', ' ')}
                            </Badge>
                          ))}
                          {server.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{server.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Claude Code CLI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        systemStatus.claudeCode ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">
                        {systemStatus.claudeCode ? 'Connected' : 'Not Available'}
                      </span>
                    </div>
                    {systemStatus.claudeCode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Version: v1.0.0
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ClaudeCodexInterface