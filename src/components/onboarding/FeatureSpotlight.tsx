import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronRight, Play, BookOpen, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/stores/onboarding'
import type { FeatureSpotlight as FeatureSpotlightType, FeatureCategory } from '@/types/onboarding'

interface FeatureSpotlightProps {
  spotlight: FeatureSpotlightType
  onDismiss: () => void
  onTryFeature: () => void
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  showDemo?: boolean
}

interface SpotlightManagerProps {
  targetElement?: string
  category?: FeatureCategory
  maxConcurrent?: number
}

const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  spotlight,
  onDismiss,
  onTryFeature,
  position = 'center',
  showDemo = true
}) => {
  const [currentBenefitIndex, setBenefitIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Cycle through benefits
  useEffect(() => {
    if (spotlight.benefits.length <= 1) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setBenefitIndex((prev) => (prev + 1) % spotlight.benefits.length)
        setIsAnimating(false)
      }, 150)
    }, 3000)

    return () => clearInterval(interval)
  }, [spotlight.benefits.length])

  const getCategoryIcon = (category: FeatureCategory) => {
    const icons = {
      'chat': '💬',
      'file-management': '📁',
      'terminal': '💻',
      'mcp-integration': '🔗',
      'collaboration': '👥',
      'advanced-tools': '🛠️',
      'customization': '🎨'
    }
    return icons[category] || '⭐'
  }

  const getCategoryColor = (category: FeatureCategory) => {
    const colors = {
      'chat': 'blue',
      'file-management': 'green',
      'terminal': 'purple',
      'mcp-integration': 'orange',
      'collaboration': 'pink',
      'advanced-tools': 'red',
      'customization': 'yellow'
    }
    return colors[category] || 'gray'
  }

  const positionClasses = {
    'top': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'left': 'left-4 top-1/2 transform -translate-y-1/2',
    'right': 'right-4 top-1/2 transform -translate-y-1/2',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }}
      className={`fixed ${positionClasses[position]} z-50 max-w-md`}
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg -z-10" />
      
      <Card className="border-2 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="relative pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </motion.div>
              <Badge 
                variant="outline" 
                className={`bg-${getCategoryColor(spotlight.category)}-50 border-${getCategoryColor(spotlight.category)}-200`}
              >
                {getCategoryIcon(spotlight.category)} {spotlight.category.replace('-', ' ')}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardTitle className="text-lg flex items-center gap-2">
            <span>{spotlight.title}</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {spotlight.description}
          </p>

          {/* Animated Benefits */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Benefits
            </h4>
            <div className="relative h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBenefitIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>{spotlight.benefits[currentBenefitIndex]}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Progress dots for benefits */}
            {spotlight.benefits.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {spotlight.benefits.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentBenefitIndex ? 'bg-blue-500' : 'bg-muted-foreground/30'
                    }`}
                    animate={{
                      scale: index === currentBenefitIndex ? 1.2 : 1
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Demo section */}
          {showDemo && spotlight.demoUrl && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" />
                Quick Demo
              </h4>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Button variant="secondary" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
          )}

          {/* Interactive demo hint */}
          {spotlight.interactiveDemo && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <BookOpen className="h-4 w-4" />
                <span>Interactive tutorial available</span>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={onTryFeature} className="flex-1">
              <ChevronRight className="h-4 w-4 mr-2" />
              Try It Now
            </Button>
            <Button variant="outline" onClick={onDismiss}>
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const SpotlightManager: React.FC<SpotlightManagerProps> = ({
  targetElement,
  category,
  maxConcurrent = 1
}) => {
  const { 
    userProfile, 
    availableFeatures, 
    unlockedFeatures,
    dismissGuidance,
    unlockFeature,
    discoverFeature
  } = useOnboardingStore()

  const [activeSpotlights, setActiveSpotlights] = useState<FeatureSpotlightType[]>([])

  // Generate spotlights based on user profile and unlocked features
  useEffect(() => {
    if (!userProfile) return

    const spotlights: FeatureSpotlightType[] = []
    
    Object.values(availableFeatures).forEach(feature => {
      // Check if feature should be spotlighted
      if (
        !unlockedFeatures.has(feature.featureId) &&
        feature.unlockCondition(userProfile) &&
        (!category || feature.category === category) &&
        spotlights.length < maxConcurrent
      ) {
        spotlights.push(feature)
      }
    })

    // Sort by priority
    spotlights.sort((a, b) => b.priority - a.priority)
    
    setActiveSpotlights(spotlights.slice(0, maxConcurrent))
  }, [userProfile, availableFeatures, unlockedFeatures, category, maxConcurrent])

  const handleTryFeature = (featureId: string) => {
    unlockFeature(featureId)
    discoverFeature(featureId)
    setActiveSpotlights(prev => prev.filter(s => s.featureId !== featureId))
  }

  const handleDismissSpotlight = (featureId: string) => {
    dismissGuidance(`spotlight-${featureId}`)
    setActiveSpotlights(prev => prev.filter(s => s.featureId !== featureId))
  }

  return (
    <AnimatePresence>
      {activeSpotlights.map((spotlight, index) => (
        <FeatureSpotlight
          key={spotlight.id}
          spotlight={spotlight}
          onTryFeature={() => handleTryFeature(spotlight.featureId)}
          onDismiss={() => handleDismissSpotlight(spotlight.featureId)}
          position={index === 0 ? 'center' : 'right'}
        />
      ))}
    </AnimatePresence>
  )
}

export default FeatureSpotlight