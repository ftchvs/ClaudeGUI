import { useState } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ExecutionStep {
  id: string
  title: string
  status: 'running' | 'completed' | 'error'
  output?: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Claude, your AI coding assistant. I can help you with code generation, file operations, debugging, and more. What would you like to work on?",
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // Simulate execution steps
    const step: ExecutionStep = {
      id: Date.now().toString(),
      title: 'Processing request...',
      status: 'running'
    }
    setExecutionSteps(prev => [...prev, step])
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'll help you with "${input}". This is a demonstration of the Claude GUI interface working properly!`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      
      // Update execution step
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
      padding: '20px', 
      background: '#1f2937', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <header style={{
          borderBottom: '1px solid #374151',
          paddingBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 10px 0'
          }}>
            Claude GUI
          </h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            AI-Powered Development Environment
          </p>
        </header>

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
                    <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </small>
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
            Version 1.0.0 | Ready for Development
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App