import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileTree } from './file-tree'
import { FolderIcon, SearchIcon, RefreshCwIcon } from 'lucide-react'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  extension?: string
}

// Mock file system data
const mockFileSystem: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          { id: '3', name: 'Button.tsx', type: 'file', extension: 'tsx' },
          { id: '4', name: 'Input.tsx', type: 'file', extension: 'tsx' },
          { id: '5', name: 'Card.tsx', type: 'file', extension: 'tsx' },
        ]
      },
      {
        id: '6',
        name: 'pages',
        type: 'folder',
        children: [
          { id: '7', name: 'Home.tsx', type: 'file', extension: 'tsx' },
          { id: '8', name: 'About.tsx', type: 'file', extension: 'tsx' },
        ]
      },
      { id: '9', name: 'App.tsx', type: 'file', extension: 'tsx' },
      { id: '10', name: 'main.tsx', type: 'file', extension: 'tsx' },
      { id: '11', name: 'index.css', type: 'file', extension: 'css' },
    ]
  },
  {
    id: '12',
    name: 'public',
    type: 'folder',
    children: [
      { id: '13', name: 'index.html', type: 'file', extension: 'html' },
      { id: '14', name: 'favicon.ico', type: 'file', extension: 'ico' },
    ]
  },
  { id: '15', name: 'package.json', type: 'file', extension: 'json' },
  { id: '16', name: 'tsconfig.json', type: 'file', extension: 'json' },
  { id: '17', name: 'README.md', type: 'file', extension: 'md' },
  { id: '18', name: '.gitignore', type: 'file' },
]

export function FileExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file)
    console.log('Selected file:', file)
  }

  const handleRefresh = () => {
    console.log('Refreshing file tree...')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full rounded-xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderIcon className="h-5 w-5" />
              Explorer
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <FileTree nodes={mockFileSystem} onFileSelect={handleFileSelect} />
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t bg-muted/30"
            >
              <div className="text-sm">
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-muted-foreground text-xs">
                  {selectedFile.type} {selectedFile.extension && `• ${selectedFile.extension.toUpperCase()}`}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}