import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log to error reporting service (e.g., Sentry)
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error reporting service
    console.group('🔥 Error Report')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Timestamp:', new Date().toISOString())
    console.error('User Agent:', navigator.userAgent)
    console.error('URL:', window.location.href)
    console.groupEnd()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px',
          textAlign: 'center',
          background: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #333333',
          borderRadius: '12px',
          margin: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💥</div>
          
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#ef4444'
          }}>
            Something went wrong
          </h2>
          
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: '16px', 
            color: '#b3b3b3',
            maxWidth: '500px',
            lineHeight: '1.5'
          }}>
            We encountered an unexpected error. Don't worry, this has been reported and we're working on fixing it.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginBottom: '24px',
              padding: '16px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#ff6b6b',
              fontFamily: '"SF Mono", "Monaco", "Cascadia Code", monospace',
              fontSize: '12px',
              textAlign: 'left',
              maxWidth: '600px',
              overflow: 'auto'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Error Details (Development Mode)
              </summary>
              <div>
                <strong>Error:</strong> {this.state.error.message}
              </div>
              {this.state.error.stack && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Stack Trace:</strong>
                  <pre style={{ 
                    margin: '4px 0 0 0', 
                    whiteSpace: 'pre-wrap',
                    fontSize: '11px',
                    color: '#ffcc99'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              {this.state.errorInfo && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Component Stack:</strong>
                  <pre style={{ 
                    margin: '4px 0 0 0', 
                    whiteSpace: 'pre-wrap',
                    fontSize: '11px',
                    color: '#99ccff'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </details>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                background: '#10a37f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#0d8f6f'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#10a37f'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                background: 'transparent',
                color: '#b3b3b3',
                border: '1px solid #404040',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2d2d2d'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#b3b3b3'
              }}
            >
              Reload Page
            </button>
          </div>

          <div style={{ 
            marginTop: '24px',
            fontSize: '12px',
            color: '#666666'
          }}>
            Error ID: {Date.now().toString(36)}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary