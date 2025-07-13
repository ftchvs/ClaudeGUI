import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  BookOpen, 
  Rocket, 
  Search, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Palette,
  Monitor,
  Zap,
  Target,
  Star,
  Coffee,
  Code,
  Users,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useOnboardingStore } from '@/stores/onboarding'
import type { UserPersona, OnboardingStep } from '@/types/onboarding'

interface WelcomeJourneyProps {
  onComplete: () => void
  onSkip: () => void
}

interface StepProps {
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

// Step 1: Welcome & Introduction
const WelcomeStep: React.FC<StepProps> = ({ onNext, onSkip, isFirst }) => {
  const [selectedMotivation, setSelectedMotivation] = useState('')
  
  const motivations = [
    { id: 'efficiency', label: 'Boost my productivity', icon: <Zap className="h-5 w-5" /> },
    { id: 'learning', label: 'Learn new development skills', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'collaboration', label: 'Improve team collaboration', icon: <Users className="h-5 w-5" /> },
    { id: 'exploration', label: 'Explore AI-powered tools', icon: <Search className="h-5 w-5" /> }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
      </motion.div>

      <div className="space-y-4">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Welcome to ClaudeGUI
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-muted-foreground"
        >
          Your premium Claude Code interface with intelligent MCP integration
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">What brings you here today?</h3>
        <div className="grid grid-cols-2 gap-3">
          {motivations.map((motivation) => (
            <motion.div
              key={motivation.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => setSelectedMotivation(motivation.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMotivation === motivation.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-muted hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${selectedMotivation === motivation.id ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {motivation.icon}
                  </div>
                  <span className="font-medium">{motivation.label}</span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedMotivation}
          className="min-w-32"
        >
          Get Started
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}

// Step 2: Persona Selection
const PersonaStep: React.FC<StepProps> = ({ onNext, onPrevious, onSkip }) => {
  const { setPersona } = useOnboardingStore()
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | ''>('')

  const personas = [
    {
      id: 'newcomer' as UserPersona,
      title: 'New to Claude Code',
      description: 'First time using Claude Code, want guided experience',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-green-100 border-green-300 text-green-800',
      benefits: ['Step-by-step guidance', 'Built-in tutorials', 'Safe learning environment']
    },
    {
      id: 'developer' as UserPersona,
      title: 'Experienced Developer',
      description: 'Familiar with development tools, want efficient workflows',
      icon: <Code className="h-6 w-6" />,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      benefits: ['Advanced shortcuts', 'Powerful integrations', 'Customizable interface']
    },
    {
      id: 'power-user' as UserPersona,
      title: 'Power User',
      description: 'Expert user seeking maximum efficiency and automation',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      benefits: ['Advanced automation', 'Workflow optimization', 'Beta features access']
    },
    {
      id: 'team-lead' as UserPersona,
      title: 'Team Lead',
      description: 'Managing projects and team workflows',
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      benefits: ['Team collaboration', 'Project management', 'Usage analytics']
    }
  ]

  const handleNext = () => {
    if (selectedPersona) {
      setPersona(selectedPersona)
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold">Choose Your Experience</h2>
        <p className="text-muted-foreground">
          We'll customize the interface based on your role and experience level
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((persona) => (
          <motion.div
            key={persona.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <button
              onClick={() => setSelectedPersona(persona.id)}
              className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                selectedPersona === persona.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-muted hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {selectedPersona === persona.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${persona.color}`}>
                    {persona.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{persona.title}</h3>
                    <p className="text-sm text-muted-foreground">{persona.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">You'll get:</h4>
                  <ul className="space-y-1">
                    {persona.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedPersona}
            className="min-w-32"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Step 3: Preference Setup
const PreferenceStep: React.FC<StepProps> = ({ onNext, onPrevious, onSkip }) => {
  const { updatePreferences } = useOnboardingStore()
  const [preferences, setPreferences] = useState({
    theme: 'auto',
    layoutDensity: 'comfortable',
    guidanceLevel: 'normal',
    notificationLevel: 'normal',
    reducedMotion: false
  })

  const handleNext = () => {
    updatePreferences(preferences)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold">Customize Your Interface</h2>
        <p className="text-muted-foreground">
          Set up your preferences to create the perfect working environment
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <Select value={preferences.theme} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, theme: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (system)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Layout Density</Label>
              <RadioGroup
                value={preferences.layoutDensity}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, layoutDensity: value }))}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact">Compact</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <Label htmlFor="comfortable">Comfortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="spacious" />
                  <Label htmlFor="spacious">Spacious</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Guidance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Guidance & Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Guidance Level</Label>
              <Select value={preferences.guidanceLevel} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, guidanceLevel: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Notifications</Label>
              <Select value={preferences.notificationLevel} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, notificationLevel: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reducedMotion"
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, reducedMotion: !!checked }))
                }
              />
              <Label htmlFor="reducedMotion">Reduce motion and animations</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={handleNext} className="min-w-32">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Step 4: Core Concepts Introduction
const ConceptsStep: React.FC<StepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [currentConcept, setCurrentConcept] = useState(0)
  
  const concepts = [
    {
      title: 'Claude Code Integration',
      description: 'Direct integration with Claude for intelligent code assistance',
      icon: <Code className="h-8 w-8" />,
      features: ['Real-time code help', 'Smart suggestions', 'Error detection'],
      demo: 'Interactive code editing demo'
    },
    {
      title: 'MCP Servers',
      description: 'Connect external tools and services to enhance your workflow',
      icon: <Zap className="h-8 w-8" />,
      features: ['GitHub integration', 'Web scraping', 'File operations'],
      demo: 'Live MCP connection demo'
    },
    {
      title: 'Smart Workspace',
      description: 'Adaptive interface that learns from your usage patterns',
      icon: <Monitor className="h-8 w-8" />,
      features: ['Auto panel layout', 'Context awareness', 'Workflow optimization'],
      demo: 'Workspace customization demo'
    }
  ]

  const currentConceptData = concepts[currentConcept]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold">Core Concepts</h2>
        <p className="text-muted-foreground">
          Understanding these will help you get the most out of ClaudeGUI
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center space-x-2">
        {concepts.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentConcept ? 'bg-blue-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Concept display */}
      <Card className="min-h-96">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentConcept}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                {currentConceptData.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold">{currentConceptData.title}</h3>
                <p className="text-muted-foreground">{currentConceptData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentConceptData.features.map((feature, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <Coffee className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800">{currentConceptData.demo}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          {currentConcept > 0 && (
            <Button variant="outline" onClick={() => setCurrentConcept(prev => prev - 1)}>
              Previous Concept
            </Button>
          )}
          
          {currentConcept < concepts.length - 1 ? (
            <Button onClick={() => setCurrentConcept(prev => prev + 1)}>
              Next Concept
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={onNext}>
              Continue to Next Step
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Step 5: First Project Setup
const FirstProjectStep: React.FC<StepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState('')
  const [description, setDescription] = useState('')
  
  const projectTypes = [
    { id: 'web', label: 'Web Application', icon: '🌐' },
    { id: 'api', label: 'API/Backend', icon: '⚡' },
    { id: 'mobile', label: 'Mobile App', icon: '📱' },
    { id: 'desktop', label: 'Desktop App', icon: '💻' },
    { id: 'other', label: 'Other', icon: '🔧' }
  ]

  const canContinue = projectName.trim() !== '' && projectType !== ''

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold">Create Your First Project</h2>
        <p className="text-muted-foreground">
          Let's set up a project to explore ClaudeGUI's features
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="My awesome project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Project Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    projectType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-muted hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button 
            onClick={onNext}
            disabled={!canContinue}
            className="min-w-32"
          >
            Create Project
            <Rocket className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Step 6: Feature Discovery
const DiscoveryStep: React.FC<StepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  
  const features = [
    { id: 'mcp', name: 'MCP Integration', description: 'Connect external services', priority: 'high' },
    { id: 'terminal', name: 'Integrated Terminal', description: 'Run commands directly', priority: 'medium' },
    { id: 'collaboration', name: 'Team Features', description: 'Share and collaborate', priority: 'medium' },
    { id: 'automation', name: 'Workflow Automation', description: 'Automate repetitive tasks', priority: 'low' }
  ]

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold">Discover Features</h2>
        <p className="text-muted-foreground">
          Choose which features you'd like to explore first
        </p>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <Card 
            key={feature.id}
            className={`cursor-pointer transition-all ${
              selectedFeatures.includes(feature.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleFeature(feature.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedFeatures.includes(feature.id)}
                    onChange={() => {}} // Controlled by card click
                  />
                  <div>
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Badge variant={feature.priority === 'high' ? 'default' : 'secondary'}>
                  {feature.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onNext} className="min-w-32">
            Complete Setup
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Main Welcome Journey Component
export const WelcomeJourney: React.FC<WelcomeJourneyProps> = ({ onComplete, onSkip }) => {
  const {
    onboardingState,
    nextOnboardingStep,
    previousOnboardingStep,
    skipOnboardingStep,
    completeOnboarding,
    updateStepProgress
  } = useOnboardingStore()

  const steps: OnboardingStep[] = [
    'welcome',
    'persona-selection',
    'preference-setup',
    'core-concepts',
    'first-project',
    'feature-discovery'
  ]

  const currentStepIndex = steps.indexOf(onboardingState.currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStepIndex === steps.length - 1) {
      completeOnboarding()
      onComplete()
    } else {
      nextOnboardingStep()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      previousOnboardingStep()
    }
  }

  const handleSkip = () => {
    skipOnboardingStep()
    if (currentStepIndex === steps.length - 1) {
      onComplete()
    }
  }

  const renderStep = () => {
    const stepProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onSkip: handleSkip,
      isFirst: currentStepIndex === 0,
      isLast: currentStepIndex === steps.length - 1
    }

    switch (onboardingState.currentStep) {
      case 'welcome':
        return <WelcomeStep {...stepProps} />
      case 'persona-selection':
        return <PersonaStep {...stepProps} />
      case 'preference-setup':
        return <PreferenceStep {...stepProps} />
      case 'core-concepts':
        return <ConceptsStep {...stepProps} />
      case 'first-project':
        return <FirstProjectStep {...stepProps} />
      case 'feature-discovery':
        return <DiscoveryStep {...stepProps} />
      default:
        return <WelcomeStep {...stepProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default WelcomeJourney