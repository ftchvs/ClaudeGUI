// User profiling and onboarding system types

export type UserPersona = 'newcomer' | 'developer' | 'power-user' | 'team-lead'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type OnboardingStep = 
  | 'welcome'
  | 'persona-selection'
  | 'preference-setup'
  | 'core-concepts'
  | 'first-project'
  | 'feature-discovery'
  | 'completion'

export type FeatureCategory = 
  | 'chat'
  | 'file-management'
  | 'terminal'
  | 'mcp-integration'
  | 'collaboration'
  | 'advanced-tools'
  | 'customization'

export interface UserProfile {
  id: string
  persona: UserPersona
  skillLevels: Record<FeatureCategory, SkillLevel>
  preferences: UserPreferences
  joinedAt: Date
  lastActiveAt: Date
  onboardingCompleted: boolean
  onboardingStep: OnboardingStep
  featureDiscovery: FeatureDiscoveryProgress
  achievements: Achievement[]
  usagePatterns: UsagePattern[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  reducedMotion: boolean
  notificationLevel: 'minimal' | 'normal' | 'detailed'
  tooltipLevel: 'none' | 'basic' | 'detailed' | 'contextual'
  layoutDensity: 'compact' | 'comfortable' | 'spacious'
  keyboardShortcuts: boolean
  autoSave: boolean
  panelBehavior: 'manual' | 'smart' | 'adaptive'
  guidanceLevel: 'none' | 'minimal' | 'normal' | 'comprehensive'
}

export interface FeatureDiscoveryProgress {
  discoveredFeatures: Set<string>
  featuresInProgress: Set<string>
  lastDiscoveryDate: Date
  discoveryScore: number // 0-100 percentage of features discovered
  categoryProgress: Record<FeatureCategory, number>
}

export interface Achievement {
  id: string
  category: FeatureCategory
  title: string
  description: string
  icon: string
  unlockedAt: Date
  points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface UsagePattern {
  sessionId: string
  timestamp: Date
  action: string
  context: Record<string, any>
  duration: number
  success: boolean
  featureUsed: string
  workflowStep?: string
}

export interface OnboardingState {
  currentStep: OnboardingStep
  stepProgress: number // 0-100 for current step
  totalProgress: number // 0-100 for entire onboarding
  isActive: boolean
  isSkippable: boolean
  canGoBack: boolean
  timeSpent: number
  stepData: Record<string, any>
}

export interface ContextualGuidance {
  id: string
  title: string
  content: string
  type: 'tooltip' | 'spotlight' | 'modal' | 'inline'
  trigger: 'hover' | 'click' | 'focus' | 'auto' | 'delay'
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  priority: 'low' | 'medium' | 'high' | 'critical'
  featureTarget: string
  showCondition?: (userProfile: UserProfile) => boolean
  dismissible: boolean
  maxShowCount?: number
  shownCount: number
  lastShownAt?: Date
}

export interface WorkflowSuggestion {
  id: string
  title: string
  description: string
  category: FeatureCategory
  steps: WorkflowStep[]
  estimatedTime: number
  difficulty: SkillLevel
  benefits: string[]
  prerequisites: string[]
  targetPersona?: UserPersona[]
}

export interface WorkflowStep {
  id: string
  title: string
  description: string
  action: string
  target: string
  expectedOutcome: string
  helpText?: string
  validation?: (context: any) => boolean
}

export interface FeatureSpotlight {
  id: string
  featureId: string
  title: string
  description: string
  benefits: string[]
  demoUrl?: string
  interactiveDemo?: boolean
  unlockCondition: (userProfile: UserProfile) => boolean
  priority: number
  category: FeatureCategory
}

export interface NavigationHint {
  id: string
  title: string
  description: string
  action: string
  target: string
  icon: string
  urgency: 'low' | 'medium' | 'high'
  context: Record<string, any>
  expiresAt?: Date
}

export interface SmartSuggestion {
  id: string
  type: 'feature' | 'workflow' | 'optimization' | 'learning'
  title: string
  description: string
  action: () => void
  relevanceScore: number
  category: FeatureCategory
  metadata: Record<string, any>
}

// Events for tracking user interactions
export interface OnboardingEvent {
  type: 'step-started' | 'step-completed' | 'step-skipped' | 'feature-discovered' | 'achievement-unlocked' | 'guidance-shown' | 'guidance-dismissed'
  timestamp: Date
  stepId?: OnboardingStep
  featureId?: string
  achievementId?: string
  guidanceId?: string
  metadata?: Record<string, any>
}

// Analytics and insights
export interface OnboardingAnalytics {
  completionRate: number
  averageCompletionTime: number
  dropOffPoints: OnboardingStep[]
  mostSkippedSteps: OnboardingStep[]
  featureAdoptionRate: Record<string, number>
  userSatisfactionScore: number
}