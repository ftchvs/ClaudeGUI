interface MCPServer {
  id: string
  name: string
  description: string
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  capabilities: string[]
  lastConnected?: Date
  errorMessage?: string
  settings?: Record<string, any>
}

interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  server: string
}

export class MCPManager {
  private servers: Map<string, MCPServer> = new Map()
  private connections: Map<string, any> = new Map()
  private listeners: Set<(servers: MCPServer[]) => void> = new Set()

  constructor() {
    this.initializeServers()
  }

  private initializeServers() {
    // Initialize MCP servers configuration
    const serverConfigs: MCPServer[] = [
      {
        id: 'puppeteer',
        name: 'Puppeteer',
        description: 'Web automation and browser control',
        status: 'disconnected',
        capabilities: [
          'web_navigation',
          'page_interaction', 
          'screenshot_capture',
          'form_automation',
          'data_extraction'
        ]
      },
      {
        id: 'context7',
        name: 'Context7',
        description: 'Documentation and library context provider',
        status: 'disconnected',
        capabilities: [
          'library_documentation',
          'api_reference',
          'code_examples',
          'dependency_resolution'
        ]
      },
      {
        id: 'firecrawl',
        name: 'Firecrawl',
        description: 'Web scraping and content extraction',
        status: 'disconnected',
        capabilities: [
          'web_scraping',
          'content_extraction',
          'batch_crawling',
          'url_mapping',
          'structured_data'
        ]
      },
      {
        id: 'github',
        name: 'GitHub',
        description: 'GitHub integration for repository management',
        status: 'disconnected',
        capabilities: [
          'repository_access',
          'issue_management',
          'pull_requests',
          'commit_operations',
          'branch_management'
        ]
      },
      {
        id: 'filesystem',
        name: 'File System',
        description: 'Local file system operations',
        status: 'connected', // Usually always available
        capabilities: [
          'file_read',
          'file_write', 
          'directory_operations',
          'file_search',
          'permissions_management'
        ]
      }
    ]

    serverConfigs.forEach(server => {
      this.servers.set(server.id, server)
    })

    // Auto-connect to available servers
    this.autoConnect()
  }

  private async autoConnect() {
    // Simulate connection attempts
    for (const [id, server] of this.servers) {
      if (server.status === 'disconnected') {
        await this.connectServer(id)
      }
    }
  }

  async connectServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId)
    if (!server) return false

    // Update status to connecting
    server.status = 'connecting'
    this.notifyListeners()

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Simulate success/failure based on server type
      const connectionSuccess = this.simulateConnection(serverId)

      if (connectionSuccess) {
        server.status = 'connected'
        server.lastConnected = new Date()
        server.errorMessage = undefined
        
        // Store mock connection
        this.connections.set(serverId, { 
          connected: true, 
          serverId,
          capabilities: server.capabilities 
        })
      } else {
        server.status = 'error'
        server.errorMessage = `Failed to connect to ${server.name}`
      }

    } catch (error) {
      server.status = 'error'
      server.errorMessage = error instanceof Error ? error.message : 'Unknown error'
    }

    this.notifyListeners()
    return server.status === 'connected'
  }

  private simulateConnection(serverId: string): boolean {
    // Simulate different connection success rates
    const successRates: Record<string, number> = {
      'filesystem': 1.0,  // Always succeeds
      'github': 0.8,      // Usually succeeds
      'context7': 0.9,    // Usually succeeds  
      'puppeteer': 0.7,   // Sometimes fails
      'firecrawl': 0.6    // Often fails (rate limiting, etc.)
    }

    const rate = successRates[serverId] || 0.5
    return Math.random() < rate
  }

  async disconnectServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId)
    if (!server) return false

    server.status = 'disconnected'
    server.errorMessage = undefined
    this.connections.delete(serverId)
    
    this.notifyListeners()
    return true
  }

  async executeCommand(serverId: string, command: string, params?: any): Promise<MCPResponse> {
    const server = this.servers.get(serverId)
    const connection = this.connections.get(serverId)

    if (!server || !connection || server.status !== 'connected') {
      return {
        success: false,
        error: `Server ${serverId} is not connected`,
        server: serverId
      }
    }

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500))

    return this.simulateCommand(serverId, command, params)
  }

  private simulateCommand(serverId: string, command: string, params?: any): MCPResponse {
    const responses: Record<string, Record<string, any>> = {
      puppeteer: {
        navigate: { 
          success: true, 
          data: { url: params?.url, status: 'loaded' },
          server: serverId
        },
        screenshot: { 
          success: true, 
          data: { path: '/tmp/screenshot.png', size: '1280x720' },
          server: serverId
        },
        extract: { 
          success: true, 
          data: { elements: ['title', 'content', 'links'] },
          server: serverId
        }
      },
      context7: {
        search: { 
          success: true, 
          data: { docs: ['React Hooks', 'TypeScript Guide', 'API Reference'] },
          server: serverId
        },
        resolve: { 
          success: true, 
          data: { library: params?.library, version: '1.0.0' },
          server: serverId
        }
      },
      firecrawl: {
        scrape: { 
          success: true, 
          data: { content: 'Scraped content...', format: 'markdown' },
          server: serverId
        },
        crawl: { 
          success: true, 
          data: { pages: 5, status: 'completed' },
          server: serverId
        }
      },
      github: {
        create_issue: { 
          success: true, 
          data: { issue_number: 123, url: 'https://github.com/repo/issues/123' },
          server: serverId
        },
        commit: { 
          success: true, 
          data: { sha: 'abc123', message: params?.message },
          server: serverId
        }
      },
      filesystem: {
        read: { 
          success: true, 
          data: { content: `// Content of ${params?.path}`, encoding: 'utf8' },
          server: serverId
        },
        write: { 
          success: true, 
          data: { path: params?.path, bytes: 1024 },
          server: serverId
        }
      }
    }

    const serverResponses = responses[serverId] || {}
    const response = serverResponses[command]

    if (response) {
      return response
    }

    return {
      success: false,
      error: `Unknown command: ${command}`,
      server: serverId
    }
  }

  // Puppeteer-specific methods
  async navigateToPage(url: string): Promise<MCPResponse> {
    return this.executeCommand('puppeteer', 'navigate', { url })
  }

  async takeScreenshot(selector?: string): Promise<MCPResponse> {
    return this.executeCommand('puppeteer', 'screenshot', { selector })
  }

  async extractPageData(selectors: string[]): Promise<MCPResponse> {
    return this.executeCommand('puppeteer', 'extract', { selectors })
  }

  // Context7-specific methods
  async searchDocumentation(query: string): Promise<MCPResponse> {
    return this.executeCommand('context7', 'search', { query })
  }

  async resolveLibrary(library: string): Promise<MCPResponse> {
    return this.executeCommand('context7', 'resolve', { library })
  }

  // Firecrawl-specific methods
  async scrapeWebsite(url: string, options?: any): Promise<MCPResponse> {
    return this.executeCommand('firecrawl', 'scrape', { url, ...options })
  }

  async crawlWebsite(url: string, options?: any): Promise<MCPResponse> {
    return this.executeCommand('firecrawl', 'crawl', { url, ...options })
  }

  // GitHub-specific methods
  async createIssue(title: string, body: string, labels?: string[]): Promise<MCPResponse> {
    return this.executeCommand('github', 'create_issue', { title, body, labels })
  }

  async createCommit(message: string, files: string[]): Promise<MCPResponse> {
    return this.executeCommand('github', 'commit', { message, files })
  }

  // File system methods
  async readFile(path: string): Promise<MCPResponse> {
    return this.executeCommand('filesystem', 'read', { path })
  }

  async writeFile(path: string, content: string): Promise<MCPResponse> {
    return this.executeCommand('filesystem', 'write', { path, content })
  }

  // Server management
  getServers(): MCPServer[] {
    return Array.from(this.servers.values())
  }

  getConnectedServers(): MCPServer[] {
    return this.getServers().filter(server => server.status === 'connected')
  }

  getServerStatus(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId)
  }

  // Event handling
  onServersChange(callback: (servers: MCPServer[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    const servers = this.getServers()
    this.listeners.forEach(callback => callback(servers))
  }

  // Health check
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const [id, server] of this.servers) {
      if (server.status === 'connected') {
        try {
          // Perform a simple health check command
          const result = await this.executeCommand(id, 'ping')
          results[id] = result.success
        } catch {
          results[id] = false
        }
      } else {
        results[id] = false
      }
    }

    return results
  }
}

// Singleton instance
export const mcpManager = new MCPManager()