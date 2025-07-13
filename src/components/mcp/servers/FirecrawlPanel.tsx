import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Search, 
  Download, 
  ExternalLink, 
  FileText, 
  Map,
  Loader,
  AlertCircle,
  CheckCircle,
  Eye,
  Code,
  Image,
  Link as LinkIcon,
  Filter,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useMcpOperations } from '@/hooks/useMcpOperations'
import type { FirecrawlResult } from '@/types/mcp'

interface ScrapeResult extends FirecrawlResult {
  id: string
  timestamp: Date
  duration: number
  tokensUsed?: number
}

interface CrawlResult {
  id: string
  url: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  pages: ScrapeResult[]
  totalPages: number
  progress: number
  startTime: Date
  endTime?: Date
}

interface SearchResult {
  title: string
  url: string
  description: string
  domain: string
  timestamp: Date
}

const FirecrawlPanel: React.FC = () => {
  const { executeFirecrawl } = useMcpOperations()
  
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [crawlUrl, setCrawlUrl] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'html' | 'both'>('markdown')
  const [includeImages, setIncludeImages] = useState(false)
  const [onlyMainContent, setOnlyMainContent] = useState(true)
  const [followLinks, setFollowLinks] = useState(false)
  const [maxPages, setMaxPages] = useState('10')
  
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([])
  const [mapResults, setMapResults] = useState<string[]>([])
  
  const [isOperationRunning, setIsOperationRunning] = useState<{
    scrape: boolean
    search: boolean
    crawl: boolean
    map: boolean
  }>({
    scrape: false,
    search: false,
    crawl: false,
    map: false
  })
  
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return
    
    setIsOperationRunning(prev => ({ ...prev, scrape: true }))
    setError(null)
    
    try {
      const formats = outputFormat === 'both' ? ['markdown', 'html'] : [outputFormat]
      
      const result = await executeFirecrawl('scrape', {
        url: scrapeUrl,
        formats,
        onlyMainContent,
        includeImages: !includeImages ? undefined : includeImages
      })
      
      // Mock scrape result
      const mockResult: ScrapeResult = {
        id: crypto.randomUUID(),
        url: scrapeUrl,
        markdown: outputFormat !== 'html' ? `# ${scrapeUrl}\n\nThis is the scraped content from the webpage. The content includes:\n\n## Main Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Features\n\n- Feature 1: Advanced web scraping\n- Feature 2: Content extraction\n- Feature 3: Format conversion\n\n\`\`\`javascript\n// Example code block\nconst scraper = new WebScraper();\nconst result = await scraper.scrape(url);\n\`\`\`` : undefined,
        html: outputFormat !== 'markdown' ? `<html><head><title>${scrapeUrl}</title></head><body><h1>Scraped Content</h1><p>This is the HTML version of the scraped content.</p></body></html>` : undefined,
        metadata: {
          title: `Page Title - ${scrapeUrl}`,
          description: 'This is a sample page description extracted from the webpage.',
          language: 'en',
          statusCode: 200
        },
        timestamp: new Date(),
        duration: Math.random() * 3000 + 1000,
        tokensUsed: Math.floor(Math.random() * 2000 + 500)
      }
      
      setScrapeResults(prev => [mockResult, ...prev.slice(0, 9)]) // Keep last 10 results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed')
    } finally {
      setIsOperationRunning(prev => ({ ...prev, scrape: false }))
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsOperationRunning(prev => ({ ...prev, search: true }))
    setError(null)
    
    try {
      const result = await executeFirecrawl('search', {
        query: searchQuery,
        limit: 10,
        country: 'us',
        lang: 'en'
      })
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          title: `${searchQuery} - Official Documentation`,
          url: `https://docs.${searchQuery.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `Official documentation and guides for ${searchQuery}. Learn how to get started, API reference, and best practices.`,
          domain: `docs.${searchQuery.toLowerCase().replace(/\s+/g, '')}.com`,
          timestamp: new Date()
        },
        {
          title: `${searchQuery} Tutorial - Complete Guide`,
          url: `https://tutorial.example.com/${searchQuery.toLowerCase()}`,
          description: `A comprehensive tutorial covering all aspects of ${searchQuery} with practical examples and code samples.`,
          domain: 'tutorial.example.com',
          timestamp: new Date()
        },
        {
          title: `GitHub - ${searchQuery} Repository`,
          url: `https://github.com/repo/${searchQuery.toLowerCase()}`,
          description: `Open source ${searchQuery} implementation with community contributions and extensive documentation.`,
          domain: 'github.com',
          timestamp: new Date()
        }
      ]
      
      setSearchResults(mockResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsOperationRunning(prev => ({ ...prev, search: false }))
    }
  }

  const handleCrawl = async () => {
    if (!crawlUrl.trim()) return
    
    setIsOperationRunning(prev => ({ ...prev, crawl: true }))
    setError(null)
    
    try {
      const result = await executeFirecrawl('crawl', {
        url: crawlUrl,
        limit: parseInt(maxPages),
        allowExternalLinks: followLinks,
        scrapeOptions: {
          formats: [outputFormat === 'both' ? 'markdown' : outputFormat],
          onlyMainContent
        }
      })
      
      // Mock crawl result
      const mockCrawl: CrawlResult = {
        id: crypto.randomUUID(),
        url: crawlUrl,
        status: 'running',
        pages: [],
        totalPages: parseInt(maxPages),
        progress: 0,
        startTime: new Date()
      }
      
      setCrawlResults(prev => [mockCrawl, ...prev.slice(0, 4)]) // Keep last 5 crawls
      
      // Simulate crawl progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          
          setCrawlResults(prev => prev.map(crawl => 
            crawl.id === mockCrawl.id 
              ? { 
                  ...crawl, 
                  status: 'completed' as const,
                  progress: 100,
                  endTime: new Date(),
                  pages: Array.from({ length: Math.min(5, parseInt(maxPages)) }, (_, i) => ({
                    id: crypto.randomUUID(),
                    url: `${crawlUrl}/page-${i + 1}`,
                    markdown: `# Page ${i + 1}\n\nContent from page ${i + 1} of the crawled website.`,
                    metadata: {
                      title: `Page ${i + 1} Title`,
                      description: `Description for page ${i + 1}`,
                      statusCode: 200
                    },
                    timestamp: new Date(),
                    duration: Math.random() * 2000 + 500
                  }))
                }
              : crawl
          ))
          
          setIsOperationRunning(prev => ({ ...prev, crawl: false }))
        } else {
          setCrawlResults(prev => prev.map(crawl => 
            crawl.id === mockCrawl.id ? { ...crawl, progress } : crawl
          ))
        }
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crawling failed')
      setIsOperationRunning(prev => ({ ...prev, crawl: false }))
    }
  }

  const handleMap = async () => {
    if (!mapUrl.trim()) return
    
    setIsOperationRunning(prev => ({ ...prev, map: true }))
    setError(null)
    
    try {
      const result = await executeFirecrawl('map', {
        url: mapUrl,
        includeSubdomains: false,
        limit: 50
      })
      
      // Mock map results
      const mockUrls = [
        `${mapUrl}`,
        `${mapUrl}/about`,
        `${mapUrl}/contact`,
        `${mapUrl}/products`,
        `${mapUrl}/services`,
        `${mapUrl}/blog`,
        `${mapUrl}/documentation`,
        `${mapUrl}/api`,
        `${mapUrl}/support`,
        `${mapUrl}/pricing`
      ]
      
      setMapResults(mockUrls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mapping failed')
    } finally {
      setIsOperationRunning(prev => ({ ...prev, map: false }))
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-orange-500" />
        <div>
          <h2 className="text-2xl font-bold">Firecrawl Web Scraper</h2>
          <p className="text-muted-foreground">
            Advanced web scraping, crawling, and content extraction
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Scraping Configuration
          </CardTitle>
          <CardDescription>
            Configure output format and extraction options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="output-format">Output Format</Label>
              <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="max-pages">Max Pages (for crawling)</Label>
              <Select value={maxPages} onValueChange={setMaxPages}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 pages</SelectItem>
                  <SelectItem value="10">10 pages</SelectItem>
                  <SelectItem value="25">25 pages</SelectItem>
                  <SelectItem value="50">50 pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="main-content" 
                  checked={onlyMainContent}
                  onCheckedChange={(checked) => setOnlyMainContent(checked as boolean)}
                />
                <Label htmlFor="main-content">Only main content</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-images" 
                  checked={includeImages}
                  onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                />
                <Label htmlFor="include-images">Include images</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="follow-links" 
                  checked={followLinks}
                  onCheckedChange={(checked) => setFollowLinks(checked as boolean)}
                />
                <Label htmlFor="follow-links">Follow external links</Label>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="scrape" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scrape">Single Page</TabsTrigger>
          <TabsTrigger value="crawl">Full Crawl</TabsTrigger>
          <TabsTrigger value="search">Web Search</TabsTrigger>
          <TabsTrigger value="map">Site Map</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Single Page Scraping
              </CardTitle>
              <CardDescription>
                Extract content from a single webpage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL to scrape (e.g., https://example.com)"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleScrape} 
                  disabled={isOperationRunning.scrape || !scrapeUrl.trim()}
                >
                  {isOperationRunning.scrape ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Scrape
                </Button>
              </div>

              {/* Scrape Results */}
              <div className="space-y-4">
                {scrapeResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{result.metadata.title}</CardTitle>
                            <CardDescription>{result.url}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {formatDuration(result.duration)}
                            </Badge>
                            {result.tokensUsed && (
                              <Badge variant="secondary">
                                {result.tokensUsed} tokens
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.metadata.description && (
                          <p className="text-muted-foreground mb-4">
                            {result.metadata.description}
                          </p>
                        )}
                        
                        <Tabs defaultValue="content">
                          <TabsList>
                            {result.markdown && <TabsTrigger value="content">Content</TabsTrigger>}
                            {result.html && <TabsTrigger value="html">HTML</TabsTrigger>}
                            <TabsTrigger value="metadata">Metadata</TabsTrigger>
                          </TabsList>
                          
                          {result.markdown && (
                            <TabsContent value="content">
                              <ScrollArea className="h-64 w-full">
                                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
                                  {result.markdown}
                                </pre>
                              </ScrollArea>
                            </TabsContent>
                          )}
                          
                          {result.html && (
                            <TabsContent value="html">
                              <ScrollArea className="h-64 w-full">
                                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
                                  {result.html}
                                </pre>
                              </ScrollArea>
                            </TabsContent>
                          )}
                          
                          <TabsContent value="metadata">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Language:</strong> {result.metadata.language || 'Unknown'}
                              </div>
                              <div>
                                <strong>Status:</strong> {result.metadata.statusCode}
                              </div>
                              <div>
                                <strong>Scraped:</strong> {result.timestamp.toLocaleString()}
                              </div>
                              <div>
                                <strong>Duration:</strong> {formatDuration(result.duration)}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crawl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Full Website Crawling
              </CardTitle>
              <CardDescription>
                Crawl multiple pages from a website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter website URL to crawl (e.g., https://docs.example.com)"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCrawl()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCrawl} 
                  disabled={isOperationRunning.crawl || !crawlUrl.trim()}
                >
                  {isOperationRunning.crawl ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Crawl
                </Button>
              </div>

              {/* Crawl Results */}
              <div className="space-y-4">
                {crawlResults.map((crawl, index) => (
                  <motion.div
                    key={crawl.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {getStatusIcon(crawl.status)}
                              {crawl.url}
                            </CardTitle>
                            <CardDescription>
                              {crawl.pages.length} of {crawl.totalPages} pages crawled
                            </CardDescription>
                          </div>
                          <Badge variant={crawl.status === 'completed' ? 'default' : 'secondary'}>
                            {crawl.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(crawl.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${crawl.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          {crawl.pages.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Crawled Pages</h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {crawl.pages.map((page) => (
                                  <div key={page.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm truncate">{page.url}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {formatDuration(page.duration)}
                                      </Badge>
                                      <Button size="sm" variant="ghost">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Web Search
              </CardTitle>
              <CardDescription>
                Search the web and get structured results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter search query (e.g., 'React best practices 2024')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isOperationRunning.search || !searchQuery.trim()}
                >
                  {isOperationRunning.search ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.url}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-blue-600 mb-1">
                              {result.title}
                            </h3>
                            <p className="text-sm text-green-600 mb-2">
                              {result.domain}
                            </p>
                            <p className="text-muted-foreground mb-3">
                              {result.description}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => setScrapeUrl(result.url)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Scrape
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(result.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Website Mapping
              </CardTitle>
              <CardDescription>
                Discover all pages and URLs on a website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter website URL to map (e.g., https://example.com)"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMap()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleMap} 
                  disabled={isOperationRunning.map || !mapUrl.trim()}
                >
                  {isOperationRunning.map ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Map className="h-4 w-4 mr-2" />
                  )}
                  Map
                </Button>
              </div>

              {/* Map Results */}
              {mapResults.length > 0 && (
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-lg">Discovered URLs</CardTitle>
                    <CardDescription>
                      Found {mapResults.length} URLs on {mapUrl}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-2">
                        {mapResults.map((url, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 rounded border hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-mono">{url}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setScrapeUrl(url)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FirecrawlPanel