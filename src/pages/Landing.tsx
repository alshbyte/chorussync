import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Landing() {
  const [inviteCode, setInviteCode] = useState('')
  const navigate = useNavigate()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode.trim()) {
      navigate(`/join/${inviteCode.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25"
          >
            <Music className="h-9 w-9 text-primary-foreground" />
          </motion.div>

          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
            Chorus<span className="text-primary">Sync</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Real-time lyrics for group singing.<br />
            <span className="text-foreground/70">Any language. Every device. One leader.</span>
          </p>
        </motion.div>

        {/* Join Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 w-full max-w-sm space-y-3"
        >
          <form onSubmit={handleJoin} className="space-y-3">
            <Input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              maxLength={20}
              className="h-13 text-center text-base font-mono tracking-[0.2em] rounded-xl border-2 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:border-primary"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!inviteCode.trim()}
              className="w-full h-12 text-base gap-2 font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              Join Session
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 text-sm rounded-xl border-2"
          >
            Create or manage a community
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-14 w-full max-w-sm"
        >
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: '⚡', text: 'Leader taps a verse — everyone sees it' },
              { icon: '🌐', text: 'AI transliterates Hindi, Telugu, Tamil & more' },
              { icon: '📱', text: 'Works offline as an installable app' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm text-foreground/70">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground/60">
        ChorusSync · Built for communities that sing together
      </footer>
    </div>
  )
}
