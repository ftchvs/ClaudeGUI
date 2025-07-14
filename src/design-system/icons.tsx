import React from 'react'

// Icon props interface
interface IconProps {
  size?: number | string
  color?: string
  className?: string
  strokeWidth?: number
}

// Claude Code Specific Icons
export const ClaudeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Custom Claude logo design */}
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12l2 2 4-4"/>
    <path d="M12 2v20"/>
    <path d="M2 12h20"/>
  </svg>
)

export const AISparkIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export const CodeGenerateIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16,18 22,12 16,6"/>
    <polyline points="8,6 2,12 8,18"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
    <circle cx="12" cy="8" r="2"/>
    <circle cx="12" cy="16" r="2"/>
  </svg>
)

export const ProjectAnalysisIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    <circle cx="9" cy="9" r="2"/>
    <circle cx="15" cy="15" r="2"/>
    <circle cx="20" cy="6" r="2"/>
  </svg>
)

export const WorkflowIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="6" height="6" rx="1"/>
    <rect x="15" y="3" width="6" height="6" rx="1"/>
    <rect x="9" y="15" width="6" height="6" rx="1"/>
    <path d="M6 9v3a3 3 0 0 0 3 3h6"/>
    <path d="M18 9v3a3 3 0 0 1-3 3h-3"/>
  </svg>
)

// Enhanced Common Icons
export const FileIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14,2 L14,8 L20,8 M14,2 L4,2 C2.9,2 2,2.9 2,4 L2,20 C2,21.1 2.9,22 4,22 L20,22 C21.1,22 22,21.1 22,20 L22,8 L14,2 Z"/>
    <line x1="7" y1="13" x2="17" y2="13"/>
    <line x1="7" y1="17" x2="13" y2="17"/>
  </svg>
)

export const FolderIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

export const TerminalIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="6,9 12,15 18,9"/>
  </svg>
)

export const ChatIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="9" cy="10" r="1"/>
    <circle cx="15" cy="10" r="1"/>
    <path d="M9 14s1 1 3 1 3-1 3-1"/>
  </svg>
)

export const SettingsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export const SearchIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

export const LoadingIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} animate-spin`}
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

export const CheckIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

export const ErrorIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

export const WarningIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export const InfoIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

// File Type Icons
export const TypeScriptIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#3178C6', 
  className = '' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <rect width="24" height="24" rx="2" fill={color}/>
    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" fill="white"/>
    <text x="12" y="16" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">TS</text>
  </svg>
)

export const JavaScriptIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#F7DF1E', 
  className = '' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <rect width="24" height="24" rx="2" fill={color}/>
    <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">JS</text>
  </svg>
)

export const ReactIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#61DAFB', 
  className = '' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="2"/>
    <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
    <path d="M12 7c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z"/>
  </svg>
)

// Diff and Git Icons
export const GitDiffIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6" cy="6" r="3"/>
    <circle cx="18" cy="18" r="3"/>
    <path d="M6 9v6"/>
    <path d="M18 9V6"/>
    <path d="M9 6h9"/>
    <path d="M9 18h9"/>
  </svg>
)

export const PlusIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 5v14"/>
    <path d="M5 12h14"/>
  </svg>
)

export const MinusIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14"/>
  </svg>
)

export const ExpandIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 3h6v6"/>
    <path d="M9 21H3v-6"/>
    <path d="M21 3l-7 7"/>
    <path d="M3 21l7-7"/>
  </svg>
)

export const EditIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export const XIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6L6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
)

export const ExternalLinkIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <path d="M15 3h6v6"/>
    <path d="M10 14L21 3"/>
  </svg>
)

export const EyeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export const FileTextIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H8"/>
  </svg>
)

export const CodeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 18l6-6-6-6"/>
    <path d="M8 6l-6 6 6 6"/>
  </svg>
)

export const ClockIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

// Icon collection for easy access
export const Icons = {
  // Claude Code specific
  Claude: ClaudeIcon,
  AISpark: AISparkIcon,
  CodeGenerate: CodeGenerateIcon,
  ProjectAnalysis: ProjectAnalysisIcon,
  Workflow: WorkflowIcon,
  
  // Common UI
  File: FileIcon,
  Folder: FolderIcon,
  FolderOpen: FolderIcon, // Add alias for now
  Terminal: TerminalIcon,
  Chat: ChatIcon,
  Settings: SettingsIcon,
  Search: SearchIcon,
  Loading: LoadingIcon,
  Check: CheckIcon,
  Error: ErrorIcon,
  Warning: WarningIcon,
  Info: InfoIcon,
  Copy: FileIcon, // Add alias for now
  Download: ExternalLinkIcon, // Add alias for now  
  Send: FileIcon, // Add alias for now
  Attachment: FileIcon, // Add alias for now
  
  // Diff and Git
  GitDiff: GitDiffIcon,
  Plus: PlusIcon,
  Minus: MinusIcon,
  Expand: ExpandIcon,
  Edit: EditIcon,
  X: XIcon,
  ExternalLink: ExternalLinkIcon,
  Eye: EyeIcon,
  FileText: FileTextIcon,
  Code: CodeIcon,
  Clock: ClockIcon,
  
  // File types
  TypeScript: TypeScriptIcon,
  JavaScript: JavaScriptIcon,
  React: ReactIcon,
}

export default Icons