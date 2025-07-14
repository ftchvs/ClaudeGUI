const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Claude Code CLI Integration
  claudeCode: {
    execute: (command, args) => ipcRenderer.invoke('claude-code:execute', command, args),
    checkAvailability: () => ipcRenderer.invoke('claude-code:check-availability'),
    onOutput: (callback) => {
      ipcRenderer.on('claude-code:output', (event, data) => callback(data))
      // Return cleanup function
      return () => ipcRenderer.removeAllListeners('claude-code:output')
    }
  },

  // File System Operations
  file: {
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
    exists: (filePath) => ipcRenderer.invoke('file:exists', filePath)
  },

  directory: {
    list: (dirPath) => ipcRenderer.invoke('directory:list', dirPath)
  },

  // Dialog Operations
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:open-file'),
    openDirectory: () => ipcRenderer.invoke('dialog:open-directory')
  },

  // Git Operations
  git: {
    status: (repoPath) => ipcRenderer.invoke('git:status', repoPath)
  },

  // Process Operations
  process: {
    cwd: () => ipcRenderer.invoke('process:cwd'),
    chdir: (newPath) => ipcRenderer.invoke('process:chdir', newPath)
  },

  // Terminal Operations
  terminal: {
    execute: (command, options) => ipcRenderer.invoke('terminal:execute', command, options)
  },

  // Window Controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },

  // Development helpers (only available in dev)
  dev: {
    reload: () => ipcRenderer.invoke('dev:reload'),
    toggleDevTools: () => ipcRenderer.invoke('dev:toggle-devtools')
  },

  // Platform information
  platform: process.platform,
  
  // Environment detection
  isElectron: true,
  isDev: process.env.NODE_ENV === 'development'
})

// Security: Remove any global Node.js APIs that might have been exposed
delete window.require
delete window.exports
delete window.module

// Additional security: freeze the exposed API to prevent tampering
Object.freeze(window.electronAPI)