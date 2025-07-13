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
  const [showMenu, setShowMenu] = useState(false)
  
  const [kpiData, setKpiData] = useState<KPIData>({
    totalTokens: 12547,
    totalCost: 4.82,
    requestsToday: 23,
    avgResponseTime: 1.2,
    successRate: 98.5,
    activeSessions: 3
  })

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
      background: '#1f2937', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: '#111827',
        borderBottom: '1px solid #374151',
        padding: '0 20px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Claude GUI
          </h1>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: showMenu ? '#374151' : 'transparent',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ☰ Menu
            </button>
            
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                minWidth: '200px',
                zIndex: 50,
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
              }}>
                <div style={{ padding: '8px 0' }}>
                  <button style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '12px 16px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white',
                    cursor: 'pointer'
                  }}>
                    📁 File Explorer
                  </button>
                  <button style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '12px 16px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white',
                    cursor: 'pointer'
                  }}>
                    📊 Analytics
                  </button>
                  <button style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '12px 16px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white',
                    cursor: 'pointer'
                  }}>
                    🔌 MCP Servers
                  </button>
                  <button style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '12px 16px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white',
                    cursor: 'pointer'
                  }}>
                    📝 Project History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>●</span>
              <span>Claude Connected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#3b82f6' }}>●</span>
              <span>3 MCP Servers</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? '#374151' : 'transparent',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ⚙️
          </button>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          background: '#374151',
          borderBottom: '1px solid #4b5563',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f3f4f6' }}>Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db' }}>Theme</label>
                <select style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  background: '#1f2937', 
                  border: '1px solid #4b5563', 
                  color: 'white' 
                }}>
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db' }}>Model</label>
                <select style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  background: '#1f2937', 
                  border: '1px solid #4b5563', 
                  color: 'white' 
                }}>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Claude 3 Haiku</option>
                  <option>Claude 3 Opus</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db' }}>Max Tokens</label>
                <input type="number" defaultValue="4000" style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  background: '#1f2937', 
                  border: '1px solid #4b5563', 
                  color: 'white' 
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Dashboard */}
      <div style={{
        background: '#374151',
        borderBottom: '1px solid #4b5563',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#f3f4f6' }}>Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '15px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '5px' }}>Total Tokens</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {kpiData.totalTokens.toLocaleString()}
              </div>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '15px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '5px' }}>Total Cost</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                ${kpiData.totalCost.toFixed(3)}
              </div>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '15px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '5px' }}>Requests Today</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {kpiData.requestsToday}
              </div>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '15px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '5px' }}>Avg Response</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {kpiData.avgResponseTime.toFixed(1)}s
              </div>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '15px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '5px' }}>Success Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {kpiData.successRate}%
              </div>
            </div>
            <div style={{ background: '#1f2937', borderRadius: '8px', padding: '15px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '5px' }}>Active Sessions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {kpiData.activeSessions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '20px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <main style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            minHeight: '600px'
          }}>
            <section style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ margin: '0 0 15px 0', color: '#f3f4f6' }}>Chat Interface</h2>
              
              <div style={{
                background: '#1f2937',
                borderRadius: '6px',
                padding: '15px',
                minHeight: '400px',
                flex: 1,
                overflowY: 'auto',
                marginBottom: '15px'
              }}>
                {messages.map(message => (
                  <div key={message.id} style={{
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 15px',
                      borderRadius: '12px',
                      background: message.role === 'user' ? '#3b82f6' : '#4b5563',
                      color: 'white'
                    }}>
                      <p style={{ margin: '0 0 5px 0' }}>{message.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                          {message.timestamp.toLocaleTimeString()}
                        </small>
                        {message.tokens && (
                          <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>
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
                      padding: '10px 15px',
                      borderRadius: '12px',
                      background: '#4b5563',
                      color: '#9ca3af'
                    }}>
                      <span>Claude is thinking...</span>
                      <span style={{ animation: 'pulse 1.5s infinite' }}>●●●</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message here..."
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #4b5563',
                    background: '#1f2937',
                    color: 'white'
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: !input.trim() || isLoading ? '#6b7280' : '#3b82f6',
                    color: 'white',
                    cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Send
                </button>
              </div>
            </section>

            <section style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h2 style={{ margin: '0 0 15px 0', color: '#f3f4f6' }}>Execution Terminal</h2>
              <div style={{
                background: '#1f2937',
                borderRadius: '6px',
                padding: '15px',
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
                    color: '#9ca3af'
                  }}>
                    <div>
                      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚡</div>
                      <p>Ready for Execution</p>
                      <p style={{ fontSize: '0.875rem' }}>Send a message to see execution steps</p>
                    </div>
                  </div>
                ) : (
                  executionSteps.map(step => (
                    <div key={step.id} style={{
                      marginBottom: '15px',
                      padding: '12px',
                      background: '#374151',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${
                        step.status === 'running' ? '#3b82f6' :
                        step.status === 'completed' ? '#10b981' : '#ef4444'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          color: step.status === 'running' ? '#3b82f6' :
                                 step.status === 'completed' ? '#10b981' : '#ef4444'
                        }}>
                          {step.status === 'running' ? '⟳' : 
                           step.status === 'completed' ? '✓' : '✗'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>{step.title}</span>
                      </div>
                      {step.output && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '0.875rem', 
                          color: '#9ca3af',
                          fontFamily: 'monospace'
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
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#9ca3af'
          }}>
            <div>
              <span style={{ color: '#10b981' }}>●</span> Claude GUI Active
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