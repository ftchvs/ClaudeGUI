// Premium Design System for Claude Code GUI
export interface PremiumTheme {
  name: string
  type: 'light' | 'dark'
  colors: {
    // Brand Colors (Claude-inspired)
    primary: string
    primaryHover: string
    primaryActive: string
    primarySubtle: string
    
    // Semantic Colors
    success: string
    warning: string
    error: string
    info: string
    
    // Surface Colors
    background: string
    surface: string
    surfaceHover: string
    surfaceActive: string
    border: string
    borderHover: string
    
    // Text Colors  
    text: string
    textSecondary: string
    textTertiary: string
    textInverse: string
    
    // Interactive Colors
    interactive: string
    interactiveHover: string
    interactiveActive: string
    
    // Code Syntax Colors
    syntax: {
      keyword: string
      string: string
      number: string
      comment: string
      function: string
      variable: string
      type: string
      operator: string
    }
  }
  
  typography: {
    fontFamily: {
      display: string // For headings and hero text
      body: string    // For UI text
      code: string    // For code blocks
    }
    
    fontSize: {
      xs: string    // 12px
      sm: string    // 14px  
      base: string  // 16px
      lg: string    // 18px
      xl: string    // 20px
      '2xl': string // 24px
      '3xl': string // 30px
      '4xl': string // 36px
    }
    
    fontWeight: {
      normal: number    // 400
      medium: number    // 500
      semibold: number  // 600
      bold: number      // 700
    }
    
    lineHeight: {
      tight: string   // 1.25
      normal: string  // 1.5
      relaxed: string // 1.75
    }
  }
  
  spacing: {
    px: string
    0: string
    1: string   // 4px
    2: string   // 8px
    3: string   // 12px
    4: string   // 16px
    5: string   // 20px
    6: string   // 24px
    8: string   // 32px
    10: string  // 40px
    12: string  // 48px
    16: string  // 64px
    20: string  // 80px
    24: string  // 96px
  }
  
  borderRadius: {
    none: string
    sm: string    // 4px
    base: string  // 8px
    md: string    // 12px
    lg: string    // 16px
    full: string  // 50%
  }
  
  shadows: {
    none: string
    sm: string
    base: string
    md: string
    lg: string
    xl: string
  }
  
  animation: {
    duration: {
      fast: string    // 150ms
      normal: string  // 300ms
      slow: string    // 500ms
    }
    
    easing: {
      ease: string
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
}

// Claude Code Dark Theme (Primary)
export const claudeCodeDark: PremiumTheme = {
  name: 'Claude Code Dark',
  type: 'dark',
  colors: {
    // Claude Brand Colors
    primary: '#FF8C42',        // Claude orange
    primaryHover: '#FF7A2B',   
    primaryActive: '#FF6914',  
    primarySubtle: '#FF8C4220',
    
    // Semantic Colors
    success: '#10B981',   // Emerald
    warning: '#F59E0B',   // Amber  
    error: '#EF4444',     // Red
    info: '#3B82F6',      // Blue
    
    // Surface Colors
    background: '#0A0A0A',     // True black
    surface: '#1A1A1A',       // Card background
    surfaceHover: '#262626',   // Hover state
    surfaceActive: '#2D2D2D',  // Active state
    border: '#404040',         // Border color
    borderHover: '#525252',    // Border hover
    
    // Text Colors
    text: '#FAFAFA',           // Primary text
    textSecondary: '#A3A3A3',  // Secondary text
    textTertiary: '#737373',   // Tertiary text
    textInverse: '#0A0A0A',    // Inverse text
    
    // Interactive Colors
    interactive: '#FF8C42',    // Links, buttons
    interactiveHover: '#FF7A2B',
    interactiveActive: '#FF6914',
    
    // Code Syntax (VS Code Dark+ inspired)
    syntax: {
      keyword: '#569CD6',    // Blue for keywords
      string: '#CE9178',     // Orange for strings
      number: '#B5CEA8',     // Green for numbers
      comment: '#6A9955',    // Green for comments
      function: '#DCDCAA',   // Yellow for functions
      variable: '#9CDCFE',   // Light blue for variables
      type: '#4EC9B0',       // Cyan for types
      operator: '#D4D4D4',   // Gray for operators
    }
  },
  
  typography: {
    fontFamily: {
      display: '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      code: '"JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },
  
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    full: '50%',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.24)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.20)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.20)',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
}

// Claude Code Light Theme
export const claudeCodeLight: PremiumTheme = {
  ...claudeCodeDark,
  name: 'Claude Code Light',
  type: 'light',
  colors: {
    ...claudeCodeDark.colors,
    
    // Surface Colors (inverted)
    background: '#FFFFFF',     
    surface: '#F8F9FA',       
    surfaceHover: '#F1F3F4',   
    surfaceActive: '#E8EAED',  
    border: '#E5E7EB',         
    borderHover: '#D1D5DB',    
    
    // Text Colors (inverted)
    text: '#111827',           
    textSecondary: '#6B7280',  
    textTertiary: '#9CA3AF',   
    textInverse: '#FFFFFF',    
    
    // Code Syntax (Light theme)
    syntax: {
      keyword: '#0066CC',    // Blue for keywords
      string: '#008000',     // Green for strings  
      number: '#0033CC',     // Dark blue for numbers
      comment: '#008000',    // Green for comments
      function: '#795E26',   // Brown for functions
      variable: '#001080',   // Navy for variables
      type: '#267F99',       // Teal for types
      operator: '#000000',   // Black for operators
    }
  }
}

// Professional Purple Theme (Alternative)
export const professionalPurple: PremiumTheme = {
  ...claudeCodeDark,
  name: 'Professional Purple',
  type: 'dark',
  colors: {
    ...claudeCodeDark.colors,
    primary: '#8B5CF6',        // Purple
    primaryHover: '#7C3AED',   
    primaryActive: '#6D28D9',  
    primarySubtle: '#8B5CF620',
    interactive: '#8B5CF6',
    interactiveHover: '#7C3AED',
    interactiveActive: '#6D28D9',
  }
}

// Export default theme
export const defaultTheme = claudeCodeDark

// Theme utilities
export const getTheme = (themeName: string): PremiumTheme => {
  switch (themeName) {
    case 'claude-dark': return claudeCodeDark
    case 'claude-light': return claudeCodeLight  
    case 'professional-purple': return professionalPurple
    default: return claudeCodeDark
  }
}

export const availableThemes = [
  claudeCodeDark,
  claudeCodeLight,
  professionalPurple,
]