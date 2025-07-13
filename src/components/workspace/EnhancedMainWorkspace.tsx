import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PanelLeft, 
  PanelRight, 
  Terminal, 
  FileText, 
  Code, 
  Settings, 
  Zap,
  Brain,
  FolderTree,
  Play,
  Save,
  GitBranch,
  Search,
  MoreHorizontal,
  Plus,
  X,
  Split,
  Maximize2,
  Minimize2,
  RefreshCw,
  Bug,
  Package,
  Cpu,
  Monitor,
  Palette,
  Sun,
  Moon,
  Command,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Edit3,
  Copy,
  Trash2,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Activity,
  BarChart3,
  Clock,
  Users,
  MessageSquare,
  Bell,
  Filter,
  SortAsc,
  Star,
  Bookmark,
  Tag,
  Globe,
  Layers,
  Boxes,
  Database,
  Server,
  Cloud,
  HardDrive,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/app'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  language?: string
  size?: number
  modified?: Date
  children?: FileItem[]
  isExpanded?: boolean
  isModified?: boolean
  hasErrors?: boolean
}

interface TabItem {
  id: string
  title: string
  content: string
  language: string
  isModified: boolean
  path: string
}

interface TerminalSession {
  id: string
  title: string
  history: Array<{ 
    command: string
    output: string
    timestamp: Date
    exitCode: number
  }>
  currentDirectory: string
  isActive: boolean
}

interface BuildStatus {
  status: 'idle' | 'building' | 'success' | 'error'
  progress: number
  logs: string[]
  startTime?: Date
  duration?: number
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: { up: number; down: number }
}

export const EnhancedMainWorkspace: React.FC = () => {
  const { theme, setTheme } = useAppStore()
  
  // Layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240)
  const [leftPanelVisible, setLeftPanelVisible] = useState(true)
  const [rightPanelVisible, setRightPanelVisible] = useState(true)
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Editor state
  const [openTabs, setOpenTabs] = useState<TabItem[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  
  // Terminal state
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([
    {
      id: 'main',
      title: 'Main Terminal',
      history: [],
      currentDirectory: '/workspace',
      isActive: true
    }
  ])
  const [activeTerminalId, setActiveTerminalId] = useState('main')
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    codeBlocks?: Array<{ language: string; code: string }>
  }>>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m Claude, your AI coding assistant. I can help you with code generation, debugging, file operations, and more. What would you like to work on?',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  
  // Build and metrics state
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    status: 'idle',
    progress: 0,
    logs: []
  })
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 15,
    memory: 65,
    disk: 42,
    network: { up: 125, down: 1250 }
  })
  
  // Project structure
  const [projectFiles, setProjectFiles] = useState<FileItem[]>([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: '/src',
      isExpanded: true,
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          isExpanded: true,
          children: [
            { 
              id: 'app', 
              name: 'App.tsx', 
              type: 'file', 
              path: '/src/components/App.tsx', 
              language: 'typescript',
              size: 2456,
              modified: new Date(),
              isModified: true
            },
            { 
              id: 'button', 
              name: 'Button.tsx', 
              type: 'file', 
              path: '/src/components/Button.tsx', 
              language: 'typescript',
              size: 1234,
              modified: new Date()
            }
          ]
        },
        { 
          id: 'utils', 
          name: 'utils.ts', 
          type: 'file', 
          path: '/src/utils.ts', 
          language: 'typescript',
          size: 890,
          modified: new Date(),
          hasErrors: true
        },
        { 
          id: 'main', 
          name: 'main.tsx', 
          type: 'file', 
          path: '/src/main.tsx', 
          language: 'typescript',
          size: 456,
          modified: new Date()
        }
      ]
    },
    { 
      id: 'package', 
      name: 'package.json', 
      type: 'file', 
      path: '/package.json', 
      language: 'json',
      size: 1567,
      modified: new Date()
    },
    { 
      id: 'readme', 
      name: 'README.md', 
      type: 'file', 
      path: '/README.md', 
      language: 'markdown',
      size: 234,
      modified: new Date()
    }
  ])

  // Simulate system metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 5)),
        disk: prev.disk,
        network: {
          up: Math.max(0, prev.network.up + (Math.random() - 0.5) * 50),
          down: Math.max(0, prev.network.down + (Math.random() - 0.5) * 200)
        }
      }))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'file') {
      // Open file in new tab if not already open
      const existingTab = openTabs.find(tab => tab.path === file.path)
      if (!existingTab) {
        const newTab: TabItem = {
          id: file.id,
          title: file.name,
          content: `// ${file.name}\n// Edit this file with Claude's assistance\n\nexport const example = () => {\n  return \"Hello from ${file.name}!\"\n}`,
          language: file.language || 'text',
          isModified: false,
          path: file.path
        }
        setOpenTabs(prev => [...prev, newTab])
        setActiveTabId(newTab.id)
      } else {
        setActiveTabId(existingTab.id)
      }
      setCurrentFile(file)
    } else {
      // Toggle folder expansion
      const toggleFolder = (files: FileItem[]): FileItem[] => {
        return files.map(f => {
          if (f.id === file.id) {
            return { ...f, isExpanded: !f.isExpanded }
          }
          if (f.children) {
            return { ...f, children: toggleFolder(f.children) }
          }
          return f
        })
      }
      setProjectFiles(toggleFolder(projectFiles))
    }
  }

  const closeTab = (tabId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTabId === tabId) {
      const remainingTabs = openTabs.filter(tab => tab.id !== tabId)
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    
    // Simulate AI response
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `I'll help you with "${chatInput}". Here's what I suggest:\n\n\`\`\`typescript\n// Generated code based on your request\nconst solution = () => {\n  // Implementation here\n  return "AI-generated solution"\n}\n\nexport default solution\n\`\`\`\n\nWould you like me to create this file or make any modifications?`,
        timestamp: new Date(),
        codeBlocks: [{
          language: 'typescript',
          code: 'const solution = () => {\n  return "AI-generated solution"\n}'
        }]
      }
      setChatMessages(prev => [...prev, response])
    }, 1000)
  }

  const executeTerminalCommand = (command: string) => {
    const activeSession = terminalSessions.find(s => s.id === activeTerminalId)
    if (!activeSession) return
    
    const output = command === 'npm run build' 
      ? 'Building project...\n✓ Build completed successfully'
      : command === 'git status'
      ? 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean'
      : `Executed: ${command}\n✓ Command completed`
    
    const historyEntry = {
      command,
      output,
      timestamp: new Date(),
      exitCode: 0
    }
    
    setTerminalSessions(prev => 
      prev.map(session => 
        session.id === activeTerminalId
          ? { ...session, history: [...session.history, historyEntry] }
          : session
      )
    )
  }

  const renderFileTree = (files: FileItem[], depth = 0) => {
    return files.map(file => (
      <div key={file.id}>
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 ${
            currentFile?.id === file.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
        >
          {file.type === 'folder' ? (
            <>
              {file.isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
              <Folder className="h-4 w-4 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-3" />
              <File className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          
          <span className={`text-sm flex-1 ${file.isModified ? 'text-orange-600' : ''}`}>
            {file.name}
            {file.isModified && <span className="text-orange-500 ml-1">●</span>}
          </span>
          
          {file.hasErrors && (
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          )}
          
          {file.type === 'file' && file.language && (
            <Badge variant="outline" className="text-xs ml-1">
              {file.language}
            </Badge>
          )}
        </div>
        
        {file.type === 'folder' && file.isExpanded && file.children && (
          <div>
            {renderFileTree(file.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  const activeTab = openTabs.find(tab => tab.id === activeTabId)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Menu Bar */}
      <div className="h-8 bg-muted/30 border-b flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">ClaudeGUI</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2">File</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">Edit</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">View</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">Terminal</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">Help</Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            CPU: {systemMetrics.cpu.toFixed(0)}%
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HardDrive className="h-3 w-3" />
            RAM: {systemMetrics.memory.toFixed(0)}%
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3" />
            {systemMetrics.network.down.toFixed(0)} KB/s
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <AnimatePresence>
          {leftPanelVisible && (
            <motion.div
              initial={{ x: -leftPanelWidth }}
              animate={{ x: 0 }}
              exit={{ x: -leftPanelWidth }}
              style={{ width: leftPanelWidth }}
              className="border-r bg-muted/20"
            >
              <Tabs defaultValue="explorer" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 m-2">
                  <TabsTrigger value="explorer"><FolderTree className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="search"><Search className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="git"><GitBranch className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="extensions"><Package className="h-4 w-4" /></TabsTrigger>
                </TabsList>

                <TabsContent value="explorer" className="flex-1 overflow-hidden">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">EXPLORER</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-full">
                      {renderFileTree(projectFiles)}
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="search" className="flex-1 p-4">
                  <div className="space-y-4">
                    <Input placeholder="Search files..." />
                    <Input placeholder="Replace..." />
                    <div className="text-sm text-muted-foreground">
                      No results found
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="git" className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">SOURCE CONTROL</h4>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-2 border rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span>App.tsx</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-4">Modified</div>
                      </div>
                      
                      <div className="p-2 border rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>NewComponent.tsx</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-4">Added</div>
                      </div>
                    </div>
                    
                    <Input placeholder="Message (Ctrl+Enter to commit)" />
                    <Button size="sm" className="w-full">
                      <GitBranch className="h-3 w-3 mr-2" />
                      Commit
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="extensions" className="flex-1 p-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">MCP SERVERS</h4>
                    
                    <div className="space-y-2">
                      <Card className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium">GitHub</span>
                          </div>
                          <Badge variant="default" className="text-xs">Connected</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Git operations and repository management</p>
                      </Card>
                      
                      <Card className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium">File System</span>
                          </div>
                          <Badge variant="default" className="text-xs">Connected</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">File operations and management</p>
                      </Card>
                      
                      <Card className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-medium">Web Scraper</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">Disconnected</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Extract data from websites</p>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          {openTabs.length > 0 && (
            <div className="h-10 border-b bg-muted/20 flex items-center">
              <ScrollArea className="flex-1">
                <div className="flex">
                  {openTabs.map(tab => (
                    <div
                      key={tab.id}
                      className={`flex items-center gap-2 px-3 py-2 border-r cursor-pointer hover:bg-muted/50 ${
                        activeTabId === tab.id ? 'bg-background border-b-2 border-blue-500' : ''
                      }`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      <File className="h-3 w-3" />
                      <span className="text-sm">{tab.title}</span>
                      {tab.isModified && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex items-center gap-1 px-2">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Split className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 relative">
            {activeTab ? (
              <div className="h-full p-4">
                <div className="h-full border rounded-lg overflow-hidden">
                  <div className="h-8 bg-muted/30 border-b flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{activeTab.title}</span>
                      <Badge variant="outline" className="text-xs">{activeTab.language}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Search className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-full bg-background relative">
                    <Textarea
                      value={activeTab.content}
                      onChange={(e) => {
                        setOpenTabs(prev => prev.map(tab => 
                          tab.id === activeTabId 
                            ? { ...tab, content: e.target.value, isModified: true }
                            : tab
                        ))
                      }}
                      className="h-full font-mono text-sm resize-none border-0 focus:ring-0"
                      placeholder="Start coding..."
                    />
                    
                    {/* Line numbers overlay */}
                    <div className="absolute left-0 top-0 w-12 h-full bg-muted/10 border-r text-xs leading-6 text-muted-foreground text-right pr-2">
                      {Array.from({ length: 50 }, (_, i) => (
                        <div key={i + 1}>{i + 1}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Claude Code Assistant</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a file to start coding, or chat with Claude for assistance
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setRightPanelVisible(true)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat with Claude
                      </Button>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        New File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <AnimatePresence>
          {rightPanelVisible && (
            <motion.div
              initial={{ x: rightPanelWidth }}
              animate={{ x: 0 }}
              exit={{ x: rightPanelWidth }}
              style={{ width: rightPanelWidth }}
              className="border-l bg-muted/20"
            >
              <div className="h-full flex flex-col">
                <div className="h-12 border-b flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Claude Assistant</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setRightPanelVisible(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-muted border'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          {message.codeBlocks && (
                            <div className="mt-2 space-y-2">
                              {message.codeBlocks.map((block, i) => (
                                <div key={i} className="bg-black/20 p-2 rounded text-xs font-mono">
                                  <div className="text-xs text-muted-foreground mb-1">{block.language}</div>
                                  <pre>{block.code}</pre>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Claude for help..."
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    />
                    <Button onClick={handleChatSubmit}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel - Terminal */}
      <AnimatePresence>
        {bottomPanelVisible && (
          <motion.div
            initial={{ y: bottomPanelHeight }}
            animate={{ y: 0 }}
            exit={{ y: bottomPanelHeight }}
            style={{ height: bottomPanelHeight }}
            className="border-t bg-black text-white"
          >
            <Tabs value={activeTerminalId} onValueChange={setActiveTerminalId} className="h-full flex flex-col">
              <div className="h-10 border-b border-gray-700 flex items-center justify-between px-4">
                <TabsList className="bg-transparent">
                  {terminalSessions.map(session => (
                    <TabsTrigger key={session.id} value={session.id} className="text-white">
                      <Terminal className="h-3 w-3 mr-2" />
                      {session.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-white"
                    onClick={() => setBottomPanelVisible(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {terminalSessions.map(session => (
                <TabsContent key={session.id} value={session.id} className="flex-1 overflow-hidden">
                  <div className="h-full flex flex-col font-mono text-sm">
                    <ScrollArea className="flex-1 p-4">
                      {session.history.map((entry, i) => (
                        <div key={i} className="mb-2">
                          <div className="text-green-400">
                            {session.currentDirectory} $ {entry.command}
                          </div>
                          <div className="text-gray-300 whitespace-pre-wrap">{entry.output}</div>
                        </div>
                      ))}
                    </ScrollArea>
                    
                    <div className="p-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">{session.currentDirectory} $</span>
                        <Input
                          className="flex-1 bg-transparent border-0 text-white focus:ring-0"
                          placeholder="Enter command..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const command = e.currentTarget.value
                              if (command.trim()) {
                                executeTerminalCommand(command)
                                e.currentTarget.value = ''
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedMainWorkspace