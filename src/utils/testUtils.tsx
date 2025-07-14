import React from 'react'

// Mock theme for testing
export const mockTheme = {
  bg: '#000000',
  surface: '#1a1a1a',
  border: '#333333',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  accent: '#10a37f',
  button: '#ffffff',
  buttonText: '#000000',
  input: '#2d2d2d'
}

// Mock message for testing
export const mockMessage = {
  id: '1',
  content: 'Test message',
  role: 'user' as const,
  timestamp: new Date(),
  tokens: 10,
  cost: 0.001
}

// Mock execution step for testing
export const mockExecutionStep = {
  id: '1',
  title: 'Test execution',
  status: 'completed' as const,
  output: 'Test output',
  timestamp: new Date()
}

// Mock KPI data for testing
export const mockKPIData = {
  totalTokens: 1000,
  totalCost: 0.5,
  requestsToday: 5,
  avgResponseTime: 1.2,
  successRate: 98.5,
  activeSessions: 1
}

// Simple test wrapper component
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

// Mock service responses
export const mockServiceResponse = {
  success: true,
  output: 'Mock response',
  duration: 1000,
  tokens: 50,
  cost: 0.01
}

// Test utilities
export const createMockMessage = (overrides = {}) => ({
  ...mockMessage,
  id: Math.random().toString(),
  ...overrides
})

export const createMockExecutionStep = (overrides = {}) => ({
  ...mockExecutionStep,
  id: Math.random().toString(),
  ...overrides
})

// Simple test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) }
  }
}

// Mock environment for testing
export const setupTestEnvironment = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true
  })

  // Mock console methods to avoid noise in tests
  const originalConsole = { ...console }
  console.warn = () => {}
  console.error = () => {}
  console.log = () => {}

  return {
    cleanup: () => {
      Object.assign(console, originalConsole)
    }
  }
}

export default {
  mockTheme,
  mockMessage,
  mockExecutionStep,
  mockKPIData,
  TestWrapper,
  mockServiceResponse,
  createMockMessage,
  createMockExecutionStep,
  waitFor,
  mockLocalStorage,
  setupTestEnvironment
}