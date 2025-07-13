import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { UserIcon, BotIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageProps {
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function Message({ content, role, timestamp }: MessageProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 max-w-4xl",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BotIcon className="h-4 w-4" />
        </div>
      )}
      
      <Card className={cn(
        "flex-1 rounded-2xl border-none shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <div className="p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="m-0 whitespace-pre-wrap">{content}</p>
          </div>
          <div className={cn(
            "mt-2 text-xs opacity-70",
            isUser ? "text-primary-foreground" : "text-muted-foreground"
          )}>
            {timestamp.toLocaleTimeString()}
          </div>
        </div>
      </Card>
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-accent">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  )
}