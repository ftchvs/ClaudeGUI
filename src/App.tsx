import { useEffect } from 'react'
import { useAppStore } from '@/stores/app'
import { EnhancedMainWorkspace } from '@/components/workspace/EnhancedMainWorkspace'

function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <EnhancedMainWorkspace />
}

export default App