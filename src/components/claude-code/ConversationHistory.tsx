import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  User,
  Bot,
  Play,
  RotateCcw,
  Copy,
  Clock,
  File,
  Terminal,
  Code,
  GitBranch,
  Zap,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useClaudeCodeStore } from '@/stores/claude-code'
import type { ClaudeCodeConversation, ClaudeCodeMessage } from '@/types/claude-code'

interface MessageComponentProps {
  message: ClaudeCodeMessage
  conversation: ClaudeCodeConversation
  onReplayCommand?: (command: string) => void
  onOpenFile?: (path: string) => void
}

const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  conversation,
  onReplayCommand,
  onOpenFile
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getMessageIcon = () => {
    switch (message.role) {
      case 'user':
        return <User className="h-5 w-5 text-blue-500" />
      case 'assistant':
        return <Bot className="h-5 w-5 text-green-500" />
      case 'system':
        return <Terminal className="h-5 w-5 text-orange-500" />
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />
    }
  }

  const getRoleColor = () => {
    switch (message.role) {
      case 'user':
        return 'border-l-blue-500'
      case 'assistant':
        return 'border-l-green-500'
      case 'system':
        return 'border-l-orange-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 ${getRoleColor()} pl-4 py-3 mb-4`}
    >
      {/* Message Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getMessageIcon()}
          <span className="font-medium capitalize">{message.role}</span>
          <Badge variant="outline" className="text-xs">
            {formatTimestamp(message.timestamp)}
          </Badge>
          {message.metadata.tokensUsed && (
            <Badge variant="secondary" className="text-xs">
              {message.metadata.tokensUsed} tokens
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {message.metadata.command && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReplayCommand?.(message.metadata.command!)}
              title="Replay command"
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(message.content)}
            title="Copy message"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {(message.metadata.filesReferenced.length > 0 || message.attachments) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              title="Show details"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-lg">
          {message.content}
        </pre>
      </div>

      {/* Message Metadata */}
      {message.metadata.command && (
        <div className="mt-2 p-2 bg-blue-50 rounded border">
          <div className="flex items-center gap-2 text-sm">
            <Terminal className="h-4 w-4 text-blue-600" />
            <span className="font-mono">{message.metadata.command}</span>
          </div>
        </div>
      )}

      {/* Tools Used */}
      {message.metadata.toolsUsed.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {message.metadata.toolsUsed.map((tool, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              {tool}
            </Badge>
          ))}
        </div>
      )}

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            {/* Referenced Files */}
            {message.metadata.filesReferenced.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Referenced Files</h4>
                <div className="space-y-1">
                  {message.metadata.filesReferenced.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                      onClick={() => onOpenFile?.(file)}
                    >
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-mono">{file}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                <div className="space-y-1">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{attachment.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {attachment.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ConversationCardProps {
  conversation: ClaudeCodeConversation
  onSelect: (conversation: ClaudeCodeConversation) => void
  onRestore: (conversation: ClaudeCodeConversation) => void
  isSelected: boolean
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onSelect,
  onRestore,
  isSelected
}) => {
  const duration = conversation.endTime
    ? conversation.endTime.getTime() - conversation.startTime.getTime()
    : Date.now() - conversation.startTime.getTime()

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(ms / 3600000)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onSelect(conversation)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">
                Conversation {conversation.id.slice(0, 8)}
              </span>
              <Badge variant={conversation.endTime ? 'secondary' : 'default'} className="text-xs">
                {conversation.endTime ? 'Ended' : 'Active'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(duration)}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {conversation.messages.length} messages
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {conversation.totalTokens} tokens
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                ${conversation.cost.toFixed(4)}
              </div>
            </div>

            {/* Context Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <File className="h-3 w-3" />
                {conversation.context.files.length} files
              </div>
              {conversation.context.gitBranch && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GitBranch className="h-3 w-3" />
                  {conversation.context.gitBranch}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button size="sm" variant="ghost" onClick={() => onRestore(conversation)}>
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost">
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ConversationHistory: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    currentWorkspace,
    commands,
    openFile,
    replayCommand,
    startConversation
  } = useClaudeCodeStore()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest' | 'mostTokens'>('newest')

  const conversationList = Object.values(conversations)
  const selectedConversation = selectedConversationId ? conversations[selectedConversationId] : null

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversationList

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.messages.some(msg =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.metadata.command?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Time period filter
    if (filterPeriod !== 'all') {
      const now = new Date()
      let cutoff: Date
      
      switch (filterPeriod) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoff = new Date(0)
      }
      
      filtered = filtered.filter(conv => conv.startTime >= cutoff)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        break
      case 'longest':
        filtered.sort((a, b) => {
          const aDuration = (a.endTime || new Date()).getTime() - a.startTime.getTime()
          const bDuration = (b.endTime || new Date()).getTime() - b.startTime.getTime()
          return bDuration - aDuration
        })
        break
      case 'mostTokens':
        filtered.sort((a, b) => b.totalTokens - a.totalTokens)
        break
    }

    return filtered
  }, [conversationList, searchQuery, filterPeriod, sortBy])

  const handleRestoreConversation = (conversation: ClaudeCodeConversation) => {
    // Restore conversation context
    conversation.context.files.forEach(filePath => {
      openFile(filePath)
    })
    
    // Optionally start a new conversation with the same context
    const newConversationId = startConversation()
    setSelectedConversationId(newConversationId)
  }

  const totalStats = useMemo(() => {
    const total = conversationList.length
    const totalMessages = conversationList.reduce((acc, conv) => acc + conv.messages.length, 0)
    const totalTokens = conversationList.reduce((acc, conv) => acc + conv.totalTokens, 0)
    const totalCost = conversationList.reduce((acc, conv) => acc + conv.cost, 0)
    
    return { total, totalMessages, totalTokens, totalCost }
  }, [conversationList])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Conversation History</h2>
            <p className="text-muted-foreground">
              View and replay your Claude Code conversations
            </p>
          </div>
          
          <Button onClick={startConversation}>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalStats.total}</div>
            <div className="text-sm text-muted-foreground">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalStats.totalMessages}</div>
            <div className="text-sm text-muted-foreground">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalStats.totalTokens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">${totalStats.totalCost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Cost</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="longest">Longest</SelectItem>
              <SelectItem value="mostTokens">Most tokens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Conversation List */}
        <div className="w-1/3 border-r p-4">
          <ScrollArea className="h-full">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onSelect={(conv) => setSelectedConversationId(conv.id)}
                    onRestore={handleRestoreConversation}
                    isSelected={selectedConversationId === conversation.id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Conversation Detail */}
        <div className="flex-1 p-4">
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Conversation {selectedConversation.id.slice(0, 8)}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedConversation.startTime.toLocaleString()}</span>
                  <span>{selectedConversation.messages.length} messages</span>
                  <span>{selectedConversation.totalTokens} tokens</span>
                  <span>${selectedConversation.cost.toFixed(4)}</span>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <MessageComponent
                      key={message.id}
                      message={message}
                      conversation={selectedConversation}
                      onReplayCommand={replayCommand}
                      onOpenFile={openFile}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationHistory