import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Users, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCommunityStore } from '@/stores/community-store'

export function JoinGroup() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const store = useCommunityStore()
  const [name, setName] = useState(store.userName)
  const [result, setResult] = useState<{
    type: 'temple' | 'group'
    id: string
    templeId: string
  } | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (!code) return
    const upper = code.toUpperCase()
    const temple = store.temples.find((t) => t.inviteCode === upper)
    if (temple) {
      setResult({ type: 'temple', id: temple.id, templeId: temple.id })
      return
    }
    const group = store.groups.find((g) => g.inviteCode === upper)
    if (group) {
      setResult({ type: 'group', id: group.id, templeId: group.templeId })
      return
    }
    setNotFound(true)
  }, [code])

  const handleJoin = () => {
    if (!code) return
    store.setUserName(name.trim() || 'Singer')
    const r = store.joinByCode(code)
    if (r) {
      setJoined(true)
      setTimeout(() => {
        if (r.type === 'group') {
          navigate(`/group/${r.id}`)
        } else {
          navigate(`/temple/${r.id}`)
        }
      }, 600)
    }
  }

  const groupInfo = result?.type === 'group' ? store.groups.find((g) => g.id === result.id) : null
  const templeInfo = result ? store.temples.find((t) => t.id === result.templeId) : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-radial-glow px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Music className="h-7 w-7 text-primary-foreground" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Joining with code
          </p>
          <p className="font-mono text-lg tracking-widest font-semibold">
            {code?.toUpperCase()}
          </p>
        </div>

        {notFound && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 text-left">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Code not found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check the code and try again, or ask the group leader.
              </p>
            </div>
          </div>
        )}

        {result && !joined && (
          <>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    {groupInfo?.name || templeInfo?.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                </div>
              </div>
            </div>

            <div className="text-left">
              <Label>Your Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1.5"
              />
            </div>

            <Button onClick={handleJoin} className="w-full h-12 gap-2 text-base" size="lg">
              Join <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {joined && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-primary text-lg font-semibold"
          >
            ✓ Joined!
          </motion.div>
        )}

        {notFound && (
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        )}
      </motion.div>
    </div>
  )
}
