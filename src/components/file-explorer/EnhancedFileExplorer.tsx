import React, { useState, useEffect } from 'react'
import { webClaudeCodeService } from '@/services/webClaudeCodeService'

interface FileItem {
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  modified?: Date
}

interface EnhancedFileExplorerProps {
  currentTheme: any
  onFileSelect?: (file: FileItem) => void
}

export const EnhancedFileExplorer: React.FC<EnhancedFileExplorerProps> = ({
  currentTheme,
  onFileSelect
}) => {
  const [currentPath, setCurrentPath] = useState('/workspace/ClaudeGUI')
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isViewingFile, setIsViewingFile] = useState(false)

  // Mock project structure
  const mockFiles: FileItem[] = [
    { name: '..', type: 'directory', path: '/workspace' },
    { name: 'src', type: 'directory', path: '/workspace/ClaudeGUI/src' },
    { name: 'dist', type: 'directory', path: '/workspace/ClaudeGUI/dist' },
    { name: 'node_modules', type: 'directory', path: '/workspace/ClaudeGUI/node_modules' },
    { name: 'package.json', type: 'file', path: '/workspace/ClaudeGUI/package.json', size: 1234 },
    { name: 'tsconfig.json', type: 'file', path: '/workspace/ClaudeGUI/tsconfig.json', size: 456 },
    { name: 'vite.config.ts', type: 'file', path: '/workspace/ClaudeGUI/vite.config.ts', size: 789 },
    { name: 'README.md', type: 'file', path: '/workspace/ClaudeGUI/README.md', size: 2345 },
    { name: 'CLAUDE.md', type: 'file', path: '/workspace/ClaudeGUI/CLAUDE.md', size: 12567 },
    { name: '.gitignore', type: 'file', path: '/workspace/ClaudeGUI/.gitignore', size: 234 },
    { name: 'tailwind.config.js', type: 'file', path: '/workspace/ClaudeGUI/tailwind.config.js', size: 567 }
  ]

  useEffect(() => {
    loadFiles()
  }, [currentPath])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would call the actual file service
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate loading
      
      if (currentPath === '/workspace/ClaudeGUI/src') {
        setFiles([
          { name: '..', type: 'directory', path: '/workspace/ClaudeGUI' },
          { name: 'components', type: 'directory', path: '/workspace/ClaudeGUI/src/components' },
          { name: 'services', type: 'directory', path: '/workspace/ClaudeGUI/src/services' },
          { name: 'stores', type: 'directory', path: '/workspace/ClaudeGUI/src/stores' },
          { name: 'hooks', type: 'directory', path: '/workspace/ClaudeGUI/src/hooks' },
          { name: 'types', type: 'directory', path: '/workspace/ClaudeGUI/src/types' },
          { name: 'App.tsx', type: 'file', path: '/workspace/ClaudeGUI/src/App.tsx', size: 19567 },
          { name: 'EnhancedApp.tsx', type: 'file', path: '/workspace/ClaudeGUI/src/EnhancedApp.tsx', size: 15234 },
          { name: 'main.tsx', type: 'file', path: '/workspace/ClaudeGUI/src/main.tsx', size: 345 },
          { name: 'index.css', type: 'file', path: '/workspace/ClaudeGUI/src/index.css', size: 1567 },
          { name: 'vite-env.d.ts', type: 'file', path: '/workspace/ClaudeGUI/src/vite-env.d.ts', size: 234 }
        ])
      } else {
        setFiles(mockFiles)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileClick = async (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path)
      setIsViewingFile(false)
      setSelectedFile(null)
    } else {
      setSelectedFile(file)
      onFileSelect?.(file)
      
      // Load file content for preview
      try {
        setIsLoading(true)
        const response = await webClaudeCodeService.performFileOperation({
          type: 'read',
          path: file.path
        })
        setFileContent(response.output)
        setIsViewingFile(true)
      } catch (error) {
        console.error('Error reading file:', error)
        setFileContent('Error loading file content')
        setIsViewingFile(true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return file.name === '..' ? '↩️' : '📁'
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts': return '🔷'
      case 'js':
      case 'jsx': return '🟨'
      case 'json': return '📄'
      case 'md': return '📝'
      case 'css': return '🎨'
      case 'html': return '🌐'
      case 'png':
      case 'jpg':
      case 'jpeg': return '🖼️'
      default: return '📄'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatPath = (path: string) => {
    return path.replace('/workspace/ClaudeGUI', '~')
  }

  return (
    <div style={{
      background: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '600px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>
          File Explorer
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsViewingFile(false)}
            disabled={!isViewingFile}
            style={{
              background: isViewingFile ? currentTheme.accent : 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '4px 8px',
              color: isViewingFile ? 'white' : currentTheme.textSecondary,
              cursor: isViewingFile ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            📁 Files
          </button>
          <button
            onClick={() => setIsViewingFile(true)}
            disabled={!selectedFile || selectedFile.type === 'directory'}
            style={{
              background: isViewingFile && selectedFile ? currentTheme.accent : 'transparent',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '4px 8px',
              color: isViewingFile && selectedFile ? 'white' : currentTheme.textSecondary,
              cursor: selectedFile && selectedFile.type === 'file' ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {/* Path breadcrumb */}
      <div style={{
        background: currentTheme.bg,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '6px',
        padding: '8px 12px',
        marginBottom: '16px',
        fontSize: '12px',
        color: currentTheme.textSecondary,
        fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace'
      }}>
        {formatPath(currentPath)}
      </div>

      {/* Content */}
      <div style={{
        background: currentTheme.bg,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '8px',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!isViewingFile ? (
          /* File List */
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '8px'
          }}>
            {isLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: currentTheme.textSecondary
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${currentTheme.border}`,
                  borderTop: `2px solid ${currentTheme.accent}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Loading files...
              </div>
            ) : (
              files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(file)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedFile?.path === file.path ? currentTheme.surface : 'transparent'
                  }}
                  onMouseOver={(e) => {
                    if (selectedFile?.path !== file.path) {
                      e.currentTarget.style.background = currentTheme.surface
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedFile?.path !== file.path) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>
                    {getFileIcon(file)}
                  </span>
                  <span style={{ 
                    flex: 1, 
                    fontSize: '14px', 
                    color: currentTheme.text,
                    fontWeight: file.type === 'directory' ? '500' : '400'
                  }}>
                    {file.name}
                  </span>
                  {file.size && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: currentTheme.textSecondary,
                      fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace'
                    }}>
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* File Preview */
          <div style={{ 
            flex: 1, 
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${currentTheme.border}`,
              background: currentTheme.surface,
              fontSize: '12px',
              color: currentTheme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{getFileIcon(selectedFile!)}</span>
              <span>{selectedFile?.name}</span>
              {selectedFile?.size && (
                <span>• {formatFileSize(selectedFile.size)}</span>
              )}
            </div>
            <div style={{
              flex: 1,
              padding: '16px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
              lineHeight: '1.5',
              color: currentTheme.text,
              whiteSpace: 'pre-wrap'
            }}>
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: currentTheme.textSecondary
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${currentTheme.border}`,
                    borderTop: `2px solid ${currentTheme.accent}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  Loading file content...
                </div>
              ) : (
                fileContent
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default EnhancedFileExplorer