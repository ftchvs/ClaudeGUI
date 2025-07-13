# Claude GUI

A modern, clean, and minimalist GUI for Claude Code built with React, TypeScript, shadcn/ui, and Framer Motion.

## Features

- **Clean, Minimalist Design**: Modern interface with rounded corners and smooth animations
- **Multi-Panel Workspace**: Configurable panels for chat, file explorer, terminal, and settings
- **Framer Motion Animations**: Smooth, butter-like transitions and micro-interactions
- **File Explorer**: Interactive file tree with syntax-aware icons
- **Integrated Terminal**: Built-in terminal emulator with command history
- **Chat Interface**: Conversational UI with message bubbles and syntax highlighting
- **Theme Support**: Light and dark mode with instant switching
- **Responsive Layout**: Adaptive design that works on different screen sizes

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **shadcn/ui** - UI components (Radix + Tailwind)
- **Framer Motion** - Animations and transitions
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/claude-gui.git
   cd claude-gui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:1420`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (workspace, sidebar, header)
│   ├── chat/            # Chat interface components
│   ├── file-explorer/   # File browser components
│   ├── terminal/        # Terminal emulator
│   └── settings/        # Settings panel
├── stores/              # Zustand state stores
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

## Design Principles

- **Minimalism**: Clean, uncluttered interface focusing on essential features
- **Responsiveness**: Smooth animations with consistent 60fps performance
- **Accessibility**: Keyboard navigation and screen reader support
- **Consistency**: Unified design language with rounded corners (12-24px radius)
- **Performance**: Optimized for large codebases and long conversations

## Customization

### Themes

The application supports light and dark themes. You can customize the color palette by modifying the CSS variables in `src/index.css`.

### Border Radius

The default border radius is set to 1rem (16px) in the Tailwind config. You can adjust this by modifying the `--radius` CSS variable.

### Animations

All animations are powered by Framer Motion. You can customize transition durations and easing functions in the component files.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the excellent component library
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide](https://lucide.dev/) for beautiful icons
- [Claude](https://claude.ai/) for the inspiration