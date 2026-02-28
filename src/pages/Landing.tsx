import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, Users, Sparkles, ArrowRight, QrCode } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          {/* Logo / Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/25">
            <Music className="h-10 w-10 text-white" />
          </div>

          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Chorus<span className="text-orange-500">Sync</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400 font-serif">
            Sing together. In any language. In perfect sync.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: Users, text: 'Real-time sync' },
              { icon: Sparkles, text: 'AI transliteration' },
              { icon: QrCode, text: 'Instant join' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300"
              >
                <Icon className="h-4 w-4 text-orange-500" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Join Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 w-full max-w-sm"
        >
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code (e.g., YOUTH108)"
                maxLength={20}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-center text-lg font-mono tracking-widest text-slate-50 placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!inviteCode.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:bg-orange-500 hover:shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Join Session
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-900 hover:text-slate-100"
          >
            Create a Temple / Manage Groups
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="pb-8 text-center text-xs text-slate-600">
        <p>🙏 Built for communities that sing together</p>
      </footer>
    </div>
  )
}
