import React, { useState, useEffect } from 'react'
import TopNavigation from './components/layout/TopNavigation'
import SettingsPanel from './components/settings/SettingsPanel'
import KPIDashboard from './components/dashboard/KPIDashboard'
import EnhancedChatInterface from './components/chat/EnhancedChatInterface'
import EnhancedTerminal from './components/terminal/EnhancedTerminal'
import EnhancedFileExplorer from './components/visual/EnhancedFileExplorer'
import ClaudeCodeCommandCenter from './components/claude-code/ClaudeCodeCommandCenter'
import DiffViewerPanel from './components/diff/DiffViewerPanel'
import ProjectAnalysisDashboard from './components/analytics/ProjectAnalysisDashboard'
import TemplateGallery from './components/templates/TemplateGallery'
import WorkflowAutomation from './components/workflows/WorkflowAutomation'
import OnboardingOrchestrator from './components/onboarding/OnboardingOrchestrator'
import ProjectManager from './components/projects/ProjectManager'
import ErrorBoundary from './components/error/ErrorBoundary'
import ErrorToast from './components/error/ErrorToast'
import { getClaudeCodeService, isElectronEnvironment, type ServiceStatus } from './services/serviceProvider'
import { useErrorHandler } from './hooks/useErrorHandler'
import { claudeCodeDark, claudeCodeLight, type PremiumTheme } from './design-system/theme'
import { Icons } from './design-system/icons'

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
  // Error handling
  const { currentError, clearCurrentError, handleApiError, withErrorHandling } = useErrorHandler()

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('commands')
  const [isLoading, setIsLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

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
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    available: false,
    version: 'Loading...',
    environment: 'web',
    capabilities: [],
    features: {
      realCLI: false,
      fileWatching: false,
      terminalExec: false,
      projectAnalysis: false,
      codeGeneration: false
    },
    hasApiKey: false
  })

  // Premium theme configuration
  const currentTheme: PremiumTheme = isDarkMode ? claudeCodeDark : claudeCodeLight
  
  // Legacy theme adapter for components not yet migrated
  const legacyTheme = {
    bg: currentTheme.colors.background,
    surface: currentTheme.colors.surface,
    border: currentTheme.colors.border,
    text: currentTheme.colors.text,
    textSecondary: currentTheme.colors.textSecondary,
    accent: currentTheme.colors.primary,
    button: currentTheme.colors.primary,
    buttonText: currentTheme.colors.textInverse,
    input: currentTheme.colors.surfaceHover
  }

  // Initialize component
  useEffect(() => {
    // Load saved API key
    const savedApiKey = localStorage.getItem('claude_api_key') || ''
    setApiKey(savedApiKey)
    
    // Update service status with dynamic service
    const claudeCodeService = getClaudeCodeService()
    claudeCodeService.getStatus().then(status => {
      setServiceStatus(status)
    })
    
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
      // Send to Claude service with error handling
      const claudeCodeService = getClaudeCodeService()
      const response = await withErrorHandling(
        () => claudeCodeService.chat(message, {
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          currentDirectory: '/workspace/ClaudeGUI'
        }),
        'api'
      )() as any

      if (!response) {
        throw new Error('Failed to get response from Claude service')
      }

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
      handleApiError(error)
      
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
        content: `I apologize, but I encountered an error while processing your request. Please check your API configuration and try again.`,
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
      // Execute command via service with error handling
      const claudeCodeService = getClaudeCodeService()
      const response = await withErrorHandling(
        () => claudeCodeService.executeTerminalCommand(command),
        'api'
      )() as any

      if (!response) {
        throw new Error('Failed to execute command')
      }

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
      handleApiError(error)
      
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
    const claudeCodeService = getClaudeCodeService()
    claudeCodeService.setApiKey(newApiKey)
    claudeCodeService.getStatus().then(status => {
      setServiceStatus(status)
    })
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

  const handleFileSelect = (file: any) => {
    // Add selected file to messages as context
    const fileMessage: Message = {
      id: Date.now().toString(),
      content: `📁 Selected file: ${file.name} (${file.path})`,
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, fileMessage])
  }

  const handleFileEdit = async (file: any) => {
    // Request Claude to edit the file
    const editRequest = `Please help me edit the file: ${file.path}. The file is ${file.type === 'file' ? `a ${file.language} file` : 'a directory'}.`
    await handleSendMessage(editRequest)
  }

  const handleClaudeAnalyze = async (file: any) => {
    // Request Claude to analyze the file
    const analyzeRequest = `Please analyze the file: ${file.path}. Provide insights about code quality, potential improvements, and best practices. The file is ${file.type === 'file' ? `a ${file.language} file` : 'a directory'}.`
    await handleSendMessage(analyzeRequest)
  }

  const handleOnboardingComplete = (result: any) => {
    console.log('Onboarding completed:', result)
    setShowOnboarding(false)
    
    // Apply any settings from the onboarding
    if (result.setupConfig) {
      if (result.setupConfig.theme) {
        setIsDarkMode(result.setupConfig.theme === 'dark')
      }
      if (result.setupConfig.apiKey) {
        handleApiKeyChange(result.setupConfig.apiKey)
      }
    }
  }

  return (
    <ErrorBoundary>
      <div style={{ 
        background: currentTheme.colors.background, 
        color: currentTheme.colors.text, 
        minHeight: '100vh',
        fontFamily: currentTheme.typography.fontFamily.body,
        fontSize: currentTheme.typography.fontSize.base,
        lineHeight: currentTheme.typography.lineHeight.normal,
        transition: `all ${currentTheme.animation.duration.normal} ${currentTheme.animation.easing.easeOut}`
      }}>
      {/* Top Navigation */}
      <TopNavigation
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        showSettings={showSettings}
        onSettingsToggle={handleSettingsToggle}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentTheme={legacyTheme}
      />

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          isDarkMode={isDarkMode}
          currentTheme={legacyTheme}
          onApiKeyChange={handleApiKeyChange}
          apiKey={apiKey}
        />
      )}

      {/* KPI Dashboard */}
      <KPIDashboard
        kpiData={kpiData}
        currentTheme={legacyTheme}
      />

      {/* Main Content Area */}
      <div style={{ 
        padding: currentTheme.spacing[6],
        background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.surface} 100%)`,
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: currentTheme.spacing[6]
        }}>
          {/* Main Workspace */}
          <main style={{
            display: 'grid',
            gridTemplateColumns: (activeTab === 'files' || activeTab === 'commands' || activeTab === 'projects') ? '1fr' : '1fr 1fr',
            gap: currentTheme.spacing[6],
            minHeight: '600px',
            position: 'relative'
          }}>
            {activeTab === 'commands' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Error size={20} color={currentTheme.colors.error} />
                    <span>Command center temporarily unavailable</span>
                  </div>
                </div>
              }>
                <ClaudeCodeCommandCenter />
              </ErrorBoundary>
            )}

            {activeTab === 'projects' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md,
                  gridColumn: '1 / -1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Error size={20} color={currentTheme.colors.error} />
                    <span>Project manager temporarily unavailable</span>
                  </div>
                </div>
              }>
                <ProjectManager
                  className="h-full w-full"
                  onProjectSelect={(project) => {
                    console.log('Selected project:', project)
                    // Could show project details or switch context
                  }}
                  onSessionStart={(project, session) => {
                    console.log('Starting session for project:', project, session)
                    // Could switch to commands tab and start session
                    setActiveTab('commands')
                  }}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'chat' && (
              <>
                {/* Chat Interface */}
                <ErrorBoundary fallback={
                  <div style={{
                    background: currentTheme.colors.surface,
                    border: `1px solid ${currentTheme.colors.border}`,
                    borderRadius: currentTheme.borderRadius.lg,
                    padding: currentTheme.spacing[6],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentTheme.colors.textSecondary,
                    boxShadow: currentTheme.shadows.md
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                      <Icons.Error size={20} color={currentTheme.colors.error} />
                      <span>Chat interface temporarily unavailable</span>
                    </div>
                  </div>
                }>
                  <EnhancedChatInterface
                    onCodeGenerate={(code, language, filename) => {
                      console.log('Code generated:', { code, language, filename })
                    }}
                    onCommandExecute={(command) => {
                      console.log('Command to execute:', command)
                    }}
                    onFileSelect={handleFileSelect}
                  />
                </ErrorBoundary>

                {/* Execution Terminal */}
                <ErrorBoundary fallback={
                  <div style={{
                    background: currentTheme.colors.surface,
                    border: `1px solid ${currentTheme.colors.border}`,
                    borderRadius: currentTheme.borderRadius.lg,
                    padding: currentTheme.spacing[6],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentTheme.colors.textSecondary,
                    boxShadow: currentTheme.shadows.md
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                      <Icons.Terminal size={20} color={currentTheme.colors.warning} />
                      <span>Terminal interface temporarily unavailable</span>
                    </div>
                  </div>
                }>
                  <EnhancedTerminal
                    executionSteps={executionSteps}
                    onExecuteCommand={handleExecuteCommand}
                    currentTheme={legacyTheme}
                  />
                </ErrorBoundary>
              </>
            )}

            {activeTab === 'files' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Folder size={20} color={currentTheme.colors.warning} />
                    <span>File explorer temporarily unavailable</span>
                  </div>
                </div>
              }>
                <EnhancedFileExplorer
                  rootPath="/Users/felipetavareschaves/Developer/ClaudeGUI"
                  onFileSelect={handleFileSelect}
                  onFileEdit={handleFileEdit}
                  onClaudeAnalyze={handleClaudeAnalyze}
                  showGitStatus={true}
                  showClaudeInsights={true}
                  className="w-full"
                />
              </ErrorBoundary>
            )}

            {activeTab === 'diff' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Error size={20} color={currentTheme.colors.error} />
                    <span>Diff viewer temporarily unavailable</span>
                  </div>
                </div>
              }>
                <DiffViewerPanel
                  onFileAccepted={(filename) => {
                    console.log('File accepted:', filename)
                    // Here you would integrate with Claude Code CLI to apply the changes
                  }}
                  onFileRejected={(filename) => {
                    console.log('File rejected:', filename)
                    // Here you would discard the changes
                  }}
                  onSessionAccepted={(sessionId) => {
                    console.log('Session accepted:', sessionId)
                    // Here you would apply all changes in the session
                  }}
                  onSessionRejected={(sessionId) => {
                    console.log('Session rejected:', sessionId)
                    // Here you would discard all changes in the session
                  }}
                  className="h-full"
                />
              </ErrorBoundary>
            )}

            {activeTab === 'templates' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Error size={20} color={currentTheme.colors.error} />
                    <span>Template gallery temporarily unavailable</span>
                  </div>
                </div>
              }>
                <TemplateGallery
                  onTemplateGenerate={(template, customizations) => {
                    console.log('Template generated:', template.name, customizations)
                    // Add a message to the chat about the template generation
                    const templateMessage: Message = {
                      id: Date.now().toString(),
                      content: `🧩 Generated template: ${template.name} with customizations: ${JSON.stringify(customizations)}`,
                      role: 'assistant',
                      timestamp: new Date()
                    }
                    setMessages(prev => [...prev, templateMessage])
                    
                    // Switch to commands tab to see the generated code
                    setActiveTab('commands')
                  }}
                  className="h-full"
                />
              </ErrorBoundary>
            )}

            {activeTab === 'analytics' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md,
                  gridColumn: '1 / -1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Error size={20} color={currentTheme.colors.error} />
                    <span>Analytics dashboard temporarily unavailable</span>
                  </div>
                </div>
              }>
                <ProjectAnalysisDashboard
                  projectPath="/Users/felipetavareschaves/Developer/ClaudeGUI"
                  className="h-full w-full"
                />
              </ErrorBoundary>
            )}


            {activeTab === 'workflows' && (
              <ErrorBoundary fallback={
                <div style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.borderRadius.lg,
                  padding: currentTheme.spacing[6],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.colors.textSecondary,
                  boxShadow: currentTheme.shadows.md,
                  gridColumn: '1 / -1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                    <Icons.Error size={20} color={currentTheme.colors.error} />
                    <span>Workflow automation temporarily unavailable</span>
                  </div>
                </div>
              }>
                <WorkflowAutomation
                  onWorkflowComplete={(workflow, results) => {
                    console.log('Workflow completed:', workflow.name, results)
                    // Add a message to the chat about the workflow completion
                    const workflowMessage: Message = {
                      id: Date.now().toString(),
                      content: `🔄 Workflow "${workflow.name}" completed successfully with ${results.length} steps executed.`,
                      role: 'assistant',
                      timestamp: new Date()
                    }
                    setMessages(prev => [...prev, workflowMessage])
                    
                    // Show notification or switch to results view
                    setActiveTab('chat')
                  }}
                  className="h-full"
                />
              </ErrorBoundary>
            )}
          </main>

          {/* Status Footer */}
          <footer style={{
            borderTop: `1px solid ${currentTheme.colors.border}`,
            paddingTop: currentTheme.spacing[5],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: currentTheme.typography.fontSize.sm,
            color: currentTheme.colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily.body
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[4] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                <Icons.Claude 
                  size={16} 
                  color={serviceStatus.available ? currentTheme.colors.success : currentTheme.colors.error}
                />
                <span>
                  {serviceStatus.available ? 'Claude Service Active' : 'Claude Service Offline'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                <Icons.Settings size={14} color={currentTheme.colors.textTertiary} />
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  Environment: {serviceStatus.environment}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
                {serviceStatus.hasApiKey ? (
                  <Icons.Check size={14} color={currentTheme.colors.success} />
                ) : (
                  <Icons.Warning size={14} color={currentTheme.colors.warning} />
                )}
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  API Key: {serviceStatus.hasApiKey ? 'Configured' : 'Missing'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2] }}>
              <Icons.AISpark size={14} color={currentTheme.colors.primary} />
              <span style={{ 
                fontFamily: currentTheme.typography.fontFamily.code,
                fontSize: currentTheme.typography.fontSize.xs,
                color: currentTheme.colors.textTertiary
              }}>
                Claude GUI v2.0.0 | Premium Claude Code Interface
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Error Toast */}
      <ErrorToast
        error={currentError}
        onDismiss={clearCurrentError}
      />

      {/* Onboarding Experience */}
      <OnboardingOrchestrator
        onComplete={handleOnboardingComplete}
        forceShow={false} // Set to true for testing
      />
    </div>
    </ErrorBoundary>
  )
}

export default EnhancedApp