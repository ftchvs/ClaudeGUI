import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/stores/app'
import { SendIcon, LoaderIcon } from 'lucide-react'

export function ChatInput() {
  const [input, setInput] = useState('')
  const { addMessage, isLoading, setLoading } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage({ content: userMessage, role: 'user' })
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      addMessage({ 
        content: `I understand you said: "${userMessage}". This is a demo response from Claude GUI.`, 
        role: 'assistant' 
      })
      setLoading(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4"
    >
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Claude..."
          className="flex-1 rounded-2xl bg-muted border-none"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="rounded-2xl px-6"
        >
          {isLoading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </form>
    </motion.div>
  )
}