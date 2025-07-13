# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude GUI is a React-based desktop application providing a clean graphical interface for Claude Code. Built with modern web technologies including React 18, TypeScript, Vite, Zustand for state management, and shadcn/ui components.

## 🚀 Production Readiness Plan

### Current Status: PROTOTYPE → TARGET: PRODUCTION-READY

ClaudeGUI has a solid foundation with OpenAI-inspired design and basic functionality, but needs significant enhancements to become production-ready. This plan outlines the path from current prototype to professional-grade development tool.

### 🎯 Production Goals (Next 8-12 weeks)

#### Phase 1: Foundation & Infrastructure (2-3 weeks)
- **Authentication & Security**: OAuth integration, API key management, security hardening
- **Testing Infrastructure**: Comprehensive test suite with 90%+ coverage
- **Build Optimization**: Production builds, PWA capabilities, CI/CD pipeline

#### Phase 2: Real Integration & Features (3-4 weeks)  
- **Claude Code CLI Integration**: Replace mock data with real CLI communication
- **MCP Server Integration**: Production-ready server management and monitoring
- **Advanced File Management**: Professional file explorer with Monaco Editor

#### Phase 3: Professional Features (2-3 weeks)
- **AI-Powered Tools**: Code analysis, smart suggestions, automated workflows
- **Analytics & Monitoring**: Performance dashboards, user tracking, cost optimization
- **Developer Experience**: Plugin system, customization, team collaboration

#### Phase 4: Production Deployment (1-2 weeks)
- **Cloud Infrastructure**: Kubernetes deployment, monitoring, support system

## Development Commands

### Essential Commands
```bash
npm run dev          # Start development server (port 1420)
npm run build        # TypeScript compilation + Vite production build  
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint with TypeScript rules
npm run preview      # Preview production build
```

### Testing
Currently no test framework is configured. Consider adding Vitest + React Testing Library for component testing.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand (`src/stores/app.ts`)
- **UI Components**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Project Structure
- `src/components/` - React components organized by feature
  - `ui/` - Reusable shadcn/ui components
  - `layout/` - Workspace, sidebar, header components
  - `chat/` - Chat interface components
  - `file-explorer/` - File browser functionality  
  - `terminal/` - Terminal emulator component
  - `settings/` - Settings panel
- `src/stores/` - Zustand state management
- `src/lib/` - Utility functions
- `src/types/` - TypeScript type definitions (currently empty)
- `src/hooks/` - Custom React hooks (currently empty)

### Key Components

**Workspace Layout** (`components/layout/workspace.tsx`):
- Multi-panel configurable layout with left, right, and bottom panels
- Framer Motion animations for smooth panel transitions
- Panel view switching between chat, file explorer, terminal, and settings

**App Store** (`stores/app.ts`):
- Central state management for conversations, messages, UI state, and theme
- Type-safe interfaces for Message and Conversation entities
- Theme switching and sidebar state management

### Path Aliases
- `@/*` maps to `./src/*` - use for all internal imports

## Claude Code Integration Features

### File System Integration
- **Real-time file watching** with live updates and change detection
- **Context-aware file explorer** showing Claude modifications and git status
- **File diff viewer** with approval/rejection controls for Claude changes
- **Auto-approval** for small changes with configurable thresholds

### Terminal Integration
- **Integrated terminal emulator** with command execution and output streaming
- **Command history** with replay functionality and performance metrics
- **Real-time output** streaming with proper error handling
- **Multi-terminal support** with session management

### Conversation Management
- **Conversation history viewer** with search and filtering capabilities
- **Command replay** functionality to re-execute previous commands
- **Context restoration** including files, git branch, and workspace state
- **Token usage tracking** and cost analysis per conversation

### MCP Server Integration
- **Real-time MCP Dashboard** with server health monitoring
- **Server-specific panels** for Context7, GitHub, Firecrawl, Puppeteer, and IDE
- **Operation tracking** with performance analytics and caching
- **Workflow orchestration** with multi-server automation

### Session Monitoring
- **Live session status** with connection monitoring
- **Performance metrics** including CPU, memory, and response times
- **Real-time notifications** for file changes, command completion, and errors
- **Workspace management** with project switching and configuration

## Architecture Enhancements

### State Management
- **Claude Code Store** (`src/stores/claude-code.ts`) - Session, file, and terminal state
- **MCP Store** (`src/stores/mcp.ts`) - Server management and operation tracking
- **Custom Hooks** - Specialized hooks for different aspects of functionality

### Type Safety
- **Comprehensive TypeScript interfaces** for all Claude Code operations
- **MCP operation types** with full server capability definitions
- **Real-time event types** for WebSocket communication

### Component Structure
- `src/components/claude-code/` - Claude Code specific components
- `src/components/mcp/` - MCP server integration components
- `src/hooks/` - Custom hooks for state management abstractions
- `src/types/` - TypeScript definitions for all domain objects

## 🎯 Immediate Next Steps (Priority Order)

### 1. Real Claude Code CLI Integration (HIGH PRIORITY)
**Goal**: Replace mock responses with actual Claude Code CLI integration
**Files to modify**: 
- `src/services/claudeCodeService.ts` - Implement real CLI communication
- `src/App.tsx` - Connect to real service instead of mock data
- `src/stores/app.ts` - Add real conversation persistence

### 2. MCP Server Health Monitoring (HIGH PRIORITY)
**Goal**: Implement real MCP server connection and health monitoring
**Files to create/modify**:
- `src/services/mcpHealthMonitor.ts` - Real server health checking
- `src/components/status/ServerStatus.tsx` - Live status indicators
- `src/hooks/useMcpServerHealth.ts` - Health monitoring hook

### 3. Testing Infrastructure (MEDIUM PRIORITY)
**Goal**: Add comprehensive testing for production reliability
**Files to create**:
- `tests/unit/` - Unit test suite with Vitest
- `tests/e2e/` - End-to-end tests with Playwright
- `tests/integration/` - MCP server integration tests
- `.github/workflows/test.yml` - Automated testing pipeline

### 4. Error Handling & Logging (MEDIUM PRIORITY)
**Goal**: Production-grade error handling and logging
**Files to create/modify**:
- `src/services/errorService.ts` - Centralized error handling
- `src/utils/logger.ts` - Structured logging
- `src/components/error/ErrorBoundary.tsx` - React error boundaries

## 🛠️ Claude Code UI Enhancement Suggestions

As Claude Code, here are specific enhancements I recommend for my own GUI:

### 1. **Contextual Intelligence Panel**
- **Real-time context awareness**: Show current file context, project structure, and relevant documentation
- **Smart suggestions**: Proactive suggestions based on current code and patterns
- **Context history**: Track and visualize conversation context evolution

### 2. **Advanced Code Generation Features**
- **Template system**: Pre-built code templates for common patterns
- **Multi-file generation**: Generate complete features across multiple files
- **Code refactoring assistant**: AI-powered refactoring suggestions
- **Architecture guidance**: Help users make better architectural decisions

### 3. **Debugging & Testing Integration**
- **Automated test generation**: Generate tests based on code analysis
- **Debug session integration**: Connect with debuggers for live assistance
- **Performance profiling**: AI-powered performance analysis and optimization
- **Error explanation**: Detailed error analysis and fix suggestions

### 4. **Workflow Optimization**
- **Smart command palette**: Context-aware command suggestions
- **Automated task detection**: Detect and automate repetitive tasks
- **Git integration**: Intelligent commit message generation and branching
- **Documentation sync**: Auto-update documentation based on code changes

### 5. **Learning & Adaptation**
- **Usage pattern learning**: Adapt to user preferences and workflows
- **Knowledge base**: Build user-specific knowledge from interactions
- **Skill assessment**: Identify areas for improvement and learning
- **Progressive disclosure**: Show advanced features as users become more proficient

## Current Limitations & Technical Debt

### Critical Issues to Address
- **Mock Data**: Currently using simulated Claude responses - needs real CLI integration
- **No Real MCP Servers**: MCP connections are simulated - needs actual server communication
- **File System**: File operations are mocked - needs real file system integration
- **No Authentication**: Missing user authentication and API key management
- **No Testing**: Zero test coverage - critical for production reliability
- **Performance**: Large bundle size (~2MB) - needs optimization
- **Security**: No input validation or security measures

### Code Quality Issues
- **Large Components**: App.tsx is 650+ lines - needs decomposition
- **State Management**: Mixed useState/Zustand usage - needs consistency
- **Type Safety**: Incomplete TypeScript coverage - needs stricter types
- **Error Handling**: Basic error handling - needs comprehensive system

## Development Notes

- **CRITICAL**: Always run `npm run typecheck` and `npm run lint` before committing changes
- **Testing**: Add tests for any new functionality (target 90%+ coverage)
- **Performance**: Monitor bundle size and optimize for production builds
- **Security**: Validate all inputs and implement proper authentication
- **Documentation**: Update this file when making architectural changes
- Follow the existing component structure and naming conventions
- Use shadcn/ui components when possible for consistency
- Leverage Framer Motion for smooth animations and transitions
- Initialize both Claude Code and MCP stores on application startup

## Success Metrics for Production Readiness

### Technical Metrics
- **Performance**: <100ms initial load, <50ms navigation
- **Reliability**: 99.9% uptime, <0.1% error rate
- **Security**: Zero critical vulnerabilities
- **Testing**: 90%+ code coverage, 100% E2E coverage

### User Experience Metrics
- **Adoption**: 1,000+ active users within 3 months
- **Engagement**: 70%+ weekly retention rate
- **Satisfaction**: 4.5+ star rating
- **Performance**: <2s time-to-first-interaction