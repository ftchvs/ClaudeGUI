import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Image, 
  Layers, 
  Undo, 
  Redo, 
  Download, 
  Share2, 
  Zap, 
  Brain, 
  Lightbulb, 
  Target, 
  GitBranch, 
  Database, 
  Server, 
  Cloud, 
  Smartphone, 
  Monitor, 
  Cpu, 
  Network, 
  Lock, 
  Key, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Trash2, 
  Copy, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Hand, 
  MousePointer, 
  PenTool, 
  Edit3, 
  Shapes, 
  Palette, 
  Grid, 
  Maximize2, 
  Minimize2,
  MessageSquare,
  Sparkles,
  Wand2,
  Eye,
  EyeOff,
  Link,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DrawingElement {
  id: string
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'component' | 'connection'
  position: { x: number; y: number }
  size?: { width: number; height: number }
  points?: Array<{ x: number; y: number }>
  text?: string
  style: {
    color: string
    strokeWidth: number
    fill?: string
    fontSize?: number
    fontWeight?: string
  }
  metadata?: {
    componentType?: string
    description?: string
    properties?: Record<string, any>
  }
}

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  elements: DrawingElement[]
  category: 'architecture' | 'flow' | 'ui' | 'database' | 'planning'
}

interface AIInsight {
  id: string
  type: 'suggestion' | 'pattern' | 'optimization' | 'question'
  title: string
  description: string
  targetElement?: string
  confidence: number
}

export const VisualThinking: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'select' | 'component'>('pen')
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showAIInsights, setShowAIInsights] = useState(true)
  
  // Drawing style
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fillColor, setFillColor] = useState('transparent')
  const [fontSize, setFontSize] = useState(16)
  
  // AI suggestions
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'suggestion',
      title: 'Add Authentication Layer',
      description: 'Consider adding an authentication service between the frontend and API',
      confidence: 0.85
    },
    {
      id: '2',
      type: 'pattern',
      title: 'Observer Pattern Detected',
      description: 'Your components follow the observer pattern - perfect for real-time updates',
      confidence: 0.92
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Caching Opportunity',
      description: 'Add a caching layer between the API and database for better performance',
      confidence: 0.78
    }
  ])

  // Templates
  const templates: Template[] = [
    {
      id: 'web-app',
      name: 'Web Application',
      description: 'Standard web app architecture with frontend, API, and database',
      icon: <Monitor className="h-4 w-4" />,
      category: 'architecture',
      elements: [
        {
          id: 'frontend',
          type: 'component',
          position: { x: 100, y: 100 },
          size: { width: 120, height: 80 },
          text: 'Frontend\n(React)',
          style: { color: '#3b82f6', strokeWidth: 2, fill: '#dbeafe' },
          metadata: { componentType: 'frontend', description: 'User interface layer' }
        },
        {
          id: 'api',
          type: 'component',
          position: { x: 300, y: 100 },
          size: { width: 120, height: 80 },
          text: 'API\n(Node.js)',
          style: { color: '#10b981', strokeWidth: 2, fill: '#d1fae5' },
          metadata: { componentType: 'api', description: 'Business logic layer' }
        },
        {
          id: 'database',
          type: 'component',
          position: { x: 500, y: 100 },
          size: { width: 120, height: 80 },
          text: 'Database\n(PostgreSQL)',
          style: { color: '#f59e0b', strokeWidth: 2, fill: '#fef3c7' },
          metadata: { componentType: 'database', description: 'Data persistence layer' }
        }
      ]
    },
    {
      id: 'microservices',
      name: 'Microservices',
      description: 'Microservices architecture with API gateway and multiple services',
      icon: <Network className="h-4 w-4" />,
      category: 'architecture',
      elements: []
    },
    {
      id: 'user-flow',
      name: 'User Flow',
      description: 'User journey mapping and flow diagram',
      icon: <GitBranch className="h-4 w-4" />,
      category: 'flow',
      elements: []
    }
  ]

  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply zoom and pan
    ctx.save()
    ctx.scale(zoom / 100, zoom / 100)
    ctx.translate(pan.x, pan.y)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#f3f4f6'
      ctx.lineWidth = 1
      const gridSize = 20
      
      for (let x = 0; x <= canvas.width * (100 / zoom); x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height * (100 / zoom))
        ctx.stroke()
      }
      
      for (let y = 0; y <= canvas.height * (100 / zoom); y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width * (100 / zoom), y)
        ctx.stroke()
      }
    }

    // Draw elements
    elements.forEach(element => {
      ctx.strokeStyle = element.style.color
      ctx.lineWidth = element.style.strokeWidth
      ctx.fillStyle = element.style.fill || 'transparent'

      switch (element.type) {
        case 'rectangle':
          if (element.size) {
            ctx.fillRect(element.position.x, element.position.y, element.size.width, element.size.height)
            ctx.strokeRect(element.position.x, element.position.y, element.size.width, element.size.height)
          }
          break
          
        case 'circle':
          if (element.size) {
            const radius = Math.min(element.size.width, element.size.height) / 2
            const centerX = element.position.x + element.size.width / 2
            const centerY = element.position.y + element.size.height / 2
            
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
          }
          break
          
        case 'component':
          if (element.size) {
            // Draw component box with rounded corners
            const x = element.position.x
            const y = element.position.y
            const w = element.size.width
            const h = element.size.height
            const r = 8
            
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + w - r, y)
            ctx.quadraticCurveTo(x + w, y, x + w, y + r)
            ctx.lineTo(x + w, y + h - r)
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
            ctx.lineTo(x + r, y + h)
            ctx.quadraticCurveTo(x, y + h, x, y + h - r)
            ctx.lineTo(x, y + r)
            ctx.quadraticCurveTo(x, y, x + r, y)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            
            // Draw text
            if (element.text) {
              ctx.fillStyle = element.style.color
              ctx.font = `${element.style.fontSize || 14}px sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              
              const lines = element.text.split('\n')
              const lineHeight = (element.style.fontSize || 14) * 1.2
              const startY = y + h / 2 - (lines.length - 1) * lineHeight / 2
              
              lines.forEach((line, index) => {
                ctx.fillText(line, x + w / 2, startY + index * lineHeight)
              })
            }
          }
          break
          
        case 'line':
          if (element.points && element.points.length > 1) {
            ctx.beginPath()
            ctx.moveTo(element.points[0].x, element.points[0].y)
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y)
            }
            ctx.stroke()
          }
          break
      }

      // Highlight selected element
      if (element.id === selectedElement && element.size) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(
          element.position.x - 5, 
          element.position.y - 5, 
          element.size.width + 10, 
          element.size.height + 10
        )
        ctx.setLineDash([])
      }
    })

    ctx.restore()
  }, [elements, selectedElement, zoom, pan, showGrid])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) * (100 / zoom)) - pan.x
    const y = ((e.clientY - rect.top) * (100 / zoom)) - pan.y

    if (tool === 'component') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'component',
        position: { x: x - 60, y: y - 40 },
        size: { width: 120, height: 80 },
        text: 'Component',
        style: {
          color: strokeColor,
          strokeWidth,
          fill: fillColor,
          fontSize
        }
      }
      setElements(prev => [...prev, newElement])
      setSelectedElement(newElement.id)
    } else if (tool === 'rectangle') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'rectangle',
        position: { x, y },
        size: { width: 100, height: 60 },
        style: {
          color: strokeColor,
          strokeWidth,
          fill: fillColor
        }
      }
      setElements(prev => [...prev, newElement])
      setSelectedElement(newElement.id)
    }
    
    setIsDrawing(true)
  }, [tool, strokeColor, strokeWidth, fillColor, fontSize, zoom, pan])

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setElements(template.elements)
      setCurrentTemplate(templateId)
    }
  }

  const generateAISuggestion = () => {
    const newInsight: AIInsight = {
      id: Date.now().toString(),
      type: 'suggestion',
      title: 'Smart Connection Detected',
      description: 'I notice you have components that could benefit from a message queue for async communication',
      confidence: 0.89
    }
    setAIInsights(prev => [newInsight, ...prev])
  }

  const exportDiagram = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'architecture-diagram.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="h-full flex">
      {/* Left Toolbar */}
      <div className="w-16 border-r bg-muted/20 flex flex-col items-center py-4 gap-2">
        <Button
          variant={tool === 'select' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('select')}
          className="w-10 h-10 p-0"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        
        <Button
          variant={tool === 'pen' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('pen')}
          className="w-10 h-10 p-0"
        >
          <Pen className="h-4 w-4" />
        </Button>
        
        <Button
          variant={tool === 'component' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('component')}
          className="w-10 h-10 p-0"
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <Button
          variant={tool === 'rectangle' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('rectangle')}
          className="w-10 h-10 p-0"
        >
          <Shapes className="h-4 w-4" />
        </Button>
        
        <Button
          variant={tool === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('text')}
          className="w-10 h-10 p-0"
        >
          <Type className="h-4 w-4" />
        </Button>

        <div className="w-full h-px bg-border my-2" />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-12 border-b bg-muted/20 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Visual Thinking</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <FolderOpen className="h-3 w-3 mr-2" />
                Open
              </Button>
              <Button size="sm" variant="outline">
                <Save className="h-3 w-3 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={exportDiagram}>
                <Download className="h-3 w-3 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-muted' : ''}
              >
                <Grid className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-sm w-12 text-center">{zoom}%</span>
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(300, zoom + 25))}>
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button size="sm" onClick={generateAISuggestion}>
              <Sparkles className="h-3 w-3 mr-2" />
              AI Analyze
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l bg-muted/20">
        <Tabs defaultValue="templates" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Quick Start Templates</h3>
                
                {templates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => applyTemplate(template.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-semibold text-sm">Component Library</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="h-12 flex-col gap-1">
                      <Database className="h-4 w-4" />
                      <span className="text-xs">Database</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 flex-col gap-1">
                      <Server className="h-4 w-4" />
                      <span className="text-xs">Server</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 flex-col gap-1">
                      <Cloud className="h-4 w-4" />
                      <span className="text-xs">Cloud</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 flex-col gap-1">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">Mobile</span>
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="properties" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Style Properties</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium">Stroke Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-8 h-8 rounded border"
                      />
                      <Input value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Stroke Width</label>
                    <Slider
                      value={[strokeWidth]}
                      onValueChange={(value) => setStrokeWidth(value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Fill Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                        onChange={(e) => setFillColor(e.target.value)}
                        className="w-8 h-8 rounded border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFillColor('transparent')}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Font Size</label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      max={32}
                      min={8}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                </div>

                {selectedElement && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-3">Element Properties</h4>
                    <div className="space-y-2">
                      <Input placeholder="Component name" />
                      <Input placeholder="Description" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Component type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">AI Insights</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAIInsights(!showAIInsights)}
                  >
                    {showAIInsights ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>

                <div className="space-y-3">
                  {aiInsights.map(insight => (
                    <Card key={insight.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {insight.type === 'suggestion' && <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />}
                          {insight.type === 'pattern' && <Brain className="h-4 w-4 text-blue-500 mt-0.5" />}
                          {insight.type === 'optimization' && <Zap className="h-4 w-4 text-green-500 mt-0.5" />}
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {(insight.confidence * 100).toFixed(0)}% confident
                              </Badge>
                              <Button size="sm" variant="ghost" className="h-6 px-2">
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button size="sm" className="w-full" onClick={generateAISuggestion}>
                  <Wand2 className="h-3 w-3 mr-2" />
                  Generate More Insights
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default VisualThinking