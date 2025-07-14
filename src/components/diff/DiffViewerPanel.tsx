/**
 * Diff Viewer Panel Component
 * 
 * Container panel for multiple file diffs with management controls
 * Integrates with Claude Code operations to show before/after changes
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import VisualDiffViewer from './VisualDiffViewer'
import { getClaudeCodeService } from '../../services/serviceProvider'

interface FileDiff {
  filename: string
  language: string
  oldContent: string
  newContent: string
  isNewFile?: boolean
  isDeletedFile?: boolean
  isBinaryFile?: boolean
  timestamp: Date
  operation: string // e.g., "edit", "create", "refactor"
}

interface DiffSession {
  id: string
  title: string
  timestamp: Date
  files: FileDiff[]
  status: 'pending' | 'accepted' | 'rejected' | 'partial'
}

interface DiffViewerPanelProps {
  className?: string
  onFileAccepted?: (filename: string) => void
  onFileRejected?: (filename: string) => void
  onSessionAccepted?: (sessionId: string) => void
  onSessionRejected?: (sessionId: string) => void
}

export const DiffViewerPanel: React.FC<DiffViewerPanelProps> = ({
  className = '',
  onFileAccepted,
  onFileRejected,
  onSessionAccepted,
  onSessionRejected
}) => {
  const [diffSessions, setDiffSessions] = useState<DiffSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)

  // Mock data for development - in production, this would come from Claude Code CLI operations
  useEffect(() => {
    // Simulate some diff sessions
    const mockSessions: DiffSession[] = [
      {
        id: 'session-1',
        title: 'Refactor authentication service',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        status: 'pending',
        files: [
          {
            filename: 'src/auth/AuthService.ts',
            language: 'typescript',
            oldContent: `export class AuthService {
  private token: string | null = null;
  
  login(username: string, password: string) {
    // Simple auth logic
    if (username && password) {
      this.token = 'mock-token';
      return true;
    }
    return false;
  }
  
  logout() {
    this.token = null;
  }
}`,
            newContent: `export class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const { token, refreshToken } = await response.json();
        this.token = token;
        this.refreshToken = refreshToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }
  
  logout() {
    this.token = null;
    this.refreshToken = null;
  }
  
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}`,
            timestamp: new Date(),
            operation: 'refactor'
          }
        ]
      },
      {
        id: 'session-2',
        title: 'Add error handling to API client',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        status: 'accepted',
        files: [
          {
            filename: 'src/api/ApiClient.ts',
            language: 'typescript',
            oldContent: `export class ApiClient {
  async get(url: string) {
    const response = await fetch(url);
    return response.json();
  }
}`,
            newContent: `export class ApiClient {
  async get(url: string) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}`,
            timestamp: new Date(),
            operation: 'edit'
          }
        ]
      }
    ]
    
    setDiffSessions(mockSessions)
    if (mockSessions.length > 0) {
      setSelectedSession(mockSessions[0].id)
      if (mockSessions[0].files.length > 0) {
        setSelectedFile(mockSessions[0].files[0].filename)
      }
    }
  }, [])

  const currentSession = selectedSession ? diffSessions.find(s => s.id === selectedSession) : null
  const currentFile = currentSession && selectedFile ? 
    currentSession.files.find(f => f.filename === selectedFile) : null

  const handleAcceptFile = (filename: string) => {
    if (currentSession) {
      // Update the file status in the session
      setDiffSessions(prev => prev.map(session => 
        session.id === currentSession.id
          ? {
              ...session,
              files: session.files.map(file => 
                file.filename === filename 
                  ? { ...file, status: 'accepted' as any }
                  : file
              )
            }
          : session
      ))
    }
    
    onFileAccepted?.(filename)
  }

  const handleRejectFile = (filename: string) => {
    if (currentSession) {
      // Update the file status in the session
      setDiffSessions(prev => prev.map(session => 
        session.id === currentSession.id
          ? {
              ...session,
              files: session.files.map(file => 
                file.filename === filename 
                  ? { ...file, status: 'rejected' as any }
                  : file
              )
            }
          : session
      ))
    }
    
    onFileRejected?.(filename)
  }

  const handleAcceptAllFiles = () => {
    if (currentSession) {
      currentSession.files.forEach(file => {
        handleAcceptFile(file.filename)
      })
      onSessionAccepted?.(currentSession.id)
    }
  }

  const handleRejectAllFiles = () => {
    if (currentSession) {
      currentSession.files.forEach(file => {
        handleRejectFile(file.filename)
      })
      onSessionRejected?.(currentSession.id)
    }
  }

  const getSessionStatusColor = (status: DiffSession['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400'
      case 'accepted': return 'text-green-400'
      case 'rejected': return 'text-red-400'
      case 'partial': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getSessionStatusIcon = (status: DiffSession['status']) => {
    switch (status) {
      case 'pending': return <Icons.Clock size={14} />
      case 'accepted': return <Icons.Check size={14} />
      case 'rejected': return <Icons.X size={14} />
      case 'partial': return <Icons.Workflow size={14} />
      default: return <Icons.Clock size={14} />
    }
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex ${className}`}>
      {/* Sessions Sidebar */}
      <div className="w-80 border-r border-gray-700 bg-gray-800/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm">Code Changes</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWatching(!isWatching)}
                className={`p-1 rounded transition-colors ${
                  isWatching ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Icons.Eye size={14} />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            {diffSessions.length} session{diffSessions.length !== 1 ? 's' : ''} • 
            {diffSessions.reduce((acc, session) => acc + session.files.length, 0)} file{diffSessions.reduce((acc, session) => acc + session.files.length, 0) !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-auto">
          {diffSessions.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <Icons.GitDiff size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm">No code changes yet</p>
              <p className="text-xs mt-1">Changes will appear here when Claude modifies files</p>
            </div>
          ) : (
            diffSessions.map(session => (
              <div key={session.id} className="border-b border-gray-700/50 last:border-b-0">
                <button
                  onClick={() => {
                    setSelectedSession(session.id)
                    if (session.files.length > 0) {
                      setSelectedFile(session.files[0].filename)
                    }
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-700 transition-colors ${
                    selectedSession === session.id ? 'bg-blue-600/20 border-r-2 border-r-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white text-sm truncate pr-2">{session.title}</h4>
                    <div className={`flex items-center gap-1 ${getSessionStatusColor(session.status)}`}>
                      {getSessionStatusIcon(session.status)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    {session.timestamp.toLocaleTimeString()} • {session.files.length} file{session.files.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {session.files.slice(0, 3).map(file => (
                      <span key={file.filename} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded truncate max-w-24">
                        {file.filename.split('/').pop()}
                      </span>
                    ))}
                    {session.files.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                        +{session.files.length - 3}
                      </span>
                    )}
                  </div>
                </button>

                {/* Files List (when session is selected) */}
                {selectedSession === session.id && (
                  <div className="bg-gray-900/50">
                    {session.files.map(file => (
                      <button
                        key={file.filename}
                        onClick={() => setSelectedFile(file.filename)}
                        className={`w-full p-3 pl-8 text-left hover:bg-gray-600 transition-colors border-b border-gray-700/30 ${
                          selectedFile === file.filename ? 'bg-gray-600' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 truncate">{file.filename}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Icons.Code size={12} />
                            {file.language}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Session Actions */}
        {currentSession && (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex gap-2">
              <button
                onClick={handleRejectAllFiles}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
              >
                <Icons.X size={12} />
                Reject All
              </button>
              <button
                onClick={handleAcceptAllFiles}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
              >
                <Icons.Check size={12} />
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Diff Viewer */}
      <div className="flex-1 flex flex-col">
        {currentFile ? (
          <VisualDiffViewer
            diff={currentFile}
            onAcceptChange={handleAcceptFile}
            onRejectChange={handleRejectFile}
            onViewFile={(filename) => {
              // Handle file viewing - could open in editor or external app
              console.log('View file:', filename)
            }}
            className="h-full"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <Icons.GitDiff size={64} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Select a File to View Changes</h3>
              <p className="text-sm text-gray-500">
                Choose a session and file from the sidebar to see the diff
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiffViewerPanel