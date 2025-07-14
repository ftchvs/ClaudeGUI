/**
 * Setup Wizard Component
 * 
 * Multi-step wizard for configuring Claude Code CLI integration
 * Guides users through API key setup, environment detection, and preferences
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { getClaudeCodeService, type ServiceStatus } from '../../services/serviceProvider'

interface SetupWizardProps {
  className?: string
  onComplete?: (config: SetupConfig) => void
  onSkip?: () => void
}

interface SetupConfig {
  apiKey: string
  environment: 'web' | 'electron' | 'desktop'
  projectPath: string
  enableFileWatching: boolean
  enableAutoSave: boolean
  theme: 'dark' | 'light' | 'auto'
  enableAnalytics: boolean
}

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ReactNode
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  className = '',
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<SetupConfig>({
    apiKey: '',
    environment: 'web',
    projectPath: '',
    enableFileWatching: true,
    enableAutoSave: true,
    theme: 'dark',
    enableAnalytics: true
  })
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    // Detect environment and pre-populate config
    const claudeCodeService = getClaudeCodeService()
    claudeCodeService.getStatus().then(status => {
      setServiceStatus(status)
      setConfig(prev => ({
        ...prev,
        environment: status.environment as any
      }))
    })

    // Load saved API key if available
    const savedApiKey = localStorage.getItem('claude_api_key') || ''
    if (savedApiKey) {
      setConfig(prev => ({ ...prev, apiKey: savedApiKey }))
    }

    // Detect project path
    const currentPath = window.location.pathname
    if (currentPath && currentPath !== '/') {
      setConfig(prev => ({ ...prev, projectPath: currentPath }))
    }
  }, [])

  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey.trim()) {
      setValidationError('API key is required')
      return false
    }

    if (!apiKey.startsWith('sk-ant-')) {
      setValidationError('Invalid API key format. Claude API keys start with "sk-ant-"')
      return false
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      const claudeCodeService = getClaudeCodeService()
      claudeCodeService.setApiKey(apiKey)
      const status = await claudeCodeService.getStatus()
      
      if (status.hasApiKey) {
        setValidationError(null)
        return true
      } else {
        setValidationError('API key validation failed. Please check your key.')
        return false
      }
    } catch (error) {
      setValidationError('Failed to validate API key. Please try again.')
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 0) {
      const isValid = await validateApiKey(config.apiKey)
      if (!isValid) return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save configuration
    localStorage.setItem('claude_api_key', config.apiKey)
    localStorage.setItem('claude_setup_completed', 'true')
    localStorage.setItem('theme_preference', config.theme)
    localStorage.setItem('setup_config', JSON.stringify(config))

    onComplete?.(config)
  }

  const updateConfig = (updates: Partial<SetupConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    setValidationError(null)
  }

  // Step 1: API Key Configuration
  const ApiKeyStep = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Claude size={24} className="text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Configure Claude API</h3>
        <p className="text-gray-400">Enter your Claude API key to enable AI-powered features</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Claude API Key
          </label>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={config.apiKey}
            onChange={(e) => updateConfig({ apiKey: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {validationError && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <Icons.Error size={16} />
              {validationError}
            </p>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start gap-3">
            <Icons.Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-2">Where to find your API key:</h4>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Visit <span className="text-blue-400">console.anthropic.com</span></li>
                <li>Sign in to your Anthropic account</li>
                <li>Navigate to API Keys section</li>
                <li>Create a new API key or copy existing one</li>
              </ol>
            </div>
          </div>
        </div>

        {serviceStatus && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400">Environment</div>
              <div className="text-white font-medium">{serviceStatus.environment}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400">Version</div>
              <div className="text-white font-medium">{serviceStatus.version}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Step 2: Environment Configuration
  const EnvironmentStep = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Settings size={24} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Environment Setup</h3>
        <p className="text-gray-400">Configure your development environment preferences</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Project Directory
          </label>
          <input
            type="text"
            placeholder="/path/to/your/project"
            value={config.projectPath}
            onChange={(e) => updateConfig({ projectPath: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-400">
            Specify the root directory of your project for better context
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <h4 className="font-medium text-white">File Watching</h4>
              <p className="text-sm text-gray-400">Monitor file changes in real-time</p>
            </div>
            <button
              onClick={() => updateConfig({ enableFileWatching: !config.enableFileWatching })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.enableFileWatching ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                config.enableFileWatching ? 'transform translate-x-6' : 'transform translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <h4 className="font-medium text-white">Auto-save</h4>
              <p className="text-sm text-gray-400">Automatically save changes</p>
            </div>
            <button
              onClick={() => updateConfig({ enableAutoSave: !config.enableAutoSave })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.enableAutoSave ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                config.enableAutoSave ? 'transform translate-x-6' : 'transform translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Step 3: Preferences
  const PreferencesStep = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.AISpark size={24} className="text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Customize Experience</h3>
        <p className="text-gray-400">Set your preferences for the best experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark', icon: '🌙' },
              { id: 'light', label: 'Light', icon: '☀️' },
              { id: 'auto', label: 'Auto', icon: '🔄' }
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => updateConfig({ theme: theme.id as any })}
                className={`p-4 rounded-lg border transition-colors ${
                  config.theme === theme.id
                    ? 'border-purple-500 bg-purple-600/20 text-purple-400'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{theme.icon}</div>
                <div className="font-medium">{theme.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div>
            <h4 className="font-medium text-white">Analytics & Telemetry</h4>
            <p className="text-sm text-gray-400">Help improve Claude GUI with usage analytics</p>
          </div>
          <button
            onClick={() => updateConfig({ enableAnalytics: !config.enableAnalytics })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              config.enableAnalytics ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              config.enableAnalytics ? 'transform translate-x-6' : 'transform translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Icons.Check size={20} className="text-green-400" />
            <h4 className="font-medium text-white">Setup Complete!</h4>
          </div>
          <p className="text-sm text-gray-300">
            You're ready to start using Claude GUI. You can change these settings anytime in the preferences.
          </p>
        </div>
      </div>
    </div>
  )

  const steps: SetupStep[] = [
    {
      id: 'api-key',
      title: 'API Configuration',
      description: 'Configure your Claude API access',
      icon: <Icons.Claude size={16} />,
      component: ApiKeyStep
    },
    {
      id: 'environment',
      title: 'Environment',
      description: 'Set up your development environment',
      icon: <Icons.Settings size={16} />,
      component: EnvironmentStep
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: <Icons.AISpark size={16} />,
      component: PreferencesStep
    }
  ]

  const currentStepData = steps[currentStep]

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Setup Wizard</h2>
            <p className="text-gray-400">Configure Claude GUI for your needs</p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            Skip Setup
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                index === currentStep 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : index < currentStep
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-800 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <Icons.Check size={16} />
                ) : (
                  step.icon
                )}
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  index < currentStep ? 'bg-green-400' : 'bg-gray-600'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        {currentStepData.component}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-200 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={isValidating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <Icons.Loading size={16} />
                  Validating...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <Icons.Check size={16} />
                  Complete Setup
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupWizard