import React, { useState, useEffect } from 'react'
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
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useOnboardingStore } from '@/stores/onboarding'
import { EnhancedSmartTooltip } from '@/components/onboarding/ContextualLearning'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  language?: string
  children?: FileItem[]
}

interface MCPServer {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  description: string
  capabilities: string[]
}

export const MainWorkspace: React.FC = () => {
  const { userProfile, trackEvent, unlockedFeatures } = useOnboardingStore()
  const [activePanel, setActivePanel] = useState<'explorer' | 'chat' | 'terminal' | 'mcp'>('chat')
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [rightPanelVisible, setRightPanelVisible] = useState(true)
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null)
  const [terminalHistory, setTerminalHistory] = useState<Array<{ command: string; output: string; timestamp: Date }>>([])
  
  // Sample project structure
  const [projectFiles] = useState<FileItem[]>([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          children: [
            { id: 'app', name: 'App.tsx', type: 'file', path: '/src/components/App.tsx', language: 'typescript' },
            { id: 'button', name: 'Button.tsx', type: 'file', path: '/src/components/Button.tsx', language: 'typescript' }
          ]
        },
        { id: 'utils', name: 'utils.ts', type: 'file', path: '/src/utils.ts', language: 'typescript' },
        { id: 'main', name: 'main.tsx', type: 'file', path: '/src/main.tsx', language: 'typescript' }
      ]
    },
    { id: 'package', name: 'package.json', type: 'file', path: '/package.json', language: 'json' },
    { id: 'readme', name: 'README.md', type: 'file', path: '/README.md', language: 'markdown' }
  ])

  // Sample MCP servers
  const [mcpServers] = useState<MCPServer[]>([
    {
      id: 'github',
      name: 'GitHub Integration',
      status: 'connected',
      description: 'Git operations, issue management, PR workflows',
      capabilities: ['git', 'issues', 'pull-requests', 'repositories']
    },
    {
      id: 'filesystem',
      name: 'File System',
      status: 'connected', 
      description: 'File operations, directory management',
      capabilities: ['read', 'write', 'create', 'delete', 'search']
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper',
      status: 'disconnected',
      description: 'Extract data from websites',
      capabilities: ['scrape', 'extract', 'monitor']
    }
  ])

  const handleFileOperation = (operation: string, path: string) => {
    trackEvent({
      type: 'feature-discovered',
      timestamp: new Date(),
      featureId: 'file-operation',
      metadata: { operation, path }
    })
    
    // Simulate file operation
    console.log(`File operation: ${operation} on ${path}`)
  }

  const handleTerminalCommand = (command: string) => {
    const output = `Executing: ${command}\n✓ Command completed successfully`
    const newEntry = {
      command,
      output,
      timestamp: new Date()
    }
    
    setTerminalHistory(prev => [...prev, newEntry])
    setActivePanel('terminal')
    
    trackEvent({
      type: 'feature-discovered',
      timestamp: new Date(),
      featureId: 'terminal-command',
      metadata: { command }
    })
  }

  const renderFileTree = (files: FileItem[], depth = 0) => {
    return files.map(file => (
      <div key={file.id} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer ${
            currentFile?.id === file.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => file.type === 'file' && setCurrentFile(file)}
        >
          {file.type === 'folder' ? (
            <FolderTree className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm">{file.name}</span>
          {file.type === 'file' && file.language && (
            <Badge variant="outline" className="text-xs">
              {file.language}
            </Badge>
          )}
        </div>
        {file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ))
  }

  const renderMCPPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">MCP Servers</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
      
      {mcpServers.map(server => (
        <Card key={server.id} className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                server.status === 'connected' ? 'bg-green-500' : 
                server.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <h4 className="font-medium text-sm">{server.name}</h4>
            </div>
            <Badge variant={server.status === 'connected' ? 'default' : 'secondary'}>
              {server.status}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">{server.description}</p>
          
          <div className="flex flex-wrap gap-1">
            {server.capabilities.map(cap => (
              <Badge key={cap} variant="outline" className="text-xs">
                {cap}
              </Badge>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )

  const renderTerminalPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold text-sm">Terminal</h3>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost">
            <Play className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="font-mono text-xs space-y-2">
          {terminalHistory.map((entry, index) => (
            <div key={index}>
              <div className="text-blue-400">$ {entry.command}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{entry.output}</div>
            </div>
          ))}
          {terminalHistory.length === 0 && (
            <div className="text-muted-foreground">
              Welcome to ClaudeGUI Terminal
              <br />Type commands or ask Claude for help
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t">
        <Input
          placeholder="Type command or ask Claude..."
          className="font-mono text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const command = e.currentTarget.value
              if (command.trim()) {
                handleTerminalCommand(command)
                e.currentTarget.value = ''
              }
            }
          }}
        />
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <AnimatePresence>
        {sidebarVisible && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 border-r bg-muted/30 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Explorer</h2>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSidebarVisible(false)}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Tabs */}
            <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as any)} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 m-2">
                <TabsTrigger value="explorer" className="text-xs">
                  <FolderTree className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs">
                  <Brain className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="terminal" className="text-xs">
                  <Terminal className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="mcp" className="text-xs">
                  <Zap className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="explorer" className="h-full m-0">
                  <ScrollArea className="h-full p-2">
                    <EnhancedSmartTooltip
                      tipId="file-explorer"
                      content="Browse and manage your project files. Click on files to open them in the editor."
                      title="File Explorer"
                      category="file-management"
                      skillLevel="beginner"
                      type="feature"
                      relevanceScore={0.8}
                    >
                      <div className="space-y-1">
                        {renderFileTree(projectFiles)}
                      </div>
                    </EnhancedSmartTooltip>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="chat" className="h-full m-0">
                  <div className="h-full">
                    <ChatInterface 
                      onFileOperation={handleFileOperation}
                      onTerminalCommand={handleTerminalCommand}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="terminal" className="h-full m-0">
                  <EnhancedSmartTooltip
                    tipId="terminal-panel"
                    content="Execute commands with Claude's assistance. Ask Claude to explain commands or help with terminal operations."
                    title="AI-Powered Terminal"
                    category="terminal"
                    skillLevel="intermediate"
                    type="feature"
                    relevanceScore={0.9}
                  >
                    {renderTerminalPanel()}
                  </EnhancedSmartTooltip>
                </TabsContent>

                <TabsContent value="mcp" className="h-full m-0">
                  <ScrollArea className="h-full p-2">
                    <EnhancedSmartTooltip
                      tipId="mcp-servers"
                      content="MCP (Model Context Protocol) servers extend Claude's capabilities with external tools and services."
                      title="MCP Integration"
                      category="mcp-integration"
                      skillLevel="advanced"
                      type="feature"
                      relevanceScore={0.7}
                    >
                      {renderMCPPanel()}
                    </EnhancedSmartTooltip>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/30">
          <div className="flex items-center gap-2">
            {!sidebarVisible && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSidebarVisible(true)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            )}
            
            <EnhancedSmartTooltip
              tipId="project-title"
              content="Your current project workspace. Claude can help you manage and develop your entire project."
              title="Project Workspace"
              category="file-management"
              skillLevel="beginner"
              type="hint"
              relevanceScore={0.6}
            >
              <h1 className="font-semibold">ClaudeGUI Project</h1>
            </EnhancedSmartTooltip>
            
            {currentFile && (
              <Badge variant="outline" className="ml-2">
                {currentFile.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <GitBranch className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setRightPanelVisible(!rightPanelVisible)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="flex-1 relative">
            {currentFile ? (
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{currentFile.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{currentFile.language}</Badge>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 h-full">
                    <div className="h-full bg-muted/30 rounded p-4 font-mono text-sm">
                      <div className="text-muted-foreground">
                        {/* This would be replaced with a real code editor like Monaco */}
                        {`// ${currentFile.name}
// AI-powered code editing with Claude
// Ask Claude to help you write, review, or refactor code

import React from 'react'

export const ExampleComponent = () => {
  return (
    <div>
      <h1>Hello from {currentFile.name}</h1>
      <p>Claude can help you build amazing applications!</p>
    </div>
  )
}

export default ExampleComponent`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Welcome to ClaudeGUI</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a file from the explorer or start chatting with Claude to begin
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setActivePanel('chat')}>
                        <Brain className="h-4 w-4 mr-2" />
                        Chat with Claude
                      </Button>
                      <Button variant="outline" onClick={() => setActivePanel('explorer')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Open File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <AnimatePresence>
            {rightPanelVisible && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 border-l bg-muted/30"
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Assistant Panel</h3>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-2">Claude can help you with:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Code generation and review</li>
                            <li>• File organization</li>
                            <li>• Terminal commands</li>
                            <li>• Project architecture</li>
                            <li>• Debugging assistance</li>
                          </ul>
                        </div>
                        
                        <Button size="sm" className="w-full" onClick={() => setActivePanel('chat')}>
                          Start Conversation
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MainWorkspace