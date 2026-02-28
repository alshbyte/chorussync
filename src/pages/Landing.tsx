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
    <div className="min-h-screen flex flex-col bg-background bg-radial-glow">
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
            className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/20"
          >
            <Music className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Chorus<span className="text-primary">Sync</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Real-time lyrics for group singing.<br />
            Any language. Every device. One leader.
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
              placeholder="Invite code (e.g. YOUTH108)"
              maxLength={20}
              className="h-12 text-center text-base font-mono tracking-[0.2em] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!inviteCode.trim()}
              className="w-full h-12 text-base gap-2 font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
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
            className="w-full h-11 text-sm"
          >
            Create or manage a community
          </Button>
        </motion.div>

        {/* Features — minimal, one line each */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 w-full max-w-sm"
        >
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            {[
              '⚡ Leader taps a verse — everyone sees it instantly',
              '🌐 AI transliterates Hindi, Telugu, Tamil & more',
              '📱 Works offline as an installable app',
            ].map((text) => (
              <p key={text} className="text-center leading-relaxed">{text}</p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground/40">
        ChorusSync · Built for communities that sing together
      </footer>
    </div>
  )
}
