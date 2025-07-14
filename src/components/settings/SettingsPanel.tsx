import React from 'react'

interface SettingsPanelProps {
  isDarkMode: boolean
  currentTheme: any
  onApiKeyChange?: (apiKey: string) => void
  apiKey?: string
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isDarkMode,
  currentTheme,
  onApiKeyChange,
  apiKey
}) => {
  return (
    <div style={{
      background: currentTheme.surface,
      borderBottom: `1px solid ${currentTheme.border}`,
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ margin: '0 0 20px 0', color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>
          Settings
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: currentTheme.text, 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Theme
            </label>
            <select style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              background: currentTheme.input, 
              border: `1px solid ${currentTheme.border}`, 
              color: currentTheme.text,
              fontSize: '14px',
              outline: 'none'
            }}>
              <option>{isDarkMode ? 'Dark' : 'Light'}</option>
              <option>{isDarkMode ? 'Light' : 'Dark'}</option>
              <option>Auto</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: currentTheme.text, 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Model
            </label>
            <select style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              background: currentTheme.input, 
              border: `1px solid ${currentTheme.border}`, 
              color: currentTheme.text,
              fontSize: '14px',
              outline: 'none'
            }}>
              <option>Claude 3.5 Sonnet</option>
              <option>Claude 3 Haiku</option>
              <option>Claude 3 Opus</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: currentTheme.text, 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Max Tokens
            </label>
            <input 
              type="number" 
              defaultValue="4000" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                background: currentTheme.input, 
                border: `1px solid ${currentTheme.border}`, 
                color: currentTheme.text,
                fontSize: '14px',
                outline: 'none'
              }} 
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: currentTheme.text, 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Claude API Key
            </label>
            <input 
              type="password" 
              placeholder="sk-ant-api..." 
              value={apiKey || ''}
              onChange={(e) => onApiKeyChange?.(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                background: currentTheme.input, 
                border: `1px solid ${currentTheme.border}`, 
                color: currentTheme.text,
                fontSize: '14px',
                outline: 'none'
              }} 
            />
            <small style={{ 
              color: currentTheme.textSecondary, 
              fontSize: '12px', 
              marginTop: '4px', 
              display: 'block' 
            }}>
              Your API key is stored locally and never sent to our servers
            </small>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: currentTheme.text, 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Working Directory
            </label>
            <input 
              type="text" 
              defaultValue="/workspace/ClaudeGUI" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                background: currentTheme.input, 
                border: `1px solid ${currentTheme.border}`, 
                color: currentTheme.text,
                fontSize: '14px',
                outline: 'none'
              }} 
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: currentTheme.text, 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Auto-save Conversations
            </label>
            <select style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              background: currentTheme.input, 
              border: `1px solid ${currentTheme.border}`, 
              color: currentTheme.text,
              fontSize: '14px',
              outline: 'none'
            }}>
              <option>Enabled</option>
              <option>Disabled</option>
              <option>Ask each time</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${currentTheme.border}` }}>
          <h4 style={{ margin: '0 0 16px 0', color: currentTheme.text, fontSize: '16px', fontWeight: '500' }}>
            Quick Actions
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={{
              background: currentTheme.button,
              color: currentTheme.buttonText,
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Test API Connection
            </button>
            <button style={{
              background: 'transparent',
              color: currentTheme.text,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Clear Chat History
            </button>
            <button style={{
              background: 'transparent',
              color: currentTheme.text,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Export Settings
            </button>
            <button style={{
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel