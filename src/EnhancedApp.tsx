import React, { useState, useEffect } from 'react'
import TopNavigation from './components/layout/TopNavigation'
import SettingsPanel from './components/settings/SettingsPanel'
import KPIDashboard from './components/dashboard/KPIDashboard'
import EnhancedChatInterface from './components/chat/EnhancedChatInterface'
import EnhancedTerminal from './components/terminal/EnhancedTerminal'
import { webClaudeCodeService } from './services/webClaudeCodeService'

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
  command?: string
  duration?: number
  timestamp: Date
}

interface KPIData {
  totalTokens: number
  totalCost: number
  requestsToday: number
  avgResponseTime: number
  successRate: number
  activeSessions: number
}

function EnhancedApp() {
  // UI State
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [isLoading, setIsLoading] = useState(false)

  // Data State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Claude, your AI coding assistant. I can help you with code generation, file operations, debugging, and more. What would you like to work on today?",
      role: 'assistant',
      timestamp: new Date(),
      tokens: 45,
      cost: 0.002
    }
  ])
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [kpiData, setKpiData] = useState<KPIData>({
    totalTokens: 12547,
    totalCost: 4.82,
    requestsToday: 23,
    avgResponseTime: 1.2,
    successRate: 98.5,
    activeSessions: 3
  })

  // Service State
  const [apiKey, setApiKey] = useState('')
  const [serviceStatus, setServiceStatus] = useState(webClaudeCodeService.getStatus())

  // Theme configuration
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

  // Initialize component
  useEffect(() => {
    // Load saved API key
    const savedApiKey = localStorage.getItem('claude_api_key') || ''
    setApiKey(savedApiKey)
    
    // Update service status
    setServiceStatus(webClaudeCodeService.getStatus())
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme_preference')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Create user message
    const userTokens = Math.floor(message.length / 4)
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
      tokens: userTokens,
      cost: userTokens * 0.00003
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Update KPIs
    setKpiData(prev => ({
      ...prev,
      totalTokens: prev.totalTokens + userTokens,
      totalCost: prev.totalCost + (userTokens * 0.00003),
      requestsToday: prev.requestsToday + 1
    }))

    // Create execution step
    const executionStep: ExecutionStep = {
      id: Date.now().toString(),
      title: 'Processing request with Claude...',
      status: 'running',
      timestamp: new Date()
    }
    setExecutionSteps(prev => [...prev, executionStep])

    try {
      // Send to Claude service
      const response = await webClaudeCodeService.chat(message, {
        conversationHistory: messages.slice(-10), // Last 10 messages for context
        currentDirectory: '/workspace/ClaudeGUI'
      })

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.output,
        role: 'assistant',
        timestamp: new Date(),
        tokens: response.tokens,
        cost: response.cost
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update KPIs with response data
      if (response.tokens && response.cost) {
        setKpiData(prev => ({
          ...prev,
          totalTokens: prev.totalTokens + response.tokens!,
          totalCost: prev.totalCost + response.cost!,
          avgResponseTime: (prev.avgResponseTime + response.duration) / 2,
          successRate: response.success ? Math.min(99.9, prev.successRate + 0.1) : Math.max(90, prev.successRate - 1)
        }))
      }

      // Update execution step
      setExecutionSteps(prev => prev.map(step => 
        step.id === executionStep.id 
          ? { 
              ...step, 
              status: response.success ? 'completed' : 'error', 
              output: response.success ? 'Request processed successfully' : response.error,
              duration: response.duration
            }
          : step
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Update execution step with error
      setExecutionSteps(prev => prev.map(step => 
        step.id === executionStep.id 
          ? { 
              ...step, 
              status: 'error',
              output: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          : step
      ))

      // Create error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your API configuration.`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteCommand = async (command: string) => {
    // Create execution step
    const executionStep: ExecutionStep = {
      id: Date.now().toString(),
      title: `Executing: ${command}`,
      status: 'running',
      command,
      timestamp: new Date()
    }
    setExecutionSteps(prev => [...prev, executionStep])

    try {
      // Execute command via service
      const response = await webClaudeCodeService.executeTerminalCommand(command)

      // Update execution step
      setExecutionSteps(prev => prev.map(step => 
        step.id === executionStep.id 
          ? { 
              ...step, 
              status: response.success ? 'completed' : 'error',
              output: response.output || response.error,
              duration: response.duration
            }
          : step
      ))

    } catch (error) {
      console.error('Error executing command:', error)
      
      setExecutionSteps(prev => prev.map(step => 
        step.id === executionStep.id 
          ? { 
              ...step, 
              status: 'error',
              output: error instanceof Error ? error.message : 'Command execution failed'
            }
          : step
      ))
    }
  }

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey)
    webClaudeCodeService.setApiKey(newApiKey)
    setServiceStatus(webClaudeCodeService.getStatus())
  }

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div style={{ 
      background: currentTheme.bg, 
      color: currentTheme.text, 
      minHeight: '100vh',
      fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {/* Top Navigation */}
      <TopNavigation
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        showSettings={showSettings}
        onSettingsToggle={handleSettingsToggle}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentTheme={currentTheme}
      />

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          isDarkMode={isDarkMode}
          currentTheme={currentTheme}
          onApiKeyChange={handleApiKeyChange}
          apiKey={apiKey}
        />
      )}

      {/* KPI Dashboard */}
      <KPIDashboard
        kpiData={kpiData}
        currentTheme={currentTheme}
      />

      {/* Main Content Area */}
      <div style={{ padding: '24px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Main Workspace */}
          <main style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            minHeight: '600px'
          }}>
            {/* Chat Interface */}
            <EnhancedChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              currentTheme={currentTheme}
            />

            {/* Execution Terminal */}
            <EnhancedTerminal
              executionSteps={executionSteps}
              onExecuteCommand={handleExecuteCommand}
              currentTheme={currentTheme}
            />
          </main>

          {/* Status Footer */}
          <footer style={{
            borderTop: `1px solid ${currentTheme.border}`,
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: currentTheme.textSecondary
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  color: serviceStatus.available ? currentTheme.accent : '#ef4444', 
                  fontSize: '12px' 
                }}>
                  ●
                </span> 
                <span>
                  {serviceStatus.available ? 'Claude Service Active' : 'Claude Service Offline'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: currentTheme.textSecondary }}>
                  Environment: {serviceStatus.environment}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: currentTheme.textSecondary }}>
                  API Key: {serviceStatus.hasApiKey ? '✓ Configured' : '✗ Missing'}
                </span>
              </div>
            </div>
            <div>
              <span>Claude GUI v2.0.0 | Enhanced Production-Ready Interface</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default EnhancedApp