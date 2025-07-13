import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/app'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  SettingsIcon, 
  PaletteIcon, 
  ShieldIcon,
  InfoIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsPanel() {
  const { theme, toggleTheme } = useAppStore()


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full rounded-xl border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </CardTitle>
          <CardDescription>
            Customize your Claude GUI experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">
              {/* Appearance Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PaletteIcon className="h-5 w-5" />
                      Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize colors and visual preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Theme</div>
                        <div className="text-sm text-muted-foreground">
                          Choose between light and dark mode
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={toggleTheme}
                        className="rounded-lg"
                      >
                        {theme === 'light' ? 'Dark' : 'Light'} Mode
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Border Radius</div>
                        <div className="text-sm text-muted-foreground">
                          Adjust corner roundness
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[8, 12, 16, 20].map((radius) => (
                          <Button
                            key={radius}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-8 h-8 p-0",
                              radius === 16 && "bg-primary text-primary-foreground"
                            )}
                            style={{ borderRadius: `${radius}px` }}
                          >
                            {radius}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* API Configuration */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldIcon className="h-5 w-5" />
                      API Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your Claude API settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        type="password"
                        placeholder="sk-ant-..."
                        className="mt-1 rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your API key is stored securely and never shared
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Model</label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {['claude-3-sonnet', 'claude-3-opus'].map((model) => (
                          <Button
                            key={model}
                            variant={model === 'claude-3-sonnet' ? 'secondary' : 'outline'}
                            className="justify-start rounded-lg"
                          >
                            {model}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* System Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <InfoIcon className="h-5 w-5" />
                      About
                    </CardTitle>
                    <CardDescription>
                      System and version information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-mono">1.0.0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Built with</span>
                      <span>React + TypeScript</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">UI Framework</span>
                      <span>shadcn/ui + Tailwind</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Animations</span>
                      <span>Framer Motion</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}