import React, { useState, useEffect } from 'react'

interface ErrorToastProps {
  error: string | null
  onDismiss: () => void
  duration?: number
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for animation to complete
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [error, duration, onDismiss])

  if (!error) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#1a1a1a',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          fontSize: '20px',
          color: '#ef4444',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          ⚠️
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#ffffff',
            marginBottom: '4px'
          }}>
            Error
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#b3b3b3',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666666',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default ErrorToast