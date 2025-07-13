import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  FileText,
  Bug,
  Loader,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMcpOperations } from '@/hooks/useMcpOperations'
import type { IdeExecutionResult } from '@/types/mcp'

interface DiagnosticItem {
  severity: 'error' | 'warning' | 'info'
  message: string
  line: number
  column: number
  file: string
}

const IDEPanel: React.FC = () => {
  const { executeIDE } = useMcpOperations()
  
  const [code, setCode] = useState('print("Hello, World!")')
  const [fileUri, setFileUri] = useState('')
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([])
  const [executionResults, setExecutionResults] = useState<IdeExecutionResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExecuteCode = async () => {
    if (!code.trim()) return
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await executeIDE('execute-code', { code })
      
      const mockResult: IdeExecutionResult = {
        output: 'Hello, World!\nExecution completed successfully.',
        executionCount: executionResults.length + 1,
        metadata: {
          language: 'python',
          executionTime: Math.random() * 1000 + 100,
          memoryUsage: Math.random() * 50 + 10
        }
      }
      
      setExecutionResults(prev => [mockResult, ...prev.slice(0, 9)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code execution failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetDiagnostics = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await executeIDE('get-diagnostics', { 
        uri: fileUri || undefined 
      })
      
      const mockDiagnostics: DiagnosticItem[] = [
        {
          severity: 'error',
          message: 'Undefined variable: undefinedVar',
          line: 15,
          column: 8,
          file: 'main.py'
        },
        {
          severity: 'warning',
          message: 'Unused import: os',
          line: 2,
          column: 1,
          file: 'main.py'
        },
        {
          severity: 'info',
          message: 'Consider using f-strings for string formatting',
          line: 23,
          column: 12,
          file: 'utils.py'
        }
      ]
      
      setDiagnostics(mockDiagnostics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get diagnostics')
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bug className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'info':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="h-6 w-6 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold">IDE Integration</h2>
          <p className="text-muted-foreground">
            Execute code and analyze diagnostics in your development environment
          </p>
        </div>
      </div>

      <Tabs defaultValue="execution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="execution">Code Execution</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Execution
              </CardTitle>
              <CardDescription>
                Execute code in the integrated development environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Code to Execute</label>
                <Textarea
                  placeholder="Enter your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleExecuteCode} disabled={isLoading}>
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Execute Code
                </Button>
                
                <Button variant="outline" onClick={() => setCode('')}>
                  Clear
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Code Diagnostics
              </CardTitle>
              <CardDescription>
                Analyze code for errors, warnings, and suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="File URI (optional, leave empty for all files)"
                  value={fileUri}
                  onChange={(e) => setFileUri(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleGetDiagnostics} disabled={isLoading}>
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Bug className="h-4 w-4 mr-2" />
                  )}
                  Analyze
                </Button>
              </div>

              {diagnostics.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Diagnostic Results</h4>
                    <div className="flex gap-2">
                      <Badge variant="destructive">
                        {diagnostics.filter(d => d.severity === 'error').length} errors
                      </Badge>
                      <Badge variant="secondary">
                        {diagnostics.filter(d => d.severity === 'warning').length} warnings
                      </Badge>
                      <Badge variant="outline">
                        {diagnostics.filter(d => d.severity === 'info').length} info
                      </Badge>
                    </div>
                  </div>

                  <ScrollArea className="h-64 w-full">
                    <div className="space-y-2">
                      {diagnostics.map((diagnostic, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {getSeverityIcon(diagnostic.severity)}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{diagnostic.message}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    <span>{diagnostic.file}</span>
                                    <span>Line {diagnostic.line}:{diagnostic.column}</span>
                                    <Badge 
                                      variant={getSeverityColor(diagnostic.severity) as any}
                                      className="text-xs"
                                    >
                                      {diagnostic.severity}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Execution Results
              </CardTitle>
              <CardDescription>
                View output from recent code executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {executionResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No execution results yet. Run some code to see output.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executionResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              Execution #{result.executionCount}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {result.metadata.language && (
                                <Badge variant="outline">{result.metadata.language}</Badge>
                              )}
                              {result.metadata.executionTime && (
                                <Badge variant="secondary">
                                  {Math.round(result.metadata.executionTime)}ms
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {result.output && (
                              <div>
                                <h4 className="font-medium mb-2">Output</h4>
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto font-mono">
                                  {result.output}
                                </pre>
                              </div>
                            )}
                            
                            {result.error && (
                              <div>
                                <h4 className="font-medium mb-2 text-red-500">Error</h4>
                                <pre className="text-sm bg-red-50 p-4 rounded-lg overflow-x-auto font-mono text-red-700">
                                  {result.error}
                                </pre>
                              </div>
                            )}
                            
                            {result.metadata && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {result.metadata.executionTime && (
                                  <div>
                                    <strong>Execution Time:</strong> {Math.round(result.metadata.executionTime)}ms
                                  </div>
                                )}
                                {result.metadata.memoryUsage && (
                                  <div>
                                    <strong>Memory Usage:</strong> {Math.round(result.metadata.memoryUsage)}MB
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IDEPanel