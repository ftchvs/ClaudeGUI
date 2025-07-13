import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  UserProfile,
  UserPersona,
  UserPreferences,
  OnboardingState,
  OnboardingStep,
  FeatureCategory,
  SkillLevel,
  Achievement,
  ContextualGuidance,
  WorkflowSuggestion,
  OnboardingEvent,
  SmartSuggestion,
  FeatureSpotlight,
  NavigationHint
} from '@/types/onboarding'

interface OnboardingStore {
  // User Profile State
  userProfile: UserProfile | null
  isNewUser: boolean
  
  // Onboarding State
  onboardingState: OnboardingState
  
  // Guidance System
  activeGuidance: ContextualGuidance[]
  dismissedGuidance: Set<string>
  
  // Suggestions and Recommendations
  suggestions: SmartSuggestion[]
  workflowSuggestions: WorkflowSuggestion[]
  
  // Feature Discovery
  availableFeatures: Record<string, FeatureSpotlight>
  unlockedFeatures: Set<string>
  
  // Navigation and Hints
  navigationHints: NavigationHint[]
  
  // Analytics
  events: OnboardingEvent[]
  
  // Actions - User Profile Management
  initializeUserProfile: () => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  setPersona: (persona: UserPersona) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateSkillLevel: (category: FeatureCategory, level: SkillLevel) => void
  
  // Actions - Onboarding Flow
  startOnboarding: () => void
  nextOnboardingStep: () => void
  previousOnboardingStep: () => void
  skipOnboardingStep: () => void
  completeOnboarding: () => void
  updateStepProgress: (progress: number) => void
  setStepData: (key: string, value: any) => void
  
  // Actions - Feature Discovery
  discoverFeature: (featureId: string) => void
  unlockFeature: (featureId: string) => void
  markFeatureInProgress: (featureId: string) => void
  completeFeatureUsage: (featureId: string) => void
  
  // Actions - Guidance System
  showGuidance: (guidance: ContextualGuidance) => void
  dismissGuidance: (guidanceId: string) => void
  clearActiveGuidance: () => void
  
  // Actions - Achievements
  unlockAchievement: (achievement: Achievement) => void
  
  // Actions - Suggestions
  addSuggestion: (suggestion: SmartSuggestion) => void
  dismissSuggestion: (suggestionId: string) => void
  executeSuggestion: (suggestionId: string) => void
  
  // Actions - Analytics
  trackEvent: (event: OnboardingEvent) => void
  getAnalytics: () => any
  
  // Actions - Smart Features
  generateSmartSuggestions: () => void
  updateNavigationHints: () => void
  adaptToUserBehavior: () => void
}

const defaultUserPreferences: UserPreferences = {
  theme: 'auto',
  reducedMotion: false,
  notificationLevel: 'normal',
  tooltipLevel: 'contextual',
  layoutDensity: 'comfortable',
  keyboardShortcuts: true,
  autoSave: true,
  panelBehavior: 'adaptive',
  guidanceLevel: 'normal'
}

const createDefaultUserProfile = (): UserProfile => ({
  id: crypto.randomUUID(),
  persona: 'newcomer',
  skillLevels: {
    'chat': 'beginner',
    'file-management': 'beginner',
    'terminal': 'beginner',
    'mcp-integration': 'beginner',
    'collaboration': 'beginner',
    'advanced-tools': 'beginner',
    'customization': 'beginner'
  },
  preferences: defaultUserPreferences,
  joinedAt: new Date(),
  lastActiveAt: new Date(),
  onboardingCompleted: false,
  onboardingStep: 'welcome',
  featureDiscovery: {
    discoveredFeatures: new Set(),
    featuresInProgress: new Set(),
    lastDiscoveryDate: new Date(),
    discoveryScore: 0,
    categoryProgress: {
      'chat': 0,
      'file-management': 0,
      'terminal': 0,
      'mcp-integration': 0,
      'collaboration': 0,
      'advanced-tools': 0,
      'customization': 0
    }
  },
  achievements: [],
  usagePatterns: []
})

const defaultOnboardingState: OnboardingState = {
  currentStep: 'welcome',
  stepProgress: 0,
  totalProgress: 0,
  isActive: false,
  isSkippable: true,
  canGoBack: false,
  timeSpent: 0,
  stepData: {}
}

export const useOnboardingStore = create<OnboardingStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    userProfile: null,
    isNewUser: true,
    onboardingState: defaultOnboardingState,
    activeGuidance: [],
    dismissedGuidance: new Set(),
    suggestions: [],
    workflowSuggestions: [],
    availableFeatures: {},
    unlockedFeatures: new Set(['chat', 'file-explorer']), // Basic features unlocked by default
    navigationHints: [],
    events: [],

    // User Profile Management
    initializeUserProfile: () => {
      const storedProfile = localStorage.getItem('claudegui-user-profile')
      
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile)
          profile.lastActiveAt = new Date()
          set({ 
            userProfile: profile, 
            isNewUser: false,
            onboardingState: profile.onboardingCompleted 
              ? { ...defaultOnboardingState, isActive: false }
              : { ...defaultOnboardingState, currentStep: profile.onboardingStep, isActive: true }
          })
        } catch (error) {
          console.error('Failed to load user profile:', error)
          const newProfile = createDefaultUserProfile()
          set({ userProfile: newProfile, isNewUser: true })
        }
      } else {
        const newProfile = createDefaultUserProfile()
        set({ userProfile: newProfile, isNewUser: true })
      }
      
      // Initialize suggestions and hints
      get().generateSmartSuggestions()
      get().updateNavigationHints()
    },

    updateUserProfile: (updates) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedProfile = { ...userProfile, ...updates, lastActiveAt: new Date() }
      set({ userProfile: updatedProfile })
      localStorage.setItem('claudegui-user-profile', JSON.stringify(updatedProfile))
    },

    setPersona: (persona) => {
      get().updateUserProfile({ persona })
      get().adaptToUserBehavior()
      get().trackEvent({
        type: 'step-completed',
        timestamp: new Date(),
        stepId: 'persona-selection',
        metadata: { persona }
      })
    },

    updatePreferences: (preferences) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedPreferences = { ...userProfile.preferences, ...preferences }
      get().updateUserProfile({ preferences: updatedPreferences })
    },

    updateSkillLevel: (category, level) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedSkillLevels = { ...userProfile.skillLevels, [category]: level }
      get().updateUserProfile({ skillLevels: updatedSkillLevels })
    },

    // Onboarding Flow Management
    startOnboarding: () => {
      set({
        onboardingState: {
          ...get().onboardingState,
          isActive: true,
          currentStep: 'welcome',
          stepProgress: 0,
          totalProgress: 0
        }
      })
      
      get().trackEvent({
        type: 'step-started',
        timestamp: new Date(),
        stepId: 'welcome'
      })
    },

    nextOnboardingStep: () => {
      const { onboardingState } = get()
      const steps: OnboardingStep[] = [
        'welcome',
        'persona-selection', 
        'preference-setup',
        'core-concepts',
        'first-project',
        'feature-discovery',
        'completion'
      ]
      
      const currentIndex = steps.indexOf(onboardingState.currentStep)
      const nextStep = steps[currentIndex + 1]
      
      if (nextStep) {
        const newProgress = ((currentIndex + 1) / (steps.length - 1)) * 100
        
        set({
          onboardingState: {
            ...onboardingState,
            currentStep: nextStep,
            stepProgress: 0,
            totalProgress: newProgress,
            canGoBack: true
          }
        })
        
        get().updateUserProfile({ onboardingStep: nextStep })
        get().trackEvent({
          type: 'step-started',
          timestamp: new Date(),
          stepId: nextStep
        })
        
        if (nextStep === 'completion') {
          get().completeOnboarding()
        }
      }
    },

    previousOnboardingStep: () => {
      const { onboardingState } = get()
      const steps: OnboardingStep[] = [
        'welcome',
        'persona-selection',
        'preference-setup', 
        'core-concepts',
        'first-project',
        'feature-discovery',
        'completion'
      ]
      
      const currentIndex = steps.indexOf(onboardingState.currentStep)
      const previousStep = steps[currentIndex - 1]
      
      if (previousStep) {
        const newProgress = ((currentIndex - 1) / (steps.length - 1)) * 100
        
        set({
          onboardingState: {
            ...onboardingState,
            currentStep: previousStep,
            stepProgress: 0,
            totalProgress: Math.max(0, newProgress),
            canGoBack: currentIndex > 1
          }
        })
        
        get().updateUserProfile({ onboardingStep: previousStep })
      }
    },

    skipOnboardingStep: () => {
      get().trackEvent({
        type: 'step-skipped',
        timestamp: new Date(),
        stepId: get().onboardingState.currentStep
      })
      get().nextOnboardingStep()
    },

    completeOnboarding: () => {
      set({
        onboardingState: {
          ...get().onboardingState,
          isActive: false,
          totalProgress: 100
        }
      })
      
      get().updateUserProfile({ 
        onboardingCompleted: true,
        onboardingStep: 'completion'
      })
      
      // Unlock achievement
      get().unlockAchievement({
        id: 'onboarding-complete',
        category: 'customization',
        title: 'Welcome Aboard!',
        description: 'Successfully completed the onboarding process',
        icon: '🎉',
        unlockedAt: new Date(),
        points: 100,
        tier: 'gold'
      })
    },

    updateStepProgress: (progress) => {
      set({
        onboardingState: {
          ...get().onboardingState,
          stepProgress: Math.max(0, Math.min(100, progress))
        }
      })
    },

    setStepData: (key, value) => {
      set({
        onboardingState: {
          ...get().onboardingState,
          stepData: {
            ...get().onboardingState.stepData,
            [key]: value
          }
        }
      })
    },

    // Feature Discovery
    discoverFeature: (featureId) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedDiscovered = new Set(userProfile.featureDiscovery.discoveredFeatures)
      updatedDiscovered.add(featureId)
      
      get().updateUserProfile({
        featureDiscovery: {
          ...userProfile.featureDiscovery,
          discoveredFeatures: updatedDiscovered,
          lastDiscoveryDate: new Date()
        }
      })
      
      get().trackEvent({
        type: 'feature-discovered',
        timestamp: new Date(),
        featureId,
        metadata: { source: 'user-interaction' }
      })
    },

    unlockFeature: (featureId) => {
      const { unlockedFeatures } = get()
      const newUnlocked = new Set(unlockedFeatures)
      newUnlocked.add(featureId)
      
      set({ unlockedFeatures: newUnlocked })
      
      // Show celebration for major feature unlocks
      if (['mcp', 'advanced-terminal', 'collaboration'].includes(featureId)) {
        get().showGuidance({
          id: `feature-unlock-${featureId}`,
          title: '🎉 New Feature Unlocked!',
          content: `You've unlocked ${featureId}. Click to learn more about this feature.`,
          type: 'modal',
          trigger: 'auto',
          position: 'auto',
          priority: 'high',
          featureTarget: featureId,
          dismissible: true,
          shownCount: 0
        })
      }
    },

    markFeatureInProgress: (featureId) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedInProgress = new Set(userProfile.featureDiscovery.featuresInProgress)
      updatedInProgress.add(featureId)
      
      get().updateUserProfile({
        featureDiscovery: {
          ...userProfile.featureDiscovery,
          featuresInProgress: updatedInProgress
        }
      })
    },

    completeFeatureUsage: (featureId) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedInProgress = new Set(userProfile.featureDiscovery.featuresInProgress)
      updatedInProgress.delete(featureId)
      
      get().updateUserProfile({
        featureDiscovery: {
          ...userProfile.featureDiscovery,
          featuresInProgress: updatedInProgress
        }
      })
    },

    // Guidance System
    showGuidance: (guidance) => {
      const { activeGuidance, dismissedGuidance } = get()
      
      if (dismissedGuidance.has(guidance.id)) return
      
      // Check if guidance should be shown based on conditions
      const { userProfile } = get()
      if (guidance.showCondition && userProfile && !guidance.showCondition(userProfile)) {
        return
      }
      
      // Update shown count
      const updatedGuidance = { 
        ...guidance, 
        shownCount: guidance.shownCount + 1,
        lastShownAt: new Date()
      }
      
      // Check max show count
      if (guidance.maxShowCount && updatedGuidance.shownCount > guidance.maxShowCount) {
        return
      }
      
      set({ 
        activeGuidance: [...activeGuidance, updatedGuidance]
      })
      
      get().trackEvent({
        type: 'guidance-shown',
        timestamp: new Date(),
        guidanceId: guidance.id,
        metadata: { type: guidance.type, priority: guidance.priority }
      })
    },

    dismissGuidance: (guidanceId) => {
      const { activeGuidance, dismissedGuidance } = get()
      
      set({
        activeGuidance: activeGuidance.filter(g => g.id !== guidanceId),
        dismissedGuidance: new Set([...dismissedGuidance, guidanceId])
      })
      
      get().trackEvent({
        type: 'guidance-dismissed',
        timestamp: new Date(),
        guidanceId
      })
    },

    clearActiveGuidance: () => {
      set({ activeGuidance: [] })
    },

    // Achievements
    unlockAchievement: (achievement) => {
      const { userProfile } = get()
      if (!userProfile) return

      const updatedAchievements = [...userProfile.achievements, achievement]
      get().updateUserProfile({ achievements: updatedAchievements })
      
      // Show achievement notification
      get().showGuidance({
        id: `achievement-${achievement.id}`,
        title: '🏆 Achievement Unlocked!',
        content: `${achievement.title}: ${achievement.description}`,
        type: 'modal',
        trigger: 'auto',
        position: 'auto',
        priority: 'high',
        featureTarget: achievement.category,
        dismissible: true,
        shownCount: 0
      })
      
      get().trackEvent({
        type: 'achievement-unlocked',
        timestamp: new Date(),
        achievementId: achievement.id,
        metadata: { category: achievement.category, points: achievement.points }
      })
    },

    // Suggestions
    addSuggestion: (suggestion) => {
      const { suggestions } = get()
      set({ suggestions: [...suggestions, suggestion] })
    },

    dismissSuggestion: (suggestionId) => {
      const { suggestions } = get()
      set({ suggestions: suggestions.filter(s => s.id !== suggestionId) })
    },

    executeSuggestion: (suggestionId) => {
      const { suggestions } = get()
      const suggestion = suggestions.find(s => s.id === suggestionId)
      
      if (suggestion) {
        suggestion.action()
        get().dismissSuggestion(suggestionId)
        
        get().trackEvent({
          type: 'feature-discovered',
          timestamp: new Date(),
          featureId: suggestionId,
          metadata: { source: 'suggestion', type: suggestion.type }
        })
      }
    },

    // Analytics
    trackEvent: (event) => {
      const { events } = get()
      set({ events: [...events, event] })
      
      // Keep only last 1000 events for performance
      if (events.length > 1000) {
        set({ events: events.slice(-1000) })
      }
    },

    getAnalytics: () => {
      const { events, userProfile } = get()
      
      return {
        totalEvents: events.length,
        onboardingEvents: events.filter(e => e.type.includes('step')),
        featureDiscoveryEvents: events.filter(e => e.type === 'feature-discovered'),
        completionRate: userProfile?.onboardingCompleted ? 100 : 0,
        timeSpent: get().onboardingState.timeSpent
      }
    },

    // Smart Features
    generateSmartSuggestions: () => {
      const { userProfile, unlockedFeatures } = get()
      if (!userProfile) return

      const suggestions: SmartSuggestion[] = []
      
      // Suggest features based on persona and skill level
      if (userProfile.persona === 'developer' && !unlockedFeatures.has('terminal-advanced')) {
        suggestions.push({
          id: 'suggest-advanced-terminal',
          type: 'feature',
          title: 'Try Advanced Terminal Features',
          description: 'As a developer, you might find our advanced terminal tools helpful',
          action: () => get().unlockFeature('terminal-advanced'),
          relevanceScore: 0.8,
          category: 'terminal',
          metadata: { reason: 'persona-match' }
        })
      }
      
      if (userProfile.featureDiscovery.categoryProgress['mcp-integration'] < 50 && unlockedFeatures.has('chat')) {
        suggestions.push({
          id: 'suggest-mcp-integration',
          type: 'workflow',
          title: 'Enhance Your Workflow with MCP',
          description: 'Connect external tools to supercharge your development process',
          action: () => get().unlockFeature('mcp'),
          relevanceScore: 0.7,
          category: 'mcp-integration',
          metadata: { reason: 'progression' }
        })
      }
      
      set({ suggestions })
    },

    updateNavigationHints: () => {
      const { userProfile, unlockedFeatures } = get()
      if (!userProfile) return

      const hints: NavigationHint[] = []
      
      // Add contextual hints based on current state
      if (!userProfile.onboardingCompleted) {
        hints.push({
          id: 'complete-onboarding',
          title: 'Complete Setup',
          description: 'Finish your onboarding to unlock all features',
          action: 'start-onboarding',
          target: 'onboarding',
          icon: '🚀',
          urgency: 'medium',
          context: { step: userProfile.onboardingStep }
        })
      }
      
      if (userProfile.featureDiscovery.discoveryScore < 30) {
        hints.push({
          id: 'explore-features',
          title: 'Discover Features',
          description: 'You\'ve only explored a few features. There\'s much more to discover!',
          action: 'show-feature-tour',
          target: 'features',
          icon: '🔍',
          urgency: 'low',
          context: { score: userProfile.featureDiscovery.discoveryScore }
        })
      }
      
      set({ navigationHints: hints })
    },

    adaptToUserBehavior: () => {
      const { userProfile } = get()
      if (!userProfile) return

      // Adjust guidance level based on user behavior
      const { events } = get()
      const guidanceDismissals = events.filter(e => e.type === 'guidance-dismissed').length
      const guidanceShown = events.filter(e => e.type === 'guidance-shown').length
      
      if (guidanceDismissals / Math.max(guidanceShown, 1) > 0.7) {
        // User dismisses most guidance, reduce level
        get().updatePreferences({ guidanceLevel: 'minimal' })
      }
      
      // Update suggestions based on behavior
      get().generateSmartSuggestions()
      get().updateNavigationHints()
    }
  }))
)