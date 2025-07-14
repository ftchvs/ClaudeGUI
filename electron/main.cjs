const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const { spawn, exec } = require('child_process')
const path = require('path')
const fs = require('fs').promises
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    titleBarOverlay: {
      color: '#1a1a1a',
      symbolColor: '#ffffff'
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // You'll need to add an icon
    show: false
  })

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:1420' 
    : `file://${path.join(__dirname, '../dist/index.html')}`
  
  mainWindow.loadURL(startUrl)

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers for Claude Code CLI Integration

// Execute Claude Code CLI commands
ipcMain.handle('claude-code:execute', async (event, command, args = []) => {
  return new Promise((resolve) => {
    const startTime = Date.now()
    
    // Spawn Claude Code CLI process
    const claudeProcess = spawn('claude', [command, ...args], {
      cwd: process.cwd(),
      env: { ...process.env }
    })

    let stdout = ''
    let stderr = ''

    claudeProcess.stdout.on('data', (data) => {
      stdout += data.toString()
      // Send real-time output to renderer
      event.sender.send('claude-code:output', {
        type: 'stdout',
        data: data.toString(),
        timestamp: new Date().toISOString()
      })
    })

    claudeProcess.stderr.on('data', (data) => {
      stderr += data.toString()
      event.sender.send('claude-code:output', {
        type: 'stderr', 
        data: data.toString(),
        timestamp: new Date().toISOString()
      })
    })

    claudeProcess.on('close', (code) => {
      const duration = Date.now() - startTime
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr,
        exitCode: code,
        duration,
        command: `claude ${command} ${args.join(' ')}`
      })
    })

    claudeProcess.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        command: `claude ${command} ${args.join(' ')}`
      })
    })
  })
})

// Check if Claude Code CLI is available
ipcMain.handle('claude-code:check-availability', async () => {
  return new Promise((resolve) => {
    exec('claude --version', (error, stdout, stderr) => {
      if (error) {
        resolve({
          available: false,
          error: 'Claude Code CLI not found. Please install Claude Code CLI first.',
          installUrl: 'https://claude.ai/code'
        })
      } else {
        const version = stdout.trim()
        resolve({
          available: true,
          version,
          environment: 'desktop',
          features: {
            realCLI: true,
            fileWatching: true,
            terminalExec: true,
            projectAnalysis: true,
            codeGeneration: true
          }
        })
      }
    })
  })
})

// File system operations
ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('file:write', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('file:exists', async (event, filePath) => {
  try {
    await fs.access(filePath)
    return { exists: true }
  } catch {
    return { exists: false }
  }
})

ipcMain.handle('directory:list', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    const result = await Promise.all(
      items.map(async (item) => {
        const fullPath = path.join(dirPath, item.name)
        const stats = await fs.stat(fullPath)
        
        return {
          name: item.name,
          path: fullPath,
          type: item.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime
        }
      })
    )
    
    return { success: true, items: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Open file/directory dialogs
ipcMain.handle('dialog:open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'JavaScript', extensions: ['js', 'mjs', 'jsx'] },
      { name: 'TypeScript', extensions: ['ts', 'tsx'] },
      { name: 'Python', extensions: ['py'] },
      { name: 'Text Files', extensions: ['txt', 'md'] }
    ]
  })
  
  return result
})

ipcMain.handle('dialog:open-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  
  return result
})

// Git operations
ipcMain.handle('git:status', async (event, repoPath) => {
  return new Promise((resolve) => {
    exec('git status --porcelain', { cwd: repoPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message })
      } else {
        const files = stdout
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const status = line.substring(0, 2)
            const filepath = line.substring(3)
            return { status, filepath }
          })
        
        resolve({ success: true, files })
      }
    })
  })
})

// Get current working directory
ipcMain.handle('process:cwd', async () => {
  return process.cwd()
})

// Set working directory
ipcMain.handle('process:chdir', async (event, newPath) => {
  try {
    process.chdir(newPath)
    return { success: true, cwd: process.cwd() }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Terminal operations
ipcMain.handle('terminal:execute', async (event, command, options = {}) => {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const cwd = options.cwd || process.cwd()
    
    exec(command, { cwd, env: { ...process.env, ...options.env } }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime
      
      if (error) {
        resolve({
          success: false,
          output: stdout,
          error: stderr || error.message,
          duration,
          command
        })
      } else {
        resolve({
          success: true,
          output: stdout,
          error: stderr,
          duration,
          command
        })
      }
    })
  })
})

// Window controls
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.restore()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

// Development helpers
if (isDev) {
  ipcMain.handle('dev:reload', () => {
    mainWindow?.webContents.reload()
  })
  
  ipcMain.handle('dev:toggle-devtools', () => {
    mainWindow?.webContents.toggleDevTools()
  })
}