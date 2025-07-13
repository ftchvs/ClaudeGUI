import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message } from './message'
import { ChatInput } from './chat-input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export function ChatArea() {
  const { currentConversation, createNewConversation } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentConversation?.messages])

  if (!currentConversation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Card className="p-8 rounded-2xl border-dashed">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Claude GUI</h2>
            <p className="text-muted-foreground mb-6">
              Start a new conversation to begin chatting with Claude
            </p>
            <Button onClick={createNewConversation} className="rounded-xl">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="space-y-6 p-4 max-w-4xl mx-auto">
          <AnimatePresence>
            {currentConversation.messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
          </AnimatePresence>
          
          {currentConversation.messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">
                Ask Claude anything - from coding help to creative writing
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
      <ChatInput />
    </div>
  )
}