# ClaudeGUI 🚀

**A beautiful, modern GUI for Claude Code - Making AI development accessible to everyone**

ClaudeGUI transforms the powerful Claude Code CLI into an intuitive, OpenAI Codex-style interface that brings AI-powered development to users who prefer visual interfaces over terminal commands.

![ClaudeGUI Interface](https://via.placeholder.com/800x400/1f2937/ffffff?text=ClaudeGUI+Interface)

## ✨ Features

### 🎨 **Modern Interface Design**
- **OpenAI Codex-inspired UI** - Clean, intuitive design for non-terminal users
- **Split-panel layout** - Chat interface on the left, execution terminal on the right
- **Dark/Light mode** - Automatic theme switching with system preferences
- **Responsive design** - Works seamlessly on all screen sizes

### 🤖 **AI-Powered Development**
- **Real-time Claude integration** - Direct communication with Claude Code CLI
- **Intelligent code generation** - Context-aware code suggestions and generation
- **File operations** - Create, read, modify, and manage files through AI
- **Terminal automation** - Execute commands with AI assistance

### 🔧 **MCP Server Integration**
- **Puppeteer** - Web automation and browser control
- **Context7** - Documentation and library context provider
- **Firecrawl** - Web scraping and content extraction
- **GitHub** - Repository management and version control
- **File System** - Local file operations and management

### 📊 **System Monitoring**
- **Real-time metrics** - CPU, memory, and system performance
- **MCP server status** - Live connection monitoring
- **Execution tracking** - Step-by-step operation visualization
- **Error handling** - Comprehensive error reporting and recovery

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Claude Code CLI** (optional - will simulate if not available)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/claude-gui.git
   cd claude-gui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:1420`

### Production Build

```bash
npm run build
npm run preview
```

## 🛠 Configuration

### MCP Servers Setup

ClaudeGUI automatically detects and manages MCP servers. Configure them in `mcp-config.json`:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-puppeteer"],
      "description": "Web automation and browser control"
    },
    "context7": {
      "command": "npx", 
      "args": ["@context7/mcp-server"],
      "description": "Documentation and library context provider"
    }
  }
}
```

### Environment Variables

Create a `.env` file for configuration:

```env
# GitHub Integration (optional)
GITHUB_TOKEN=your_github_token

# Claude Code CLI Path (optional)
CLAUDE_CODE_PATH=/usr/local/bin/claude-code

# Development settings
VITE_DEV_MODE=true
```

## 📖 Usage Guide

### 💬 **Chat Interface**

1. **Start a conversation** - Type your request in the chat input
2. **File operations** - Ask Claude to create, read, or modify files
3. **Code generation** - Request functions, components, or entire applications
4. **Debugging help** - Get assistance with errors and optimization

**Example prompts:**
- "Create a React component for a user profile"
- "Fix the error in utils.ts file"
- "Analyze the project structure and suggest improvements"
- "Generate tests for the Button component"

### ⚡ **Execution Terminal**

Watch real-time execution steps:
- **Analysis** - Claude processes your request
- **File Operations** - Creating, reading, or modifying files
- **Terminal Commands** - Running npm, git, or other commands
- **Code Generation** - AI-powered code creation

### 🔧 **MCP Server Management**

- **View status** - Check connection status in the system panel
- **Connect/Disconnect** - Manage server connections manually
- **Monitor capabilities** - See available features for each server
- **Error handling** - Automatic reconnection and error recovery

## 🏗 Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Project Structure

```
claude-gui/
├── src/
│   ├── components/           # React components
│   │   ├── workspace/        # Main interface components
│   │   ├── ui/              # Reusable UI components
│   │   └── intelligence/     # AI-powered features
│   ├── services/            # Business logic
│   │   ├── claudeCodeService.ts    # Claude Code CLI integration
│   │   └── mcpManager.ts          # MCP server management
│   ├── stores/              # State management
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
├── mcp-config.json         # MCP server configuration
└── docs/                   # Documentation
```

### Key Services

#### ClaudeCodeService
Handles communication with the Claude Code CLI:
- File operations (read, write, create, delete)
- Chat interactions with context
- Terminal command execution
- Project analysis and insights

#### MCPManager
Manages Model Context Protocol servers:
- Server connection management
- Command execution and routing
- Health monitoring and recovery
- Real-time status updates

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Start development server**
   ```bash
   npm run dev
   ```

### Code Standards

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message format

### Testing

```bash
# Run unit tests
npm run test

# Run E2E tests  
npm run test:e2e

# Run type checking
npm run type-check
```

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit pull request with clear description

## 📚 API Reference

### ClaudeCodeService

```typescript
// Chat with Claude Code
await claudeCodeService.chat(message, {
  currentDirectory: '/workspace',
  files: ['src/App.tsx']
})

// File operations
await claudeCodeService.performFileOperation({
  type: 'create',
  path: 'components/NewComponent.tsx',
  content: '...'
})

// Terminal commands
await claudeCodeService.executeTerminalCommand('npm run build')
```

### MCPManager

```typescript
// Connect to MCP server
await mcpManager.connectServer('puppeteer')

// Execute commands
await mcpManager.navigateToPage('https://example.com')
await mcpManager.takeScreenshot()
await mcpManager.scrapeWebsite('https://docs.example.com')
```

## 🔒 Security

### Sandboxing
- MCP servers run in isolated environments
- File system access is restricted to project directories
- Network access is controlled and monitored

### Authentication
- GitHub integration uses personal access tokens
- No sensitive data is stored in local storage
- All API communications are encrypted

### Best Practices
- Regular dependency updates
- Security audit with `npm audit`
- Environment variable validation
- Input sanitization and validation

## 🐛 Troubleshooting

### Common Issues

#### Claude Code CLI Not Found
```bash
# Install Claude Code CLI
npm install -g @anthropic/claude-code

# Verify installation
claude-code --version
```

#### MCP Server Connection Failed
- Check network connectivity
- Verify server configuration in `mcp-config.json`
- Review server logs in the system panel
- Try reconnecting manually

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=claude-gui:* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** - For Claude AI and the Claude Code CLI
- **Radix UI** - For accessible UI components  
- **Tailwind CSS** - For utility-first styling
- **Vite** - For lightning-fast development
- **Open Source Community** - For inspiration and contributions

## 📞 Support

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community help and questions
- **Documentation** - Comprehensive guides and API reference
- **Examples** - Sample projects and use cases

## 🛣 Roadmap

### v1.1 (Next Release)
- [ ] Plugin system for custom MCP servers
- [ ] Code templates and snippets
- [ ] Project workspace management
- [ ] Advanced debugging tools

### v1.2 (Future)
- [ ] Multi-language support
- [ ] Cloud synchronization
- [ ] Collaborative editing
- [ ] Mobile companion app

### v2.0 (Vision)
- [ ] AI-powered architecture suggestions
- [ ] Automated testing generation
- [ ] Performance optimization recommendations
- [ ] Integration with popular IDEs

---

**Made with ❤️ by the ClaudeGUI community**

[⭐ Star us on GitHub](https://github.com/your-username/claude-gui) | [🐛 Report Issues](https://github.com/your-username/claude-gui/issues) | [💬 Join Discussions](https://github.com/your-username/claude-gui/discussions)