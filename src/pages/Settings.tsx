import { motion } from 'framer-motion'
import { Globe, Type, Palette, Vibrate, MusicIcon, ScrollText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { FontSizeSlider } from '@/components/common/FontSizeSlider'
import { useUIStore } from '@/stores/ui-store'

const scriptOptions = [
  { value: 'original', label: 'Original script' },
  { value: 'en', label: 'English (Roman)' },
  { value: 'hi', label: 'हिन्दी (Devanagari)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'od', label: 'ଓଡ଼ିଆ (Odia)' },
]

export function Settings() {
  const {
    theme,
    preferredScript,
    hapticFeedback,
    showChords,
    autoScroll,
    setPreferredScript,
    toggleHapticFeedback,
    toggleShowChords,
    toggleAutoScroll,
  } = useUIStore()

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <h1 className="text-2xl font-bold font-serif">Settings</h1>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground capitalize">{theme}</span>
                <ThemeToggle />
              </div>
            </div>
            <Separator />
            <FontSizeSlider />
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-primary" />
              Language & Script
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Preferred Script</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lyrics will be shown in this script
                </p>
              </div>
              <Select
                value={preferredScript}
                onValueChange={(v) => setPreferredScript(v as typeof preferredScript)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scriptOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Session */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Type className="h-4 w-4 text-primary" />
              Session Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <ScrollText className="h-3.5 w-3.5" />
                  Auto-scroll
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Scroll to active stanza automatically
                </p>
              </div>
              <Switch checked={autoScroll} onCheckedChange={toggleAutoScroll} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <Vibrate className="h-3.5 w-3.5" />
                  Haptic feedback
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vibrate on stanza change
                </p>
              </div>
              <Switch checked={hapticFeedback} onCheckedChange={toggleHapticFeedback} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <MusicIcon className="h-3.5 w-3.5" />
                  Show chords
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Display chord notations above lyrics
                </p>
              </div>
              <Switch checked={showChords} onCheckedChange={toggleShowChords} />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <div className="pt-2 pb-8 text-center text-xs text-muted-foreground space-y-1">
          <p className="font-semibold">ChorusSync v0.1.0</p>
          <p>Built with 🙏 for singing communities</p>
        </div>
      </motion.div>
    </div>
  )
}
