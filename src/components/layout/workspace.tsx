import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChatArea } from '@/components/chat/chat-area'
import { FileExplorer } from '@/components/file-explorer/file-explorer'
import { Terminal } from '@/components/terminal/terminal'
import { SettingsPanel } from '@/components/settings/settings-panel'
// import McpDashboard from '@/components/mcp/McpDashboard'
import FileExplorerClaude from '@/components/claude-code/FileExplorer'
import IntegratedTerminal from '@/components/claude-code/IntegratedTerminal'
import ConversationHistory from '@/components/claude-code/ConversationHistory'
import StatusBar from '@/components/claude-code/StatusBar'
import ActivityMonitor from '@/components/claude-code/ActivityMonitor'
import { 
  PanelLeftIcon, 
  PanelRightIcon, 
  PanelBottomIcon,
  MessageSquareIcon,
  FolderIcon,
  TerminalIcon,
  SettingsIcon,
  BrainCircuitIcon,
  HistoryIcon,
  MonitorIcon,
  GitBranchIcon,
  ZapIcon,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClaudeCodeStore } from '@/stores/claude-code'
import { useMcpStore } from '@/stores/mcp'

type PanelView = 'chat' | 'explorer' | 'terminal' | 'settings' | 'mcp' | 'claude-files' | 'claude-terminal' | 'claude-history' | 'claude-session' | 'activity-monitor'

export function Workspace() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true)
  const [leftPanelView, setLeftPanelView] = useState<PanelView>('claude-files')
  const [rightPanelView, setRightPanelView] = useState<PanelView>('chat')
  const [bottomPanelView, setBottomPanelView] = useState<PanelView>('claude-terminal')

  // Claude Code integration
  const { 
    isConnected: claudeConnected, 
    currentSession, 
    runningCommands,
    pendingDiffs,
    initialize: initializeClaudeCode 
  } = useClaudeCodeStore()
  
  // MCP integration
  const { 
    analytics: mcpAnalytics, 
    servers: mcpServers,
    initialize: initializeMcp 
  } = useMcpStore()

  // Initialize stores on mount
  useEffect(() => {
    initializeClaudeCode()
    initializeMcp()
  }, [initializeClaudeCode, initializeMcp])

  const renderPanelContent = (view: PanelView) => {
    switch (view) {
      case 'chat':
        return <ChatArea />
      case 'explorer':
        return <FileExplorer />
      case 'terminal':
        return <Terminal />
      case 'settings':
        return <SettingsPanel />
      case 'mcp':
        return <div className="p-4">MCP Dashboard (Coming Soon)</div>
      case 'claude-files':
        return <FileExplorerClaude />
      case 'claude-terminal':
        return <IntegratedTerminal />
      case 'claude-history':
        return <ConversationHistory />
      case 'claude-session':
        return <div className="p-4">Claude Session Monitor (Coming Soon)</div>
      case 'activity-monitor':
        return <ActivityMonitor />
      default:
        return <div>Panel content</div>
    }
  }

  const getPanelIcon = (view: PanelView) => {
    switch (view) {
      case 'chat':
        return MessageSquareIcon
      case 'explorer':
        return FolderIcon
      case 'terminal':
        return TerminalIcon
      case 'settings':
        return SettingsIcon
      case 'mcp':
        return BrainCircuitIcon
      case 'claude-files':
        return FolderIcon
      case 'claude-terminal':
        return TerminalIcon
      case 'claude-history':
        return HistoryIcon
      case 'claude-session':
        return MonitorIcon
      case 'activity-monitor':
        return Activity
      default:
        return MessageSquareIcon
    }
  }

  const getPanelBadge = (view: PanelView) => {
    switch (view) {
      case 'claude-terminal':
        return runningCommands.size > 0 ? runningCommands.size : null
      case 'claude-files':
        return pendingDiffs.length > 0 ? pendingDiffs.length : null
      case 'mcp':
        return Object.values(mcpServers).filter(s => s.health.status === 'connected').length || null
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-background/95 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="h-8 w-8"
        >
          <PanelLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="h-8 w-8"
        >
          <PanelRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
          className="h-8 w-8"
        >
          <PanelBottomIcon className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${claudeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-muted-foreground">
              {claudeConnected ? 'Claude Connected' : 'Claude Disconnected'}
            </span>
          </div>
          {currentSession && (
            <Badge variant="outline" className="text-xs">
              Session: {currentSession.id.slice(0, 8)}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-1">
          {(['claude-files', 'claude-terminal', 'claude-history', 'activity-monitor', 'mcp', 'chat', 'settings'] as PanelView[]).map((view) => {
            const Icon = getPanelIcon(view)
            const badge = getPanelBadge(view)
            return (
              <Button
                key={view}
                variant={leftPanelView === view ? "secondary" : "ghost"}
                size="icon"
                onClick={() => {
                  setLeftPanelView(view)
                  setLeftPanelOpen(true)
                }}
                className="h-8 w-8 relative"
              >
                <Icon className="h-4 w-4" />
                {badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex">
        {/* Left panel */}
        {leftPanelOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 320 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r bg-muted/30"
          >
            {renderPanelContent(leftPanelView)}
          </motion.div>
        )}

        {/* Center content */}
        <div className="flex-1 flex flex-col">
          <div className={cn(
            "flex-1",
            rightPanelOpen && bottomPanelOpen ? "h-1/2" : "h-full"
          )}>
            {rightPanelOpen ? (
              renderPanelContent(rightPanelView)
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Open a panel to start working</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom panel */}
          {bottomPanelOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 300 }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t bg-muted/30"
            >
              {renderPanelContent(bottomPanelView)}
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  )
}