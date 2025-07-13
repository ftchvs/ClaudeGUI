import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusIcon, MessageSquareIcon, SettingsIcon, MenuIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { sidebarOpen, conversations, currentConversation, createNewConversation, setCurrentConversation, toggleSidebar } = useAppStore()

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed left-0 top-0 z-40 h-screen w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Claude GUI</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <MenuIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <Button 
                onClick={createNewConversation} 
                className="w-full justify-start gap-2 rounded-xl"
              >
                <PlusIcon className="h-4 w-4" />
                New Conversation
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={currentConversation?.id === conversation.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 rounded-xl text-left h-auto p-3",
                        currentConversation?.id === conversation.id && "bg-accent"
                      )}
                      onClick={() => setCurrentConversation(conversation)}
                    >
                      <MessageSquareIcon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">{conversation.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {conversation.messages.length} messages
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl">
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}