import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboarding'
import { SmartTooltip, GuidedTour } from './SmartTooltip'
import type { FeatureCategory, SkillLevel } from '@/types/onboarding'

interface ContextualTip {
  id: string
  title: string
  content: string
  category: FeatureCategory
  type: 'hint' | 'tutorial' | 'feature' | 'workflow' | 'shortcut'
  skillLevel: SkillLevel
  relevanceScore: number
  triggerCondition?: () => boolean
  maxShowCount?: number
  contextualData?: any
}

interface LearningContext {
  registerTip: (tip: ContextualTip) => void
  unregisterTip: (tipId: string) => void
  triggerTour: (tourId: string) => void
  showContextualHelp: (category?: FeatureCategory) => void
  adaptToUserBehavior: () => void
}

const ContextualLearningContext = createContext<LearningContext | null>(null)

interface ContextualLearningProviderProps {
  children: ReactNode
}

export const ContextualLearningProvider: React.FC<ContextualLearningProviderProps> = ({ children }) => {
  const { userProfile, trackEvent, generateSmartSuggestions } = useOnboardingStore()
  const [registeredTips, setRegisteredTips] = useState<Map<string, ContextualTip>>(new Map())
  const [activeTips, setActiveTips] = useState<ContextualTip[]>([])
  const [currentTour, setCurrentTour] = useState<string | null>(null)

  // Predefined learning paths and tours
  const learningTours = {
    'getting-started': {
      id: 'getting-started',
      steps: [
        {
          target: '.main-interface',
          title: 'Welcome to ClaudeGUI!',
          content: 'This is your main workspace where you\'ll interact with Claude and manage your projects.',
          position: 'bottom' as const
        },
        {
          target: '.chat-area',
          title: 'Chat Interface',
          content: 'Start conversations with Claude here. Use natural language to describe what you want to accomplish.',
          position: 'left' as const
        },
        {
          target: '.mcp-panel',
          title: 'MCP Integration',
          content: 'Connect external tools and services to enhance your workflow capabilities.',
          position: 'right' as const
        }
      ]
    },
    'advanced-features': {
      id: 'advanced-features',
      steps: [
        {
          target: '.terminal-panel',
          title: 'Integrated Terminal',
          content: 'Execute commands directly from the interface with Claude\'s assistance.',
          position: 'top' as const
        },
        {
          target: '.file-explorer',
          title: 'Smart File Management',
          content: 'Browse and manage files with AI-powered suggestions and automation.',
          position: 'left' as const
        }
      ]
    }
  }

  // Smart tip generation based on user behavior
  useEffect(() => {
    if (!userProfile) return

    const generateContextualTips = () => {
      const tips: ContextualTip[] = []

      // Generate tips based on user persona
      if (userProfile.persona === 'newcomer') {
        tips.push({
          id: 'newcomer-tip-1',
          title: 'Getting Started',
          content: 'Take your time to explore. Each feature has helpful tooltips and guidance.',
          category: 'customization',
          type: 'hint',
          skillLevel: 'beginner',
          relevanceScore: 0.9,
          maxShowCount: 3
        })
      }

      if (userProfile.persona === 'developer') {
        tips.push({
          id: 'developer-tip-1',
          title: 'Keyboard Shortcuts',
          content: 'Press Ctrl+K (Cmd+K on Mac) to open the command palette for quick actions.',
          category: 'customization',
          type: 'shortcut',
          skillLevel: 'intermediate',
          relevanceScore: 0.8,
          maxShowCount: 2
        })
      }

      // Generate tips based on skill levels
      Object.entries(userProfile.skillLevels).forEach(([category, skill]) => {
        if (skill === 'beginner') {
          tips.push({
            id: `beginner-${category}`,
            title: `${category.replace('-', ' ')} Basics`,
            content: `Start with simple ${category.replace('-', ' ')} tasks to build confidence.`,
            category: category as FeatureCategory,
            type: 'tutorial',
            skillLevel: 'beginner',
            relevanceScore: 0.7,
            maxShowCount: 5
          })
        }
      })

      // Update active tips based on relevance and conditions
      const filteredTips = tips.filter(tip => {
        if (tip.triggerCondition && !tip.triggerCondition()) return false
        
        // Check if tip was shown too many times
        const shownCount = getShownCount(tip.id)
        if (tip.maxShowCount && shownCount >= tip.maxShowCount) return false
        
        return true
      })

      // Sort by relevance score
      filteredTips.sort((a, b) => b.relevanceScore - a.relevanceScore)
      
      setActiveTips(filteredTips.slice(0, 3)) // Show top 3 most relevant tips
    }

    generateContextualTips()
  }, [userProfile])

  // Adaptive learning based on user interaction patterns
  useEffect(() => {
    if (!userProfile) return

    const adaptInterval = setInterval(() => {
      adaptToUserBehavior()
    }, 30000) // Adapt every 30 seconds

    return () => clearInterval(adaptInterval)
  }, [userProfile])

  const getShownCount = (tipId: string): number => {
    // In a real app, this would come from analytics or local storage
    return 0
  }

  const registerTip = (tip: ContextualTip) => {
    setRegisteredTips(prev => new Map(prev).set(tip.id, tip))
  }

  const unregisterTip = (tipId: string) => {
    setRegisteredTips(prev => {
      const newMap = new Map(prev)
      newMap.delete(tipId)
      return newMap
    })
  }

  const triggerTour = (tourId: string) => {
    if (learningTours[tourId]) {
      setCurrentTour(tourId)
      trackEvent({
        type: 'guidance-shown',
        timestamp: new Date(),
        guidanceId: `tour-${tourId}`,
        metadata: { type: 'guided-tour' }
      })
    }
  }

  const showContextualHelp = (category?: FeatureCategory) => {
    const relevantTips = Array.from(registeredTips.values())
      .filter(tip => !category || tip.category === category)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5)

    setActiveTips(relevantTips)
  }

  const adaptToUserBehavior = () => {
    if (!userProfile) return

    // Analyze user behavior patterns and adjust learning content
    const { events } = useOnboardingStore.getState()
    
    // Count interaction patterns
    const recentEvents = events.filter(e => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(e.timestamp) > dayAgo
    })

    const dismissalRate = recentEvents.filter(e => e.type === 'guidance-dismissed').length / 
                         Math.max(recentEvents.filter(e => e.type === 'guidance-shown').length, 1)

    // If user dismisses too many tips, reduce frequency
    if (dismissalRate > 0.7) {
      setActiveTips(prev => prev.slice(0, 1)) // Show only most relevant tip
    }

    // Generate new suggestions based on behavior
    generateSmartSuggestions()
  }

  const contextValue: LearningContext = {
    registerTip,
    unregisterTip,
    triggerTour,
    showContextualHelp,
    adaptToUserBehavior
  }

  return (
    <ContextualLearningContext.Provider value={contextValue}>
      {children}
      
      {/* Render active contextual tips */}
      <AnimatePresence>
        {activeTips.map((tip, index) => (
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ delay: index * 0.2 }}
            className="fixed right-4 z-40"
            style={{ top: `${20 + index * 120}px` }}
          >
            <SmartTooltip
              content={tip.content}
              title={tip.title}
              category={tip.category}
              skillLevel={tip.skillLevel}
              priority={tip.relevanceScore > 0.8 ? 'high' : 'medium'}
              adaptiveContent={true}
              className="cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors">
                ?
              </div>
            </SmartTooltip>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Render active tour */}
      {currentTour && learningTours[currentTour] && (
        <GuidedTour
          tourId={currentTour}
          steps={learningTours[currentTour].steps}
          onComplete={() => setCurrentTour(null)}
          onSkip={() => setCurrentTour(null)}
        />
      )}
    </ContextualLearningContext.Provider>
  )
}

// Hook to use contextual learning
export const useContextualLearning = () => {
  const context = useContext(ContextualLearningContext)
  if (!context) {
    throw new Error('useContextualLearning must be used within ContextualLearningProvider')
  }
  return context
}

// Enhanced SmartTooltip wrapper that auto-registers with the learning system
interface EnhancedSmartTooltipProps {
  children: ReactNode
  tipId: string
  content: string
  title?: string
  category: FeatureCategory
  skillLevel?: SkillLevel
  type?: 'hint' | 'tutorial' | 'feature' | 'workflow' | 'shortcut'
  relevanceScore?: number
  className?: string
}

export const EnhancedSmartTooltip: React.FC<EnhancedSmartTooltipProps> = ({
  children,
  tipId,
  content,
  title,
  category,
  skillLevel = 'beginner',
  type = 'hint',
  relevanceScore = 0.5,
  className
}) => {
  const { registerTip, unregisterTip } = useContextualLearning()

  useEffect(() => {
    const tip: ContextualTip = {
      id: tipId,
      title: title || '',
      content,
      category,
      type,
      skillLevel,
      relevanceScore
    }

    registerTip(tip)

    return () => {
      unregisterTip(tipId)
    }
  }, [tipId, content, title, category, skillLevel, type, relevanceScore, registerTip, unregisterTip])

  return (
    <SmartTooltip
      content={content}
      title={title}
      category={category}
      skillLevel={skillLevel}
      adaptiveContent={true}
      className={className}
    >
      {children}
    </SmartTooltip>
  )
}

export default ContextualLearningProvider