import { useState, useCallback } from 'react'

interface ErrorInfo {
  message: string
  type: 'network' | 'api' | 'validation' | 'general'
  code?: string | number
  timestamp: Date
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [currentError, setCurrentError] = useState<string | null>(null)

  const logError = useCallback((error: Error | string, type: ErrorInfo['type'] = 'general', code?: string | number) => {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      type,
      code,
      timestamp: new Date()
    }

    setErrors(prev => [...prev.slice(-9), errorInfo]) // Keep last 10 errors
    setCurrentError(errorInfo.message)

    // Log to console for development
    console.error('Error logged:', errorInfo)

    // In production, you might want to send to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service like Sentry
      // sentryCapture(errorInfo)
    }
  }, [])

  const clearCurrentError = useCallback(() => {
    setCurrentError(null)
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
    setCurrentError(null)
  }, [])

  const handleApiError = useCallback((error: any) => {
    let message = 'An unexpected error occurred'
    let code: string | number | undefined

    if (error?.response) {
      // HTTP error response
      code = error.response.status
      message = error.response.data?.error?.message || 
                error.response.data?.message || 
                `HTTP ${error.response.status}: ${error.response.statusText}`
    } else if (error?.message) {
      // Network or other error
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    logError(message, 'api', code)
  }, [logError])

  const handleNetworkError = useCallback((error: any) => {
    let message = 'Network connection failed'
    
    if (error?.message?.includes('Failed to fetch')) {
      message = 'Unable to connect to the server. Please check your internet connection.'
    } else if (error?.message?.includes('NetworkError')) {
      message = 'Network error occurred. Please try again.'
    } else if (error?.message) {
      message = error.message
    }

    logError(message, 'network')
  }, [logError])

  const handleValidationError = useCallback((field: string, message: string) => {
    logError(`${field}: ${message}`, 'validation')
  }, [logError])

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorType: ErrorInfo['type'] = 'general'
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args)
      } catch (error) {
        if (errorType === 'api') {
          handleApiError(error)
        } else if (errorType === 'network') {
          handleNetworkError(error)
        } else {
          logError(error as Error, errorType)
        }
        return null
      }
    }
  }, [logError, handleApiError, handleNetworkError])

  return {
    errors,
    currentError,
    logError,
    clearCurrentError,
    clearAllErrors,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    withErrorHandling
  }
}

export default useErrorHandler