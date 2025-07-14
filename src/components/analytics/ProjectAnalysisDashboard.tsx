/**
 * Project Analysis Dashboard
 * 
 * Intelligent insights about the codebase using Claude Code's analysis capabilities
 * Shows code quality, architecture, dependencies, and improvement suggestions
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { getClaudeCodeService } from '../../services/serviceProvider'

interface CodeQualityMetrics {
  overall: number
  maintainability: number
  complexity: number
  testCoverage: number
  security: number
  performance: number
}

interface DependencyInfo {
  name: string
  version: string
  type: 'production' | 'development' | 'peer'
  isOutdated: boolean
  vulnerabilities: number
  size: string
}

interface FileAnalysis {
  filename: string
  language: string
  lines: number
  complexity: number
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion'
    message: string
    line?: number
  }>
  quality: number
}

interface ArchitectureInsight {
  title: string
  description: string
  type: 'strength' | 'concern' | 'opportunity'
  impact: 'low' | 'medium' | 'high'
  suggestions: string[]
}

interface ProjectAnalysis {
  overview: {
    totalFiles: number
    totalLines: number
    languages: Record<string, number>
    lastUpdated: Date
  }
  quality: CodeQualityMetrics
  dependencies: DependencyInfo[]
  topFiles: FileAnalysis[]
  architecture: ArchitectureInsight[]
  suggestions: Array<{
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    effort: 'small' | 'medium' | 'large'
    category: 'quality' | 'performance' | 'security' | 'maintainability'
  }>
}

interface ProjectAnalysisDashboardProps {
  className?: string
  projectPath?: string
}

export const ProjectAnalysisDashboard: React.FC<ProjectAnalysisDashboardProps> = ({
  className = '',
  projectPath = '/workspace'
}) => {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'quality' | 'dependencies' | 'files' | 'architecture'>('overview')

  // Mock analysis data for development
  const mockAnalysis: ProjectAnalysis = {
    overview: {
      totalFiles: 45,
      totalLines: 12580,
      languages: {
        'TypeScript': 8420,
        'JavaScript': 2160,
        'CSS': 1200,
        'HTML': 800
      },
      lastUpdated: new Date()
    },
    quality: {
      overall: 87,
      maintainability: 92,
      complexity: 75,
      testCoverage: 68,
      security: 95,
      performance: 83
    },
    dependencies: [
      {
        name: 'react',
        version: '18.2.0',
        type: 'production',
        isOutdated: false,
        vulnerabilities: 0,
        size: '42.2 KB'
      },
      {
        name: 'lodash',
        version: '4.17.20',
        type: 'production',
        isOutdated: true,
        vulnerabilities: 1,
        size: '531 KB'
      },
      {
        name: 'electron',
        version: '37.2.1',
        type: 'development',
        isOutdated: false,
        vulnerabilities: 0,
        size: '158 MB'
      }
    ],
    topFiles: [
      {
        filename: 'src/EnhancedApp.tsx',
        language: 'TypeScript',
        lines: 650,
        complexity: 45,
        quality: 78,
        issues: [
          {
            type: 'warning',
            message: 'Component is too large, consider splitting',
            line: 1
          },
          {
            type: 'suggestion',
            message: 'Add error boundaries for better UX',
            line: 334
          }
        ]
      },
      {
        filename: 'src/services/claudeCodeService.ts',
        language: 'TypeScript',
        lines: 420,
        complexity: 32,
        quality: 92,
        issues: [
          {
            type: 'suggestion',
            message: 'Consider adding JSDoc comments',
            line: 15
          }
        ]
      }
    ],
    architecture: [
      {
        title: 'Modular Service Architecture',
        description: 'Well-structured service layer with clear separation of concerns',
        type: 'strength',
        impact: 'high',
        suggestions: []
      },
      {
        title: 'Large Component Files',
        description: 'Some components exceed recommended size limits',
        type: 'concern',
        impact: 'medium',
        suggestions: [
          'Split large components into smaller, focused components',
          'Extract custom hooks for complex state logic',
          'Consider component composition patterns'
        ]
      },
      {
        title: 'Testing Coverage Opportunity',
        description: 'Current test coverage could be improved',
        type: 'opportunity',
        impact: 'high',
        suggestions: [
          'Add unit tests for critical business logic',
          'Implement integration tests for user workflows',
          'Set up automated testing in CI/CD pipeline'
        ]
      }
    ],
    suggestions: [
      {
        title: 'Improve Test Coverage',
        description: 'Add comprehensive tests to increase reliability and maintainability',
        priority: 'high',
        effort: 'large',
        category: 'quality'
      },
      {
        title: 'Update Outdated Dependencies',
        description: 'Several dependencies have newer versions with security fixes',
        priority: 'medium',
        effort: 'small',
        category: 'security'
      },
      {
        title: 'Optimize Bundle Size',
        description: 'Implement code splitting and tree shaking to reduce bundle size',
        priority: 'medium',
        effort: 'medium',
        category: 'performance'
      }
    ]
  }

  useEffect(() => {
    // Initialize with mock data for development
    setAnalysis(mockAnalysis)
  }, [projectPath])

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const claudeCodeService = getClaudeCodeService()
      const result = await claudeCodeService.analyzeProject(projectPath, {
        depth: 5,
        includeTests: true,
        includeDocs: true
      })

      if (result.success && result.analysis) {
        // Transform Claude Code analysis to our format
        // This would need to be implemented based on actual Claude Code output
        setAnalysis(mockAnalysis) // For now, use mock data
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <Icons.Check size={16} className="text-green-400" />
    if (score >= 75) return <Icons.Warning size={16} className="text-yellow-400" />
    return <Icons.Error size={16} className="text-red-400" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Project Stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icons.File size={20} className="text-blue-400" />
          <h3 className="font-semibold text-white">Project Size</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Files</span>
            <span className="text-white font-medium">{analysis?.overview.totalFiles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Lines</span>
            <span className="text-white font-medium">{analysis?.overview.totalLines.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Code Quality */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icons.AISpark size={20} className="text-green-400" />
          <h3 className="font-semibold text-white">Code Quality</h3>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${getQualityColor(analysis?.quality.overall || 0)}`}>
            {analysis?.quality.overall}%
          </div>
          <p className="text-gray-400 text-sm">Overall Score</p>
        </div>
      </div>

      {/* Dependencies */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Workflow size={20} className="text-purple-400" />
          <h3 className="font-semibold text-white">Dependencies</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Total</span>
            <span className="text-white font-medium">{analysis?.dependencies.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Outdated</span>
            <span className="text-yellow-400 font-medium">
              {analysis?.dependencies.filter(d => d.isOutdated).length}
            </span>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Code size={20} className="text-orange-400" />
          <h3 className="font-semibold text-white">Languages</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(analysis?.overview.languages || {}).map(([lang, lines]) => (
            <div key={lang} className="flex justify-between">
              <span className="text-gray-400 text-sm">{lang}</span>
              <span className="text-white font-medium">{lines.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderQualityMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(analysis?.quality || {}).map(([metric, score]) => (
        <div key={metric} className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white capitalize">
              {metric.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            {getQualityIcon(score)}
          </div>
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-sm">Score</span>
              <span className={`font-medium ${getQualityColor(score)}`}>{score}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  score >= 90 ? 'bg-green-400' :
                  score >= 75 ? 'bg-yellow-400' :
                  score >= 60 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderArchitectureInsights = () => (
    <div className="space-y-6">
      {analysis?.architecture.map((insight, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${
              insight.type === 'strength' ? 'bg-green-400/20 text-green-400' :
              insight.type === 'concern' ? 'bg-red-400/20 text-red-400' :
              'bg-blue-400/20 text-blue-400'
            }`}>
              {insight.type === 'strength' ? <Icons.Check size={20} /> :
               insight.type === 'concern' ? <Icons.Warning size={20} /> :
               <Icons.AISpark size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-white">{insight.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insight.impact === 'high' ? 'bg-red-400/20 text-red-400' :
                  insight.impact === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-green-400/20 text-green-400'
                }`}>
                  {insight.impact} impact
                </span>
              </div>
              <p className="text-gray-400 mb-3">{insight.description}</p>
              {insight.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Suggestions:</h4>
                  <ul className="space-y-1">
                    {insight.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <Icons.AISpark size={12} className="text-blue-400" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.ProjectAnalysis size={24} className="text-blue-400" />
            <div>
              <h2 className="font-semibold text-white text-lg">Project Analysis</h2>
              <p className="text-sm text-gray-400">AI-powered insights about your codebase</p>
            </div>
          </div>
          
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Icons.Loading size={16} />
                Analyzing...
              </>
            ) : (
              <>
                <Icons.AISpark size={16} />
                Run Analysis
              </>
            )}
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex bg-gray-700 rounded-md overflow-hidden">
          {[
            { id: 'overview', label: 'Overview', icon: <Icons.ProjectAnalysis size={14} /> },
            { id: 'quality', label: 'Quality', icon: <Icons.AISpark size={14} /> },
            { id: 'dependencies', label: 'Dependencies', icon: <Icons.Workflow size={14} /> },
            { id: 'files', label: 'Files', icon: <Icons.File size={14} /> },
            { id: 'architecture', label: 'Architecture', icon: <Icons.Settings size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`px-3 py-2 text-xs transition-colors flex items-center gap-1 ${
                selectedView === tab.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icons.Error size={48} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={runAnalysis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !analysis ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icons.ProjectAnalysis size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-white mb-2">Ready to Analyze</h3>
              <p className="text-gray-400 mb-4">Click "Run Analysis" to get AI insights about your project</p>
            </div>
          </div>
        ) : (
          <div>
            {selectedView === 'overview' && renderOverview()}
            {selectedView === 'quality' && renderQualityMetrics()}
            {selectedView === 'architecture' && renderArchitectureInsights()}
            {selectedView === 'dependencies' && (
              <div className="space-y-4">
                {analysis.dependencies.map(dep => (
                  <div key={dep.name} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{dep.name}</h3>
                      <p className="text-sm text-gray-400">v{dep.version} • {dep.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {dep.isOutdated && (
                        <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded">
                          Outdated
                        </span>
                      )}
                      {dep.vulnerabilities > 0 && (
                        <span className="px-2 py-1 bg-red-400/20 text-red-400 text-xs rounded">
                          {dep.vulnerabilities} vulnerabilities
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedView === 'files' && (
              <div className="space-y-4">
                {analysis.topFiles.map(file => (
                  <div key={file.filename} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{file.filename}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{file.lines} lines</span>
                        <span className={`text-sm font-medium ${getQualityColor(file.quality)}`}>
                          {file.quality}%
                        </span>
                      </div>
                    </div>
                    {file.issues.length > 0 && (
                      <div className="space-y-1">
                        {file.issues.map((issue, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {issue.type === 'error' ? (
                              <Icons.Error size={12} className="text-red-400" />
                            ) : issue.type === 'warning' ? (
                              <Icons.Warning size={12} className="text-yellow-400" />
                            ) : (
                              <Icons.Info size={12} className="text-blue-400" />
                            )}
                            <span className="text-gray-400">{issue.message}</span>
                            {issue.line && (
                              <span className="text-gray-500">Line {issue.line}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectAnalysisDashboard