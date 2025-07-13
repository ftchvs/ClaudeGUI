import { useCallback, useMemo } from 'react'
import { useMcpStore } from '@/stores/mcp'
import type { McpWorkflow, McpWorkflowStep, McpOperationType } from '@/types/mcp'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'research' | 'development' | 'analysis' | 'automation'
  steps: Omit<McpWorkflowStep, 'id'>[]
}

export const useMcpWorkflows = () => {
  const {
    workflows,
    operations,
    servers,
    createWorkflow,
    executeWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    deleteWorkflow
  } = useMcpStore()

  // Computed values
  const workflowList = useMemo(() => Object.values(workflows), [workflows])
  
  const activeWorkflows = useMemo(() => 
    workflowList.filter(w => w.status === 'running'),
    [workflowList]
  )
  
  const completedWorkflows = useMemo(() => 
    workflowList.filter(w => w.status === 'completed'),
    [workflowList]
  )
  
  const failedWorkflows = useMemo(() => 
    workflowList.filter(w => w.status === 'failed'),
    [workflowList]
  )

  // Workflow templates for common patterns
  const templates: WorkflowTemplate[] = useMemo(() => [
    {
      id: 'github-research',
      name: 'GitHub Repository Research',
      description: 'Search GitHub repositories, analyze code, and create documentation',
      category: 'research',
      steps: [
        {
          operationType: 'search-repositories',
          serverId: 'github',
          parameters: { query: '{{searchQuery}}' },
          dependsOn: []
        },
        {
          operationType: 'get-file-contents',
          serverId: 'github',
          parameters: { 
            owner: '{{repoOwner}}',
            repo: '{{repoName}}',
            path: 'README.md'
          },
          dependsOn: ['0']
        },
        {
          operationType: 'search-code',
          serverId: 'github',
          parameters: { q: '{{codeQuery}}' },
          dependsOn: ['0']
        }
      ]
    },
    {
      id: 'web-research',
      name: 'Comprehensive Web Research',
      description: 'Search web content, scrape relevant pages, and extract structured data',
      category: 'research',
      steps: [
        {
          operationType: 'search',
          serverId: 'firecrawl',
          parameters: { query: '{{searchQuery}}', limit: 10 },
          dependsOn: []
        },
        {
          operationType: 'scrape',
          serverId: 'firecrawl',
          parameters: { url: '{{targetUrl}}' },
          dependsOn: ['0']
        },
        {
          operationType: 'extract',
          serverId: 'firecrawl',
          parameters: { 
            urls: ['{{targetUrl}}'],
            schema: '{{extractionSchema}}'
          },
          dependsOn: ['1']
        }
      ]
    },
    {
      id: 'documentation-lookup',
      name: 'Library Documentation Lookup',
      description: 'Find and retrieve comprehensive documentation for libraries',
      category: 'development',
      steps: [
        {
          operationType: 'resolve-library-id',
          serverId: 'context7',
          parameters: { libraryName: '{{libraryName}}' },
          dependsOn: []
        },
        {
          operationType: 'get-library-docs',
          serverId: 'context7',
          parameters: { 
            context7CompatibleLibraryID: '{{libraryId}}',
            topic: '{{topic}}',
            tokens: 10000
          },
          dependsOn: ['0']
        }
      ]
    },
    {
      id: 'browser-automation',
      name: 'Browser Automation Workflow',
      description: 'Navigate, interact with, and capture web page content',
      category: 'automation',
      steps: [
        {
          operationType: 'navigate',
          serverId: 'puppeteer',
          parameters: { url: '{{targetUrl}}' },
          dependsOn: []
        },
        {
          operationType: 'screenshot',
          serverId: 'puppeteer',
          parameters: { name: 'initial-state' },
          dependsOn: ['0']
        },
        {
          operationType: 'fill',
          serverId: 'puppeteer',
          parameters: { 
            selector: '{{inputSelector}}',
            value: '{{inputValue}}'
          },
          dependsOn: ['1'],
          condition: '{{inputSelector}} && {{inputValue}}'
        },
        {
          operationType: 'click',
          serverId: 'puppeteer',
          parameters: { selector: '{{buttonSelector}}' },
          dependsOn: ['2'],
          condition: '{{buttonSelector}}'
        },
        {
          operationType: 'screenshot',
          serverId: 'puppeteer',
          parameters: { name: 'final-state' },
          dependsOn: ['3']
        }
      ]
    },
    {
      id: 'code-analysis',
      name: 'Code Analysis & Execution',
      description: 'Analyze code, check diagnostics, and execute tests',
      category: 'development',
      steps: [
        {
          operationType: 'get-diagnostics',
          serverId: 'ide',
          parameters: { uri: '{{fileUri}}' },
          dependsOn: []
        },
        {
          operationType: 'execute-code',
          serverId: 'ide',
          parameters: { code: '{{codeToExecute}}' },
          dependsOn: ['0'],
          condition: 'diagnostics.length === 0'
        }
      ]
    }
  ], [])

  // Workflow creation with templates
  const createFromTemplate = useCallback((
    templateId: string,
    parameters: Record<string, any>,
    customName?: string
  ) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Replace template parameters in steps
    const processedSteps: McpWorkflowStep[] = template.steps.map((step, index) => ({
      ...step,
      id: crypto.randomUUID(),
      parameters: replaceTemplateParams(step.parameters, parameters),
      condition: step.condition ? replaceTemplateParams({ condition: step.condition }, parameters).condition : undefined
    }))

    const workflow = {
      name: customName || template.name,
      description: template.description,
      steps: processedSteps
    }

    return createWorkflow(workflow)
  }, [templates, createWorkflow])

  // Template parameter replacement
  const replaceTemplateParams = (obj: any, params: Record<string, any>): any => {
    if (typeof obj === 'string') {
      return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match
      })
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => replaceTemplateParams(item, params))
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceTemplateParams(value, params)
      }
      return result
    }
    
    return obj
  }

  // Workflow management
  const create = useCallback((
    workflow: Omit<McpWorkflow, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'results'>
  ) => {
    return createWorkflow(workflow)
  }, [createWorkflow])

  const execute = useCallback(async (workflowId: string) => {
    const workflow = workflows[workflowId]
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    return executeWorkflow(workflowId)
  }, [workflows, executeWorkflow])

  const pause = useCallback((workflowId: string) => {
    pauseWorkflow(workflowId)
  }, [pauseWorkflow])

  const resume = useCallback(async (workflowId: string) => {
    return resumeWorkflow(workflowId)
  }, [resumeWorkflow])

  const cancel = useCallback((workflowId: string) => {
    cancelWorkflow(workflowId)
  }, [cancelWorkflow])

  const remove = useCallback((workflowId: string) => {
    deleteWorkflow(workflowId)
  }, [deleteWorkflow])

  const duplicate = useCallback((workflowId: string, newName?: string) => {
    const workflow = workflows[workflowId]
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const duplicatedWorkflow = {
      name: newName || `${workflow.name} (Copy)`,
      description: workflow.description,
      steps: workflow.steps.map(step => ({
        ...step,
        id: crypto.randomUUID()
      }))
    }

    return createWorkflow(duplicatedWorkflow)
  }, [workflows, createWorkflow])

  // Workflow validation
  const validateWorkflow = useCallback((workflow: Partial<McpWorkflow>) => {
    const errors: string[] = []
    
    if (!workflow.name?.trim()) {
      errors.push('Workflow name is required')
    }
    
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step')
    }

    if (workflow.steps) {
      // Check for circular dependencies
      const stepIds = new Set(workflow.steps.map(s => s.id))
      const visited = new Set<string>()
      const recursionStack = new Set<string>()
      
      const hasCycle = (stepId: string): boolean => {
        if (recursionStack.has(stepId)) return true
        if (visited.has(stepId)) return false
        
        visited.add(stepId)
        recursionStack.add(stepId)
        
        const step = workflow.steps!.find(s => s.id === stepId)
        if (step) {
          for (const depId of step.dependsOn) {
            if (hasCycle(depId)) return true
          }
        }
        
        recursionStack.delete(stepId)
        return false
      }
      
      for (const step of workflow.steps) {
        if (hasCycle(step.id)) {
          errors.push('Workflow contains circular dependencies')
          break
        }
      }
      
      // Check if all dependencies exist
      workflow.steps.forEach((step, index) => {
        step.dependsOn.forEach(depId => {
          if (!stepIds.has(depId)) {
            errors.push(`Step ${index + 1} depends on non-existent step ${depId}`)
          }
        })
        
        // Check if server exists
        const server = servers[step.serverId]
        if (!server) {
          errors.push(`Step ${index + 1} references non-existent server ${step.serverId}`)
        } else if (!server.config.enabled) {
          errors.push(`Step ${index + 1} references disabled server ${step.serverId}`)
        }
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [servers])

  // Workflow analysis
  const analyzeWorkflow = useCallback((workflowId: string) => {
    const workflow = workflows[workflowId]
    if (!workflow) return null

    const stepCount = workflow.steps.length
    const serverCount = new Set(workflow.steps.map(s => s.serverId)).size
    const operationTypes = new Set(workflow.steps.map(s => s.operationType))
    
    // Calculate estimated duration based on historical data
    const estimatedDuration = workflow.steps.reduce((total, step) => {
      const historicalOps = Object.values(operations).filter(op => 
        op.serverId === step.serverId && 
        op.type === step.operationType &&
        op.status === 'completed'
      )
      
      const avgDuration = historicalOps.length > 0
        ? historicalOps.reduce((acc, op) => acc + (op.duration || 0), 0) / historicalOps.length
        : 5000 // Default 5 seconds if no historical data
      
      return total + avgDuration
    }, 0)

    // Identify potential bottlenecks
    const bottlenecks = workflow.steps.filter(step => {
      const server = servers[step.serverId]
      return server && (
        server.health.status !== 'connected' ||
        server.health.responseTime > 2000 ||
        server.health.successRate < 90
      )
    })

    return {
      stepCount,
      serverCount,
      operationTypes: Array.from(operationTypes),
      estimatedDuration,
      bottlenecks: bottlenecks.map(step => ({
        stepId: step.id,
        serverId: step.serverId,
        operationType: step.operationType,
        issue: servers[step.serverId]?.health.status !== 'connected' 
          ? 'Server disconnected'
          : servers[step.serverId]?.health.responseTime > 2000
          ? 'High response time'
          : 'Low success rate'
      })),
      complexity: stepCount > 10 ? 'high' : stepCount > 5 ? 'medium' : 'low'
    }
  }, [workflows, operations, servers])

  // Workflow statistics
  const stats = useMemo(() => {
    const total = workflowList.length
    const completed = completedWorkflows.length
    const failed = failedWorkflows.length
    const running = activeWorkflows.length

    const successRate = total > 0 ? (completed / (completed + failed)) * 100 : 100
    
    const totalSteps = workflowList.reduce((acc, w) => acc + w.steps.length, 0)
    const avgStepsPerWorkflow = total > 0 ? totalSteps / total : 0

    const templatesUsed = templates.length // In real implementation, track actual usage

    return {
      total,
      completed,
      failed,
      running,
      paused: workflowList.filter(w => w.status === 'paused').length,
      draft: workflowList.filter(w => w.status === 'draft').length,
      successRate,
      avgStepsPerWorkflow,
      totalSteps,
      templatesAvailable: templates.length,
      templatesUsed
    }
  }, [workflowList, completedWorkflows, failedWorkflows, activeWorkflows, templates])

  return {
    // Data
    workflows: workflowList,
    activeWorkflows,
    completedWorkflows,
    failedWorkflows,
    templates,
    stats,
    
    // Workflow management
    create,
    createFromTemplate,
    execute,
    pause,
    resume,
    cancel,
    remove,
    duplicate,
    
    // Workflow utilities
    validateWorkflow,
    analyzeWorkflow,
    getWorkflow: (id: string) => workflows[id] || null,
    
    // Template utilities
    getTemplate: (id: string) => templates.find(t => t.id === id) || null,
    getTemplatesByCategory: (category: WorkflowTemplate['category']) => 
      templates.filter(t => t.category === category),
    
    // Status checks
    isRunning: (workflowId: string) => workflows[workflowId]?.status === 'running',
    canExecute: (workflowId: string) => {
      const workflow = workflows[workflowId]
      return workflow && ['draft', 'paused', 'failed'].includes(workflow.status)
    },
    canPause: (workflowId: string) => workflows[workflowId]?.status === 'running',
    canResume: (workflowId: string) => workflows[workflowId]?.status === 'paused'
  }
}