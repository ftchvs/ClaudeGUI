import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Star, Zap, Target, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/stores/onboarding'
import type { FeatureCategory, SkillLevel } from '@/types/onboarding'

interface FeatureGateProps {
  featureId: string
  children: ReactNode
  category: FeatureCategory
  requiredSkillLevel?: SkillLevel
  requiredFeatures?: string[]
  unlockCondition?: () => boolean
  fallbackComponent?: ReactNode
  showProgress?: boolean
  className?: string
}

interface UnlockPromptProps {
  featureId: string
  category: FeatureCategory
  requiredSkillLevel?: SkillLevel
  requiredFeatures?: string[]
  onUnlock: () => void
  showProgress: boolean
}

const UnlockPrompt: React.FC<UnlockPromptProps> = ({
  featureId,
  category,
  requiredSkillLevel,
  requiredFeatures = [],
  onUnlock,
  showProgress
}) => {
  const { userProfile, unlockFeature, generateSmartSuggestions } = useOnboardingStore()

  const getFeatureDisplayName = (id: string): string => {
    const displayNames: Record<string, string> = {
      'mcp': 'MCP Integration',
      'advanced-terminal': 'Advanced Terminal',
      'collaboration': 'Collaboration Tools',
      'claude-session': 'Claude Session Monitor',
      'activity-monitor': 'Activity Monitor',
      'cost-tracker': 'Cost Tracker',
      'file-diff': 'File Diff Viewer',
      'workflow-automation': 'Workflow Automation'
    }
    return displayNames[id] || id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getCategoryDisplayName = (cat: FeatureCategory): string => {
    const displayNames: Record<FeatureCategory, string> = {
      'chat': 'Chat & Conversation',
      'file-management': 'File Management',
      'terminal': 'Terminal Operations',
      'mcp-integration': 'MCP Integration',
      'collaboration': 'Collaboration',
      'advanced-tools': 'Advanced Tools',
      'customization': 'Customization'
    }
    return displayNames[cat]
  }

  const getSkillRequirement = (): { met: boolean; current: SkillLevel; required: SkillLevel } => {
    if (!requiredSkillLevel || !userProfile) {
      return { met: true, current: 'beginner', required: 'beginner' }
    }

    const current = userProfile.skillLevels[category]
    const skillOrder: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']
    const currentIndex = skillOrder.indexOf(current)
    const requiredIndex = skillOrder.indexOf(requiredSkillLevel)

    return {
      met: currentIndex >= requiredIndex,
      current,
      required: requiredSkillLevel
    }
  }

  const getFeatureRequirements = (): { met: boolean; missing: string[] } => {
    if (requiredFeatures.length === 0) {
      return { met: true, missing: [] }
    }

    const { unlockedFeatures } = useOnboardingStore.getState()
    const missing = requiredFeatures.filter(feature => !unlockedFeatures.has(feature))

    return {
      met: missing.length === 0,
      missing
    }
  }

  const skillReq = getSkillRequirement()
  const featureReq = getFeatureRequirements()
  const canUnlock = skillReq.met && featureReq.met

  const handleUnlock = () => {
    if (canUnlock) {
      unlockFeature(featureId)
      generateSmartSuggestions()
      onUnlock()
    }
  }

  const getProgressPercentage = (): number => {
    let total = 0
    let completed = 0

    // Skill requirement progress
    if (requiredSkillLevel) {
      total += 1
      if (skillReq.met) completed += 1
    }

    // Feature requirement progress
    if (requiredFeatures.length > 0) {
      total += requiredFeatures.length
      completed += requiredFeatures.length - featureReq.missing.length
    }

    // If no requirements, it's unlocked
    if (total === 0) return 100

    return (completed / total) * 100
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <Lock className="h-8 w-8 text-muted-foreground" />
              {canUnlock && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </motion.div>
              )}
            </div>
          </div>
          <CardTitle className="text-lg">
            {getFeatureDisplayName(featureId)}
          </CardTitle>
          <Badge variant="outline" className="w-fit mx-auto">
            {getCategoryDisplayName(category)}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress indicator */}
          {showProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unlock Progress</span>
                <span className="font-medium">{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          )}

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Requirements:</h4>

            {/* Skill requirement */}
            {requiredSkillLevel && (
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Target className={`h-4 w-4 ${skillReq.met ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm">
                    {requiredSkillLevel} level in {getCategoryDisplayName(category)}
                  </span>
                </div>
                <Badge variant={skillReq.met ? "default" : "secondary"}>
                  {skillReq.met ? '✓' : `${skillReq.current} → ${skillReq.required}`}
                </Badge>
              </div>
            )}

            {/* Feature requirements */}
            {requiredFeatures.map((feature) => {
              const isUnlocked = !featureReq.missing.includes(feature)
              return (
                <div key={feature} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${isUnlocked ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className="text-sm">
                      {getFeatureDisplayName(feature)}
                    </span>
                  </div>
                  <Badge variant={isUnlocked ? "default" : "secondary"}>
                    {isUnlocked ? '✓' : 'Required'}
                  </Badge>
                </div>
              )
            })}
          </div>

          {/* Unlock button */}
          <Button
            onClick={handleUnlock}
            disabled={!canUnlock}
            className="w-full"
            variant={canUnlock ? "default" : "secondary"}
          >
            {canUnlock ? (
              <>
                <Star className="h-4 w-4 mr-2" />
                Unlock Feature
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Requirements Not Met
              </>
            )}
          </Button>

          {/* Help text */}
          {!canUnlock && (
            <p className="text-xs text-muted-foreground text-center">
              Complete the requirements above to unlock this feature
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureId,
  children,
  category,
  requiredSkillLevel,
  requiredFeatures,
  unlockCondition,
  fallbackComponent,
  showProgress = true,
  className
}) => {
  const { unlockedFeatures, userProfile } = useOnboardingStore()

  // Check if feature is unlocked
  const isUnlocked = unlockedFeatures.has(featureId)

  // Check custom unlock condition
  const customConditionMet = unlockCondition ? unlockCondition() : true

  // Check if user is in onboarding mode and should see simplified interface
  const isInOnboarding = userProfile?.onboardingCompleted === false

  const shouldShowFeature = isUnlocked && customConditionMet && (!isInOnboarding || featureId === 'chat' || featureId === 'file-explorer')

  const handleUnlock = () => {
    // Feature will be unlocked by UnlockPrompt component
    // This is just a callback for any additional actions
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {shouldShowFeature ? (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {fallbackComponent || (
              <UnlockPrompt
                featureId={featureId}
                category={category}
                requiredSkillLevel={requiredSkillLevel}
                requiredFeatures={requiredFeatures}
                onUnlock={handleUnlock}
                showProgress={showProgress}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FeatureGate