/**
 * Onboarding Orchestrator Component
 * 
 * Main orchestrator for the premium onboarding experience
 * Manages flow between welcome, setup wizard, and feature tour
 * Tracks completion progress and user preferences
 */

import React, { useState, useEffect } from 'react'
import OnboardingWelcome from './OnboardingWelcome'
import SetupWizard from './SetupWizard'
import FeatureTour from './FeatureTour'
import { Icons } from '../../design-system/icons'

interface OnboardingOrchestratorProps {
  className?: string
  onComplete?: (result: OnboardingResult) => void
  forceShow?: boolean // For testing/demo purposes
}

interface OnboardingResult {
  completed: boolean
  skipped: boolean
  setupConfig?: any
  tourCompleted: boolean
  timestamp: Date
}

interface OnboardingProgress {
  welcome: boolean
  setup: boolean
  tour: boolean
  currentStep: 'welcome' | 'setup' | 'tour' | 'completed'
}

interface OnboardingState {
  isActive: boolean
  progress: OnboardingProgress
  setupConfig: any
  canSkip: boolean
  showMinimized: boolean
}

export const OnboardingOrchestrator: React.FC<OnboardingOrchestratorProps> = ({
  className = '',
  onComplete,
  forceShow = false
}) => {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    progress: {
      welcome: false,
      setup: false,
      tour: false,
      currentStep: 'welcome'
    },
    setupConfig: null,
    canSkip: true,
    showMinimized: false
  })

  useEffect(() => {
    // Check if onboarding should be shown
    const shouldShowOnboarding = checkShouldShowOnboarding()
    
    if (shouldShowOnboarding || forceShow) {
      setState(prev => ({ ...prev, isActive: true }))
    }
  }, [forceShow])

  const checkShouldShowOnboarding = (): boolean => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('claude_onboarding_completed')
    if (completed && !forceShow) return false

    // Check if user has explicitly skipped
    const skipped = localStorage.getItem('claude_onboarding_skipped')
    if (skipped && !forceShow) return false

    // Check if this is a new user (no API key configured)
    const hasApiKey = localStorage.getItem('claude_api_key')
    const hasSetupConfig = localStorage.getItem('setup_config')
    
    // Show onboarding for new users or when forced
    return !hasApiKey || !hasSetupConfig || forceShow
  }

  const handleWelcomeComplete = () => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        welcome: true,
        currentStep: 'setup'
      }
    }))
  }

  const handleSetupComplete = (config: any) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        setup: true,
        currentStep: 'tour'
      },
      setupConfig: config
    }))
  }

  const handleTourComplete = () => {
    const result: OnboardingResult = {
      completed: true,
      skipped: false,
      setupConfig: state.setupConfig,
      tourCompleted: true,
      timestamp: new Date()
    }

    // Mark onboarding as completed
    localStorage.setItem('claude_onboarding_completed', 'true')
    localStorage.setItem('claude_onboarding_result', JSON.stringify(result))

    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        tour: true,
        currentStep: 'completed'
      },
      isActive: false
    }))

    onComplete?.(result)
  }

  const handleSkipOnboarding = () => {
    const result: OnboardingResult = {
      completed: false,
      skipped: true,
      tourCompleted: false,
      timestamp: new Date()
    }

    // Mark onboarding as skipped
    localStorage.setItem('claude_onboarding_skipped', 'true')
    localStorage.setItem('claude_onboarding_result', JSON.stringify(result))

    setState(prev => ({
      ...prev,
      isActive: false
    }))

    onComplete?.(result)
  }

  const handleRestartOnboarding = () => {
    // Clear all onboarding state
    localStorage.removeItem('claude_onboarding_completed')
    localStorage.removeItem('claude_onboarding_skipped')
    localStorage.removeItem('claude_onboarding_result')

    setState({
      isActive: true,
      progress: {
        welcome: false,
        setup: false,
        tour: false,
        currentStep: 'welcome'
      },
      setupConfig: null,
      canSkip: true,
      showMinimized: false
    })
  }

  const handleMinimize = () => {
    setState(prev => ({
      ...prev,
      showMinimized: true
    }))
  }

  const handleRestore = () => {
    setState(prev => ({
      ...prev,
      showMinimized: false
    }))
  }

  const getProgressPercentage = (): number => {
    const completed = Object.values(state.progress).filter(Boolean).length - 1 // Exclude currentStep
    return Math.round((completed / 3) * 100)
  }

  // Don't render if not active
  if (!state.isActive) {
    return null
  }

  // Minimized state
  if (state.showMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icons.AISpark size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-white">Onboarding Paused</span>
            </div>
            <button
              onClick={handleRestore}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <Icons.Expand size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            {getProgressPercentage()}% complete
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRestore}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleSkipOnboarding}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-30 ${className}`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Main content */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-full max-h-[90vh] relative">
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 bg-gray-800/90 border border-gray-600 rounded-t-lg px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Icons.Claude size={20} className="text-blue-400" />
                <span className="font-medium text-white">Claude GUI Setup</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{getProgressPercentage()}% complete</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Minimize"
              >
                <Icons.Minus size={16} className="text-gray-400" />
              </button>
              
              {state.canSkip && (
                <button
                  onClick={handleSkipOnboarding}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Skip Setup
                </button>
              )}
            </div>
          </div>

          {/* Step content */}
          <div className="mt-16 h-[calc(100%-4rem)]">
            {state.progress.currentStep === 'welcome' && (
              <OnboardingWelcome
                onGetStarted={handleWelcomeComplete}
                onSkip={handleSkipOnboarding}
                className="h-full"
              />
            )}

            {state.progress.currentStep === 'setup' && (
              <SetupWizard
                onComplete={handleSetupComplete}
                onSkip={handleSkipOnboarding}
                className="h-full"
              />
            )}

            {state.progress.currentStep === 'tour' && (
              <FeatureTour
                isActive={true}
                onComplete={handleTourComplete}
                onSkip={handleSkipOnboarding}
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-600 rounded p-3 text-xs font-mono">
          <div className="text-gray-400 mb-2">Onboarding Debug:</div>
          <div className="text-white space-y-1">
            <div>Step: {state.progress.currentStep}</div>
            <div>Progress: {getProgressPercentage()}%</div>
            <div>Welcome: {state.progress.welcome ? '✓' : '○'}</div>
            <div>Setup: {state.progress.setup ? '✓' : '○'}</div>
            <div>Tour: {state.progress.tour ? '✓' : '○'}</div>
          </div>
          <button
            onClick={handleRestartOnboarding}
            className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

export default OnboardingOrchestrator