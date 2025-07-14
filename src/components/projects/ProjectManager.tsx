/**
 * Project Manager Component
 * 
 * Manages Claude Code projects similar to Claudia's approach
 * Provides project browsing, session management, and CLI integration
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { getLocalClaudeCodeService, getEnhancedServiceStatus } from '../../services/enhancedServiceProvider'
import type { ClaudeProject, ClaudeSession, ClaudeCodeStatus } from '../../services/localClaudeCodeService'

interface ProjectManagerProps {
  className?: string
  onProjectSelect?: (project: ClaudeProject) => void
  onSessionStart?: (project: ClaudeProject, session?: ClaudeSession) => void
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  className = '',
  onProjectSelect,
  onSessionStart
}) => {
  const [projects, setProjects] = useState<ClaudeProject[]>([])
  const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null)
  const [claudeStatus, setClaudeStatus] = useState<ClaudeCodeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInstallGuide, setShowInstallGuide] = useState(false)

  useEffect(() => {
    loadProjectsAndStatus()
  }, [])

  const loadProjectsAndStatus = async () => {
    setIsLoading(true)
    try {
      // Get service status
      const serviceStatus = await getEnhancedServiceStatus()
      setClaudeStatus(serviceStatus.claudeCodeStatus || null)

      // Load projects if Claude Code is available
      if (serviceStatus.claudeCodeStatus?.isInstalled) {
        const localService = getLocalClaudeCodeService()
        if (localService) {
          const discoveredProjects = await localService.discoverProjects()
          setProjects(discoveredProjects)
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = (project: ClaudeProject) => {
    setSelectedProject(project)
    onProjectSelect?.(project)
  }

  const handleStartSession = async (project: ClaudeProject, session?: ClaudeSession) => {
    try {
      const localService = getLocalClaudeCodeService()
      if (localService) {
        const result = await localService.switchProject(project.name)
        if (result.success) {
          onSessionStart?.(project, session)
        } else {
          console.error('Failed to start session:', result.error)
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleInstallClaude = async () => {
    try {
      const localService = getLocalClaudeCodeService()
      if (localService) {
        const result = await localService.installClaudeCode()
        if (result.success) {
          await loadProjectsAndStatus()
        } else {
          console.error('Installation failed:', result.error)
        }
      }
    } catch (error) {
      console.error('Installation error:', error)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  // Claude Code not installed
  if (!claudeStatus?.isInstalled) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <Icons.Terminal size={48} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Claude Code CLI Not Found</h3>
          <p className="text-gray-400 mb-6">
            To use project management features, you need to install Claude Code CLI first.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleInstallClaude}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Icons.Download size={18} />
              Install Claude Code CLI
            </button>

            <button
              onClick={() => setShowInstallGuide(!showInstallGuide)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
            >
              Manual Installation Guide
            </button>
          </div>

          {showInstallGuide && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg text-left">
              <h4 className="font-medium text-white mb-3">Manual Installation:</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>1. Install Node.js 18+ if not already installed</p>
                <p>2. Run: <code className="bg-gray-700 px-2 py-1 rounded">npm install -g @anthropic-ai/claude-code</code></p>
                <p>3. Run: <code className="bg-gray-700 px-2 py-1 rounded">claude</code></p>
                <p>4. Follow the authentication process with <code className="bg-gray-700 px-2 py-1 rounded">/login</code></p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Claude Code installed but not authenticated
  if (!claudeStatus?.isAuthenticated) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-700 p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <Icons.Warning size={48} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
          <p className="text-gray-400 mb-6">
            Claude Code CLI is installed but requires authentication to access projects.
          </p>

          <div className="p-4 bg-yellow-600/10 border border-yellow-500/20 rounded-lg text-left">
            <h4 className="font-medium text-yellow-400 mb-2">Authentication Steps:</h4>
            <ol className="text-sm text-yellow-300 space-y-1 list-decimal list-inside">
              <li>Open your terminal</li>
              <li>Run: <code className="bg-gray-700 px-1 py-0.5 rounded">claude</code></li>
              <li>Type: <code className="bg-gray-700 px-1 py-0.5 rounded">/login</code></li>
              <li>Follow the authentication process</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <button
            onClick={loadProjectsAndStatus}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Check Authentication Status
          </button>
        </div>
      </div>
    )
  }

  // Main project manager interface
  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex ${className}`}>
      {/* Project List */}
      <div className="w-80 border-r border-gray-700 bg-gray-800/50 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Folder size={24} className="text-blue-400" />
            <div>
              <h2 className="font-semibold text-white">Claude Projects</h2>
              <p className="text-sm text-gray-400">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          <div className="relative">
            <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Icons.Loading size={24} className="mx-auto text-gray-400" />
              <p className="text-sm text-gray-400 mt-2">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-4 text-center">
              <Icons.Folder size={32} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-400">No projects found</p>
              <p className="text-xs text-gray-500 mt-1">
                Create a project with: <code>claude</code>
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">{project.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {project.sessionCount} session{project.sessionCount !== 1 ? 's' : ''} • {formatTimeAgo(project.lastModified)}
                      </p>
                    </div>
                    <Icons.ExternalLink size={14} className="text-gray-500 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedProject.name}</h3>
                  <p className="text-gray-400">{selectedProject.path}</p>
                </div>
                <button
                  onClick={() => handleStartSession(selectedProject)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Icons.Terminal size={16} />
                  Start Session
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Sessions</div>
                  <div className="text-xl font-semibold text-white">{selectedProject.sessionCount}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Last Modified</div>
                  <div className="text-sm text-white">{formatTimeAgo(selectedProject.lastModified)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Status</div>
                  <div className="text-sm text-green-400">Active</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <h4 className="font-medium text-white mb-4">Recent Sessions</h4>
              
              {selectedProject.sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.Chat size={32} className="mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">No sessions found</p>
                  <p className="text-sm text-gray-500 mt-1">Start a new session to begin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProject.sessions.map(session => (
                    <div
                      key={session.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {session.firstMessage}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                            <span>{formatTimeAgo(session.timestamp)}</span>
                            <span>•</span>
                            <span>{session.messageCount} messages</span>
                            {session.duration && (
                              <>
                                <span>•</span>
                                <span>{Math.round(session.duration / 1000)}s</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartSession(selectedProject, session)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                          title="Resume session"
                        >
                          <Icons.ExternalLink size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icons.Folder size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Project</h3>
              <p className="text-gray-400">Choose a project from the list to view details and sessions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectManager