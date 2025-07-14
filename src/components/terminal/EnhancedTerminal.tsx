import React, { useState, useRef, useEffect } from 'react'
import { webClaudeCodeService } from '@/services/webClaudeCodeService'

interface ExecutionStep {
  id: string
  title: string
  status: 'running' | 'completed' | 'error'
  output?: string
  command?: string
  duration?: number
  timestamp: Date
}

interface EnhancedTerminalProps {
  executionSteps: ExecutionStep[]
  onExecuteCommand: (command: string) => void
  currentTheme: any
}

export const EnhancedTerminal: React.FC<EnhancedTerminalProps> = ({
  executionSteps,
  onExecuteCommand,
  currentTheme
}) => {
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commonCommands = [
    'npm install',
    'npm run build',
    'npm run dev',
    'npm test',
    'git status',
    'git add .',
    'git commit -m "message"',
    'ls',
    'pwd',
    'npm run typecheck',
    'npm run lint'
  ]

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [executionSteps])

  const handleExecute = async () => {
    if (!command.trim() || isExecuting) return

    const cmd = command.trim()
    setCommand('')
    setIsExecuting(true)

    // Add to history
    setCommandHistory(prev => [...prev.slice(-20), cmd])
    setHistoryIndex(-1)

    try {
      onExecuteCommand(cmd)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleExecute()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCommand('')
        } else {
          setHistoryIndex(newIndex)
          setCommand(commandHistory[newIndex])
        }
      }
    }
  }

  const handleCommandClick = (cmd: string) => {
    setCommand(cmd)
    inputRef.current?.focus()
  }

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'running': return '⟳'
      case 'completed': return '✓'
      case 'error': return '✗'
      default: return '○'
    }
  }

  const getStatusColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'running': return currentTheme.accent
      case 'completed': return '#10b981'
      case 'error': return '#ef4444'
      default: return currentTheme.textSecondary
    }
  }

  return (
    <section style={{
      background: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>
          Execution Terminal
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
            <span>Steps: {executionSteps.length}</span>
          </div>
          <button
            onClick={() => {
              setCommand('')
              inputRef.current?.focus()
            }}
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
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        style={{
          background: currentTheme.bg,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '16px',
          minHeight: '300px',
          maxHeight: '400px',
          flex: 1,
          overflowY: 'auto',
          marginBottom: '16px',
          fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
          fontSize: '13px',
          lineHeight: '1.4'
        }}
      >
        {executionSteps.length === 0 ? (
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
            <div style={{ fontSize: '48px' }}>⚡</div>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>
                Ready for Execution
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Type a command below or send a message to see execution steps
              </p>
            </div>
          </div>
        ) : (
          <div>
            {executionSteps.map(step => (
              <div key={step.id} style={{
                marginBottom: '16px',
                padding: '12px',
                background: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                borderLeft: `4px solid ${getStatusColor(step.status)}`
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      color: getStatusColor(step.status),
                      fontSize: '14px',
                      animation: step.status === 'running' ? 'spin 1s linear infinite' : 'none'
                    }}>
                      {getStatusIcon(step.status)}
                    </span>
                    <span style={{ 
                      fontWeight: '500', 
                      fontSize: '14px', 
                      color: currentTheme.text 
                    }}>
                      {step.title}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: currentTheme.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{step.timestamp.toLocaleTimeString()}</span>
                    {step.duration && (
                      <span>({step.duration}ms)</span>
                    )}
                  </div>
                </div>

                {step.command && (
                  <div style={{
                    fontSize: '12px',
                    color: currentTheme.accent,
                    marginBottom: '8px',
                    fontFamily: 'inherit',
                    background: currentTheme.bg,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${currentTheme.border}`
                  }}>
                    $ {step.command}
                  </div>
                )}

                {step.output && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: currentTheme.textSecondary,
                    fontFamily: 'inherit',
                    background: currentTheme.bg,
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${currentTheme.border}`,
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {step.output}
                  </div>
                )}

                {step.status === 'running' && (
                  <div style={{
                    fontSize: '12px',
                    color: currentTheme.accent,
                    fontStyle: 'italic',
                    marginTop: '8px'
                  }}>
                    Executing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Common Commands */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          fontSize: '12px', 
          color: currentTheme.textSecondary, 
          marginBottom: '8px' 
        }}>
          Common commands:
        </div>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px' 
        }}>
          {commonCommands.slice(0, 6).map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleCommandClick(cmd)}
              style={{
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                color: currentTheme.textSecondary,
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = currentTheme.surface
                e.currentTarget.style.color = currentTheme.text
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = currentTheme.bg
                e.currentTarget.style.color = currentTheme.textSecondary
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{
          color: currentTheme.accent,
          fontSize: '14px',
          fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
          fontWeight: '500'
        }}>
          $
        </div>
        <input 
          ref={inputRef}
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter command... (↑↓ for history)"
          disabled={isExecuting}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '6px',
            border: `1px solid ${currentTheme.border}`,
            background: currentTheme.input,
            color: currentTheme.text,
            fontSize: '14px',
            fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
            outline: 'none',
            opacity: isExecuting ? 0.6 : 1
          }}
        />
        <button 
          onClick={handleExecute}
          disabled={!command.trim() || isExecuting}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            background: !command.trim() || isExecuting ? currentTheme.textSecondary : currentTheme.accent,
            color: !command.trim() || isExecuting ? currentTheme.bg : 'white',
            cursor: !command.trim() || isExecuting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isExecuting ? (
            <>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Running...
            </>
          ) : (
            <>
              <span>▶️</span>
              Execute
            </>
          )}
        </button>
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <div style={{ 
          marginTop: '12px',
          fontSize: '12px',
          color: currentTheme.textSecondary 
        }}>
          History: {commandHistory.slice(-3).map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleCommandClick(cmd)}
              style={{
                background: 'transparent',
                border: 'none',
                color: currentTheme.accent,
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
                marginLeft: '8px',
                textDecoration: 'underline'
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

export default EnhancedTerminal