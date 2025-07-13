import { Suspense, useEffect } from 'react'
import { useAppStore } from '@/stores/app'
// import { ClaudeCodexInterface } from '@/components/workspace/ClaudeCodexInterface'
import { Workspace } from '@/components/layout/workspace'

function App() {
  console.log('App component rendering...')
  
  try {
    const { theme } = useAppStore()

    useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    return (
      <Suspense fallback={
        <div style={{ padding: '20px', background: 'white', color: 'black', minHeight: '100vh' }}>
          <h1>Loading Claude GUI...</h1>
          <p>Please wait while the application loads.</p>
        </div>
      }>
        <Workspace />
      </Suspense>
    )
  } catch (error) {
    console.error('App rendering error:', error)
    return (
      <div style={{ padding: '20px', background: 'white', color: 'red', minHeight: '100vh' }}>
        <h1>Error loading Claude GUI</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <details>
          <summary>Technical Details</summary>
          <pre>{error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    )
  }
}

export default App