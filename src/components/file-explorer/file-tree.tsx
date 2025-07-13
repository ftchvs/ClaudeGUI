import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FolderIcon, 
  FolderOpenIcon, 
  FileIcon, 
  FileTextIcon, 
  FileCodeIcon,
  ImageIcon,
  ChevronRightIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  extension?: string
}

interface FileTreeProps {
  nodes: FileNode[]
  onFileSelect?: (file: FileNode) => void
}

const getFileIcon = (extension?: string) => {
  if (!extension) return FileIcon
  
  switch (extension.toLowerCase()) {
    case 'txt':
    case 'md':
    case 'mdx':
      return FileTextIcon
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs':
    case 'go':
    case 'rs':
    case 'php':
    case 'rb':
    case 'swift':
    case 'kt':
      return FileCodeIcon
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return ImageIcon
    default:
      return FileIcon
  }
}

export function FileTreeNode({ node, onFileSelect, level = 0 }: { 
  node: FileNode
  onFileSelect?: (file: FileNode) => void
  level?: number 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = node.type === 'folder' 
    ? (isExpanded ? FolderOpenIcon : FolderIcon)
    : getFileIcon(node.extension)

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded)
    } else {
      onFileSelect?.(node)
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 h-8 px-2 rounded-lg font-normal",
            "hover:bg-accent"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={handleClick}
        >
          {node.type === 'folder' && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRightIcon className="h-3 w-3" />
            </motion.div>
          )}
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">{node.name}</span>
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {node.type === 'folder' && isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <FileTreeNode
                key={child.id}
                node={child}
                onFileSelect={onFileSelect}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FileTree({ nodes, onFileSelect }: FileTreeProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {nodes.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </ScrollArea>
  )
}