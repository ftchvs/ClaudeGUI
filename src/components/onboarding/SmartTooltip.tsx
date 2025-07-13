import React, { ReactNode, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  Info, 
  Zap, 
  BookOpen, 
  Target, 
  ArrowRight, 
  X, 
  Play,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useOnboardingStore } from '@/stores/onboarding'
import type { FeatureCategory, SkillLevel, UserPersona } from '@/types/onboarding'

interface SmartTooltipProps {
  children: ReactNode
  content: string
  title?: string
  category?: FeatureCategory
  skillLevel?: SkillLevel
  contextualHints?: string[]
  demoAction?: () => void
  demoUrl?: string
  nextSteps?: Array<{ label: string; action: () => void }>
  triggerCondition?: () => boolean
  maxShowCount?: number
  priority?: 'low' | 'medium' | 'high'
  adaptiveContent?: boolean
  interactiveDemo?: boolean
  className?: string
}

interface ContextualTipProps {
  tip: {
    id: string
    title: string
    content: string
    category: FeatureCategory
    type: 'hint' | 'tutorial' | 'feature' | 'workflow' | 'shortcut'
    relevanceScore: number
    contextualData?: any
  }
  position: { x: number; y: number }
  onDismiss: () => void
  onInteract: () => void
}

interface GuidedTourProps {
  tourId: string
  steps: Array<{
    target: string
    title: string
    content: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    action?: () => void
  }>
  onComplete: () => void
  onSkip: () => void
}

const ContextualTip: React.FC<ContextualTipProps> = ({
  tip,
  position,
  onDismiss,
  onInteract
}) => {
  const getTypeIcon = (type: string) => {
    const icons = {
      'hint': <Lightbulb className="h-4 w-4" />,
      'tutorial': <BookOpen className="h-4 w-4" />,
      'feature': <Star className="h-4 w-4" />,
      'workflow': <Zap className="h-4 w-4" />,
      'shortcut': <Target className="h-4 w-4" />
    }
    return icons[type] || <Info className="h-4 w-4" />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'hint': 'text-blue-600 bg-blue-50 border-blue-200',
      'tutorial': 'text-green-600 bg-green-50 border-green-200',
      'feature': 'text-purple-600 bg-purple-50 border-purple-200',
      'workflow': 'text-orange-600 bg-orange-50 border-orange-200',
      'shortcut': 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[type] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed z-50 max-w-sm"
      style={{ left: position.x, top: position.y }}
    >
      <Card className={`border-2 shadow-lg ${getTypeColor(tip.type)}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getTypeIcon(tip.type)}
              <Badge variant="outline" className="text-xs">
                {tip.type}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-5 w-5 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {tip.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">
                {Math.round(tip.relevanceScore * 100)}% relevant
              </span>
            </div>
            
            <Button
              size="sm"
              onClick={onInteract}
              className="h-6 text-xs"
            >
              Try it
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  children,
  content,
  title,
  category = 'customization',
  skillLevel = 'beginner',
  contextualHints = [],
  demoAction,
  demoUrl,
  nextSteps = [],
  triggerCondition,
  maxShowCount = 3,
  priority = 'medium',
  adaptiveContent = true,
  interactiveDemo = false,
  className
}) => {
  const { userProfile, trackEvent, dismissGuidance } = useOnboardingStore()
  const [showEnhanced, setShowEnhanced] = useState(false)
  const [shownCount, setShownCount] = useState(0)
  const tooltipId = `tooltip-${category}-${Date.now()}`

  const shouldShowEnhanced = () => {
    if (!userProfile) return false
    if (shownCount >= maxShowCount) return false
    if (triggerCondition && !triggerCondition()) return false
    
    // Check skill level appropriateness
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    const userSkillIndex = skillLevels.indexOf(userProfile.skillLevels[category])
    const contentSkillIndex = skillLevels.indexOf(skillLevel)
    
    // Show if user skill is within range (not too advanced for basic content)
    return Math.abs(userSkillIndex - contentSkillIndex) <= 1
  }

  const getAdaptiveContent = () => {
    if (!adaptiveContent || !userProfile) return content
    
    const userSkill = userProfile.skillLevels[category]
    
    if (userSkill === 'expert') {
      return content + " Pro tip: You can customize this further in settings."
    } else if (userSkill === 'beginner') {
      return "🌟 " + content + " This will help you get started!"
    }
    
    return content
  }

  const handleEnhancedShow = () => {
    if (shouldShowEnhanced()) {
      setShowEnhanced(true)
      setShownCount(prev => prev + 1)
      
      trackEvent({
        type: 'guidance-shown',
        timestamp: new Date(),
        guidanceId: tooltipId,
        metadata: { category, skillLevel, priority }
      })
    }
  }

  const handleDismiss = () => {
    setShowEnhanced(false)
    dismissGuidance(tooltipId)
  }

  const handleDemo = () => {
    if (demoAction) {
      demoAction()
      trackEvent({
        type: 'feature-discovered',
        timestamp: new Date(),
        featureId: `demo-${category}`,
        metadata: { source: 'smart-tooltip' }
      })
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger 
          asChild
          onMouseEnter={handleEnhancedShow}
          onClick={handleEnhancedShow}
        >
          <div className={className}>
            {children}
          </div>
        </TooltipTrigger>
        
        <TooltipContent>
          <div className="max-w-xs">
            {title && <div className="font-medium mb-1">{title}</div>}
            <div className="text-sm">{getAdaptiveContent()}</div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Enhanced contextual tooltip */}
      <AnimatePresence>
        {showEnhanced && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed z-50 max-w-md"
            style={{ 
              left: '50%', 
              top: '20%', 
              transform: 'translateX(-50%)' 
            }}
          >
            <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {title && (
                  <h3 className="font-bold text-lg mb-2 text-blue-900">
                    {title}
                  </h3>
                )}

                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {getAdaptiveContent()}
                </p>

                {/* Contextual hints */}
                {contextualHints.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <Target className="h-4 w-4 text-orange-500" />
                      Quick Tips
                    </h4>
                    <ul className="space-y-1">
                      {contextualHints.slice(0, 3).map((hint, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interactive demo section */}
                {(demoAction || demoUrl || interactiveDemo) && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <Play className="h-4 w-4 text-green-500" />
                      Try It Out
                    </h4>
                    
                    {demoAction && (
                      <Button
                        size="sm"
                        onClick={handleDemo}
                        className="w-full"
                        variant="outline"
                      >
                        <Play className="h-3 w-3 mr-2" />
                        Interactive Demo
                      </Button>
                    )}
                    
                    {interactiveDemo && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        💡 Hover over UI elements to see contextual tips
                      </div>
                    )}
                  </div>
                )}

                {/* Next steps */}
                {nextSteps.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <ArrowRight className="h-4 w-4 text-purple-500" />
                      Next Steps
                    </h4>
                    <div className="space-y-1">
                      {nextSteps.slice(0, 2).map((step, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="ghost"
                          onClick={step.action}
                          className="w-full justify-start text-left h-auto p-2"
                        >
                          <span className="text-xs">{step.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage counter */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Shown {shownCount}/{maxShowCount} times</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Priority: {priority}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  steps,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const { trackEvent } = useOnboardingStore()

  useEffect(() => {
    setIsActive(true)
    trackEvent({
      type: 'guidance-shown',
      timestamp: new Date(),
      guidanceId: `tour-${tourId}`,
      metadata: { totalSteps: steps.length }
    })
  }, [])

  const handleNext = () => {
    const step = steps[currentStep]
    if (step.action) {
      step.action()
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsActive(false)
    onComplete()
    trackEvent({
      type: 'guidance-dismissed',
      timestamp: new Date(),
      guidanceId: `tour-${tourId}`,
      metadata: { completed: true, stepsCompleted: currentStep + 1 }
    })
  }

  const handleSkip = () => {
    setIsActive(false)
    onSkip()
    trackEvent({
      type: 'guidance-dismissed',
      timestamp: new Date(),
      guidanceId: `tour-${tourId}`,
      metadata: { completed: false, stepsCompleted: currentStep }
    })
  }

  if (!isActive) return null

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg mx-4"
      >
        <Card className="border-2 border-blue-300 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Progress value={progress} className="mb-4 h-2" />

            <h3 className="font-bold text-xl mb-3">
              {currentStepData.title}
            </h3>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
              >
                Skip Tour
              </Button>
              
              <Button
                onClick={handleNext}
                className="min-w-24"
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default SmartTooltip