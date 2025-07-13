import { useCallback, useMemo } from 'react'
import { useMcpStore } from '@/stores/mcp'
import type { McpServerConfig, McpServerType, McpServerStatus } from '@/types/mcp'

export const useMcpServers = () => {
  const {
    servers,
    serverConfigs,
    isInitializing,
    addServer,
    removeServer,
    updateServerConfig,
    connectServer,
    disconnectServer,
    testServerConnection,
    initialize
  } = useMcpStore()

  // Computed values
  const serverList = useMemo(() => Object.values(servers), [servers])
  const configList = useMemo(() => Object.values(serverConfigs), [serverConfigs])
  
  const connectedServers = useMemo(() => 
    serverList.filter(server => server.health.status === 'connected'),
    [serverList]
  )
  
  const serversByType = useMemo(() => {
    const grouped: Partial<Record<McpServerType, typeof serverList>> = {}
    serverList.forEach(server => {
      const type = server.config.type
      if (!grouped[type]) grouped[type] = []
      grouped[type]!.push(server)
    })
    return grouped
  }, [serverList])
  
  const serversByStatus = useMemo(() => {
    const grouped: Partial<Record<McpServerStatus, typeof serverList>> = {}
    serverList.forEach(server => {
      const status = server.health.status
      if (!grouped[status]) grouped[status] = []
      grouped[status]!.push(server)
    })
    return grouped
  }, [serverList])

  // Server management functions
  const createServer = useCallback((config: Omit<McpServerConfig, 'id'>) => {
    const serverConfig: McpServerConfig = {
      ...config,
      id: crypto.randomUUID()
    }
    addServer(serverConfig)
    return serverConfig.id
  }, [addServer])

  const getServer = useCallback((serverId: string) => {
    return servers[serverId] || null
  }, [servers])

  const getServerConfig = useCallback((serverId: string) => {
    return serverConfigs[serverId] || null
  }, [serverConfigs])

  const updateServer = useCallback((serverId: string, updates: Partial<McpServerConfig>) => {
    updateServerConfig(serverId, updates)
  }, [updateServerConfig])

  const toggleServerEnabled = useCallback((serverId: string) => {
    const config = serverConfigs[serverId]
    if (!config) return
    
    updateServerConfig(serverId, { enabled: !config.enabled })
    
    if (!config.enabled) {
      // If enabling and autoConnect is true, connect
      if (config.autoConnect) {
        connectServer(serverId)
      }
    } else {
      // If disabling, disconnect
      disconnectServer(serverId)
    }
  }, [serverConfigs, updateServerConfig, connectServer, disconnectServer])

  const toggleServerAutoConnect = useCallback((serverId: string) => {
    const config = serverConfigs[serverId]
    if (!config) return
    
    updateServerConfig(serverId, { autoConnect: !config.autoConnect })
  }, [serverConfigs, updateServerConfig])

  // Connection management
  const connectAll = useCallback(async () => {
    const enabledConfigs = configList.filter(config => config.enabled)
    await Promise.all(enabledConfigs.map(config => connectServer(config.id)))
  }, [configList, connectServer])

  const disconnectAll = useCallback(async () => {
    const connectedServerIds = connectedServers.map(server => server.config.id)
    await Promise.all(connectedServerIds.map(id => disconnectServer(id)))
  }, [connectedServers, disconnectServer])

  const reconnectServer = useCallback(async (serverId: string) => {
    await disconnectServer(serverId)
    // Small delay before reconnecting
    setTimeout(() => connectServer(serverId), 1000)
  }, [connectServer, disconnectServer])

  const testAllConnections = useCallback(async () => {
    const enabledConfigs = configList.filter(config => config.enabled)
    const results = await Promise.allSettled(
      enabledConfigs.map(async config => ({
        serverId: config.id,
        success: await testServerConnection(config.id)
      }))
    )
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : { serverId: '', success: false }
    )
  }, [configList, testServerConnection])

  // Health monitoring
  const getServerHealth = useCallback((serverId: string) => {
    const server = servers[serverId]
    return server ? server.health : null
  }, [servers])

  const getHealthySer = useMemo(() => 
    serverList.filter(server => 
      server.health.status === 'connected' && server.health.successRate > 90
    ),
    [serverList]
  )

  const getUnhealthyServers = useMemo(() => 
    serverList.filter(server => 
      server.health.status === 'error' || server.health.successRate < 50
    ),
    [serverList]
  )

  // Statistics
  const stats = useMemo(() => ({
    total: serverList.length,
    connected: connectedServers.length,
    connecting: serverList.filter(s => s.health.status === 'connecting').length,
    disconnected: serverList.filter(s => s.health.status === 'disconnected').length,
    error: serverList.filter(s => s.health.status === 'error').length,
    healthy: getHealthySer.length,
    unhealthy: getUnhealthyServers.length,
    averageResponseTime: serverList.length > 0 
      ? serverList.reduce((acc, s) => acc + s.health.responseTime, 0) / serverList.length 
      : 0,
    averageSuccessRate: serverList.length > 0
      ? serverList.reduce((acc, s) => acc + s.health.successRate, 0) / serverList.length
      : 100
  }), [serverList, connectedServers, getHealthySer, getUnhealthyServers])

  // Server type utilities
  const getServersByType = useCallback((type: McpServerType) => {
    return serversByType[type] || []
  }, [serversByType])

  const getServersByStatus = useCallback((status: McpServerStatus) => {
    return serversByStatus[status] || []
  }, [serversByStatus])

  return {
    // Data
    servers: serverList,
    configs: configList,
    connectedServers,
    serversByType,
    serversByStatus,
    stats,
    isInitializing,
    
    // Server management
    createServer,
    getServer,
    getServerConfig,
    updateServer,
    removeServer,
    toggleServerEnabled,
    toggleServerAutoConnect,
    
    // Connection management
    connectServer,
    disconnectServer,
    reconnectServer,
    connectAll,
    disconnectAll,
    testServerConnection,
    testAllConnections,
    
    // Health monitoring
    getServerHealth,
    healthyServers: getHealthySer,
    unhealthyServers: getUnhealthyServers,
    
    // Utilities
    getServersByType,
    getServersByStatus,
    
    // Initialization
    initialize
  }
}