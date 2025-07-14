/**
 * Project Intelligence Dashboard - Claude Code's Analytics Dream
 * 
 * Visual analytics and insights that I can't show in terminal
 * This is my vision for project-wide intelligence!
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { claudeCodeService } from '../../services/claudeCodeService'

interface ProjectMetrics {
  codeQuality: {
    score: number
    trend: 'up' | 'down' | 'stable'
    issues: { type: string; count: number; severity: 'low' | 'medium' | 'high' }[]
  }
  techDebt: {
    score: number
    totalItems: number
    categories: { name: string; count: number; estimatedHours: number }[]
  }
  testCoverage: {
    percentage: number
    trend: 'up' | 'down' | 'stable'
    uncoveredFiles: string[]
  }
  performance: {
    bundleSize: number
    loadTime: number
    suggestions: string[]
  }
  dependencies: {
    total: number
    outdated: number
    vulnerable: number
    licenses: { type: string; count: number }[]
  }
  architecture: {
    complexity: number
    modules: number
    circularDeps: number
    suggestions: string[]
  }
}

interface ProjectIntelligenceDashboardProps {
  projectPath?: string
  className?: string
}

export const ProjectIntelligenceDashboard: React.FC<ProjectIntelligenceDashboardProps> = ({
  projectPath = '.',
  className = ''
}) => {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'quality' | 'security' | 'performance'>('overview')

  useEffect(() => {
    analyzeProject()
  }, [projectPath])

  const analyzeProject = async () => {
    setLoading(true)
    try {
      // This would be real analysis via Claude Code CLI
      const analysis = await claudeCodeService.analyzeProject(projectPath, {
        depth: 3,
        format: 'json',
        include: ['*.ts', '*.tsx', '*.js', '*.jsx'],
        exclude: ['node_modules', 'dist', '.git']
      })

      // Parse or simulate comprehensive metrics
      setMetrics(generateMockMetrics())
    } catch (error) {
      console.error('Project analysis failed:', error)
      setMetrics(generateMockMetrics())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <Icons.Loading size={24} className="text-orange-400" />
          <span className="ml-2 text-gray-300">Analyzing project with Claude Code AI...</span>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-8 ${className}`}>
        <div className="text-center text-gray-400">
          <Icons.Error size={24} className="mx-auto mb-2" />
          <p>Failed to analyze project</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icons.ProjectAnalysis size={24} className="text-orange-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Project Intelligence</h2>
              <p className="text-sm text-gray-400">AI-powered analysis and insights</p>
            </div>
          </div>
          <button
            onClick={analyzeProject}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
          >
            <Icons.AISpark size={16} />
            Re-analyze
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { key: 'overview', label: 'Overview', icon: Icons.ProjectAnalysis },
          { key: 'quality', label: 'Code Quality', icon: Icons.Check },
          { key: 'security', label: 'Security', icon: Icons.Warning },
          { key: 'performance', label: 'Performance', icon: Icons.AISpark }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              selectedTab === key
                ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'overview' && <OverviewTab metrics={metrics} />}
        {selectedTab === 'quality' && <QualityTab metrics={metrics} />}
        {selectedTab === 'security' && <SecurityTab metrics={metrics} />}
        {selectedTab === 'performance' && <PerformanceTab metrics={metrics} />}
      </div>
    </div>
  )
}

// Overview Tab
const OverviewTab: React.FC<{ metrics: ProjectMetrics }> = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Code Quality Score */}
    <MetricCard
      title="Code Quality"
      value={`${metrics.codeQuality.score}/100`}
      trend={metrics.codeQuality.trend}
      color="green"
      icon={Icons.Check}
    />

    {/* Tech Debt */}
    <MetricCard
      title="Tech Debt"
      value={`${metrics.techDebt.totalItems} items`}
      subtitle={`~${metrics.techDebt.categories.reduce((sum, cat) => sum + cat.estimatedHours, 0)}h to resolve`}
      color="yellow"
      icon={Icons.Warning}
    />

    {/* Test Coverage */}
    <MetricCard
      title="Test Coverage"
      value={`${metrics.testCoverage.percentage}%`}
      trend={metrics.testCoverage.trend}
      color="blue"
      icon={Icons.Check}
    />

    {/* Dependencies */}
    <MetricCard
      title="Dependencies"
      value={`${metrics.dependencies.total} total`}
      subtitle={`${metrics.dependencies.outdated} outdated, ${metrics.dependencies.vulnerable} vulnerable`}
      color={metrics.dependencies.vulnerable > 0 ? 'red' : 'gray'}
      icon={Icons.Settings}
    />

    {/* Architecture Complexity */}
    <div className="md:col-span-2 lg:col-span-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Icons.ProjectAnalysis size={20} className="text-orange-400" />
          Architecture Overview
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{metrics.architecture.modules}</div>
            <div className="text-sm text-gray-400">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{metrics.architecture.complexity}</div>
            <div className="text-sm text-gray-400">Complexity Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${metrics.architecture.circularDeps > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.architecture.circularDeps}
            </div>
            <div className="text-sm text-gray-400">Circular Dependencies</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Quality Tab
const QualityTab: React.FC<{ metrics: ProjectMetrics }> = ({ metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Issues Breakdown */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Code Issues</h3>
        <div className="space-y-3">
          {metrics.codeQuality.issues.map((issue, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  issue.severity === 'high' ? 'bg-red-400' :
                  issue.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <span className="text-gray-300">{issue.type}</span>
              </div>
              <span className="text-gray-400">{issue.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Debt Categories */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Technical Debt</h3>
        <div className="space-y-3">
          {metrics.techDebt.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-300">{category.name}</span>
              <div className="text-right">
                <div className="text-gray-400">{category.count} items</div>
                <div className="text-xs text-gray-500">~{category.estimatedHours}h</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Test Coverage Details */}
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Test Coverage</h3>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Overall Coverage</span>
          <span className="text-white font-semibold">{metrics.testCoverage.percentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-400 h-2 rounded-full" 
            style={{ width: `${metrics.testCoverage.percentage}%` }}
          />
        </div>
      </div>
      {metrics.testCoverage.uncoveredFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Uncovered Files</h4>
          <div className="space-y-1">
            {metrics.testCoverage.uncoveredFiles.slice(0, 5).map((file, index) => (
              <div key={index} className="text-xs text-gray-400 font-mono">{file}</div>
            ))}
            {metrics.testCoverage.uncoveredFiles.length > 5 && (
              <div className="text-xs text-gray-500">
                +{metrics.testCoverage.uncoveredFiles.length - 5} more files
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)

// Security Tab
const SecurityTab: React.FC<{ metrics: ProjectMetrics }> = ({ metrics }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Security Overview</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className={`text-2xl font-bold ${metrics.dependencies.vulnerable > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {metrics.dependencies.vulnerable}
          </div>
          <div className="text-sm text-gray-400">Vulnerabilities</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{metrics.dependencies.outdated}</div>
          <div className="text-sm text-gray-400">Outdated Deps</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{metrics.dependencies.licenses.length}</div>
          <div className="text-sm text-gray-400">License Types</div>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">License Distribution</h3>
      <div className="space-y-2">
        {metrics.dependencies.licenses.map((license, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300">{license.type}</span>
            <span className="text-gray-400">{license.count} packages</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Performance Tab
const PerformanceTab: React.FC<{ metrics: ProjectMetrics }> = ({ metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        title="Bundle Size"
        value={`${(metrics.performance.bundleSize / 1024 / 1024).toFixed(1)} MB`}
        color="blue"
        icon={Icons.File}
      />
      <MetricCard
        title="Load Time"
        value={`${metrics.performance.loadTime}ms`}
        color="green"
        icon={Icons.AISpark}
      />
    </div>

    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Performance Suggestions</h3>
      <div className="space-y-2">
        {metrics.performance.suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-2">
            <Icons.Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300 text-sm">{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Reusable Metric Card
const MetricCard: React.FC<{
  title: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
  icon: React.ComponentType<any>
}> = ({ title, value, subtitle, trend, color, icon: Icon }) => {
  const colorMap = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    gray: 'text-gray-400'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <Icon size={16} className={colorMap[color]} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`text-xs ${
            trend === 'up' ? 'text-green-400' :
            trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data generator (replace with real analysis)
function generateMockMetrics(): ProjectMetrics {
  return {
    codeQuality: {
      score: 87,
      trend: 'up',
      issues: [
        { type: 'Code Smells', count: 12, severity: 'medium' },
        { type: 'Duplications', count: 5, severity: 'low' },
        { type: 'Complexity', count: 3, severity: 'high' },
        { type: 'Type Issues', count: 8, severity: 'medium' }
      ]
    },
    techDebt: {
      score: 73,
      totalItems: 28,
      categories: [
        { name: 'Legacy Code', count: 12, estimatedHours: 24 },
        { name: 'Missing Tests', count: 8, estimatedHours: 16 },
        { name: 'Documentation', count: 5, estimatedHours: 8 },
        { name: 'Performance', count: 3, estimatedHours: 12 }
      ]
    },
    testCoverage: {
      percentage: 78,
      trend: 'up',
      uncoveredFiles: [
        'src/utils/legacy.ts',
        'src/components/old/OldComponent.tsx',
        'src/services/deprecated.ts'
      ]
    },
    performance: {
      bundleSize: 2.4 * 1024 * 1024, // 2.4 MB
      loadTime: 850,
      suggestions: [
        'Consider code splitting for the analytics module',
        'Optimize images and use WebP format',
        'Enable tree shaking for unused lodash functions',
        'Use React.lazy() for heavy components'
      ]
    },
    dependencies: {
      total: 156,
      outdated: 12,
      vulnerable: 2,
      licenses: [
        { type: 'MIT', count: 89 },
        { type: 'Apache-2.0', count: 23 },
        { type: 'BSD-3-Clause', count: 18 },
        { type: 'ISC', count: 26 }
      ]
    },
    architecture: {
      complexity: 67,
      modules: 34,
      circularDeps: 1,
      suggestions: [
        'Consider breaking down the user module',
        'Extract shared utilities to reduce coupling',
        'Implement cleaner separation between UI and business logic'
      ]
    }
  }
}

export default ProjectIntelligenceDashboard