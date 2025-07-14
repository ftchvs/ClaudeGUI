/**
 * Claude Code Command Center
 * 
 * Visual interface for Claude Code CLI commands - no more terminal needed!
 * This replaces `claude edit`, `claude create`, `claude analyze` etc. with beautiful UI
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { getClaudeCodeService } from '../../services/serviceProvider'

interface CommandItem {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'file' | 'analysis' | 'project' | 'git'
  cliEquivalent: string
  params?: Array<{
    name: string
    type: 'string' | 'file' | 'directory' | 'boolean'
    required: boolean
    description: string
  }>
}

interface ExecutionResult {
  command: string
  success: boolean
  output: string
  duration: number
  timestamp: Date
}

const CLAUDE_CODE_COMMANDS: CommandItem[] = [
  {
    id: 'edit-file',
    name: 'Edit File',
    description: 'Ask Claude to edit a specific file with instructions',
    icon: <Icons.CodeGenerate size={20} className="text-blue-400" />,
    category: 'file',
    cliEquivalent: 'claude edit <file> "<instructions>"',
    params: [
      { name: 'file', type: 'file', required: true, description: 'File to edit' },
      { name: 'instructions', type: 'string', required: true, description: 'What changes to make' }
    ]
  },
  {
    id: 'create-file',
    name: 'Create File',
    description: 'Generate a new file with Claude',
    icon: <Icons.File size={20} className="text-green-400" />,
    category: 'file',
    cliEquivalent: 'claude create <file> "<description>"',
    params: [
      { name: 'file', type: 'string', required: true, description: 'File path to create' },
      { name: 'description', type: 'string', required: true, description: 'What the file should contain' }
    ]
  },
  {
    id: 'analyze-project',
    name: 'Analyze Project',
    description: 'Get AI insights about your project structure and code',
    icon: <Icons.ProjectAnalysis size={20} className="text-purple-400" />,
    category: 'analysis',
    cliEquivalent: 'claude analyze',
    params: [
      { name: 'path', type: 'directory', required: false, description: 'Path to analyze (default: current directory)' },
      { name: 'deep', type: 'boolean', required: false, description: 'Deep analysis including dependencies' }
    ]
  },
  {
    id: 'analyze-file',
    name: 'Analyze File',
    description: 'Get detailed analysis of a specific file',
    icon: <Icons.AISpark size={20} className="text-orange-400" />,
    category: 'analysis',
    cliEquivalent: 'claude analyze <file>',
    params: [
      { name: 'file', type: 'file', required: true, description: 'File to analyze' }
    ]
  },
  {
    id: 'git-commit',
    name: 'Smart Commit',
    description: 'Generate intelligent commit messages based on changes',
    icon: <Icons.Claude size={20} className="text-yellow-400" />,
    category: 'git',
    cliEquivalent: 'claude commit',
    params: [
      { name: 'includeFiles', type: 'boolean', required: false, description: 'Include specific files only' }
    ]
  },
  {
    id: 'explain-code',
    name: 'Explain Code',
    description: 'Get clear explanations of complex code',
    icon: <Icons.Info size={20} className="text-cyan-400" />,
    category: 'analysis',
    cliEquivalent: 'claude explain <file>',
    params: [
      { name: 'file', type: 'file', required: true, description: 'File to explain' },
      { name: 'lineStart', type: 'string', required: false, description: 'Start line (optional)' },
      { name: 'lineEnd', type: 'string', required: false, description: 'End line (optional)' }
    ]
  },
  {
    id: 'refactor-code',
    name: 'Refactor Code',
    description: 'Improve code structure and quality',
    icon: <Icons.Workflow size={20} className="text-red-400" />,
    category: 'file',
    cliEquivalent: 'claude refactor <file>',
    params: [
      { name: 'file', type: 'file', required: true, description: 'File to refactor' },
      { name: 'focus', type: 'string', required: false, description: 'Specific aspect to improve' }
    ]
  },
  {
    id: 'generate-tests',
    name: 'Generate Tests',
    description: 'Create comprehensive tests for your code',
    icon: <Icons.Check size={20} className="text-green-500" />,
    category: 'project',
    cliEquivalent: 'claude test <file>',
    params: [
      { name: 'file', type: 'file', required: true, description: 'File to test' },
      { name: 'framework', type: 'string', required: false, description: 'Testing framework preference' }
    ]
  }
]

export const ClaudeCodeCommandCenter: React.FC = () => {
  const [selectedCommand, setSelectedCommand] = useState<CommandItem | null>(null)
  const [commandParams, setCommandParams] = useState<Record<string, string>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Commands', icon: <Icons.Terminal size={16} /> },
    { id: 'file', name: 'File Operations', icon: <Icons.File size={16} /> },
    { id: 'analysis', name: 'Code Analysis', icon: <Icons.AISpark size={16} /> },
    { id: 'project', name: 'Project Tools', icon: <Icons.ProjectAnalysis size={16} /> },
    { id: 'git', name: 'Git Integration', icon: <Icons.Claude size={16} /> }
  ]

  const filteredCommands = CLAUDE_CODE_COMMANDS.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleExecuteCommand = async () => {
    if (!selectedCommand) return

    setIsExecuting(true)
    const startTime = Date.now()
    const claudeCodeService = getClaudeCodeService()

    try {
      let result
      switch (selectedCommand.id) {
        case 'edit-file':
          result = await claudeCodeService.editFile(
            commandParams.file,
            commandParams.instructions
          )
          break
        case 'create-file':
          result = await claudeCodeService.createFile(
            commandParams.file,
            commandParams.description
          )
          break
        case 'analyze-project':
          result = await claudeCodeService.analyzeProject(
            commandParams.path || undefined,
            { depth: commandParams.deep === 'true' ? 5 : 2 }
          )
          break
        case 'analyze-file':
          result = await claudeCodeService.performFileOperation({
            type: 'read',
            path: commandParams.file
          })
          break
        default:
          result = await claudeCodeService.chat(
            `Execute Claude Code command: ${selectedCommand.cliEquivalent} with params: ${JSON.stringify(commandParams)}`
          )
      }

      const executionResult: ExecutionResult = {
        command: `${selectedCommand.name} (${selectedCommand.cliEquivalent})`,
        success: result.success,
        output: result.output || result.error || 'Command completed',
        duration: Date.now() - startTime,
        timestamp: new Date()
      }

      setExecutionHistory(prev => [executionResult, ...prev.slice(0, 9)]) // Keep last 10
    } catch (error) {
      const executionResult: ExecutionResult = {
        command: `${selectedCommand.name} (${selectedCommand.cliEquivalent})`,
        success: false,
        output: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        timestamp: new Date()
      }
      setExecutionHistory(prev => [executionResult, ...prev.slice(0, 9)])
    } finally {
      setIsExecuting(false)
    }
  }

  const handleParamChange = (paramName: string, value: string) => {
    setCommandParams(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const isCommandReady = selectedCommand && 
    selectedCommand.params?.filter(p => p.required).every(p => commandParams[p.name]?.trim())

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.Claude size={24} className="text-orange-400" />
            <div>
              <h2 className="font-semibold text-white text-lg">Claude Code Command Center</h2>
              <p className="text-sm text-gray-400">Visual interface for Claude Code CLI • No terminal needed</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-orange-400/20 text-orange-400 text-xs rounded-full">
            {CLAUDE_CODE_COMMANDS.length} Commands Available
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex bg-gray-700 rounded-md overflow-hidden">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 text-xs transition-colors flex items-center gap-1 ${
                  selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.icon}
                <span className="hidden md:inline">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-0">
        {/* Command List */}
        <div className="border-r border-gray-700 bg-gray-800/50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium text-white text-sm">Available Commands</h3>
          </div>
          <div className="overflow-auto h-full">
            {filteredCommands.map(command => (
              <div
                key={command.id}
                onClick={() => setSelectedCommand(command)}
                className={`p-4 cursor-pointer transition-colors border-b border-gray-700/50 hover:bg-gray-700 ${
                  selectedCommand?.id === command.id ? 'bg-orange-500/20 border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {command.icon}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm">{command.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{command.description}</p>
                    <code className="text-xs text-gray-500 mt-2 block font-mono">{command.cliEquivalent}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Command Configuration */}
        <div className="border-r border-gray-700">
          {selectedCommand ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  {selectedCommand.icon}
                  <h3 className="font-medium text-white">{selectedCommand.name}</h3>
                </div>
                <p className="text-sm text-gray-400">{selectedCommand.description}</p>
                <code className="text-xs text-gray-500 mt-2 block font-mono bg-gray-800 p-2 rounded">
                  {selectedCommand.cliEquivalent}
                </code>
              </div>

              <div className="flex-1 p-4 space-y-4">
                {selectedCommand.params?.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {param.name} {param.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={param.type === 'boolean' ? 'checkbox' : 'text'}
                      placeholder={param.description}
                      value={commandParams[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, 
                        param.type === 'boolean' ? e.target.checked.toString() : e.target.value
                      )}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                  </div>
                ))}

                <button
                  onClick={handleExecuteCommand}
                  disabled={!isCommandReady || isExecuting}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {isExecuting ? (
                    <>
                      <Icons.Loading size={16} />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Icons.Terminal size={16} />
                      Execute Command
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <Icons.Terminal size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-400 mb-2">Select a Command</h3>
                <p className="text-sm text-gray-500">Choose a Claude Code command from the list to configure and execute it</p>
              </div>
            </div>
          )}
        </div>

        {/* Execution History */}
        <div>
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium text-white text-sm">Execution History</h3>
          </div>
          <div className="overflow-auto h-full">
            {executionHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Icons.Terminal size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No commands executed yet</p>
              </div>
            ) : (
              executionHistory.map((result, index) => (
                <div key={index} className="p-4 border-b border-gray-700/50">
                  <div className="flex items-start gap-2 mb-2">
                    {result.success ? (
                      <Icons.Check size={16} className="text-green-400 mt-0.5" />
                    ) : (
                      <Icons.Error size={16} className="text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-white truncate">{result.command}</h4>
                      <p className="text-xs text-gray-400">{result.timestamp.toLocaleTimeString()}</p>
                    </div>
                    <span className="text-xs text-gray-500">{result.duration}ms</span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 font-mono max-h-20 overflow-hidden">
                    {result.output}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaudeCodeCommandCenter