import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  File,
  Folder,
  FolderOpen,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  EyeOff,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  GitBranch,
  GitCommit,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { useClaudeCodeStore } from '@/stores/claude-code'
import type { ClaudeCodeFile } from '@/types/claude-code'

interface FileTreeItemProps {
  file: ClaudeCodeFile
  level: number
  isExpanded: boolean
  onToggle: (path: string) => void
  onSelect: (path: string) => void
  isSelected: boolean
  isOpen: boolean
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  file,
  level,
  isExpanded,
  onToggle,
  onSelect,
  isSelected,
  isOpen
}) => {
  const { openFile, deleteFile, renameFile } = useClaudeCodeStore()
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(file.name)

  const handleRename = async () => {
    if (newName && newName !== file.name) {
      const newPath = file.path.replace(file.name, newName)
      await renameFile(file.path, newPath)
    }
    setIsRenaming(false)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      await deleteFile(file.path)
    }
  }

  const getFileIcon = () => {
    if (file.type === 'directory') {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 text-blue-500" />
      ) : (
        <Folder className="h-4 w-4 text-blue-500" />
      )
    }

    // File type icons based on extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts':
        return <File className="h-4 w-4 text-blue-600" />
      case 'jsx':
      case 'js':
        return <File className="h-4 w-4 text-yellow-500" />
      case 'json':
        return <File className="h-4 w-4 text-green-500" />
      case 'md':
        return <File className="h-4 w-4 text-purple-500" />
      case 'css':
      case 'scss':
        return <File className="h-4 w-4 text-pink-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const getGitStatusIcon = () => {
    switch (file.gitStatus) {
      case 'modified':
        return <AlertCircle className="h-3 w-3 text-orange-500" />
      case 'added':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'deleted':
        return <Trash2 className="h-3 w-3 text-red-500" />
      case 'untracked':
        return <Clock className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors ${
            isSelected ? 'bg-accent' : ''
          } ${isOpen ? 'bg-accent/50' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (file.type === 'directory') {
              onToggle(file.path)
            } else {
              onSelect(file.path)
              openFile(file.path)
            }
          }}
        >
          {getFileIcon()}
          
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              className="h-6 text-sm flex-1"
              autoFocus
            />
          ) : (
            <>
              <span className={`text-sm flex-1 ${file.isClaudeModified ? 'font-medium' : ''}`}>
                {file.name}
              </span>
              
              <div className="flex items-center gap-1">
                {file.isClaudeModified && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Claude
                  </Badge>
                )}
                {getGitStatusIcon()}
              </div>
            </>
          )}
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openFile(file.path)}>
          <Eye className="h-4 w-4 mr-2" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setIsRenaming(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(file.path)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Path
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const FileExplorer: React.FC = () => {
  const {
    fileTree,
    openFiles,
    activeFile,
    currentWorkspace,
    gitStatus,
    ui,
    isLoading,
    loadFiles,
    refreshWorkspace,
    createFile,
    openFile,
    closeFile,
    setSearchQuery,
    toggleSidebar
  } = useClaudeCodeStore()

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [filteredFiles, setFilteredFiles] = useState<ClaudeCodeFile[]>([])

  // Filter files based on search query
  useEffect(() => {
    if (!ui.searchQuery) {
      setFilteredFiles(fileTree)
    } else {
      const filtered = fileTree.filter(file =>
        file.name.toLowerCase().includes(ui.searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(ui.searchQuery.toLowerCase())
      )
      setFilteredFiles(filtered)
    }
  }, [fileTree, ui.searchQuery])

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }, [])

  const handleCreateFile = async () => {
    const fileName = prompt('Enter file name:')
    if (fileName && currentWorkspace) {
      const filePath = `${currentWorkspace.path}/${fileName}`
      await createFile(filePath, '')
      await refreshWorkspace()
    }
  }

  const handleRefresh = async () => {
    if (currentWorkspace) {
      await loadFiles(currentWorkspace.path)
    }
  }

  const getFileLevel = (file: ClaudeCodeFile): number => {
    return file.path.split('/').length - (currentWorkspace?.path.split('/').length || 0) - 1
  }

  if (!currentWorkspace) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workspace selected</p>
            <p className="text-sm">Open a folder to start working</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Files</h3>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isLoading.files}
            >
              {isLoading.files ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCreateFile}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {}}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={ui.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Git Status */}
        {gitStatus && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span>{gitStatus.branch}</span>
            {gitStatus.hasUncommittedChanges && (
              <Badge variant="outline" className="text-xs">
                {gitStatus.unstaged.length + gitStatus.staged.length} changes
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading.files ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <FileTreeItem
                  key={file.path}
                  file={file}
                  level={getFileLevel(file)}
                  isExpanded={expandedFolders.has(file.path)}
                  onToggle={handleToggleFolder}
                  onSelect={(path) => openFile(path)}
                  isSelected={activeFile === file.path}
                  isOpen={openFiles.includes(file.path)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Open Files Tabs */}
      {openFiles.length > 0 && (
        <div className="border-t bg-muted/30">
          <div className="p-2">
            <h4 className="text-sm font-medium mb-2">Open Files</h4>
            <div className="space-y-1">
              {openFiles.map((filePath) => {
                const file = fileTree.find(f => f.path === filePath)
                if (!file) return null

                return (
                  <div
                    key={filePath}
                    className={`flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer ${
                      activeFile === filePath ? 'bg-accent' : ''
                    }`}
                    onClick={() => openFile(filePath)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <File className="h-4 w-4 text-gray-500" />
                      <span className="text-sm truncate">{file.name}</span>
                      {file.isClaudeModified && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeFile(filePath)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Workspace Info */}
      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">{currentWorkspace.name}</p>
          <p className="truncate">{currentWorkspace.path}</p>
          {currentWorkspace.stats && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">{currentWorkspace.stats.totalFiles}</span>
                <span className="ml-1">files</span>
              </div>
              <div>
                <span className="font-medium">{currentWorkspace.stats.claudeInteractions}</span>
                <span className="ml-1">interactions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileExplorer