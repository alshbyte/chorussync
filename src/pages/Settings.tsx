import { motion } from 'framer-motion'
import { Globe, Vibrate, MusicIcon, ScrollText, Moon, Sun, User } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { FontSizeSlider } from '@/components/common/FontSizeSlider'
import { useUIStore } from '@/stores/ui-store'
import { useCommunityStore } from '@/stores/community-store'

const scriptOptions = [
  { value: 'original', label: 'Original script' },
  { value: 'en', label: 'English (Roman)' },
  { value: 'hi', label: 'हिन्दी (Devanagari)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'od', label: 'ଓଡ଼ିଆ (Odia)' },
]

function SettingRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 py-1.5">{children}</div>
}

export function Settings() {
  const {
    theme,
    preferredScript,
    hapticFeedback,
    showChords,
    autoScroll,
    setTheme,
    setPreferredScript,
    toggleHapticFeedback,
    toggleShowChords,
    toggleAutoScroll,
  } = useUIStore()
  const { userName, setUserName } = useCommunityStore()

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-7"
      >
        <h1 className="text-xl font-bold text-foreground">Settings</h1>

        {/* Profile */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Profile
          </p>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-foreground">Display Name</Label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 h-9"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Appearance
          </p>
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <SettingRow>
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                <Label className="text-sm font-medium text-foreground">Dark mode</Label>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(v) => {
                  setTheme(v ? 'dark' : 'light')
                  document.documentElement.classList.toggle('dark', v)
                }}
              />
            </SettingRow>
            <Separator />
            <FontSizeSlider />
          </div>
        </section>

        {/* Language */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Language
          </p>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Preferred script</Label>
                  <p className="text-xs text-muted-foreground">Lyrics display language</p>
                </div>
              </div>
              <Select
                value={preferredScript}
                onValueChange={(v) => setPreferredScript(v as typeof preferredScript)}
              >
                <SelectTrigger className="w-40 h-9 text-xs">
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
          </div>
        </section>

        {/* Session */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            During sessions
          </p>
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <SettingRow>
              <div className="flex items-center gap-2.5">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Auto-scroll</Label>
                  <p className="text-xs text-muted-foreground">Follow active stanza</p>
                </div>
              </div>
              <Switch checked={autoScroll} onCheckedChange={toggleAutoScroll} />
            </SettingRow>
            <Separator />
            <SettingRow>
              <div className="flex items-center gap-2.5">
                <Vibrate className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Haptic feedback</Label>
                  <p className="text-xs text-muted-foreground">Vibrate on verse change</p>
                </div>
              </div>
              <Switch checked={hapticFeedback} onCheckedChange={toggleHapticFeedback} />
            </SettingRow>
            <Separator />
            <SettingRow>
              <div className="flex items-center gap-2.5">
                <MusicIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Show chords</Label>
                  <p className="text-xs text-muted-foreground">Display above lyrics</p>
                </div>
              </div>
              <Switch checked={showChords} onCheckedChange={toggleShowChords} />
            </SettingRow>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          ChorusSync v0.1.0
        </p>
      </motion.div>
    </div>
  )
}
