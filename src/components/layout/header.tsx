import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { MenuIcon, SunIcon, MoonIcon } from 'lucide-react'

export function Header() {
  const { sidebarOpen, theme, toggleSidebar, toggleTheme } = useAppStore()

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
    >
      {!sidebarOpen && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <MenuIcon className="h-4 w-4" />
        </Button>
      )}
      
      <div className="flex-1" />
      
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === 'light' ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4" />
        )}
      </Button>
    </motion.header>
  )
}