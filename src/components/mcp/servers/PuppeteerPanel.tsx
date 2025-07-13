import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  Camera, 
  MousePointer, 
  Type, 
  Play, 
  Code,
  Image as ImageIcon,
  Loader,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useMcpOperations } from '@/hooks/useMcpOperations'
import type { PuppeteerScreenshot } from '@/types/mcp'

const PuppeteerPanel: React.FC = () => {
  const { executePuppeteer } = useMcpOperations()
  
  const [url, setUrl] = useState('')
  const [selector, setSelector] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [screenshots, setScreenshots] = useState<PuppeteerScreenshot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNavigate = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setError(null)
    
    try {
      await executePuppeteer('navigate', { url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Navigation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScreenshot = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await executePuppeteer('screenshot', { 
        name: `screenshot-${Date.now()}`,
        width: 1200,
        height: 800
      })
      
      const mockScreenshot: PuppeteerScreenshot = {
        name: `screenshot-${Date.now()}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        width: 1200,
        height: 800,
        timestamp: new Date()
      }
      
      setScreenshots(prev => [mockScreenshot, ...prev.slice(0, 9)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Screenshot failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = async () => {
    if (!selector.trim()) return
    setIsLoading(true)
    setError(null)
    
    try {
      await executePuppeteer('click', { selector })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Click failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFill = async () => {
    if (!selector.trim() || !inputValue.trim()) return
    setIsLoading(true)
    setError(null)
    
    try {
      await executePuppeteer('fill', { selector, value: inputValue })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fill failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvaluate = async () => {
    if (!jsCode.trim()) return
    setIsLoading(true)
    setError(null)
    
    try {
      await executePuppeteer('evaluate', { script: jsCode })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code execution failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="h-6 w-6 text-purple-500" />
        <div>
          <h2 className="text-2xl font-bold">Puppeteer Browser Control</h2>
          <p className="text-muted-foreground">
            Automate browser interactions and capture screenshots
          </p>
        </div>
      </div>

      <Tabs defaultValue="navigation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
          <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Page Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleNavigate} disabled={isLoading}>
                  {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Navigate
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

        <TabsContent value="interaction">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Click Element
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="CSS selector (e.g., #button, .class)"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                />
                <Button onClick={handleClick} disabled={isLoading} className="w-full">
                  Click
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Fill Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Value to enter"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button onClick={handleFill} disabled={isLoading} className="w-full">
                  Fill
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="screenshots">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Screenshots
                </CardTitle>
                <Button onClick={handleScreenshot} disabled={isLoading}>
                  {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  Take Screenshot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {screenshots.map((screenshot, index) => (
                  <motion.div
                    key={screenshot.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">{screenshot.name}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{screenshot.width}x{screenshot.height}</span>
                            <span>{screenshot.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                JavaScript Automation
              </CardTitle>
              <CardDescription>
                Execute custom JavaScript code in the browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter JavaScript code to execute..."
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                rows={8}
                className="font-mono"
              />
              <Button onClick={handleEvaluate} disabled={isLoading}>
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Execute
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PuppeteerPanel