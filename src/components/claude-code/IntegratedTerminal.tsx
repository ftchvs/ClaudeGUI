import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  Plus,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Download,
  Settings,
  Play,
  Square,
  ChevronRight,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClaudeCodeStore } from '@/stores/claude-code'
import type { ClaudeCodeTerminal, ClaudeCodeCommand, TerminalEntry } from '@/types/claude-code'

interface TerminalSessionProps {
  terminal: ClaudeCodeTerminal
  isActive: boolean
  onActivate: () => void
  onClose: () => void
}

const TerminalSession: React.FC<TerminalSessionProps> = ({
  terminal,
  isActive,
  onActivate,
  onClose
}) => {
  const { 
    executeCommand, 
    sendToTerminal, 
    clearTerminal,
    commandHistory,
    runningCommands,
    currentWorkspace 
  } = useClaudeCodeStore()
  
  const [currentCommand, setCurrentCommand] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isMaximized, setIsMaximized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [terminal.history])

  // Focus input when terminal becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommand.trim()) return

    // Add command to terminal history
    const commandEntry: TerminalEntry = {
      id: crypto.randomUUID(),
      type: 'command',
      content: `${terminal.cwd}$ ${currentCommand}`,
      timestamp: new Date()
    }

    // Update terminal history immediately
    terminal.history.push(commandEntry)

    // Execute command
    try {
      const commandId = await executeCommand(currentCommand, terminal.id)
      
      // Add output placeholder
      const outputEntry: TerminalEntry = {
        id: crypto.randomUUID(),
        type: 'output',
        content: 'Executing...',
        timestamp: new Date()
      }
      terminal.history.push(outputEntry)
      
      setCurrentCommand('')
      setHistoryIndex(-1)
      
    } catch (error) {
      const errorEntry: TerminalEntry = {
        id: crypto.randomUUID(),
        type: 'error',
        content: error instanceof Error ? error.message : 'Command failed',
        timestamp: new Date()
      }
      terminal.history.push(errorEntry)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // TODO: Implement command completion
    }
  }

  const getEntryIcon = (entry: TerminalEntry) => {
    switch (entry.type) {
      case 'command':
        return <ChevronRight className="h-4 w-4 text-blue-500" />
      case 'output':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'system':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getEntryColor = (entry: TerminalEntry) => {
    switch (entry.type) {
      case 'command':
        return 'text-blue-600 font-medium'
      case 'output':
        return 'text-foreground'
      case 'error':
        return 'text-red-600'
      case 'system':
        return 'text-yellow-600'
      default:
        return 'text-foreground'
    }
  }

  const handleCopy = () => {
    const content = terminal.history
      .map(entry => entry.content)
      .join('\n')
    navigator.clipboard.writeText(content)
  }

  const handleClear = () => {
    clearTerminal(terminal.id)
  }

  return (
    <div className={`h-full flex flex-col ${isMaximized ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="font-medium text-sm">{terminal.name}</span>
          <Badge variant="outline" className="text-xs">
            {terminal.cwd.split('/').pop()}
          </Badge>
          {terminal.process && (
            <Badge 
              variant={terminal.process.status === 'running' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {terminal.process.status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClear}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col bg-gray-950 text-gray-100">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 font-mono text-sm space-y-1">
            {terminal.history.length === 0 ? (
              <div className="text-gray-400">
                <p>Welcome to Claude Code Terminal</p>
                <p>Type commands to interact with your workspace</p>
                <p className="mt-2">Working directory: {terminal.cwd}</p>
              </div>
            ) : (
              terminal.history.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 ${getEntryColor(entry)}`}
                >
                  {getEntryIcon(entry)}
                  <div className="flex-1">
                    <pre className="whitespace-pre-wrap break-words">
                      {entry.content}
                    </pre>
                    {entry.exitCode !== undefined && (
                      <div className="text-xs text-gray-400 mt-1">
                        Exit code: {entry.exitCode}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Running commands indicator */}
            {runningCommands.size > 0 && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Command running...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Command Input */}
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
            <span className="text-blue-400 font-mono text-sm">
              {terminal.cwd.split('/').pop()}$
            </span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 bg-transparent border-none text-gray-100 font-mono focus:ring-0"
              disabled={runningCommands.size > 0}
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="ghost"
              disabled={!currentCommand.trim() || runningCommands.size > 0}
            >
              <Play className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

const IntegratedTerminal: React.FC = () => {
  const {
    terminals,
    activeTerminalId,
    createTerminal,
    closeTerminal,
    commands,
    currentWorkspace,
    ui,
    toggleTerminal
  } = useClaudeCodeStore()

  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null)

  const terminalList = Object.values(terminals)
  const activeTerminal = activeTerminalId ? terminals[activeTerminalId] : null

  // Create initial terminal if none exists
  useEffect(() => {
    if (terminalList.length === 0 && currentWorkspace) {
      const terminalId = createTerminal('Main', currentWorkspace.path)
      setSelectedTerminalId(terminalId)
    }
  }, [terminalList.length, currentWorkspace, createTerminal])

  const handleCreateTerminal = () => {
    const name = `Terminal ${terminalList.length + 1}`
    const cwd = currentWorkspace?.path || process.cwd()
    const terminalId = createTerminal(name, cwd)
    setSelectedTerminalId(terminalId)
  }

  const handleCloseTerminal = (terminalId: string) => {
    closeTerminal(terminalId)
    if (selectedTerminalId === terminalId) {
      const remainingTerminals = terminalList.filter(t => t.id !== terminalId)
      setSelectedTerminalId(remainingTerminals[0]?.id || null)
    }
  }

  const recentCommands = commands
    .filter(cmd => cmd.status !== 'pending')
    .slice(0, 10)

  if (!ui.terminalOpen) {
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Integrated Terminal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCreateTerminal}>
              <Plus className="h-4 w-4 mr-2" />
              New Terminal
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleTerminal}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {terminalList.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No terminals open</p>
              <Button onClick={handleCreateTerminal} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Terminal
              </Button>
            </div>
          </div>
        ) : (
          <Tabs 
            value={selectedTerminalId || ''} 
            onValueChange={setSelectedTerminalId}
            className="h-full flex flex-col"
          >
            {/* Terminal Tabs */}
            <div className="px-4 border-b">
              <TabsList className="w-full justify-start">
                {terminalList.map((terminal) => (
                  <TabsTrigger 
                    key={terminal.id} 
                    value={terminal.id}
                    className="relative"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    {terminal.name}
                    {terminal.process?.status === 'running' && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Terminal Content */}
            <div className="flex-1">
              {terminalList.map((terminal) => (
                <TabsContent 
                  key={terminal.id} 
                  value={terminal.id}
                  className="h-full m-0"
                >
                  <TerminalSession
                    terminal={terminal}
                    isActive={selectedTerminalId === terminal.id}
                    onActivate={() => setSelectedTerminalId(terminal.id)}
                    onClose={() => handleCloseTerminal(terminal.id)}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
      </CardContent>

      {/* Command History Sidebar */}
      {recentCommands.length > 0 && (
        <div className="border-t p-4">
          <h4 className="font-medium mb-3 text-sm">Recent Commands</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentCommands.map((command) => (
              <div
                key={command.id}
                className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                onClick={() => {
                  if (selectedTerminalId) {
                    // Copy command to input (would need to implement this)
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{command.command}</p>
                  <p className="text-xs text-muted-foreground">
                    {command.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {command.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {command.status === 'failed' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {command.status === 'running' && (
                    <Loader className="h-4 w-4 text-blue-500 animate-spin" />
                  )}
                  {command.duration && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(command.duration)}ms
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default IntegratedTerminal