import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, Users, Sparkles, ArrowRight, QrCode, Globe, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const features = [
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Leader controls the stanza — every screen follows instantly.',
  },
  {
    icon: Globe,
    title: 'Multi-Script',
    description: 'Hindi, Telugu, Tamil, Odia, English — AI transliterates on the fly.',
  },
  {
    icon: QrCode,
    title: 'Instant Join',
    description: 'Scan a QR code or type a short invite code. No sign-up needed.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Organize temples, create groups, build your song library together.',
  },
]

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-lg"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-xl shadow-orange-600/30"
          >
            <Music className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">
            Chorus<span className="text-primary">Sync</span>
          </h1>

          <p className="mt-4 text-lg text-muted-foreground font-serif leading-relaxed">
            Sing together. In any language. In perfect sync.
          </p>

          {/* Feature badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Real-time
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Multi-script
            </Badge>
          </div>
        </motion.div>

        {/* Join Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 w-full max-w-sm"
        >
          <form onSubmit={handleJoin} className="space-y-3">
            <Input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code (e.g., YOUTH108)"
              maxLength={20}
              className="h-13 text-center text-lg font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm bg-card border-border"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!inviteCode.trim()}
              className="w-full text-base gap-2 h-12 shadow-lg shadow-primary/25"
            >
              Join Session
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full h-12"
          >
            Create a Temple / Manage Groups
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto max-w-lg"
        >
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <feature.icon className="h-5 w-5 text-primary mb-2" />
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="pb-8 text-center text-xs text-muted-foreground/50">
        <p>🙏 Built for communities that sing together</p>
      </footer>
    </div>
  )
}
