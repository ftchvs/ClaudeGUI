import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TerminalIcon, XIcon, MinusIcon, MaximizeIcon } from 'lucide-react'

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: Date
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to Claude GUI Terminal',
      timestamp: new Date()
    }
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const executeCommand = (command: string) => {
    if (!command.trim()) return

    const commandLine: TerminalLine = {
      id: crypto.randomUUID(),
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date()
    }

    let outputLine: TerminalLine

    // Simple command simulation
    switch (command.toLowerCase().trim()) {
      case 'ls':
        outputLine = {
          id: crypto.randomUUID(),
          type: 'output',
          content: 'src/  public/  package.json  tsconfig.json  README.md',
          timestamp: new Date()
        }
        break
      case 'pwd':
        outputLine = {
          id: crypto.randomUUID(),
          type: 'output',
          content: '/Users/user/claude-gui',
          timestamp: new Date()
        }
        break
      case 'clear':
        setLines([])
        setCurrentCommand('')
        return
      case 'help':
        outputLine = {
          id: crypto.randomUUID(),
          type: 'output',
          content: 'Available commands: ls, pwd, clear, help, npm, git',
          timestamp: new Date()
        }
        break
      default:
        if (command.startsWith('npm')) {
          outputLine = {
            id: crypto.randomUUID(),
            type: 'output',
            content: `Running: ${command}...\nCompleted successfully!`,
            timestamp: new Date()
          }
        } else if (command.startsWith('git')) {
          outputLine = {
            id: crypto.randomUUID(),
            type: 'output',
            content: `Git command: ${command}\nOn branch main\nnothing to commit, working tree clean`,
            timestamp: new Date()
          }
        } else {
          outputLine = {
            id: crypto.randomUUID(),
            type: 'error',
            content: `Command not found: ${command}`,
            timestamp: new Date()
          }
        }
    }

    setLines(prev => [...prev, commandLine, outputLine])
    setCurrentCommand('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(currentCommand)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full rounded-xl border-none shadow-sm bg-black/95 text-green-400">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-green-400">
              <TerminalIcon className="h-5 w-5" />
              Terminal
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-green-400 hover:bg-green-400/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <MinusIcon className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-green-400 hover:bg-green-400/20"
              >
                <MaximizeIcon className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-red-400 hover:bg-red-400/20"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-4 pt-0 flex flex-col h-full">
            <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
              <div className="space-y-1 font-mono text-sm">
                {lines.map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`whitespace-pre-wrap ${
                      line.type === 'command' 
                        ? 'text-blue-400' 
                        : line.type === 'error' 
                        ? 'text-red-400' 
                        : 'text-green-400'
                    }`}
                  >
                    {line.content}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <span className="text-blue-400 font-mono text-sm self-center">$</span>
              <Input
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                placeholder="Enter command..."
                className="flex-1 bg-transparent border-none text-green-400 font-mono placeholder:text-green-400/50 focus-visible:ring-0"
                autoComplete="off"
              />
            </form>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}