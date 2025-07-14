/**
 * Onboarding Welcome Component
 * 
 * Premium welcome screen for first-time users
 * Introduces Claude GUI features and capabilities
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'

interface OnboardingWelcomeProps {
  className?: string
  onGetStarted?: () => void
  onSkip?: () => void
}

interface FeatureHighlight {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  benefits: string[]
  comingSoon?: boolean
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  className = '',
  onGetStarted,
  onSkip
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const featureHighlights: FeatureHighlight[] = [
    {
      id: 'visual-interface',
      icon: <Icons.Claude size={32} className="text-blue-400" />,
      title: 'Visual Claude Code Interface',
      description: 'Professional GUI for Claude Code CLI with intuitive visual controls',
      benefits: [
        'Clean, modern interface design',
        'Real-time command execution monitoring',
        'Visual file system integration',
        'Context-aware code assistance'
      ]
    },
    {
      id: 'advanced-features',
      icon: <Icons.AISpark size={32} className="text-purple-400" />,
      title: 'Advanced AI Features',
      description: 'Powerful AI-driven tools for enhanced development productivity',
      benefits: [
        'Intelligent code analysis and suggestions',
        'Template gallery with 50+ patterns',
        'Automated workflow orchestration',
        'Real-time performance insights'
      ]
    },
    {
      id: 'collaboration',
      icon: <Icons.Workflow size={32} className="text-green-400" />,
      title: 'Team Collaboration',
      description: 'Built-in collaboration tools for development teams',
      benefits: [
        'Shared workflows and templates',
        'Team activity monitoring',
        'Code review automation',
        'Knowledge base integration'
      ],
      comingSoon: true
    },
    {
      id: 'integration',
      icon: <Icons.Terminal size={32} className="text-orange-400" />,
      title: 'Seamless Integration',
      description: 'Deep integration with your existing development environment',
      benefits: [
        'Native file system access',
        'Git workflow integration',
        'Multiple project support',
        'Custom command automation'
      ]
    }
  ]

  const currentFeature = featureHighlights[currentSlide]

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextSlide()
      }
    }, 8000) // Auto-advance every 8 seconds

    return () => clearInterval(interval)
  }, [currentSlide, isAnimating])

  const nextSlide = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % featureHighlights.length)
      setIsAnimating(false)
    }, 300)
  }

  const prevSlide = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + featureHighlights.length) % featureHighlights.length)
      setIsAnimating(false)
    }, 300)
  }

  const goToSlide = (index: number) => {
    if (index !== currentSlide && !isAnimating) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide(index)
        setIsAnimating(false)
      }, 300)
    }
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-8 border-b border-gray-700 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Icons.Claude size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Claude GUI</h1>
            <p className="text-lg text-gray-300">Professional Interface for Claude Code</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-blue-200 text-sm leading-relaxed">
            Transform your Claude Code experience with our premium visual interface. 
            Built for developers who demand both power and elegance.
          </p>
        </div>
      </div>

      {/* Feature Carousel */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-600">
                {currentFeature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{currentFeature.title}</h3>
                  {currentFeature.comingSoon && (
                    <span className="px-2 py-1 bg-orange-600/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{currentFeature.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentFeature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Icons.Check size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <Icons.Expand size={20} className="text-gray-300 transform rotate-180" />
            </button>

            <div className="flex items-center gap-2">
              {featureHighlights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <Icons.Expand size={20} className="text-gray-300" />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onSkip}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors border border-gray-600"
            >
              Skip Introduction
            </button>
            <button
              onClick={onGetStarted}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2"
            >
              <Icons.AISpark size={18} />
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-8 py-4 bg-gray-800/50 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">50+</div>
            <div className="text-xs text-gray-400">Code Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">15+</div>
            <div className="text-xs text-gray-400">Workflows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">∞</div>
            <div className="text-xs text-gray-400">Possibilities</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWelcome