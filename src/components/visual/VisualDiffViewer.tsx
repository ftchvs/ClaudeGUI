/**
 * Visual Diff Viewer - Claude Code's #1 Requested Feature
 * 
 * Beautiful side-by-side diff visualization with syntax highlighting
 * This is what I dream of showing users instead of plain text diffs!
 */

import React, { useState, useMemo } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified'
  oldLineNumber?: number
  newLineNumber?: number
  content: string
  highlight?: boolean
}

interface DiffChunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

interface VisualDiffViewerProps {
  oldContent: string
  newContent: string
  fileName: string
  language?: string
  onApprove?: () => void
  onReject?: () => void
  onEdit?: (content: string) => void
  className?: string
}

export const VisualDiffViewer: React.FC<VisualDiffViewerProps> = ({
  oldContent,
  newContent,
  fileName,
  language = 'typescript',
  onApprove,
  onReject,
  onEdit,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'side-by-side'>('split')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [wrapLines, setWrapLines] = useState(false)

  // Parse diff and create visual representation
  const diffChunks = useMemo(() => {
    return generateDiffChunks(oldContent, newContent)
  }, [oldContent, newContent])

  const stats = useMemo(() => {
    let added = 0
    let removed = 0
    let modified = 0

    diffChunks.forEach(chunk => {
      chunk.lines.forEach(line => {
        if (line.type === 'added') added++
        else if (line.type === 'removed') removed++
        else if (line.type === 'modified') modified++
      })
    })

    return { added, removed, modified }
  }, [diffChunks])

  const getLanguageIcon = () => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <Icons.TypeScript size={16} />
    if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) return <Icons.JavaScript size={16} />
    if (fileName.endsWith('.py')) return <Icons.File size={16} color={claudeCodeDark.colors.syntax.function} />
    return <Icons.File size={16} />
  }

  const getSyntaxHighlighting = (content: string, language: string) => {
    // Simple syntax highlighting for demo
    // In production, would use a library like Prism.js or highlight.js
    return content
      .replace(/(import|export|const|let|var|function|class|interface|type)/g, 
        `<span style="color: ${claudeCodeDark.colors.syntax.keyword}">$1</span>`)
      .replace(/(['"`])([^'"`]*)\1/g, 
        `<span style="color: ${claudeCodeDark.colors.syntax.string}">$1$2$1</span>`)
      .replace(/\/\/.*$/gm, 
        `<span style="color: ${claudeCodeDark.colors.syntax.comment}">$&</span>`)
      .replace(/(\d+)/g, 
        `<span style="color: ${claudeCodeDark.colors.syntax.number}">$1</span>`)
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getLanguageIcon()}
            <span className="font-mono text-sm text-gray-200">{fileName}</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-400">
                <Icons.Check size={12} />
                +{stats.added}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <Icons.Error size={12} />
                -{stats.removed}
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Icons.Warning size={12} />
                ~{stats.modified}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-gray-700 rounded-md overflow-hidden">
              {['split', 'unified', 'side-by-side'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Options */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`p-1 rounded transition-colors ${
                showLineNumbers ? 'text-orange-400' : 'text-gray-400'
              }`}
              title="Toggle line numbers"
            >
              <Icons.Settings size={16} />
            </button>

            <button
              onClick={() => setWrapLines(!wrapLines)}
              className={`p-1 rounded transition-colors ${
                wrapLines ? 'text-orange-400' : 'text-gray-400'
              }`}
              title="Toggle word wrap"
            >
              <Icons.File size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Diff Content */}
      <div className="max-h-96 overflow-auto">
        {viewMode === 'split' && (
          <SplitView 
            chunks={diffChunks} 
            showLineNumbers={showLineNumbers}
            wrapLines={wrapLines}
            language={language}
            getSyntaxHighlighting={getSyntaxHighlighting}
          />
        )}
        {viewMode === 'unified' && (
          <UnifiedView 
            chunks={diffChunks} 
            showLineNumbers={showLineNumbers}
            wrapLines={wrapLines}
            language={language}
            getSyntaxHighlighting={getSyntaxHighlighting}
          />
        )}
        {viewMode === 'side-by-side' && (
          <SideBySideView 
            oldContent={oldContent}
            newContent={newContent}
            language={language}
            getSyntaxHighlighting={getSyntaxHighlighting}
          />
        )}
      </div>

      {/* Action Buttons */}
      {(onApprove || onReject || onEdit) && (
        <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Claude Code AI Analysis: {stats.added + stats.removed + stats.modified} lines changed
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(newContent)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              >
                <Icons.CodeGenerate size={14} />
                Edit
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              >
                <Icons.Error size={14} />
                Reject
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              >
                <Icons.Check size={14} />
                Apply Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Split View Component
const SplitView: React.FC<{
  chunks: DiffChunk[]
  showLineNumbers: boolean
  wrapLines: boolean
  language: string
  getSyntaxHighlighting: (content: string, language: string) => string
}> = ({ chunks, showLineNumbers, wrapLines, language, getSyntaxHighlighting }) => (
  <div className="grid grid-cols-2 divide-x divide-gray-700">
    {/* Old Content */}
    <div className="bg-red-900/10">
      <div className="sticky top-0 bg-red-800/20 px-2 py-1 text-xs font-medium text-red-300 border-b border-red-700/30">
        Before
      </div>
      {chunks.map((chunk, chunkIndex) =>
        chunk.lines
          .filter(line => line.type === 'removed' || line.type === 'unchanged')
          .map((line, lineIndex) => (
            <div
              key={`old-${chunkIndex}-${lineIndex}`}
              className={`flex ${
                line.type === 'removed' ? 'bg-red-500/10' : ''
              }`}
            >
              {showLineNumbers && (
                <div className="w-10 px-2 py-1 text-xs text-gray-500 select-none border-r border-gray-700">
                  {line.oldLineNumber}
                </div>
              )}
              <div 
                className={`flex-1 px-2 py-1 text-sm font-mono ${wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                dangerouslySetInnerHTML={{ 
                  __html: getSyntaxHighlighting(line.content, language) 
                }}
              />
            </div>
          ))
      )}
    </div>

    {/* New Content */}
    <div className="bg-green-900/10">
      <div className="sticky top-0 bg-green-800/20 px-2 py-1 text-xs font-medium text-green-300 border-b border-green-700/30">
        After
      </div>
      {chunks.map((chunk, chunkIndex) =>
        chunk.lines
          .filter(line => line.type === 'added' || line.type === 'unchanged')
          .map((line, lineIndex) => (
            <div
              key={`new-${chunkIndex}-${lineIndex}`}
              className={`flex ${
                line.type === 'added' ? 'bg-green-500/10' : ''
              }`}
            >
              {showLineNumbers && (
                <div className="w-10 px-2 py-1 text-xs text-gray-500 select-none border-r border-gray-700">
                  {line.newLineNumber}
                </div>
              )}
              <div 
                className={`flex-1 px-2 py-1 text-sm font-mono ${wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                dangerouslySetInnerHTML={{ 
                  __html: getSyntaxHighlighting(line.content, language) 
                }}
              />
            </div>
          ))
      )}
    </div>
  </div>
)

// Unified View Component
const UnifiedView: React.FC<{
  chunks: DiffChunk[]
  showLineNumbers: boolean
  wrapLines: boolean
  language: string
  getSyntaxHighlighting: (content: string, language: string) => string
}> = ({ chunks, showLineNumbers, wrapLines, language, getSyntaxHighlighting }) => (
  <div>
    {chunks.map((chunk, chunkIndex) => (
      <div key={chunkIndex}>
        <div className="bg-gray-700 px-2 py-1 text-xs text-gray-300">
          @@ -{chunk.oldStart},{chunk.oldLines} +{chunk.newStart},{chunk.newLines} @@
        </div>
        {chunk.lines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className={`flex ${
              line.type === 'added' ? 'bg-green-500/10' :
              line.type === 'removed' ? 'bg-red-500/10' : ''
            }`}
          >
            {showLineNumbers && (
              <div className="w-16 px-2 py-1 text-xs text-gray-500 select-none border-r border-gray-700">
                <span className="inline-block w-6">{line.oldLineNumber || ''}</span>
                <span className="inline-block w-6">{line.newLineNumber || ''}</span>
              </div>
            )}
            <div className="w-4 px-1 py-1 text-xs text-center text-gray-500">
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
            </div>
            <div 
              className={`flex-1 px-2 py-1 text-sm font-mono ${wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
              dangerouslySetInnerHTML={{ 
                __html: getSyntaxHighlighting(line.content, language) 
              }}
            />
          </div>
        ))}
      </div>
    ))}
  </div>
)

// Side by Side View Component
const SideBySideView: React.FC<{
  oldContent: string
  newContent: string
  language: string
  getSyntaxHighlighting: (content: string, language: string) => string
}> = ({ oldContent, newContent, language, getSyntaxHighlighting }) => (
  <div className="grid grid-cols-2 divide-x divide-gray-700 h-96">
    <div className="overflow-auto">
      <div className="sticky top-0 bg-red-800/20 px-2 py-1 text-xs font-medium text-red-300 border-b border-red-700/30">
        Original
      </div>
      <pre 
        className="p-4 text-sm font-mono text-gray-300"
        dangerouslySetInnerHTML={{ 
          __html: getSyntaxHighlighting(oldContent, language) 
        }}
      />
    </div>
    <div className="overflow-auto">
      <div className="sticky top-0 bg-green-800/20 px-2 py-1 text-xs font-medium text-green-300 border-b border-green-700/30">
        Modified
      </div>
      <pre 
        className="p-4 text-sm font-mono text-gray-300"
        dangerouslySetInnerHTML={{ 
          __html: getSyntaxHighlighting(newContent, language) 
        }}
      />
    </div>
  </div>
)

// Simple diff algorithm (in production, would use a more sophisticated library)
function generateDiffChunks(oldContent: string, newContent: string): DiffChunk[] {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  
  const chunks: DiffChunk[] = []
  const lines: DiffLine[] = []
  
  let oldLineNum = 1
  let newLineNum = 1
  
  const maxLines = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    
    if (oldLine === newLine) {
      lines.push({
        type: 'unchanged',
        oldLineNumber: oldLineNum++,
        newLineNumber: newLineNum++,
        content: oldLine || ''
      })
    } else if (oldLine && newLine) {
      lines.push({
        type: 'removed',
        oldLineNumber: oldLineNum++,
        content: oldLine
      })
      lines.push({
        type: 'added',
        newLineNumber: newLineNum++,
        content: newLine
      })
    } else if (oldLine) {
      lines.push({
        type: 'removed',
        oldLineNumber: oldLineNum++,
        content: oldLine
      })
    } else if (newLine) {
      lines.push({
        type: 'added',
        newLineNumber: newLineNum++,
        content: newLine
      })
    }
  }
  
  chunks.push({
    oldStart: 1,
    oldLines: oldLines.length,
    newStart: 1,
    newLines: newLines.length,
    lines
  })
  
  return chunks
}

export default VisualDiffViewer