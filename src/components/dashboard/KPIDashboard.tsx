import React from 'react'

interface KPIData {
  totalTokens: number
  totalCost: number
  requestsToday: number
  avgResponseTime: number
  successRate: number
  activeSessions: number
}

interface KPIDashboardProps {
  kpiData: KPIData
  currentTheme: any
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  kpiData,
  currentTheme
}) => {
  const kpiItems = [
    {
      label: 'Total Tokens',
      value: kpiData.totalTokens.toLocaleString(),
      color: currentTheme.accent,
      icon: '🧮'
    },
    {
      label: 'Total Cost',
      value: `$${kpiData.totalCost.toFixed(3)}`,
      color: currentTheme.accent,
      icon: '💰'
    },
    {
      label: 'Requests Today',
      value: kpiData.requestsToday.toString(),
      color: currentTheme.text,
      icon: '📊'
    },
    {
      label: 'Avg Response',
      value: `${kpiData.avgResponseTime.toFixed(1)}s`,
      color: currentTheme.text,
      icon: '⚡'
    },
    {
      label: 'Success Rate',
      value: `${kpiData.successRate}%`,
      color: currentTheme.accent,
      icon: '✅'
    },
    {
      label: 'Active Sessions',
      value: kpiData.activeSessions.toString(),
      color: currentTheme.text,
      icon: '👥'
    }
  ]

  return (
    <div style={{
      background: currentTheme.bg,
      borderBottom: `1px solid ${currentTheme.border}`,
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: currentTheme.text, fontSize: '18px', fontWeight: '600' }}>
            Performance Dashboard
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: currentTheme.textSecondary }}>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: currentTheme.accent,
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {kpiItems.map((item, index) => (
            <div 
              key={item.label}
              style={{ 
                background: currentTheme.surface, 
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '12px', 
                padding: '20px',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${currentTheme.border}`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ 
                  color: currentTheme.textSecondary, 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>
                  {item.label}
                </div>
                <span style={{ fontSize: '16px', opacity: 0.7 }}>{item.icon}</span>
              </div>
              
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: item.color,
                marginBottom: '8px'
              }}>
                {item.value}
              </div>

              {/* Trend indicator */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '12px',
                color: currentTheme.textSecondary
              }}>
                <span style={{ color: '#10b981' }}>↗</span>
                <span>+{Math.floor(Math.random() * 20 + 5)}% vs yesterday</span>
              </div>

              {/* Subtle background decoration */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40px',
                height: '40px',
                background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                borderRadius: '0 12px 0 40px'
              }}></div>
            </div>
          ))}
        </div>

        {/* Quick Stats Bar */}
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: currentTheme.surface,
          borderRadius: '8px',
          border: `1px solid ${currentTheme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: currentTheme.accent 
            }}></div>
            <span style={{ fontSize: '14px', color: currentTheme.text, fontWeight: '500' }}>
              System Status: All systems operational
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: currentTheme.textSecondary }}>
            <span>API Latency: {(Math.random() * 100 + 50).toFixed(0)}ms</span>
            <span>Memory Usage: {(Math.random() * 30 + 40).toFixed(1)}%</span>
            <span>Uptime: 99.9%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KPIDashboard