import React from 'react'

interface TopNavigationProps {
  isDarkMode: boolean
  onThemeToggle: () => void
  showSettings: boolean
  onSettingsToggle: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  currentTheme: any
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  isDarkMode,
  onThemeToggle,
  showSettings,
  onSettingsToggle,
  activeTab,
  onTabChange,
  currentTheme
}) => {
  const tabs = [
    { id: 'commands', label: 'Commands', icon: '⚡' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'templates', label: 'Templates', icon: '🧩' },
    { id: 'diff', label: 'Changes', icon: '🔄' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'workflows', label: 'Workflows', icon: '🔄' }
  ]

  return (
    <nav style={{
      background: currentTheme.bg,
      borderBottom: `1px solid ${currentTheme.border}`,
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: currentTheme.accent,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            C
          </div>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: currentTheme.text,
            margin: 0
          }}>
            Claude GUI
          </h1>
        </div>
        
        {/* Horizontal Menu Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: activeTab === tab.id ? currentTheme.surface : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: activeTab === tab.id ? currentTheme.text : currentTheme.textSecondary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  const target = e.target as HTMLButtonElement
                  target.style.background = currentTheme.surface
                  target.style.color = currentTheme.text
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  const target = e.target as HTMLButtonElement
                  target.style.background = 'transparent'
                  target.style.color = currentTheme.textSecondary
                }
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: currentTheme.textSecondary }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: currentTheme.accent 
            }}></div>
            <span>Connected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>3 Servers</span>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <button 
          onClick={onThemeToggle}
          style={{
            background: 'transparent',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            padding: '8px',
            color: currentTheme.text,
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = currentTheme.surface}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = 'transparent'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        {/* Settings */}
        <button 
          onClick={onSettingsToggle}
          aria-label="Settings"
          style={{
            background: showSettings ? currentTheme.surface : 'transparent',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            padding: '8px',
            color: currentTheme.text,
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (!showSettings) (e.target as HTMLButtonElement).style.background = currentTheme.surface
          }}
          onMouseOut={(e) => {
            if (!showSettings) (e.target as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          ⚙️
        </button>
      </div>
    </nav>
  )
}

export default TopNavigation