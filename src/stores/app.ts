import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  codeBlocks?: Array<{ language: string; code: string }>
  isExecuting?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface FileOperation {
  id: string
  type: 'create' | 'read' | 'update' | 'delete'
  path: string
  content?: string
  timestamp: Date
  status: 'pending' | 'executing' | 'completed' | 'error'
  output?: string
}

interface AppState {
  currentConversation: Conversation | null
  conversations: Conversation[]
  isLoading: boolean
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  fileOperations: FileOperation[]
  
  setCurrentConversation: (conversation: Conversation) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  createNewConversation: () => void
  setLoading: (loading: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  toggleSidebar: () => void
  addFileOperation: (operation: Omit<FileOperation, 'id' | 'timestamp'>) => void
  updateFileOperation: (id: string, updates: Partial<FileOperation>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentConversation: null,
      conversations: [],
      isLoading: false,
      theme: 'light',
      sidebarOpen: true,
      fileOperations: [],
      
      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
      
      addMessage: (message) => {
        const { currentConversation } = get()
        if (!currentConversation) return
        
        const newMessage: Message = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          ...message,
        }
        
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage],
          updatedAt: new Date(),
        }
        
        set((state) => ({
          currentConversation: updatedConversation,
          conversations: state.conversations.map((conv) =>
            conv.id === currentConversation.id ? updatedConversation : conv
          ),
        }))
      },
      
      createNewConversation: () => {
        const newConversation: Conversation = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [{
            id: crypto.randomUUID(),
            content: 'Hello! I\'m Claude, your AI coding assistant. I can help you with code generation, file operations, debugging, and more. What would you like to work on?',
            role: 'assistant',
            timestamp: new Date()
          }],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          currentConversation: newConversation,
          conversations: [newConversation, ...state.conversations],
        }))
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      addFileOperation: (operation) => {
        const newOperation: FileOperation = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          ...operation,
        }
        
        set((state) => ({
          fileOperations: [newOperation, ...state.fileOperations]
        }))
      },
      
      updateFileOperation: (id, updates) => {
        set((state) => ({
          fileOperations: state.fileOperations.map((op) =>
            op.id === id ? { ...op, ...updates } : op
          )
        }))
      },
    }),
    {
      name: 'claude-gui-store',
      partialize: (state) => ({
        conversations: state.conversations,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)