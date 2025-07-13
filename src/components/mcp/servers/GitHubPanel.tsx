import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  Eye, 
  Code, 
  FileText, 
  FolderOpen,
  ExternalLink,
  Download,
  Plus,
  GitPullRequest,
  Bug,
  Calendar,
  Users,
  Loader,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMcpOperations } from '@/hooks/useMcpOperations'
import type { GitHubRepository } from '@/types/mcp'

interface RepositorySearchResult extends GitHubRepository {
  owner: {
    login: string
    avatar_url: string
  }
  topics: string[]
  license?: {
    name: string
  }
}

interface FileContent {
  name: string
  path: string
  content: string
  encoding: string
  size: number
  sha: string
}

interface CodeSearchResult {
  name: string
  path: string
  repository: {
    name: string
    full_name: string
    html_url: string
  }
  html_url: string
  score: number
}

const GitHubPanel: React.FC = () => {
  const { executeGitHub } = useMcpOperations()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [codeSearchQuery, setCodeSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'repositories' | 'code'>('repositories')
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'forks'>('stars')
  const [language, setLanguage] = useState<string>('')
  
  const [repositories, setRepositories] = useState<RepositorySearchResult[]>([])
  const [codeResults, setCodeResults] = useState<CodeSearchResult[]>([])
  const [fileContents, setFileContents] = useState<FileContent[]>([])
  const [selectedRepo, setSelectedRepo] = useState<RepositorySearchResult | null>(null)
  
  const [isSearching, setIsSearching] = useState(false)
  const [isFetchingFile, setIsFetchingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRepositorySearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      let query = searchQuery
      if (language) query += ` language:${language}`
      
      const result = await executeGitHub('search-repositories', {
        q: query,
        sort: sortBy,
        order: 'desc',
        per_page: 20
      })
      
      // Mock repository results
      const mockRepos: RepositorySearchResult[] = [
        {
          id: 1,
          name: searchQuery.toLowerCase().replace(/\s+/g, '-'),
          fullName: `user/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`,
          description: `A popular ${searchQuery} library with comprehensive features`,
          stargazerCount: 15420,
          language: language || 'JavaScript',
          updatedAt: '2024-01-15T10:30:00Z',
          owner: {
            login: 'maintainer',
            avatar_url: 'https://github.com/github.png'
          },
          topics: ['javascript', 'library', 'opensource'],
          license: { name: 'MIT' }
        },
        {
          id: 2,
          name: `${searchQuery.toLowerCase()}-cli`,
          fullName: `cli-tools/${searchQuery.toLowerCase()}-cli`,
          description: `Command line interface for ${searchQuery}`,
          stargazerCount: 3240,
          language: language || 'TypeScript',
          updatedAt: '2024-01-10T15:45:00Z',
          owner: {
            login: 'cli-tools',
            avatar_url: 'https://github.com/github.png'
          },
          topics: ['cli', 'tools', 'typescript'],
          license: { name: 'Apache-2.0' }
        }
      ]
      
      setRepositories(mockRepos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Repository search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCodeSearch = async () => {
    if (!codeSearchQuery.trim()) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      let query = codeSearchQuery
      if (language) query += ` language:${language}`
      
      const result = await executeGitHub('search-code', {
        q: query,
        sort: 'indexed',
        order: 'desc'
      })
      
      // Mock code search results
      const mockCodeResults: CodeSearchResult[] = [
        {
          name: 'example.js',
          path: 'src/components/example.js',
          repository: {
            name: 'awesome-project',
            full_name: 'user/awesome-project',
            html_url: 'https://github.com/user/awesome-project'
          },
          html_url: 'https://github.com/user/awesome-project/blob/main/src/components/example.js',
          score: 95.5
        },
        {
          name: 'utils.ts',
          path: 'lib/utils.ts',
          repository: {
            name: 'utility-library',
            full_name: 'org/utility-library',
            html_url: 'https://github.com/org/utility-library'
          },
          html_url: 'https://github.com/org/utility-library/blob/main/lib/utils.ts',
          score: 87.2
        }
      ]
      
      setCodeResults(mockCodeResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleFetchFile = async (owner: string, repo: string, path: string) => {
    setIsFetchingFile(true)
    setError(null)
    
    try {
      const result = await executeGitHub('get-file-contents', {
        owner,
        repo,
        path
      })
      
      // Mock file content
      const mockFile: FileContent = {
        name: path.split('/').pop() || path,
        path,
        content: `// File: ${path}\n// Repository: ${owner}/${repo}\n\nimport React from 'react';\n\nconst Component = () => {\n  return (\n    <div>\n      <h1>Example Component</h1>\n      <p>This is a sample file content.</p>\n    </div>\n  );\n};\n\nexport default Component;`,
        encoding: 'base64',
        size: 2048,
        sha: 'abc123def456'
      }
      
      setFileContents(prev => [mockFile, ...prev.slice(0, 4)]) // Keep last 5 files
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file')
    } finally {
      setIsFetchingFile(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-500',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-orange-500',
      'C++': 'bg-purple-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-red-500',
      default: 'bg-gray-500'
    }
    return colors[language] || colors.default
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Github className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold">GitHub Integration</h2>
          <p className="text-muted-foreground">
            Search repositories, browse code, and manage GitHub resources
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            GitHub Search
          </CardTitle>
          <CardDescription>
            Search for repositories, code, issues, and users across GitHub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repositories">Repositories</SelectItem>
                <SelectItem value="code">Code</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Stars</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="forks">Forks</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Language (optional)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            
            <div />
          </div>

          {searchType === 'repositories' ? (
            <div className="flex gap-2">
              <Input
                placeholder="Search repositories (e.g., react router, express middleware)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRepositorySearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleRepositorySearch} 
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search Repos
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Search code (e.g., function authenticate, class Component)"
                value={codeSearchQuery}
                onChange={(e) => setCodeSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCodeSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleCodeSearch} 
                disabled={isSearching || !codeSearchQuery.trim()}
              >
                {isSearching ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search Code
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="repositories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="code">Code Search</TabsTrigger>
          <TabsTrigger value="files">File Contents</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories">
          <Card>
            <CardHeader>
              <CardTitle>Repository Results</CardTitle>
              <CardDescription>
                Found {repositories.length} repositories matching your search
              </CardDescription>
            </CardHeader>
            <CardContent>
              {repositories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No repositories found. Try searching for a project name or topic.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {repositories.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-blue-600">
                                  {repo.fullName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {repo.language && (
                                    <div className="flex items-center gap-1">
                                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                                      <span className="text-sm text-muted-foreground">{repo.language}</span>
                                    </div>
                                  )}
                                  {repo.license && (
                                    <Badge variant="outline">{repo.license.name}</Badge>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground mb-3">
                                {repo.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  {repo.stargazerCount.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Updated {formatDate(repo.updatedAt)}
                                </div>
                              </div>

                              {repo.topics && repo.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {repo.topics.slice(0, 5).map((topic) => (
                                    <Badge key={topic} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedRepo(repo)}
                              >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Explore
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://github.com/${repo.fullName}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                GitHub
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

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Code Search Results</CardTitle>
              <CardDescription>
                Found {codeResults.length} code files matching your search
              </CardDescription>
            </CardHeader>
            <CardContent>
              {codeResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No code found. Try searching for function names, classes, or specific code patterns.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {codeResults.map((result, index) => (
                    <motion.div
                      key={`${result.repository.full_name}-${result.path}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <h3 className="font-semibold">{result.name}</h3>
                                <Badge variant="outline">Score: {result.score.toFixed(1)}</Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {result.path}
                              </p>
                              
                              <p className="text-sm text-blue-600">
                                {result.repository.full_name}
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const [owner, repo] = result.repository.full_name.split('/')
                                  handleFetchFile(owner, repo, result.path)
                                }}
                                disabled={isFetchingFile}
                              >
                                {isFetchingFile ? (
                                  <Loader className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Download className="h-4 w-4 mr-2" />
                                )}
                                View File
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(result.html_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                GitHub
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

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Contents</CardTitle>
              <CardDescription>
                Recently fetched file contents from GitHub
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fileContents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files loaded yet. Search for code and click "View File" to see contents.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {fileContents.map((file, index) => (
                    <motion.div
                      key={`${file.path}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{file.name}</CardTitle>
                              <CardDescription>{file.path}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {(file.size / 1024).toFixed(1)} KB
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64 w-full">
                            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg overflow-auto">
                              {file.content}
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

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common GitHub operations and utilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Create Issue</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <GitPullRequest className="h-6 w-6" />
                  <span>Create PR</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <GitFork className="h-6 w-6" />
                  <span>Fork Repository</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Bug className="h-6 w-6" />
                  <span>Report Bug</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-6 w-4" />
                  <span>Find Contributors</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Eye className="h-6 w-6" />
                  <span>Watch Repository</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GitHubPanel