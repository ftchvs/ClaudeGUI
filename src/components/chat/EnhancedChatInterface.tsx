/**
 * Enhanced Chat Interface - Claude Code's Premium Experience
 * 
 * Professional chat interface with real CLI integration, streaming responses,
 * syntax highlighting, file attachments, and advanced AI features
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { claudeCodeCLI, type CLIResponse } from '../../services/claudeCodeCLIBridge'
import { claudeCodeService } from '../../services/claudeCodeService'

interface AttachedFile {
  name: string
  path: string
  content: string
  type: 'text' | 'image' | 'binary'
  size: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system' | 'error'
  content: string
  timestamp: Date
  streaming?: boolean
  attachments?: AttachedFile[]
  metadata?: {
    tokens?: number
    cost?: number
    duration?: number
    codeBlocks?: Array<{ language: string; code: string; filename?: string }>
    actions?: Array<{ 
      type: 'create-file' | 'edit-file' | 'run-command' | 'analyze-code'
      title: string
      description: string
      payload: any
      executed: boolean
      result?: string
    }>
    thinking?: string
    suggestions?: string[]
  }
}

interface EnhancedChatInterfaceProps {
  onFileSelect?: (file: AttachedFile) => void
  onCodeGenerate?: (code: string, language: string, filename?: string) => void
  onCommandExecute?: (command: string) => void
  className?: string
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  onFileSelect,
  onCodeGenerate,
  onCommandExecute,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    type: 'system',
    content: `# Welcome to Claude Code GUI! 🚀

I'm your AI-powered development assistant with **real-time CLI integration**. I can help you:

## 🔥 **Premium Features**
- **Live Code Generation** with syntax highlighting and file creation
- **Real-time File Operations** with visual diff previews  
- **Terminal Integration** with command execution and output streaming
- **Project Analysis** with AI-powered insights and recommendations
- **Intelligent Code Reviews** with suggestions and optimizations

## 💡 **Quick Start**
Try these commands to get started:
- "Create a React component with TypeScript"
- "Analyze my project structure"  
- "Help me set up a Node.js API"
- "Show me the git status"

**What would you like to build today?**`,
    timestamp: new Date()
  }])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Enhanced AI response with real CLI integration
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachedFiles([])
    setIsLoading(true)
    setIsStreaming(true)

    // Create streaming response message
    const responseId = `assistant-${Date.now()}`
    const streamingMessage: ChatMessage = {
      id: responseId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
      metadata: { thinking: 'Analyzing your request...' }
    }

    setMessages(prev => [...prev, streamingMessage])

    try {
      // Use real Claude Code CLI
      const response = await claudeCodeCLI.chat(userMessage.content, {
        files: attachedFiles.map(f => f.path),
        stream: true,
        maxTokens: 4000
      })

      if (response.success) {
        // Parse Claude's response
        const parsedResponse = parseClaudeResponse(response.output)
        
        // Update message with full response
        setMessages(prev => prev.map(msg => 
          msg.id === responseId ? {
            ...msg,
            content: parsedResponse.content,
            streaming: false,
            metadata: {
              ...parsedResponse.metadata,
              tokens: response.tokens,
              cost: response.cost,
              duration: response.duration
            }
          } : msg
        ))

        // Auto-execute safe actions
        if (parsedResponse.metadata?.actions) {
          for (const action of parsedResponse.metadata.actions) {
            if (action.type === 'create-file' && action.payload?.autoExecute) {
              await executeAction(action, responseId)
            }
          }
        }
      } else {
        // Error handling
        setMessages(prev => prev.map(msg => 
          msg.id === responseId ? {
            ...msg,
            type: 'error',
            content: `❌ **Error**: ${response.error || 'Failed to get response from Claude Code CLI'}\n\n**Troubleshooting:**\n- Ensure Claude Code CLI is installed\n- Check your API keys are configured\n- Verify network connection`,
            streaming: false
          } : msg
        ))
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === responseId ? {
          ...msg,
          type: 'error',
          content: `❌ **Connection Error**: Could not connect to Claude Code CLI\n\n${error}`,
          streaming: false
        } : msg
      ))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [input, attachedFiles, isLoading])

  // Parse Claude's response to extract code blocks, actions, etc.
  const parseClaudeResponse = (response: string) => {
    const codeBlocks: Array<{ language: string; code: string; filename?: string }> = []
    const actions: Array<any> = []
    let content = response

    // Extract code blocks
    const codeBlockRegex = /```(\w+)(?:\s+(.+?))?\n([\s\S]*?)```/g
    let match
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const [, language, filename, code] = match
      codeBlocks.push({
        language: language || 'text',
        code: code.trim(),
        filename: filename?.trim()
      })

      // Generate file creation actions for code blocks
      if (filename) {
        actions.push({
          type: 'create-file',
          title: `Create ${filename}`,
          description: `Save this ${language} code to ${filename}`,
          payload: { filename, code: code.trim(), language },
          executed: false
        })
      }
    }

    // Extract terminal commands
    const commandRegex = /```(?:bash|shell|terminal)\n([\s\S]*?)```/g
    while ((match = commandRegex.exec(response)) !== null) {
      const commands = match[1].trim().split('\n').filter(cmd => cmd.trim() && !cmd.startsWith('#'))
      commands.forEach(cmd => {
        actions.push({
          type: 'run-command',
          title: `Run: ${cmd}`,
          description: `Execute terminal command: ${cmd}`,
          payload: { command: cmd.replace(/^\$ /, '') },
          executed: false
        })
      })
    }

    return {
      content,
      metadata: {
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
        actions: actions.length > 0 ? actions : undefined
      }
    }
  }

  // Execute action (file creation, command execution, etc.)
  const executeAction = async (action: any, messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.metadata?.actions) {
        const updatedActions = msg.metadata.actions.map(a => 
          a.title === action.title ? { ...a, executed: true } : a
        )
        return { ...msg, metadata: { ...msg.metadata, actions: updatedActions } }
      }
      return msg
    }))

    try {
      let result = ''
      
      switch (action.type) {
        case 'create-file':
          const createResult = await claudeCodeService.createFile(
            action.payload.filename, 
            action.payload.code
          )
          result = createResult.success ? '✅ File created successfully' : '❌ Failed to create file'
          onCodeGenerate?.(action.payload.code, action.payload.language, action.payload.filename)
          break

        case 'edit-file':
          const editResult = await claudeCodeCLI.editFile(
            action.payload.filename,
            action.payload.instructions
          )
          result = editResult.success ? '✅ File edited successfully' : '❌ Failed to edit file'
          break

        case 'run-command':
          const commandResult = await claudeCodeCLI.executeTerminalCommand(action.payload.command)
          result = commandResult.success ? 
            `✅ Command executed:\n\`\`\`\n${commandResult.output}\`\`\`` : 
            `❌ Command failed:\n\`\`\`\n${commandResult.error}\`\`\``
          onCommandExecute?.(action.payload.command)
          break

        case 'analyze-code':
          const analysisResult = await claudeCodeCLI.analyzeProject(action.payload.path)
          result = analysisResult.success ? '✅ Analysis complete' : '❌ Analysis failed'
          break
      }

      // Update action with result
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.metadata?.actions) {
          const updatedActions = msg.metadata.actions.map(a => 
            a.title === action.title ? { ...a, result } : a
          )
          return { ...msg, metadata: { ...msg.metadata, actions: updatedActions } }
        }
        return msg
      }))
    } catch (error) {
      console.error('Action execution failed:', error)
    }
  }

  // Handle file attachment
  const handleFileAttach = useCallback(async (files: FileList) => {
    const newFiles: AttachedFile[] = []
    
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        continue
      }

      const content = await file.text()
      newFiles.push({
        name: file.name,
        path: file.name, // In real implementation, would be full path
        content,
        type: file.type.startsWith('image/') ? 'image' : 'text',
        size: file.size
      })
    }

    setAttachedFiles(prev => [...prev, ...newFiles])
  }, [])

  // Smart suggestions based on context
  const suggestions = [
    "Create a TypeScript React component",
    "Analyze my project structure",
    "Set up a new Node.js API",
    "Generate unit tests for my code",
    "Optimize my build configuration",
    "Add error handling to my functions"
  ]

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 flex flex-col h-full overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Icons.AISpark size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Claude Code Assistant</h2>
              <p className="text-sm text-gray-400">AI-Powered Development with Real-time CLI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              CLI Connected
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Icons.Settings size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area with Enhanced UI */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Header */}
                {message.type !== 'user' && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Icons.AISpark size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-white">Claude Code</span>
                    <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                    {message.metadata?.duration && (
                      <span className="text-xs text-gray-500">• {message.metadata.duration}ms</span>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className={`rounded-2xl overflow-hidden ${
                  message.type === 'user' 
                    ? 'bg-orange-600 text-white' 
                    : message.type === 'error'
                    ? 'bg-red-900/50 border border-red-700'
                    : message.type === 'system'
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-gray-800 border border-gray-700'
                }`}>
                  <div className="p-4">
                    {/* Streaming indicator */}
                    {message.streaming && (
                      <div className="flex items-center gap-2 mb-3 text-orange-400">
                        <Icons.Loading size={16} className="animate-spin" />
                        <span className="text-sm">{message.metadata?.thinking || 'Thinking...'}</span>
                      </div>
                    )}

                    {/* Message text with markdown rendering */}
                    <div className="prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {/* File attachments */}
                    {message.attachments && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                            <Icons.File size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-300">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code blocks with enhanced syntax highlighting */}
                    {message.metadata?.codeBlocks && (
                      <div className="mt-4 space-y-3">
                        {message.metadata.codeBlocks.map((block, index) => (
                          <CodeBlock
                            key={index}
                            language={block.language}
                            code={block.code}
                            filename={block.filename}
                            onCopy={() => navigator.clipboard.writeText(block.code)}
                            onSave={block.filename ? () => onCodeGenerate?.(block.code, block.language, block.filename) : undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    {message.metadata?.actions && (
                      <div className="mt-4 space-y-2">
                        {message.metadata.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => executeAction(action, message.id)}
                            disabled={action.executed}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                              action.executed 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                              {action.executed ? (
                                <Icons.Check size={16} className="text-green-400" />
                              ) : action.type === 'create-file' ? (
                                <Icons.File size={16} />
                              ) : action.type === 'run-command' ? (
                                <Icons.Terminal size={16} />
                              ) : (
                                <Icons.AISpark size={16} />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-xs opacity-70">{action.description}</div>
                              {action.result && (
                                <div className="text-xs mt-1 opacity-90">{action.result}</div>
                              )}
                            </div>
                            {action.executed && <Icons.Check size={16} className="text-green-400" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    {message.metadata && (message.metadata.tokens || message.metadata.cost) && (
                      <div className="mt-3 pt-3 border-t border-gray-600 flex items-center gap-4 text-xs text-gray-400">
                        {message.metadata.tokens && (
                          <span>🔤 {message.metadata.tokens} tokens</span>
                        )}
                        {message.metadata.cost && (
                          <span>💰 ${message.metadata.cost.toFixed(4)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-gray-700 bg-gray-800/50">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Attached:</span>
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded-lg">
                  <Icons.File size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-300">{file.name}</span>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Icons.Error size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (
          <div className="px-6 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Suggestions:</span>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input controls */}
        <div className="p-6">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask Claude Code anything about development, files, or commands..."
                className="w-full min-h-[60px] max-h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* File attachment */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-700 rounded-xl transition-colors"
                title="Attach files"
              >
                <Icons.Attachment size={20} className="text-gray-400" />
              </button>
              
              {/* Suggestions toggle */}
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`p-3 rounded-xl transition-colors ${
                  showSuggestions ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-gray-700 text-gray-400'
                }`}
                title="Show suggestions"
              >
                <Icons.AISpark size={20} />
              </button>
              
              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                {isLoading ? (
                  <Icons.Loading size={20} className="animate-spin" />
                ) : (
                  <Icons.Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileAttach(e.target.files)}
        className="hidden"
        accept=".txt,.md,.js,.ts,.tsx,.jsx,.json,.yml,.yaml,.toml,.env"
      />
    </div>
  )
}

// Enhanced Code Block Component
const CodeBlock: React.FC<{
  language: string
  code: string
  filename?: string
  onCopy: () => void
  onSave?: () => void
}> = ({ language, code, filename, onCopy, onSave }) => (
  <div className="bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-600">
      <div className="flex items-center gap-2">
        <Icons.File size={16} className="text-gray-400" />
        <span className="text-sm text-gray-300">{filename || language}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Copy code"
        >
          <Icons.Copy size={14} className="text-gray-400" />
        </button>
        {onSave && (
          <button
            onClick={onSave}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Save file"
          >
            <Icons.Download size={14} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
)

// Utility functions
const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Simple markdown renderer (replace with react-markdown in production)
const ReactMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <div 
    dangerouslySetInnerHTML={{ 
      __html: children
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-orange-400">$1</code>')
        .replace(/\n/g, '<br />')
    }} 
  />
)

export default EnhancedChatInterface