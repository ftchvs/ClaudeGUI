import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Code, 
  Terminal, 
  FileText, 
  Mic, 
  Square,
  RotateCcw,
  Zap,
  Brain,
  Settings,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useOnboardingStore } from '@/stores/onboarding'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    thinking?: string
    codeBlocks?: Array<{ language: string; code: string }>
    actions?: Array<{ type: string; description: string; executed: boolean }>
    attachments?: Array<{ type: string; name: string; content: string }>
  }
}

interface ChatInterfaceProps {
  onCodeGeneration?: (code: string, language: string) => void
  onFileOperation?: (operation: string, path: string) => void
  onTerminalCommand?: (command: string) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onCodeGeneration,
  onFileOperation,
  onTerminalCommand
}) => {
  const { userProfile, trackEvent } = useOnboardingStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'system',
      content: `Welcome to ClaudeGUI! I'm Claude, your AI coding assistant. I can help you with:

• **Code Generation** - Write, review, and optimize code
• **File Operations** - Create, edit, and manage project files  
• **Terminal Commands** - Execute and explain command-line operations
• **Project Architecture** - Design and structure your applications
• **Debugging** - Find and fix issues in your code
• **Documentation** - Generate README files, comments, and guides

What would you like to work on today?`,
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate AI response (in real implementation, this would connect to Claude API)
  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    let response = ''
    let metadata: Message['metadata'] = {}

    // Code generation patterns
    if (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('write')) {
      if (userMessage.toLowerCase().includes('component') || userMessage.toLowerCase().includes('react')) {
        response = `I'll help you create a React component! Here's a well-structured component based on your request:

\`\`\`tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface ExampleComponentProps {
  title: string
  onAction?: () => void
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ 
  title, 
  onAction 
}) => {
  const [isActive, setIsActive] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg shadow-sm"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <button
        onClick={() => {
          setIsActive(!isActive)
          onAction?.()
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </motion.div>
  )
}
\`\`\`

This component includes:
• TypeScript interfaces for type safety
• React hooks for state management  
• Framer Motion animations
• Responsive styling with Tailwind CSS
• Proper event handling

Would you like me to modify anything or create additional components?`

        metadata.codeBlocks = [
          {
            language: 'tsx',
            code: `import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface ExampleComponentProps {
  title: string
  onAction?: () => void
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ 
  title, 
  onAction 
}) => {
  const [isActive, setIsActive] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg shadow-sm"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <button
        onClick={() => {
          setIsActive(!isActive)
          onAction?.()
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </motion.div>
  )
}`
          }
        ]
        
        metadata.actions = [
          { type: 'create-file', description: 'Create ExampleComponent.tsx', executed: false },
          { type: 'add-imports', description: 'Add required imports', executed: false }
        ]
      }
    } else if (userMessage.toLowerCase().includes('terminal') || userMessage.toLowerCase().includes('command')) {
      response = `I can help you with terminal commands! Here are some useful commands for development:

**Project Setup:**
\`\`\`bash
# Initialize a new project
npm init -y
npm install react typescript @types/react

# Start development server
npm run dev
\`\`\`

**Git Operations:**
\`\`\`bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create and switch to new branch
git checkout -b feature/new-feature
\`\`\`

**File Operations:**
\`\`\`bash
# Create directory structure
mkdir -p src/components/ui
touch src/components/ui/Button.tsx

# Search in files
grep -r "TODO" src/
\`\`\`

Which specific commands would you like me to explain or help you with?`

      metadata.actions = [
        { type: 'execute-command', description: 'Run npm install', executed: false },
        { type: 'execute-command', description: 'Initialize git repository', executed: false }
      ]
    } else if (userMessage.toLowerCase().includes('file') || userMessage.toLowerCase().includes('create file')) {
      response = `I'll help you with file operations! I can:

• **Create new files** with proper structure and boilerplate
• **Edit existing files** with intelligent modifications
• **Organize project structure** with best practices
• **Generate configuration files** (package.json, tsconfig.json, etc.)

What type of file would you like to create or modify? For example:
- React components
- TypeScript utilities
- Configuration files
- Documentation (README, API docs)
- Test files`

      metadata.actions = [
        { type: 'create-file', description: 'Create new file', executed: false },
        { type: 'organize-structure', description: 'Organize project structure', executed: false }
      ]
    } else {
      // General response
      response = `I understand you're asking about "${userMessage}". I'm here to help with your development needs!

As your AI coding assistant, I can:

🚀 **Generate Code**: Components, functions, utilities, and entire modules
📁 **Manage Files**: Create, edit, organize, and structure your project
💻 **Terminal Support**: Explain commands, generate scripts, troubleshoot issues
🔧 **Debug Issues**: Analyze errors, suggest fixes, optimize performance
📚 **Documentation**: Write README files, code comments, and API docs
🏗️ **Architecture**: Design patterns, best practices, project structure

What specific task would you like help with? The more details you provide, the better I can assist you!`
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Track user interaction
    trackEvent({
      type: 'feature-discovered',
      timestamp: new Date(),
      featureId: 'chat-interaction',
      metadata: { messageLength: input.length, hasCode: input.includes('```') }
    })

    try {
      const aiResponse = await generateAIResponse(userMessage.content)
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const executeAction = (action: { type: string; description: string }, messageId: string) => {
    // Simulate action execution
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.metadata?.actions) {
        const updatedActions = msg.metadata.actions.map(a => 
          a.description === action.description ? { ...a, executed: true } : a
        )
        return { ...msg, metadata: { ...msg.metadata, actions: updatedActions } }
      }
      return msg
    }))

    // Trigger callbacks based on action type
    if (action.type === 'create-file' && onFileOperation) {
      onFileOperation('create', 'ExampleComponent.tsx')
    } else if (action.type === 'execute-command' && onTerminalCommand) {
      onTerminalCommand('npm install')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const quickActions = [
    { icon: Code, label: 'Generate Component', prompt: 'Create a React component with TypeScript' },
    { icon: Terminal, label: 'Terminal Help', prompt: 'Help me with terminal commands' },
    { icon: FileText, label: 'Create File', prompt: 'Help me create and organize project files' },
    { icon: Settings, label: 'Setup Project', prompt: 'Help me set up a new development project' }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Claude Code Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {userProfile?.persona ? `Optimized for ${userProfile.persona}` : 'AI-Powered Development'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          ● Online
        </Badge>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type !== 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">Claude</span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                <Card className={`${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : message.type === 'system'
                    ? 'bg-muted/50 border-muted'
                    : 'bg-background border-border'
                }`}>
                  <CardContent className="p-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                    </div>
                    
                    {/* Action Buttons */}
                    {message.metadata?.actions && (
                      <div className="mt-3 space-y-2">
                        {message.metadata.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={action.executed ? "default" : "outline"}
                            onClick={() => executeAction(action, message.id)}
                            disabled={action.executed}
                            className="w-full justify-start"
                          >
                            {action.executed ? (
                              <Zap className="h-3 w-3 mr-2 text-green-500" />
                            ) : (
                              <Code className="h-3 w-3 mr-2" />
                            )}
                            {action.description}
                            {action.executed && <span className="ml-auto text-xs">✓ Done</span>}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Message Actions */}
                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-1 p-2 border-t">
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(message.content)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="bg-background border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-3 w-3 text-white animate-pulse" />
                    </div>
                    <span className="text-sm text-muted-foreground">Claude is thinking...</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(action.prompt)}
              className="justify-start gap-2"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Claude about code, files, commands, or anything development-related..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsListening(!isListening)}
              className={isListening ? 'bg-red-50 border-red-200' : ''}
            >
              {isListening ? <Square className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="min-w-[44px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface