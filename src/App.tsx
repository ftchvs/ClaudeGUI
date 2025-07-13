import { useState } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  tokens?: number
  cost?: number
}

interface ExecutionStep {
  id: string
  title: string
  status: 'running' | 'completed' | 'error'
  output?: string
}

interface KPIData {
  totalTokens: number
  totalCost: number
  requestsToday: number
  avgResponseTime: number
  successRate: number
  activeSessions: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Claude, your AI coding assistant. I can help you with code generation, file operations, debugging, and more. What would you like to work on?",
      role: 'assistant',
      timestamp: new Date(),
      tokens: 45,
      cost: 0.002
    }
  ])
  const [input, setInput] = useState('')
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState('chat')
  
  const [kpiData, setKpiData] = useState<KPIData>({
    totalTokens: 12547,
    totalCost: 4.82,
    requestsToday: 23,
    avgResponseTime: 1.2,
    successRate: 98.5,
    activeSessions: 3
  })

  // OpenAI-inspired theme colors
  const theme = {
    dark: {
      bg: '#000000',
      surface: '#1a1a1a',
      border: '#333333',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      accent: '#10a37f',
      button: '#ffffff',
      buttonText: '#000000',
      input: '#2d2d2d'
    },
    light: {
      bg: '#ffffff',
      surface: '#f7f7f8',
      border: '#e5e5e5',
      text: '#000000',
      textSecondary: '#6b6b6b',
      accent: '#10a37f',
      button: '#000000',
      buttonText: '#ffffff',
      input: '#ffffff'
    }
  }
  
  const currentTheme = isDarkMode ? theme.dark : theme.light

  const handleSend = () => {
    if (!input.trim()) return
    
    const userTokens = Math.floor(input.length / 4)
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      tokens: userTokens,
      cost: userTokens * 0.00003
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    setKpiData(prev => ({
      ...prev,
      totalTokens: prev.totalTokens + userTokens,
      totalCost: prev.totalCost + (userTokens * 0.00003),
      requestsToday: prev.requestsToday + 1
    }))
    
    const step: ExecutionStep = {
      id: Date.now().toString(),
      title: 'Processing request...',
      status: 'running'
    }
    setExecutionSteps(prev => [...prev, step])
    
    setTimeout(() => {
      const responseTokens = Math.floor(Math.random() * 200) + 50
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'll help you with "${userMessage.content}". This is a demonstration of the Claude GUI interface working properly! I can assist with code generation, debugging, file operations, and much more.`,
        role: 'assistant',
        timestamp: new Date(),
        tokens: responseTokens,
        cost: responseTokens * 0.00006
      }
      setMessages(prev => [...prev, aiMessage])
      
      setKpiData(prev => ({
        ...prev,
        totalTokens: prev.totalTokens + responseTokens,
        totalCost: prev.totalCost + (responseTokens * 0.00006),
        avgResponseTime: (prev.avgResponseTime + Math.random() * 2 + 0.5) / 2
      }))
      
      setExecutionSteps(prev => prev.map(s => 
        s.id === step.id 
          ? { ...s, status: 'completed' as const, output: 'Request processed successfully' }
          : s
      ))
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div style={{ 
      background: currentTheme.bg, 
      color: currentTheme.text, 
      minHeight: '100vh',
      fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {/* OpenAI-inspired Top Navigation */}
      <nav style={{
        background: currentTheme.bg,
        borderBottom: `1px solid ${currentTheme.border}`,
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: currentTheme.accent,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              C
            </div>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: currentTheme.text,
              margin: 0
            }}>
              Claude GUI
            </h1>
          </div>
          
          {/* Horizontal Menu Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'files', label: 'Files', icon: '📁' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'servers', label: 'MCP', icon: '🔌' },
              { id: 'history', label: 'History', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? currentTheme.surface : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: activeTab === tab.id ? currentTheme.text : currentTheme.textSecondary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = currentTheme.surface
                    target.style.color = currentTheme.text
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = 'transparent'
                    target.style.color = currentTheme.textSecondary
                  }
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: currentTheme.textSecondary }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: currentTheme.accent 
              }}></div>
              <span>Connected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>3 Servers</span>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              background: 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '8px',
              color: currentTheme.text,
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = currentTheme.surface}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = 'transparent'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {/* Settings */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? currentTheme.surface : 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '8px',
              color: currentTheme.text,
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!showSettings) (e.target as HTMLButtonElement).style.background = currentTheme.surface
            }}
            onMouseOut={(e) => {
              if (!showSettings) (e.target as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            ⚙️
          </button>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          background: currentTheme.surface,
          borderBottom: `1px solid ${currentTheme.border}`,
          padding: '24px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 20px 0', color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: currentTheme.text, fontSize: '14px', fontWeight: '500' }}>Theme</label>
                <select style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: currentTheme.input, 
                  border: `1px solid ${currentTheme.border}`, 
                  color: currentTheme.text,
                  fontSize: '14px',
                  outline: 'none'
                }}>
                  <option>{isDarkMode ? 'Dark' : 'Light'}</option>
                  <option>{isDarkMode ? 'Light' : 'Dark'}</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: currentTheme.text, fontSize: '14px', fontWeight: '500' }}>Model</label>
                <select style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: currentTheme.input, 
                  border: `1px solid ${currentTheme.border}`, 
                  color: currentTheme.text,
                  fontSize: '14px',
                  outline: 'none'
                }}>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Claude 3 Haiku</option>
                  <option>Claude 3 Opus</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: currentTheme.text, fontSize: '14px', fontWeight: '500' }}>Max Tokens</label>
                <input type="number" defaultValue="4000" style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: currentTheme.input, 
                  border: `1px solid ${currentTheme.border}`, 
                  color: currentTheme.text,
                  fontSize: '14px',
                  outline: 'none'
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Dashboard */}
      <div style={{
        background: currentTheme.bg,
        borderBottom: `1px solid ${currentTheme.border}`,
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 20px 0', color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ 
              background: currentTheme.surface, 
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px', 
              padding: '20px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Total Tokens</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.accent }}>
                {kpiData.totalTokens.toLocaleString()}
              </div>
            </div>
            <div style={{ 
              background: currentTheme.surface, 
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px', 
              padding: '20px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Total Cost</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.accent }}>
                ${kpiData.totalCost.toFixed(3)}
              </div>
            </div>
            <div style={{ 
              background: currentTheme.surface, 
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px', 
              padding: '20px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Requests Today</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.text }}>
                {kpiData.requestsToday}
              </div>
            </div>
            <div style={{ 
              background: currentTheme.surface, 
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px', 
              padding: '20px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Avg Response</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.text }}>
                {kpiData.avgResponseTime.toFixed(1)}s
              </div>
            </div>
            <div style={{ 
              background: currentTheme.surface, 
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px', 
              padding: '20px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Success Rate</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.accent }}>
                {kpiData.successRate}%
              </div>
            </div>
            <div style={{ 
              background: currentTheme.surface, 
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px', 
              padding: '20px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Active Sessions</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.text }}>
                {kpiData.activeSessions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '24px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <main style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            minHeight: '600px'
          }}>
            {/* Chat Interface */}
            <section style={{
              background: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ margin: '0 0 20px 0', color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>Chat</h2>
              
              <div style={{
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '16px',
                minHeight: '400px',
                flex: 1,
                overflowY: 'auto',
                marginBottom: '16px'
              }}>
                {messages.map(message => (
                  <div key={message.id} style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: message.role === 'user' ? currentTheme.button : currentTheme.surface,
                      color: message.role === 'user' ? currentTheme.buttonText : currentTheme.text,
                      border: `1px solid ${currentTheme.border}`
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' }}>{message.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ opacity: 0.7, fontSize: '12px', color: message.role === 'user' ? currentTheme.buttonText : currentTheme.textSecondary }}>
                          {message.timestamp.toLocaleTimeString()}
                        </small>
                        {message.tokens && (
                          <small style={{ opacity: 0.7, fontSize: '12px', color: message.role === 'user' ? currentTheme.buttonText : currentTheme.textSecondary }}>
                            {message.tokens} tokens • ${message.cost?.toFixed(4)}
                          </small>
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
                      border: `1px solid ${currentTheme.border}`
                    }}>
                      <span>Claude is thinking</span>
                      <span style={{ animation: 'pulse 1.5s infinite' }}>...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message Claude..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${currentTheme.border}`,
                    background: currentTheme.input,
                    color: currentTheme.text,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
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
                    transition: 'all 0.2s ease'
                  }}
                >
                  Send
                </button>
              </div>
            </section>

            {/* Execution Terminal */}
            <section style={{
              background: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ margin: '0 0 20px 0', color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>Execution</h2>
              <div style={{
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '16px',
                minHeight: '400px',
                overflowY: 'auto'
              }}>
                {executionSteps.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: currentTheme.textSecondary
                  }}>
                    <div>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>Ready for Execution</p>
                      <p style={{ margin: 0, fontSize: '14px' }}>Send a message to see execution steps</p>
                    </div>
                  </div>
                ) : (
                  executionSteps.map(step => (
                    <div key={step.id} style={{
                      marginBottom: '12px',
                      padding: '16px',
                      background: currentTheme.surface,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        step.status === 'running' ? currentTheme.accent :
                        step.status === 'completed' ? currentTheme.accent : '#ef4444'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          color: step.status === 'running' ? currentTheme.accent :
                                 step.status === 'completed' ? currentTheme.accent : '#ef4444',
                          fontSize: '14px'
                        }}>
                          {step.status === 'running' ? '⟳' : 
                           step.status === 'completed' ? '✓' : '✗'}
                        </span>
                        <span style={{ fontWeight: '500', fontSize: '14px', color: currentTheme.text }}>{step.title}</span>
                      </div>
                      {step.output && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '13px', 
                          color: currentTheme.textSecondary,
                          fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
                          background: currentTheme.bg,
                          padding: '8px',
                          borderRadius: '4px'
                        }}>
                          {step.output}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>

          <footer style={{
            borderTop: `1px solid ${currentTheme.border}`,
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: currentTheme.textSecondary
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: currentTheme.accent, fontSize: '12px' }}>●</span> 
              <span>Claude GUI Active</span>
            </div>
            <div>
              Version 2.0.0 | Enhanced with Dashboard & Analytics
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App