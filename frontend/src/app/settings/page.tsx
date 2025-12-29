'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Save, Bell, Volume2, Monitor, Gamepad2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    gameInvites: true,
    matchResults: true,
    
    // Sound settings
    soundEnabled: true,
    soundVolume: 70,
    moveSound: true,
    winSound: true,
    
    // Display settings
    theme: 'system',
    animations: true,
    boardTheme: 'default',
    
    // Game settings
    autoReady: false,
    confirmLeave: true,
    showHints: false,
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem('gameSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
        if (parsed.theme) {
          setTheme(parsed.theme)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [setTheme])

  // Sync theme with settings
  useEffect(() => {
    if (mounted && theme) {
      setSettings(prev => ({ ...prev, theme: theme as 'light' | 'dark' | 'system' }))
    }
  }, [theme, mounted])

  // Update theme when settings change
  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
    // If theme is changed, update immediately
    if (key === 'theme') {
      setTheme(value)
    }
  }

  const handleSave = () => {
    try {
      // Save to localStorage
      localStorage.setItem('gameSettings', JSON.stringify(settings))
      
      // Theme is already updated via updateSetting, just save
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Failed to save settings:', error)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">Manage your game preferences and account settings</p>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="gameInvites">Game Invites</Label>
                    <p className="text-sm text-muted-foreground">Notify when someone invites you to a game</p>
                  </div>
                  <Switch
                    id="gameInvites"
                    checked={settings.gameInvites}
                    onCheckedChange={(checked) => updateSetting('gameInvites', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="matchResults">Match Results</Label>
                    <p className="text-sm text-muted-foreground">Notify when your matches end</p>
                  </div>
                  <Switch
                    id="matchResults"
                    checked={settings.matchResults}
                    onCheckedChange={(checked) => updateSetting('matchResults', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sound Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Sound Settings
                </CardTitle>
                <CardDescription>Control game sounds and audio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="soundEnabled">Enable Sounds</Label>
                    <p className="text-sm text-muted-foreground">Turn game sounds on or off</p>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>
                {settings.soundEnabled && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="soundVolume">Volume</Label>
                        <span className="text-sm text-muted-foreground">{settings.soundVolume}%</span>
                      </div>
                      <Input
                        id="soundVolume"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.soundVolume}
                        onChange={(e) => updateSetting('soundVolume', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="moveSound">Move Sound</Label>
                        <p className="text-sm text-muted-foreground">Play sound when a move is made</p>
                      </div>
                      <Switch
                        id="moveSound"
                        checked={settings.moveSound}
                        onCheckedChange={(checked) => updateSetting('moveSound', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="winSound">Win Sound</Label>
                        <p className="text-sm text-muted-foreground">Play sound when game ends</p>
                      </div>
                      <Switch
                        id="winSound"
                        checked={settings.winSound}
                        onCheckedChange={(checked) => updateSetting('winSound', checked)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Display Settings
                </CardTitle>
                <CardDescription>Customize your visual experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => updateSetting('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable smooth animations</p>
                  </div>
                  <Switch
                    id="animations"
                    checked={settings.animations}
                    onCheckedChange={(checked) => updateSetting('animations', checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="boardTheme">Board Theme</Label>
                  <Select
                    value={settings.boardTheme}
                    onValueChange={(value) => updateSetting('boardTheme', value)}
                  >
                    <SelectTrigger id="boardTheme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="marble">Marble</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Game Settings
                </CardTitle>
                <CardDescription>Configure your gameplay preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoReady">Auto Ready</Label>
                    <p className="text-sm text-muted-foreground">Automatically mark as ready when joining rooms</p>
                  </div>
                  <Switch
                    id="autoReady"
                    checked={settings.autoReady}
                    onCheckedChange={(checked) => updateSetting('autoReady', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="confirmLeave">Confirm Leave</Label>
                    <p className="text-sm text-muted-foreground">Ask for confirmation before leaving a game</p>
                  </div>
                  <Switch
                    id="confirmLeave"
                    checked={settings.confirmLeave}
                    onCheckedChange={(checked) => updateSetting('confirmLeave', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showHints">Show Hints</Label>
                    <p className="text-sm text-muted-foreground">Display helpful hints during gameplay</p>
                  </div>
                  <Switch
                    id="showHints"
                    checked={settings.showHints}
                    onCheckedChange={(checked) => updateSetting('showHints', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleSave} className="gap-2">
                <Save className="h-5 w-5" />
                Save Settings
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      </main>
    </ProtectedRoute>
  )
}

