/**
 * Template Gallery - Claude Code's Code Generation Hub
 * 
 * Visual template selection and customization for rapid development
 * This transforms CLI template commands into a beautiful gallery experience!
 */

import React, { useState, useMemo } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { claudeCodeService } from '../../services/claudeCodeService'

interface CodeTemplate {
  id: string
  name: string
  description: string
  category: 'component' | 'page' | 'api' | 'utility' | 'test' | 'config'
  framework: 'react' | 'vue' | 'angular' | 'node' | 'python' | 'generic'
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  preview: string
  parameters: TemplateParameter[]
  files: TemplateFile[]
  popularity: number
  lastUpdated: Date
  author: string
  claudeOptimized: boolean
}

interface TemplateParameter {
  name: string
  label: string
  type: 'string' | 'select' | 'boolean' | 'number'
  required: boolean
  default?: any
  options?: string[]
  description: string
}

interface TemplateFile {
  path: string
  content: string
  description: string
}

interface TemplateGalleryProps {
  onTemplateGenerate?: (template: CodeTemplate, parameters: Record<string, any>) => void
  onTemplatePreview?: (template: CodeTemplate) => void
  showClaudeOptimized?: boolean
  className?: string
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onTemplateGenerate,
  onTemplatePreview,
  showClaudeOptimized = true,
  className = ''
}) => {
  const [templates] = useState<CodeTemplate[]>(generateMockTemplates())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFramework, setSelectedFramework] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [templateParameters, setTemplateParameters] = useState<Record<string, any>>({})
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery')
  const [sortBy, setSortBy] = useState<'popularity' | 'recent' | 'name'>('popularity')

  const categories = [
    { key: 'all', label: 'All Templates', icon: Icons.File },
    { key: 'component', label: 'Components', icon: Icons.React },
    { key: 'page', label: 'Pages', icon: Icons.File },
    { key: 'api', label: 'API Routes', icon: Icons.Settings },
    { key: 'utility', label: 'Utilities', icon: Icons.CodeGenerate },
    { key: 'test', label: 'Tests', icon: Icons.Check },
    { key: 'config', label: 'Config', icon: Icons.Settings }
  ]

  const frameworks = [
    { key: 'all', label: 'All Frameworks' },
    { key: 'react', label: 'React' },
    { key: 'vue', label: 'Vue' },
    { key: 'angular', label: 'Angular' },
    { key: 'node', label: 'Node.js' },
    { key: 'python', label: 'Python' }
  ]

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Filter by framework
    if (selectedFramework !== 'all') {
      filtered = filtered.filter(t => t.framework === selectedFramework)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'recent':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [templates, selectedCategory, selectedFramework, searchQuery, sortBy])

  const handleTemplateSelect = (template: CodeTemplate) => {
    setSelectedTemplate(template)
    // Initialize parameters with defaults
    const defaultParams: Record<string, any> = {}
    template.parameters.forEach(param => {
      defaultParams[param.name] = param.default ?? (param.type === 'boolean' ? false : '')
    })
    setTemplateParameters(defaultParams)
  }

  const handleParameterChange = (paramName: string, value: any) => {
    setTemplateParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const handleGenerate = async () => {
    if (!selectedTemplate) return

    try {
      await claudeCodeService.generateCode(selectedTemplate.id, {
        language: selectedTemplate.language,
        framework: selectedTemplate.framework,
        parameters: templateParameters
      })

      onTemplateGenerate?.(selectedTemplate, templateParameters)
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Template generation failed:', error)
    }
  }

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'react': return <Icons.React size={16} />
      case 'typescript': return <Icons.TypeScript size={16} />
      case 'javascript': return <Icons.JavaScript size={16} />
      default: return <Icons.File size={16} />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.CodeGenerate size={24} className="text-orange-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Template Gallery</h2>
              <p className="text-sm text-gray-400">Generate code from professional templates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode */}
            <div className="flex bg-gray-700 rounded-md overflow-hidden">
              {['gallery', 'list'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 text-xs transition-colors ${
                    viewMode === mode ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="recent">Recently Updated</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Categories */}
          <div className="flex gap-1">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedCategory === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Frameworks */}
          <div className="flex gap-1">
            {frameworks.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedFramework(key)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedFramework === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className="p-6">
        {viewMode === 'gallery' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                onPreview={() => onTemplatePreview?.(template)}
                getFrameworkIcon={getFrameworkIcon}
                getDifficultyColor={getDifficultyColor}
                showClaudeOptimized={showClaudeOptimized}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <TemplateListItem
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                onPreview={() => onTemplatePreview?.(template)}
                getFrameworkIcon={getFrameworkIcon}
                getDifficultyColor={getDifficultyColor}
                showClaudeOptimized={showClaudeOptimized}
              />
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Icons.Search size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Template Configuration Modal */}
      {selectedTemplate && (
        <TemplateConfigModal
          template={selectedTemplate}
          parameters={templateParameters}
          onParameterChange={handleParameterChange}
          onGenerate={handleGenerate}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  )
}

// Template Card Component
const TemplateCard: React.FC<{
  template: CodeTemplate
  onSelect: (template: CodeTemplate) => void
  onPreview: () => void
  getFrameworkIcon: (framework: string) => React.ReactNode
  getDifficultyColor: (difficulty: string) => string
  showClaudeOptimized: boolean
}> = ({ template, onSelect, onPreview, getFrameworkIcon, getDifficultyColor, showClaudeOptimized }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-orange-500/50 transition-colors group">
    {/* Header */}
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getFrameworkIcon(template.framework)}
          <h3 className="font-medium text-white">{template.name}</h3>
        </div>
        {showClaudeOptimized && template.claudeOptimized && (
          <div className="px-2 py-1 bg-orange-400/20 text-orange-400 text-xs rounded-full flex items-center gap-1">
            <Icons.AISpark size={10} />
            AI
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
    </div>

    {/* Content */}
    <div className="p-4">
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
            {tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
            +{template.tags.length - 3}
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span className={getDifficultyColor(template.difficulty)}>
          {template.difficulty}
        </span>
        <span>★ {template.popularity}</span>
      </div>

      {/* Code Preview */}
      <div className="bg-gray-900 rounded-md p-3 mb-4">
        <pre className="text-xs text-gray-300 overflow-hidden">
          <code>{template.preview}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onSelect(template)}
          className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors flex items-center justify-center gap-1"
        >
          <Icons.CodeGenerate size={14} />
          Generate
        </button>
        <button
          onClick={onPreview}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md transition-colors"
        >
          <Icons.File size={14} />
        </button>
      </div>
    </div>
  </div>
)

// Template List Item Component
const TemplateListItem: React.FC<{
  template: CodeTemplate
  onSelect: (template: CodeTemplate) => void
  onPreview: () => void
  getFrameworkIcon: (framework: string) => React.ReactNode
  getDifficultyColor: (difficulty: string) => string
  showClaudeOptimized: boolean
}> = ({ template, onSelect, onPreview, getFrameworkIcon, getDifficultyColor, showClaudeOptimized }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-orange-500/50 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {getFrameworkIcon(template.framework)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate">{template.name}</h3>
            {showClaudeOptimized && template.claudeOptimized && (
              <Icons.AISpark size={14} className="text-orange-400" />
            )}
            <span className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
              {template.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-400 truncate">{template.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <span className="text-xs text-gray-400">★ {template.popularity}</span>
        <button
          onClick={onPreview}
          className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
        >
          <Icons.File size={14} />
        </button>
        <button
          onClick={() => onSelect(template)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
        >
          <Icons.CodeGenerate size={14} />
          Generate
        </button>
      </div>
    </div>
  </div>
)

// Template Configuration Modal
const TemplateConfigModal: React.FC<{
  template: CodeTemplate
  parameters: Record<string, any>
  onParameterChange: (name: string, value: any) => void
  onGenerate: () => void
  onCancel: () => void
}> = ({ template, parameters, onParameterChange, onGenerate, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{template.name}</h2>
            <p className="text-sm text-gray-400">{template.description}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icons.Error size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="p-6 space-y-4">
        <h3 className="font-medium text-white mb-4">Configure Template</h3>
        
        {template.parameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {param.label}
              {param.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            
            {param.type === 'string' && (
              <input
                type="text"
                value={parameters[param.name] || ''}
                onChange={(e) => onParameterChange(param.name, e.target.value)}
                placeholder={param.description}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
            
            {param.type === 'select' && (
              <select
                value={parameters[param.name] || param.default}
                onChange={(e) => onParameterChange(param.name, e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {param.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            
            {param.type === 'boolean' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={parameters[param.name] || false}
                  onChange={(e) => onParameterChange(param.name, e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-400">{param.description}</span>
              </label>
            )}
            
            {param.type === 'number' && (
              <input
                type="number"
                value={parameters[param.name] || param.default || ''}
                onChange={(e) => onParameterChange(param.name, parseInt(e.target.value))}
                placeholder={param.description}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
            
            <p className="text-xs text-gray-500">{param.description}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors flex items-center gap-2"
        >
          <Icons.CodeGenerate size={16} />
          Generate Code
        </button>
      </div>
    </div>
  </div>
)

// Mock template data
function generateMockTemplates(): CodeTemplate[] {
  return [
    {
      id: 'react-component',
      name: 'React Component',
      description: 'Modern React component with TypeScript, props interface, and styling',
      category: 'component',
      framework: 'react',
      language: 'typescript',
      difficulty: 'beginner',
      tags: ['react', 'typescript', 'component', 'props'],
      preview: `interface Props {\n  title: string\n  onClick?: () => void\n}\n\nexport const Button: FC<Props> = ({ title, onClick }) => {\n  return (\n    <button onClick={onClick}>\n      {title}\n    </button>\n  )\n}`,
      parameters: [
        {
          name: 'componentName',
          label: 'Component Name',
          type: 'string',
          required: true,
          description: 'Name of the React component'
        },
        {
          name: 'useHooks',
          label: 'Include React Hooks',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Include useState and useEffect examples'
        },
        {
          name: 'styling',
          label: 'Styling Approach',
          type: 'select',
          required: true,
          options: ['CSS Modules', 'Styled Components', 'Tailwind CSS', 'Emotion'],
          default: 'Tailwind CSS',
          description: 'How to style the component'
        }
      ],
      files: [],
      popularity: 95,
      lastUpdated: new Date(2024, 0, 20),
      author: 'Claude Code',
      claudeOptimized: true
    },
    {
      id: 'api-route',
      name: 'API Route Handler',
      description: 'Express.js API route with validation, error handling, and TypeScript',
      category: 'api',
      framework: 'node',
      language: 'typescript',
      difficulty: 'intermediate',
      tags: ['express', 'api', 'validation', 'typescript'],
      preview: `app.post('/api/users', async (req, res) => {\n  try {\n    const { name, email } = req.body\n    // Validation and logic here\n    res.json({ success: true })\n  } catch (error) {\n    res.status(500).json({ error: error.message })\n  }\n})`,
      parameters: [
        {
          name: 'endpoint',
          label: 'Endpoint Path',
          type: 'string',
          required: true,
          description: 'API endpoint path (e.g., /api/users)'
        },
        {
          name: 'method',
          label: 'HTTP Method',
          type: 'select',
          required: true,
          options: ['GET', 'POST', 'PUT', 'DELETE'],
          default: 'GET',
          description: 'HTTP method for the route'
        }
      ],
      files: [],
      popularity: 87,
      lastUpdated: new Date(2024, 0, 18),
      author: 'Claude Code',
      claudeOptimized: true
    },
    {
      id: 'test-suite',
      name: 'Test Suite',
      description: 'Complete test suite with Jest, React Testing Library, and coverage',
      category: 'test',
      framework: 'react',
      language: 'typescript',
      difficulty: 'intermediate',
      tags: ['jest', 'testing-library', 'unit-tests', 'coverage'],
      preview: `describe('ComponentName', () => {\n  it('should render correctly', () => {\n    render(<ComponentName />)\n    expect(screen.getByText('Hello')).toBeInTheDocument()\n  })\n\n  it('should handle clicks', () => {\n    const onClick = jest.fn()\n    render(<ComponentName onClick={onClick} />)\n    fireEvent.click(screen.getByRole('button'))\n    expect(onClick).toHaveBeenCalled()\n  })\n})`,
      parameters: [
        {
          name: 'componentName',
          label: 'Component to Test',
          type: 'string',
          required: true,
          description: 'Name of component to generate tests for'
        }
      ],
      files: [],
      popularity: 73,
      lastUpdated: new Date(2024, 0, 15),
      author: 'Claude Code',
      claudeOptimized: true
    }
  ]
}

export default TemplateGallery