# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude GUI is a React-based desktop application providing a clean graphical interface for Claude Code. Built with modern web technologies including React 18, TypeScript, Vite, Zustand for state management, and shadcn/ui components.

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

## Current Limitations

- WebSocket connection to Claude Code backend needs implementation
- File system operations are currently mocked
- Git integration requires Node.js fs APIs
- Performance monitoring needs system-level access

## Development Notes

- Always run `npm run typecheck` and `npm run lint` before committing changes
- Follow the existing component structure and naming conventions
- Use shadcn/ui components when possible for consistency
- Leverage Framer Motion for smooth animations and transitions
- Initialize both Claude Code and MCP stores on application startup