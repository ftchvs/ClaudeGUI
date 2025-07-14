/**
 * Feature Tour Component
 * 
 * Interactive tour highlighting Claude GUI's advanced capabilities
 * Provides contextual tooltips and guided experience for new users
 */

import React, { useState, useEffect, useRef } from 'react'
import { Icons } from '../../design-system/icons'

interface FeatureTourProps {
  className?: string
  onComplete?: () => void
  onSkip?: () => void
  isActive?: boolean
}

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for the target element
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: React.ReactNode
  action?: string // Optional action text
  highlight?: boolean // Whether to highlight the target element
}

interface TooltipPosition {
  top: number
  left: number
  arrowPosition: 'top' | 'bottom' | 'left' | 'right'
}

export const FeatureTour: React.FC<FeatureTourProps> = ({
  className = '',
  onComplete,
  onSkip,
  isActive = true
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const tourSteps: TourStep[] = [
    {
      id: 'navigation',
      title: 'Premium Navigation',
      description: 'Access all Claude GUI features through our intuitive horizontal navigation. Switch between Commands, Files, Templates, Changes, Chat, Analytics, and Workflows.',
      target: 'nav',
      position: 'bottom',
      icon: <Icons.Workflow size={20} className="text-blue-400" />,
      action: 'Try clicking different tabs'
    },
    {
      id: 'commands',
      title: 'Command Center',
      description: 'Execute Claude Code commands with visual feedback. Monitor real-time execution, view outputs, and manage your development workflow.',
      target: '[data-tab="commands"]',
      position: 'bottom',
      icon: <Icons.Terminal size={20} className="text-green-400" />,
      action: 'Click to explore commands',
      highlight: true
    },
    {
      id: 'templates',
      title: 'Template Gallery',
      description: 'Access 50+ pre-built code templates for common patterns. Generate React components, API endpoints, CLI tools, and more with customizable parameters.',
      target: '[data-tab="templates"]',
      position: 'bottom',
      icon: <Icons.CodeGenerate size={20} className="text-purple-400" />,
      action: 'Browse template library'
    },
    {
      id: 'diff-viewer',
      title: 'Visual Diff Viewer',
      description: 'Review code changes with professional diff visualization. Accept or reject changes file-by-file or in batches with syntax highlighting.',
      target: '[data-tab="diff"]',
      position: 'bottom',
      icon: <Icons.GitDiff size={20} className="text-orange-400" />,
      action: 'View change tracking'
    },
    {
      id: 'analytics',
      title: 'Project Analytics',
      description: 'AI-powered project analysis with code quality metrics, dependency insights, and architectural recommendations for better development decisions.',
      target: '[data-tab="analytics"]',
      position: 'bottom',
      icon: <Icons.ProjectAnalysis size={20} className="text-cyan-400" />,
      action: 'Explore analytics dashboard'
    },
    {
      id: 'workflows',
      title: 'Workflow Automation',
      description: 'Chain multiple Claude Code commands into automated workflows. From feature development to security audits - automate complex tasks.',
      target: '[data-tab="workflows"]',
      position: 'bottom',
      icon: <Icons.AISpark size={20} className="text-yellow-400" />,
      action: 'Try workflow automation'
    },
    {
      id: 'settings',
      title: 'Smart Settings',
      description: 'Configure API keys, customize themes, and manage preferences. Access advanced configuration options for optimal experience.',
      target: 'button[aria-label="Settings"], nav button:last-child',
      position: 'left',
      icon: <Icons.Settings size={20} className="text-gray-400" />,
      action: 'Configure your setup'
    },
    {
      id: 'kpi-dashboard',
      title: 'Performance Insights',
      description: 'Monitor token usage, costs, success rates, and performance metrics. Track your Claude Code productivity and optimize usage.',
      target: '.kpi-dashboard, [data-testid="kpi-dashboard"]',
      position: 'bottom',
      icon: <Icons.Info size={20} className="text-blue-400" />,
      action: 'View performance data'
    }
  ]

  const currentStepData = tourSteps[currentStep]

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false)
      return
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true)
      updateTooltipPosition()
    }, 100)

    return () => clearTimeout(timer)
  }, [isActive, currentStep])

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition()
    }
  }, [isVisible, currentStep])

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        updateTooltipPosition()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isVisible])

  const updateTooltipPosition = () => {
    if (!currentStepData || !isVisible) return

    const targetElement = document.querySelector(currentStepData.target) as HTMLElement
    if (!targetElement || !tooltipRef.current) return

    const targetRect = targetElement.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const padding = 16

    let top = 0
    let left = 0
    let arrowPosition: TooltipPosition['arrowPosition'] = 'top'

    switch (currentStepData.position) {
      case 'bottom':
        top = targetRect.bottom + padding
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        arrowPosition = 'top'
        break
      case 'top':
        top = targetRect.top - tooltipRect.height - padding
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        arrowPosition = 'bottom'
        break
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.right + padding
        arrowPosition = 'left'
        break
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.left - tooltipRect.width - padding
        arrowPosition = 'right'
        break
    }

    // Ensure tooltip stays within viewport
    const maxLeft = window.innerWidth - tooltipRect.width - padding
    const maxTop = window.innerHeight - tooltipRect.height - padding

    left = Math.max(padding, Math.min(left, maxLeft))
    top = Math.max(padding, Math.min(top, maxTop))

    setTooltipPosition({ top, left, arrowPosition })

    // Highlight target element
    if (currentStepData.highlight) {
      targetElement.style.outline = '2px solid #3B82F6'
      targetElement.style.outlineOffset = '2px'
      targetElement.style.borderRadius = '8px'
    }
  }

  const handleNext = () => {
    // Remove highlight from current target
    if (currentStepData?.highlight) {
      const targetElement = document.querySelector(currentStepData.target) as HTMLElement
      if (targetElement) {
        targetElement.style.outline = ''
        targetElement.style.outlineOffset = ''
      }
    }

    if (currentStep < tourSteps.length - 1) {
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
    // Remove any remaining highlights
    tourSteps.forEach(step => {
      if (step.highlight) {
        const targetElement = document.querySelector(step.target) as HTMLElement
        if (targetElement) {
          targetElement.style.outline = ''
          targetElement.style.outlineOffset = ''
        }
      }
    })

    setIsVisible(false)
    onComplete?.()
  }

  const handleSkip = () => {
    // Remove any remaining highlights
    tourSteps.forEach(step => {
      if (step.highlight) {
        const targetElement = document.querySelector(step.target) as HTMLElement
        if (targetElement) {
          targetElement.style.outline = ''
          targetElement.style.outlineOffset = ''
        }
      }
    })

    setIsVisible(false)
    onSkip?.()
  }

  if (!isVisible || !isActive || !tooltipPosition) {
    return null
  }

  const getArrowClasses = (position: TooltipPosition['arrowPosition']) => {
    const baseClasses = 'absolute w-3 h-3 bg-gray-800 border border-gray-600 transform rotate-45'
    
    switch (position) {
      case 'top':
        return `${baseClasses} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0`
      case 'bottom':
        return `${baseClasses} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0`
      case 'left':
        return `${baseClasses} -left-1.5 top-1/2 -translate-y-1/2 border-t-0 border-r-0`
      case 'right':
        return `${baseClasses} -right-1.5 top-1/2 -translate-y-1/2 border-b-0 border-l-0`
      default:
        return baseClasses
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        style={{ pointerEvents: 'none' }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow */}
        <div className={getArrowClasses(tooltipPosition.arrowPosition)} />

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">{currentStepData.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{currentStepData.description}</p>
            </div>
          </div>

          {currentStepData.action && (
            <div className="bg-blue-600/10 rounded-lg p-3 mb-4 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Icons.Info size={16} />
                <span className="font-medium">Try it:</span>
                <span>{currentStepData.action}</span>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-gray-400">
              {currentStep + 1} of {tourSteps.length}
            </div>
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-500' : 
                    index < currentStep ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Skip Tour
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-200 rounded text-sm transition-colors disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center gap-1.5"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Icons.Check size={14} />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <Icons.ExternalLink size={14} className="transform rotate-90" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FeatureTour