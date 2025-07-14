/**
 * Visual Diff Viewer Component
 * 
 * Professional diff visualization for Claude Code changes
 * Shows before/after code with syntax highlighting and change indicators
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'

interface DiffLine {
  lineNumber: number
  content: string
  type: 'added' | 'removed' | 'unchanged' | 'modified'
  originalLineNumber?: number
}

interface FileDiff {
  filename: string
  language: string
  oldContent: string
  newContent: string
  isNewFile?: boolean
  isDeletedFile?: boolean
  isBinaryFile?: boolean
}

interface VisualDiffViewerProps {
  diff: FileDiff
  onAcceptChange?: (filename: string) => void
  onRejectChange?: (filename: string) => void
  onViewFile?: (filename: string) => void
  className?: string
}

// Simple diff algorithm - in production, consider using a library like diff2html
function computeDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const diffLines: DiffLine[] = []
  
  let oldIndex = 0
  let newIndex = 0
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex]
    const newLine = newLines[newIndex]
    
    if (oldIndex >= oldLines.length) {
      // Only new lines remaining
      diffLines.push({
        lineNumber: newIndex + 1,
        content: newLine,
        type: 'added'
      })
      newIndex++
    } else if (newIndex >= newLines.length) {
      // Only old lines remaining
      diffLines.push({
        lineNumber: oldIndex + 1,
        content: oldLine,
        type: 'removed',
        originalLineNumber: oldIndex + 1
      })
      oldIndex++
    } else if (oldLine === newLine) {
      // Lines are the same
      diffLines.push({
        lineNumber: newIndex + 1,
        content: newLine,
        type: 'unchanged',
        originalLineNumber: oldIndex + 1
      })
      oldIndex++
      newIndex++
    } else {
      // Lines are different - simple heuristic
      diffLines.push({
        lineNumber: oldIndex + 1,
        content: oldLine,
        type: 'removed',
        originalLineNumber: oldIndex + 1
      })
      diffLines.push({
        lineNumber: newIndex + 1,
        content: newLine,
        type: 'added'
      })
      oldIndex++
      newIndex++
    }
  }
  
  return diffLines
}

function getLanguageClass(language: string): string {
  const langMap: Record<string, string> = {
    'javascript': 'language-javascript',
    'typescript': 'language-typescript',
    'python': 'language-python',
    'java': 'language-java',
    'go': 'language-go',
    'rust': 'language-rust',
    'cpp': 'language-cpp',
    'html': 'language-html',
    'css': 'language-css',
    'json': 'language-json',
    'yaml': 'language-yaml',
    'xml': 'language-xml',
    'markdown': 'language-markdown'
  }
  return langMap[language.toLowerCase()] || 'language-text'
}

export const VisualDiffViewer: React.FC<VisualDiffViewerProps> = ({
  diff,
  onAcceptChange,
  onRejectChange,
  onViewFile,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [expandContext, setExpandContext] = useState(true)

  const diffLines = useMemo(() => {
    if (diff.isNewFile || diff.isDeletedFile || diff.isBinaryFile) {
      return []
    }
    return computeDiff(diff.oldContent, diff.newContent)
  }, [diff.oldContent, diff.newContent, diff.isNewFile, diff.isDeletedFile, diff.isBinaryFile])

  const stats = useMemo(() => {
    const added = diffLines.filter(line => line.type === 'added').length
    const removed = diffLines.filter(line => line.type === 'removed').length
    const modified = diffLines.filter(line => line.type === 'modified').length
    
    return { added, removed, modified, total: added + removed + modified }
  }, [diffLines])

  const getLineTypeIcon = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return <Icons.Plus size={12} className="text-green-400" />
      case 'removed':
        return <Icons.Minus size={12} className="text-red-400" />
      case 'modified':
        return <Icons.Edit size={12} className="text-yellow-400" />
      default:
        return null
    }
  }

  const getLineStyles = (type: DiffLine['type']) => {
    const baseStyles = "font-mono text-sm leading-relaxed px-4 py-1 border-l-2"
    
    switch (type) {
      case 'added':
        return `${baseStyles} bg-green-500/10 border-l-green-400 text-green-100`
      case 'removed':
        return `${baseStyles} bg-red-500/10 border-l-red-400 text-red-100`
      case 'modified':
        return `${baseStyles} bg-yellow-500/10 border-l-yellow-400 text-yellow-100`
      default:
        return `${baseStyles} bg-transparent border-l-gray-600 text-gray-300`
    }
  }

  const formatContent = (content: string) => {
    if (showWhitespace) {
      return content.replace(/ /g, '·').replace(/\t/g, '→   ')
    }
    return content
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.FileText size={20} className="text-blue-400" />
            <div>
              <h3 className="font-semibold text-white">{diff.filename}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Icons.Code size={14} />
                  {diff.language}
                </span>
                {stats.total > 0 && (
                  <>
                    {stats.added > 0 && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Icons.Plus size={12} />
                        {stats.added}
                      </span>
                    )}
                    {stats.removed > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <Icons.Minus size={12} />
                        {stats.removed}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* File Status Badge */}
          <div>
            {diff.isNewFile && (
              <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                New File
              </span>
            )}
            {diff.isDeletedFile && (
              <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">
                Deleted
              </span>
            )}
            {diff.isBinaryFile && (
              <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                Binary File
              </span>
            )}
            {!diff.isNewFile && !diff.isDeletedFile && !diff.isBinaryFile && stats.total > 0 && (
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                Modified
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-700 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 text-xs transition-colors ${
                  viewMode === 'unified' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs transition-colors ${
                  viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Split
              </button>
            </div>

            {/* Options */}
            <button
              onClick={() => setShowWhitespace(!showWhitespace)}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                showWhitespace ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icons.Eye size={12} />
              Whitespace
            </button>

            <button
              onClick={() => setExpandContext(!expandContext)}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                expandContext ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icons.Expand size={12} />
              Context
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onViewFile && (
              <button
                onClick={() => onViewFile(diff.filename)}
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors flex items-center gap-1"
              >
                <Icons.ExternalLink size={12} />
                View File
              </button>
            )}
            {onRejectChange && (
              <button
                onClick={() => onRejectChange(diff.filename)}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
              >
                <Icons.X size={12} />
                Reject
              </button>
            )}
            {onAcceptChange && (
              <button
                onClick={() => onAcceptChange(diff.filename)}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
              >
                <Icons.Check size={12} />
                Accept
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Diff Content */}
      <div className="overflow-auto max-h-96">
        {diff.isBinaryFile ? (
          <div className="p-8 text-center text-gray-400">
            <Icons.FileText size={48} className="mx-auto mb-4 text-gray-600" />
            <p>Binary file - cannot show diff</p>
          </div>
        ) : diff.isNewFile ? (
          <div className="p-4">
            <div className="text-sm text-green-400 mb-2 flex items-center gap-2">
              <Icons.Plus size={14} />
              New file created
            </div>
            <pre className={`${getLanguageClass(diff.language)} bg-gray-800 p-4 rounded overflow-auto text-sm`}>
              <code>{diff.newContent}</code>
            </pre>
          </div>
        ) : diff.isDeletedFile ? (
          <div className="p-4">
            <div className="text-sm text-red-400 mb-2 flex items-center gap-2">
              <Icons.Minus size={14} />
              File deleted
            </div>
            <pre className={`${getLanguageClass(diff.language)} bg-gray-800 p-4 rounded overflow-auto text-sm line-through opacity-60`}>
              <code>{diff.oldContent}</code>
            </pre>
          </div>
        ) : diffLines.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Icons.Check size={48} className="mx-auto mb-4 text-green-600" />
            <p>No changes detected</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {diffLines.map((line, index) => (
              <div key={index} className={getLineStyles(line.type)}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-16 text-xs text-gray-500">
                    {getLineTypeIcon(line.type)}
                    <span>{line.lineNumber}</span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <code className="whitespace-pre">{formatContent(line.content)}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualDiffViewer