import React, { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Info, Lightbulb, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useOnboardingStore } from '@/stores/onboarding'
import type { FeatureCategory, SkillLevel, UserPersona } from '@/types/onboarding'

interface ProgressiveDisclosureProps {
  children: ReactNode
  featureId: string
  category: FeatureCategory
  title?: string
  description?: string
  minimumSkillLevel?: SkillLevel
  requiredPersona?: UserPersona[]
  revealCondition?: () => boolean
  delayMs?: number
  showIntroduction?: boolean
  complexityLevel?: 'simple' | 'intermediate' | 'advanced'
  className?: string
}

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
  icon?: ReactNode
  badge?: string
  level: 'simple' | 'intermediate' | 'advanced'
  onToggle?: (expanded: boolean) => void
}

interface SmartRevealProps {
  children: ReactNode
  trigger: 'hover' | 'click' | 'scroll' | 'time' | 'progress'
  delay?: number
  condition?: () => boolean
  className?: string
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
  badge,
  level,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { userProfile } = useOnboardingStore()

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'simple': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleToggle = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    onToggle?.(newState)
  }

  // Auto-expand based on user skill level
  useEffect(() => {
    if (!userProfile) return

    const avgSkillLevel = Object.values(userProfile.skillLevels).reduce((acc, skill) => {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert']
      return acc + levels.indexOf(skill)
    }, 0) / Object.keys(userProfile.skillLevels).length

    // Auto-expand simpler sections for beginners, advanced sections for experts
    if (level === 'simple' && avgSkillLevel < 1) {
      setIsExpanded(true)
    } else if (level === 'advanced' && avgSkillLevel > 2) {
      setIsExpanded(true)
    }
  }, [userProfile, level])

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <span className="font-medium text-left">{title}</span>
          {badge && (
            <Badge variant="outline" className={getLevelColor(level)}>
              {badge}
            </Badge>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SmartReveal: React.FC<SmartRevealProps> = ({
  children,
  trigger,
  delay = 0,
  condition,
  className
}) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const [shouldReveal, setShouldReveal] = useState(false)

  useEffect(() => {
    if (condition && !condition()) return

    const timer = setTimeout(() => {
      setShouldReveal(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [condition, delay])

  const handleReveal = () => {
    if (shouldReveal) {
      setIsRevealed(true)
    }
  }

  const triggerProps = {
    hover: { onMouseEnter: handleReveal },
    click: { onClick: handleReveal },
    scroll: {}, // Would need scroll listener
    time: {}, // Handled by useEffect
    progress: {} // Would need progress context
  }

  useEffect(() => {
    if (trigger === 'time' && shouldReveal) {
      setIsRevealed(true)
    }
  }, [trigger, shouldReveal])

  return (
    <div className={className} {...triggerProps[trigger]}>
      <AnimatePresence>
        {isRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10"
            whileHover={{ borderColor: 'hsl(var(--primary) / 0.5)' }}
          >
            <div className="text-center text-muted-foreground">
              <Eye className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {trigger === 'hover' && 'Hover to reveal'}
                {trigger === 'click' && 'Click to reveal'}
                {trigger === 'time' && 'Content will appear soon...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  featureId,
  category,
  title,
  description,
  minimumSkillLevel = 'beginner',
  requiredPersona,
  revealCondition,
  delayMs = 0,
  showIntroduction = true,
  complexityLevel = 'simple',
  className
}) => {
  const { userProfile, discoverFeature, updateSkillLevel } = useOnboardingStore()
  const [isRevealed, setIsRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Check if user meets the requirements
  const meetsSkillRequirement = () => {
    if (!userProfile) return false
    
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    const userSkillIndex = skillLevels.indexOf(userProfile.skillLevels[category])
    const requiredSkillIndex = skillLevels.indexOf(minimumSkillLevel)
    
    return userSkillIndex >= requiredSkillIndex
  }

  const meetsPersonaRequirement = () => {
    if (!requiredPersona || !userProfile) return true
    return requiredPersona.includes(userProfile.persona)
  }

  const meetsCustomCondition = () => {
    return revealCondition ? revealCondition() : true
  }

  const shouldReveal = meetsSkillRequirement() && meetsPersonaRequirement() && meetsCustomCondition()

  // Auto-reveal with delay
  useEffect(() => {
    if (!shouldReveal) return

    const timer = setTimeout(() => {
      setIsRevealed(true)
      discoverFeature(featureId)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [shouldReveal, delayMs, featureId, discoverFeature])

  // Show hint for locked features
  useEffect(() => {
    if (!shouldReveal && userProfile) {
      setShowHint(true)
    }
  }, [shouldReveal, userProfile])

  const handleManualReveal = () => {
    if (shouldReveal) {
      setIsRevealed(true)
      discoverFeature(featureId)
    }
  }

  const getSkillUpgradeHint = () => {
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    const currentIndex = skillLevels.indexOf(userProfile?.skillLevels[category] || 'beginner')
    const requiredIndex = skillLevels.indexOf(minimumSkillLevel)
    
    if (currentIndex < requiredIndex) {
      return `Reach ${minimumSkillLevel} level in ${category.replace('-', ' ')} to unlock this feature`
    }
    return null
  }

  if (!shouldReveal && showHint) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className} relative`}
      >
        <Card className="border-dashed border-muted-foreground/30 bg-muted/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">
                  {title || `Advanced ${category.replace('-', ' ')} feature`}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {getSkillUpgradeHint() || 'This feature will unlock as you progress'}
                </p>
                
                {!meetsPersonaRequirement() && requiredPersona && (
                  <Badge variant="outline" className="text-xs">
                    For {requiredPersona.join(', ')} users
                  </Badge>
                )}
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      {description || 'Complete more tasks to unlock this feature'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!isRevealed) {
    return (
      <SmartReveal
        trigger="click"
        condition={() => shouldReveal}
        className={className}
      >
        <div onClick={handleManualReveal}>
          {children}
        </div>
      </SmartReveal>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {showIntroduction && title && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 text-sm">{title}</h4>
              {description && (
                <p className="text-blue-700 text-xs mt-1">{description}</p>
              )}
              <Badge variant="outline" className="mt-2 text-xs bg-blue-100">
                {complexityLevel} level
              </Badge>
            </div>
          </div>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  )
}

// Higher-order component for automatic progressive disclosure
export const withProgressiveDisclosure = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProgressiveDisclosureProps, 'children'>
) => {
  return (props: P) => (
    <ProgressiveDisclosure {...options}>
      <Component {...props} />
    </ProgressiveDisclosure>
  )
}

// Utility components
export { CollapsibleSection, SmartReveal }

export default ProgressiveDisclosure