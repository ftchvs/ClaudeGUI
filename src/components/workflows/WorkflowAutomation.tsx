/**
 * Workflow Automation Component
 * 
 * Automated workflows for common development tasks
 * Chains multiple Claude Code commands together for complex operations
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { getClaudeCodeService } from '../../services/serviceProvider'

interface WorkflowStep {
  id: string
  name: string
  command: string
  args: Record<string, string>
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
  duration?: number
}

interface Workflow {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
  steps: WorkflowStep[]
  triggers?: string[]
  schedule?: string
  isActive: boolean
  lastRun?: Date
  successRate: number
}

interface WorkflowAutomationProps {
  className?: string
  onWorkflowComplete?: (workflow: Workflow, results: any[]) => void
}

export const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  className = '',
  onWorkflowComplete
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false)

  // Mock workflows data
  const mockWorkflows: Workflow[] = [
    {
      id: 'full-feature-dev',
      name: 'Full Feature Development',
      description: 'Complete feature development workflow from planning to deployment',
      category: 'development',
      icon: <Icons.Workflow size={20} className="text-blue-400" />,
      difficulty: 'advanced',
      estimatedTime: '30-45 minutes',
      tags: ['planning', 'development', 'testing', 'deployment'],
      isActive: true,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      successRate: 87,
      steps: [
        {
          id: 'analyze-requirements',
          name: 'Analyze Requirements',
          command: 'analyze',
          args: { type: 'requirements' },
          description: 'Analyze project requirements and suggest implementation approach',
          status: 'pending'
        },
        {
          id: 'generate-structure',
          name: 'Generate File Structure',
          command: 'create',
          args: { type: 'structure' },
          description: 'Create optimal file and folder structure for the feature',
          status: 'pending'
        },
        {
          id: 'implement-core',
          name: 'Implement Core Logic',
          command: 'create',
          args: { type: 'implementation' },
          description: 'Generate core implementation files with best practices',
          status: 'pending'
        },
        {
          id: 'add-tests',
          name: 'Add Tests',
          command: 'create',
          args: { type: 'tests' },
          description: 'Generate comprehensive test suite',
          status: 'pending'
        },
        {
          id: 'update-docs',
          name: 'Update Documentation',
          command: 'edit',
          args: { type: 'documentation' },
          description: 'Update README and API documentation',
          status: 'pending'
        },
        {
          id: 'run-quality-check',
          name: 'Quality Check',
          command: 'analyze',
          args: { type: 'quality' },
          description: 'Run code quality analysis and fix issues',
          status: 'pending'
        }
      ]
    },
    {
      id: 'code-review-prep',
      name: 'Code Review Preparation',
      description: 'Prepare code for review with automated checks and documentation',
      category: 'quality',
      icon: <Icons.Check size={20} className="text-green-400" />,
      difficulty: 'intermediate',
      estimatedTime: '15-20 minutes',
      tags: ['review', 'quality', 'documentation'],
      isActive: true,
      lastRun: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      successRate: 94,
      steps: [
        {
          id: 'analyze-changes',
          name: 'Analyze Changes',
          command: 'analyze',
          args: { scope: 'changes' },
          description: 'Analyze recent changes and their impact',
          status: 'pending'
        },
        {
          id: 'run-linting',
          name: 'Run Linting',
          command: 'lint',
          args: { fix: 'true' },
          description: 'Run linting and auto-fix issues',
          status: 'pending'
        },
        {
          id: 'update-tests',
          name: 'Update Tests',
          command: 'test',
          args: { update: 'true' },
          description: 'Update and run tests for changed code',
          status: 'pending'
        },
        {
          id: 'generate-summary',
          name: 'Generate PR Summary',
          command: 'generate',
          args: { type: 'pr-summary' },
          description: 'Generate pull request summary and changelog',
          status: 'pending'
        }
      ]
    },
    {
      id: 'security-audit',
      name: 'Security Audit',
      description: 'Comprehensive security analysis and vulnerability detection',
      category: 'security',
      icon: <Icons.Warning size={20} className="text-red-400" />,
      difficulty: 'advanced',
      estimatedTime: '20-30 minutes',
      tags: ['security', 'audit', 'vulnerabilities'],
      isActive: false,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      successRate: 91,
      steps: [
        {
          id: 'scan-dependencies',
          name: 'Scan Dependencies',
          command: 'audit',
          args: { type: 'dependencies' },
          description: 'Scan for vulnerable dependencies',
          status: 'pending'
        },
        {
          id: 'analyze-code',
          name: 'Code Security Analysis',
          command: 'analyze',
          args: { type: 'security' },
          description: 'Analyze code for security vulnerabilities',
          status: 'pending'
        },
        {
          id: 'check-configs',
          name: 'Configuration Check',
          command: 'audit',
          args: { type: 'configuration' },
          description: 'Check configuration files for security issues',
          status: 'pending'
        },
        {
          id: 'generate-report',
          name: 'Generate Report',
          command: 'generate',
          args: { type: 'security-report' },
          description: 'Generate comprehensive security report',
          status: 'pending'
        }
      ]
    },
    {
      id: 'performance-optimization',
      name: 'Performance Optimization',
      description: 'Analyze and optimize application performance',
      category: 'performance',
      icon: <Icons.AISpark size={20} className="text-yellow-400" />,
      difficulty: 'intermediate',
      estimatedTime: '25-35 minutes',
      tags: ['performance', 'optimization', 'analysis'],
      isActive: true,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      successRate: 82,
      steps: [
        {
          id: 'performance-analysis',
          name: 'Performance Analysis',
          command: 'analyze',
          args: { type: 'performance' },
          description: 'Analyze application performance bottlenecks',
          status: 'pending'
        },
        {
          id: 'optimize-code',
          name: 'Optimize Code',
          command: 'optimize',
          args: { type: 'code' },
          description: 'Apply performance optimizations to code',
          status: 'pending'
        },
        {
          id: 'optimize-assets',
          name: 'Optimize Assets',
          command: 'optimize',
          args: { type: 'assets' },
          description: 'Optimize images, CSS, and JavaScript',
          status: 'pending'
        },
        {
          id: 'measure-improvement',
          name: 'Measure Improvements',
          command: 'benchmark',
          args: { before: 'true', after: 'true' },
          description: 'Measure performance improvements',
          status: 'pending'
        }
      ]
    }
  ]

  const categories = [
    { id: 'all', name: 'All Workflows', count: mockWorkflows.length },
    { id: 'development', name: 'Development', count: mockWorkflows.filter(w => w.category === 'development').length },
    { id: 'quality', name: 'Quality Assurance', count: mockWorkflows.filter(w => w.category === 'quality').length },
    { id: 'security', name: 'Security', count: mockWorkflows.filter(w => w.category === 'security').length },
    { id: 'performance', name: 'Performance', count: mockWorkflows.filter(w => w.category === 'performance').length }
  ]

  useEffect(() => {
    setWorkflows(mockWorkflows)
  }, [])

  const filteredWorkflows = workflows.filter(workflow => 
    selectedCategory === 'all' || workflow.category === selectedCategory
  )

  const runWorkflow = async (workflow: Workflow) => {
    setRunningWorkflow(workflow.id)
    setSelectedWorkflow(workflow)

    const claudeCodeService = getClaudeCodeService()
    const results: any[] = []

    // Reset all steps to pending
    const updatedWorkflow = {
      ...workflow,
      steps: workflow.steps.map(step => ({ ...step, status: 'pending' as const, output: undefined, duration: undefined }))
    }
    setSelectedWorkflow(updatedWorkflow)

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        const startTime = Date.now()

        // Update step status to running
        setSelectedWorkflow(prev => prev ? {
          ...prev,
          steps: prev.steps.map(s => s.id === step.id ? { ...s, status: 'running' } : s)
        } : prev)

        try {
          // Simulate Claude Code command execution
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)) // 2-5 seconds

          let result
          switch (step.command) {
            case 'analyze':
              result = await claudeCodeService.analyzeProject(undefined, { depth: 3 })
              break
            case 'create':
              result = await claudeCodeService.createFile(`${step.args.type}-output.txt`, `Generated ${step.name}`)
              break
            case 'edit':
              result = await claudeCodeService.editFile('README.md', `Update documentation for ${step.name}`)
              break
            default:
              result = await claudeCodeService.chat(`Execute ${step.command} with args: ${JSON.stringify(step.args)}`)
          }

          results.push(result)
          const duration = Date.now() - startTime

          // Update step status to completed
          setSelectedWorkflow(prev => prev ? {
            ...prev,
            steps: prev.steps.map(s => s.id === step.id ? {
              ...s,
              status: 'completed',
              output: result.output || 'Step completed successfully',
              duration
            } : s)
          } : prev)

        } catch (error) {
          const duration = Date.now() - startTime
          
          // Update step status to failed
          setSelectedWorkflow(prev => prev ? {
            ...prev,
            steps: prev.steps.map(s => s.id === step.id ? {
              ...s,
              status: 'failed',
              output: error instanceof Error ? error.message : 'Step failed',
              duration
            } : s)
          } : prev)

          break // Stop workflow on first failure
        }
      }

      onWorkflowComplete?.(workflow, results)
    } finally {
      setRunningWorkflow(null)
    }
  }

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return <Icons.Clock size={16} className="text-gray-400" />
      case 'running':
        return <Icons.Loading size={16} className="text-blue-400" />
      case 'completed':
        return <Icons.Check size={16} className="text-green-400" />
      case 'failed':
        return <Icons.Error size={16} className="text-red-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex ${className}`}>
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 bg-gray-800/50 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Workflow size={24} className="text-purple-400" />
            <div>
              <h2 className="font-semibold text-white">Workflow Automation</h2>
              <p className="text-sm text-gray-400">Automated development workflows</p>
            </div>
          </div>

          <button
            onClick={() => setShowWorkflowBuilder(true)}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Icons.Plus size={16} />
            Create Workflow
          </button>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-purple-600/20 text-purple-400' 
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedWorkflow ? (
          // Workflow Execution View
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedWorkflow.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedWorkflow.name}</h3>
                    <p className="text-gray-400">{selectedWorkflow.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Icons.X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Estimated time: {selectedWorkflow.estimatedTime}</span>
                <span>•</span>
                <span>{selectedWorkflow.steps.length} steps</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded ${getDifficultyColor(selectedWorkflow.difficulty)}`}>
                  {selectedWorkflow.difficulty}
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-4">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-300 text-sm font-medium">
                        {index + 1}
                      </div>
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{step.name}</h4>
                        <p className="text-sm text-gray-400">{step.description}</p>
                      </div>
                      {step.duration && (
                        <span className="text-xs text-gray-500">{step.duration}ms</span>
                      )}
                    </div>

                    {step.output && (
                      <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-600">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-auto max-h-32">
                          {step.output}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Workflow List View
          <>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedCategory === 'all' ? 'All Workflows' : categories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-gray-400">{filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} available</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredWorkflows.map(workflow => (
                  <div key={workflow.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {workflow.icon}
                          <div>
                            <h4 className="font-semibold text-white">{workflow.name}</h4>
                            <p className="text-sm text-gray-400">{workflow.description}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(workflow.difficulty)}`}>
                          {workflow.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          {workflow.steps.length} steps
                        </span>
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                          {workflow.estimatedTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span>Success rate: {workflow.successRate}%</span>
                        {workflow.lastRun && (
                          <span>Last run: {workflow.lastRun.toLocaleDateString()}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {workflow.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {workflow.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                            +{workflow.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedWorkflow(workflow)}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          <Icons.Eye size={16} />
                          View Steps
                        </button>
                        <button
                          onClick={() => runWorkflow(workflow)}
                          disabled={runningWorkflow === workflow.id}
                          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          {runningWorkflow === workflow.id ? (
                            <>
                              <Icons.Loading size={16} />
                              Running...
                            </>
                          ) : (
                            <>
                              <Icons.Workflow size={16} />
                              Run Workflow
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-12">
                  <Icons.Workflow size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-white mb-2">No Workflows Found</h3>
                  <p className="text-gray-400">Try selecting a different category</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WorkflowAutomation