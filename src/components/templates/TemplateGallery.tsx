/**
 * Template Gallery Component
 * 
 * Pre-built templates for code generation with Claude Code
 * Provides common patterns, components, and boilerplate code
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../../design-system/icons'
import { claudeCodeDark } from '../../design-system/theme'
import { getClaudeCodeService } from '../../services/serviceProvider'

interface CodeTemplate {
  id: string
  name: string
  description: string
  category: string
  language: string
  framework?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  preview: string
  instructions: string
  files: Array<{
    path: string
    content: string
  }>
  dependencies?: string[]
  estimatedTime: string
  author: string
  downloads: number
  rating: number
}

interface TemplateCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  count: number
}

interface TemplateGalleryProps {
  className?: string
  onTemplateGenerate?: (template: CodeTemplate, customizations: Record<string, string>) => void
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  className = '',
  onTemplateGenerate
}) => {
  const [templates, setTemplates] = useState<CodeTemplate[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular')
  const [showCustomization, setShowCustomization] = useState(false)
  const [customizations, setCustomizations] = useState<Record<string, string>>({})

  // Mock templates data
  const mockTemplates: CodeTemplate[] = [
    {
      id: 'react-component',
      name: 'React Functional Component',
      description: 'Modern React component with TypeScript, hooks, and best practices',
      category: 'react',
      language: 'TypeScript',
      framework: 'React',
      difficulty: 'beginner',
      tags: ['react', 'typescript', 'component', 'hooks'],
      preview: `interface ComponentProps {
  className?: string
}

export const MyComponent: React.FC<ComponentProps> = ({ className = '' }) => {
  const [state, setState] = useState()
  
  return (
    <div className={\`component-container \${className}\`}>
      <h2>MyComponent</h2>
    </div>
  )
}

export default MyComponent`,
      instructions: 'Creates a modern React functional component with TypeScript types, state management, and proper export patterns.',
      files: [
        {
          path: 'src/components/${componentName}.tsx',
          content: 'Component implementation with TypeScript and React hooks'
        },
        {
          path: 'src/components/${componentName}.test.tsx',
          content: 'Unit tests for the component using React Testing Library'
        },
        {
          path: 'src/components/${componentName}.stories.tsx',
          content: 'Storybook stories for component documentation'
        }
      ],
      dependencies: ['react', 'react-dom', '@types/react'],
      estimatedTime: '5 minutes',
      author: 'Claude Code Templates',
      downloads: 1250,
      rating: 4.8
    },
    {
      id: 'express-api',
      name: 'Express.js REST API',
      description: 'Complete REST API with authentication, middleware, and database integration',
      category: 'backend',
      language: 'TypeScript',
      framework: 'Express.js',
      difficulty: 'intermediate',
      tags: ['express', 'rest', 'api', 'authentication', 'middleware'],
      preview: `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from './routes/auth'
import { usersRouter } from './routes/users'

const app = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)

export default app`,
      instructions: 'Generates a production-ready Express.js REST API with authentication, error handling, and database integration.',
      files: [
        {
          path: 'src/app.ts',
          content: 'Main Express application setup'
        },
        {
          path: 'src/routes/${resourceName}.ts',
          content: 'REST API routes for the specified resource'
        },
        {
          path: 'src/middleware/auth.ts',
          content: 'Authentication middleware'
        },
        {
          path: 'src/models/${resourceName}.ts',
          content: 'Data model and validation'
        }
      ],
      dependencies: ['express', 'cors', 'helmet', 'jsonwebtoken'],
      estimatedTime: '15 minutes',
      author: 'Claude Code Templates',
      downloads: 890,
      rating: 4.6
    },
    {
      id: 'python-cli',
      name: 'Python CLI Tool',
      description: 'Command-line interface with argument parsing, logging, and configuration',
      category: 'python',
      language: 'Python',
      difficulty: 'intermediate',
      tags: ['python', 'cli', 'argparse', 'logging'],
      preview: `#!/usr/bin/env python3
"""
my-tool - A command-line tool for data processing
"""

import argparse
import logging
import sys
from pathlib import Path

def setup_logging(verbose: bool = False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(level=level, format='%(levelname)s: %(message)s')

def main():
    parser = argparse.ArgumentParser(description='Data processing tool')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    setup_logging(args.verbose)
    
    logging.info('Starting my-tool')

if __name__ == '__main__':
    main()`,
      instructions: 'Creates a professional Python CLI tool with proper argument parsing, logging, and project structure.',
      files: [
        {
          path: '${toolName}/__main__.py',
          content: 'Main CLI entry point'
        },
        {
          path: '${toolName}/cli.py',
          content: 'Command-line interface implementation'
        },
        {
          path: '${toolName}/config.py',
          content: 'Configuration management'
        },
        {
          path: 'setup.py',
          content: 'Package setup and dependencies'
        }
      ],
      dependencies: ['click', 'pyyaml', 'rich'],
      estimatedTime: '12 minutes',
      author: 'Claude Code Templates',
      downloads: 654,
      rating: 4.7
    },
    {
      id: 'docker-compose',
      name: 'Docker Development Environment',
      description: 'Multi-service Docker Compose setup with database, cache, and monitoring',
      category: 'devops',
      language: 'YAML',
      difficulty: 'intermediate',
      tags: ['docker', 'compose', 'database', 'redis', 'monitoring'],
      preview: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`,
      instructions: 'Sets up a complete development environment with application, database, cache, and monitoring services.',
      files: [
        {
          path: 'docker-compose.yml',
          content: 'Main Docker Compose configuration'
        },
        {
          path: 'docker-compose.override.yml',
          content: 'Development overrides'
        },
        {
          path: 'Dockerfile',
          content: 'Application container definition'
        },
        {
          path: '.dockerignore',
          content: 'Files to ignore in Docker build'
        }
      ],
      estimatedTime: '8 minutes',
      author: 'Claude Code Templates',
      downloads: 432,
      rating: 4.5
    }
  ]

  const mockCategories: TemplateCategory[] = [
    {
      id: 'all',
      name: 'All Templates',
      icon: <Icons.Workflow size={16} />,
      description: 'Browse all available templates',
      count: mockTemplates.length
    },
    {
      id: 'react',
      name: 'React',
      icon: <Icons.React size={16} />,
      description: 'React components and applications',
      count: mockTemplates.filter(t => t.category === 'react').length
    },
    {
      id: 'backend',
      name: 'Backend',
      icon: <Icons.Settings size={16} />,
      description: 'APIs and server-side applications',
      count: mockTemplates.filter(t => t.category === 'backend').length
    },
    {
      id: 'python',
      name: 'Python',
      icon: <Icons.Code size={16} />,
      description: 'Python scripts and applications',
      count: mockTemplates.filter(t => t.category === 'python').length
    },
    {
      id: 'devops',
      name: 'DevOps',
      icon: <Icons.Terminal size={16} />,
      description: 'Infrastructure and deployment',
      count: mockTemplates.filter(t => t.category === 'devops').length
    }
  ]

  useEffect(() => {
    setTemplates(mockTemplates)
    setCategories(mockCategories)
  }, [])

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return a.name.localeCompare(b.name) // Mock recent sort
      default:
        return 0
    }
  })

  const handleGenerateTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const claudeCodeService = getClaudeCodeService()
      
      // Replace template variables with customizations
      let instructions = selectedTemplate.instructions
      Object.entries(customizations).forEach(([key, value]) => {
        instructions = instructions.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value)
      })

      // Use Claude Code to generate the template
      await claudeCodeService.chat(
        `Generate code using this template: ${selectedTemplate.name}. ${instructions}. Use these customizations: ${JSON.stringify(customizations)}`
      )

      onTemplateGenerate?.(selectedTemplate, customizations)
      setShowCustomization(false)
      setSelectedTemplate(null)
      setCustomizations({})
    } catch (error) {
      console.error('Failed to generate template:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}>
        ★
      </span>
    ))
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex ${className}`}>
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 bg-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Icons.CodeGenerate size={24} className="text-purple-400" />
            <div>
              <h2 className="font-semibold text-white">Template Gallery</h2>
              <p className="text-sm text-gray-400">Pre-built code templates</p>
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
              className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-purple-600/20 text-purple-400' 
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.count}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {showCustomization && selectedTemplate ? (
          // Template Customization
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTemplate.name}</h3>
                  <p className="text-gray-400">Customize template parameters</p>
                </div>
                <button
                  onClick={() => setShowCustomization(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Icons.X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Component Name
                  </label>
                  <input
                    type="text"
                    placeholder="MyComponent"
                    value={customizations.componentName || ''}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, componentName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {selectedTemplate.category === 'backend' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      placeholder="users"
                      value={customizations.resourceName || ''}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, resourceName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {selectedTemplate.category === 'python' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Tool Name
                      </label>
                      <input
                        type="text"
                        placeholder="my-tool"
                        value={customizations.toolName || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, toolName: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Tool Description
                      </label>
                      <input
                        type="text"
                        placeholder="A helpful command-line tool"
                        value={customizations.toolDescription || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, toolDescription: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}

                {selectedTemplate.category === 'devops' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Database Name
                    </label>
                    <input
                      type="text"
                      placeholder="myapp"
                      value={customizations.dbName || ''}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, dbName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomization(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateTemplate}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Icons.CodeGenerate size={16} />
                  Generate Code
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Template List
          <>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedCategory === 'all' ? 'All Templates' : categories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-gray-400">{filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                          <p className="text-sm text-gray-400">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {renderStars(template.rating)}
                          <span className="text-gray-400 ml-1">({template.rating})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          {template.language}
                        </span>
                        {template.framework && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                            {template.framework}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span>{template.downloads} downloads</span>
                        <span>{template.estimatedTime}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowCustomization(true)
                          setCustomizations({})
                        }}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Icons.Download size={16} />
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Icons.CodeGenerate size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-white mb-2">No Templates Found</h3>
                  <p className="text-gray-400">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TemplateGallery