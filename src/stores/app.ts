import { create } from 'zustand'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface AppState {
  currentConversation: Conversation | null
  conversations: Conversation[]
  isLoading: boolean
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  
  setCurrentConversation: (conversation: Conversation) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  createNewConversation: () => void
  setLoading: (loading: boolean) => void
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentConversation: null,
  conversations: [],
  isLoading: false,
  theme: 'light',
  sidebarOpen: true,
  
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
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    set((state) => ({
      currentConversation: newConversation,
      conversations: [newConversation, ...state.conversations],
    }))
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))