import React, { useState, useRef, useEffect } from 'react'
import { webClaudeCodeService } from '@/services/webClaudeCodeService'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  tokens?: number
  cost?: number
}

interface EnhancedChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  currentTheme: any
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentTheme
}) => {
  const [input, setInput] = useState('')
  const [suggestions] = useState([
    "Create a new React component",
    "Debug the TypeScript errors",
    "Optimize the bundle size",
    "Add error boundaries",
    "Implement testing strategy"
  ])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const message = input.trim()
    setInput('')
    setShowSuggestions(false)
    
    onSendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('```')) {
        return (
          <div key={index} style={{
            background: currentTheme.bg,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '4px',
            padding: '8px',
            margin: '8px 0',
            fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
            fontSize: '13px',
            overflow: 'auto'
          }}>
            <code>{line.replace(/```\w*/, '')}</code>
          </div>
        )
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} style={{ fontWeight: 'bold', margin: '4px 0' }}>
            {line.replace(/\*\*/g, '')}
          </div>
        )
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={index} style={{ 
            marginLeft: '16px', 
            margin: '2px 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ color: currentTheme.accent, fontSize: '12px', marginTop: '2px' }}>•</span>
            <span>{line.substring(2)}</span>
          </div>
        )
      }
      return <div key={index} style={{ margin: '4px 0' }}>{line}</div>
    })
  }

  return (
    <section style={{
      background: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>
          Chat with Claude
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: currentTheme.textSecondary,
            background: currentTheme.bg,
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${currentTheme.border}`
          }}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: webClaudeCodeService.getStatus().available ? currentTheme.accent : '#ef4444'
            }}></div>
            <span>{webClaudeCodeService.getStatus().available ? 'Connected' : 'Offline'}</span>
          </div>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            style={{
              background: 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '4px 8px',
              color: currentTheme.textSecondary,
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            💡 Suggestions
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div style={{
        background: currentTheme.bg,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '8px',
        padding: '16px',
        minHeight: '400px',
        maxHeight: '500px',
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        scrollBehavior: 'smooth'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: currentTheme.textSecondary,
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '48px' }}>🤖</div>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>
                Welcome to Claude GUI!
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Start a conversation with Claude to get help with your code.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div key={message.id} style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.role === 'user' ? currentTheme.button : currentTheme.surface,
                  color: message.role === 'user' ? currentTheme.buttonText : currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                  position: 'relative'
                }}>
                  {/* Message content */}
                  <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
                    {message.role === 'assistant' ? formatContent(message.content) : message.content}
                  </div>
                  
                  {/* Message metadata */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '12px',
                    opacity: 0.7,
                    borderTop: `1px solid ${message.role === 'user' ? currentTheme.buttonText + '20' : currentTheme.border}`,
                    paddingTop: '8px',
                    marginTop: '8px'
                  }}>
                    <span style={{ 
                      color: message.role === 'user' ? currentTheme.buttonText : currentTheme.textSecondary 
                    }}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.tokens && (
                      <span style={{ 
                        color: message.role === 'user' ? currentTheme.buttonText : currentTheme.textSecondary 
                      }}>
                        {message.tokens} tokens • ${message.cost?.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: currentTheme.surface,
                  color: currentTheme.textSecondary,
                  border: `1px solid ${currentTheme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: `2px solid ${currentTheme.border}`,
                    borderTop: `2px solid ${currentTheme.accent}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Claude is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '24px',
          right: '24px',
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: `0 4px 12px ${currentTheme.border}`,
          zIndex: 10
        }}>
          <div style={{ fontSize: '12px', color: currentTheme.textSecondary, marginBottom: '8px' }}>
            Suggested prompts:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  color: currentTheme.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = currentTheme.bg
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <textarea
            ref={inputRef as any}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Claude... (Shift+Enter for new line)"
            style={{
              width: '100%',
              minHeight: '44px',
              maxHeight: '120px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.border}`,
              background: currentTheme.input,
              color: currentTheme.text,
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            rows={1}
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: !input.trim() || isLoading ? currentTheme.textSecondary : currentTheme.button,
            color: !input.trim() || isLoading ? currentTheme.bg : currentTheme.buttonText,
            cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Sending...
            </>
          ) : (
            <>
              <span>📤</span>
              Send
            </>
          )}
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  )
}

export default EnhancedChatInterface