import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Book, 
  Search, 
  Download, 
  ExternalLink, 
  Star, 
  Code, 
  FileText,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useMcpOperations } from '@/hooks/useMcpOperations'
import type { Context7LibraryInfo } from '@/types/mcp'

interface LibrarySearchResult {
  id: string
  name: string
  description: string
  trustScore: number
  codeSnippets: number
  version?: string
}

interface DocumentationResult {
  content: string
  libraryId: string
  topic?: string
  tokensUsed: number
}

const Context7Panel: React.FC = () => {
  const { executeContext7, operations } = useMcpOperations()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLibrary, setSelectedLibrary] = useState<LibrarySearchResult | null>(null)
  const [documentationTopic, setDocumentationTopic] = useState('')
  const [searchResults, setSearchResults] = useState<LibrarySearchResult[]>([])
  const [documentationResults, setDocumentationResults] = useState<DocumentationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFetchingDocs, setIsFetchingDocs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLibrarySearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      const result = await executeContext7('resolve-library-id', {
        libraryName: searchQuery
      })
      
      // Mock search results - in real implementation, this would come from the API
      const mockResults: LibrarySearchResult[] = [
        {
          id: `/library/${searchQuery.toLowerCase()}`,
          name: searchQuery,
          description: `Official documentation for ${searchQuery}`,
          trustScore: 9,
          codeSnippets: 150,
          version: 'latest'
        },
        {
          id: `/library/${searchQuery.toLowerCase()}-community`,
          name: `${searchQuery} Community Guide`,
          description: `Community-maintained guide for ${searchQuery}`,
          trustScore: 7,
          codeSnippets: 89,
          version: '1.0'
        }
      ]
      
      setSearchResults(mockResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleFetchDocumentation = async (library: LibrarySearchResult) => {
    setIsFetchingDocs(true)
    setError(null)
    setSelectedLibrary(library)
    
    try {
      const result = await executeContext7('get-library-docs', {
        context7CompatibleLibraryID: library.id,
        topic: documentationTopic || undefined,
        tokens: 10000
      })
      
      // Mock documentation result
      const mockDoc: DocumentationResult = {
        content: `# ${library.name} Documentation\n\n## Overview\n\nThis is the comprehensive documentation for ${library.name}.\n\n## Getting Started\n\n\`\`\`bash\nnpm install ${library.name.toLowerCase()}\n\`\`\`\n\n## Basic Usage\n\n\`\`\`javascript\nimport { ${library.name} } from '${library.name.toLowerCase()}';\n\nconst instance = new ${library.name}();\ninstance.method();\n\`\`\`\n\n## API Reference\n\n### Methods\n\n- \`method()\` - Main functionality\n- \`configure(options)\` - Configuration\n- \`destroy()\` - Cleanup\n\n## Examples\n\nMore examples and use cases...`,
        libraryId: library.id,
        topic: documentationTopic || undefined,
        tokensUsed: 2500
      }
      
      setDocumentationResults(prev => [mockDoc, ...prev.slice(0, 4)]) // Keep last 5 results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documentation')
    } finally {
      setIsFetchingDocs(false)
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getTrustScoreBadge = (score: number) => {
    if (score >= 8) return 'default'
    if (score >= 6) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Book className="h-6 w-6 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold">Context7 Documentation</h2>
          <p className="text-muted-foreground">
            Search and retrieve library documentation with AI-powered insights
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Library Search
          </CardTitle>
          <CardDescription>
            Find libraries and frameworks to get comprehensive documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter library name (e.g., React, Express, Mongoose)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLibrarySearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleLibrarySearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {/* Topic Filter */}
          <div className="flex gap-2">
            <Input
              placeholder="Optional: Specific topic (e.g., hooks, routing, authentication)"
              value={documentationTopic}
              onChange={(e) => setDocumentationTopic(e.target.value)}
              className="flex-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="history">Recent Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Library Search Results</CardTitle>
              <CardDescription>
                Found {searchResults.length} libraries matching your search
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No libraries found. Try searching for a library name.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((library, index) => (
                    <motion.div
                      key={library.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{library.name}</h3>
                                <Badge variant={getTrustScoreBadge(library.trustScore)}>
                                  <Star className="h-3 w-3 mr-1" />
                                  {library.trustScore}/10
                                </Badge>
                                {library.version && (
                                  <Badge variant="outline">v{library.version}</Badge>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground mb-3">
                                {library.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Code className="h-4 w-4" />
                                  {library.codeSnippets} code snippets
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleFetchDocumentation(library)}
                                disabled={isFetchingDocs}
                              >
                                {isFetchingDocs && selectedLibrary?.id === library.id ? (
                                  <Loader className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Download className="h-4 w-4 mr-2" />
                                )}
                                Get Docs
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://docs.${library.name.toLowerCase()}.com`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Official
                              </Button>
                            </div>
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

        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentation Results</CardTitle>
              <CardDescription>
                Retrieved documentation content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentationResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documentation retrieved yet. Search for a library and click "Get Docs".</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {documentationResults.map((doc, index) => (
                    <motion.div
                      key={`${doc.libraryId}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{doc.libraryId}</CardTitle>
                              {doc.topic && (
                                <CardDescription>Topic: {doc.topic}</CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {doc.tokensUsed} tokens
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64 w-full">
                            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg overflow-auto">
                              {doc.content}
                            </pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>
                Your recent documentation searches and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Search history will appear here as you use Context7.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Context7Panel