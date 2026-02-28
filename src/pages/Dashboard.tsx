import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Music, Library, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">My Communities</h1>
          <p className="text-sm text-muted-foreground">
            Your temples, groups & sessions
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No communities yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
            Create a temple to organize recitals, or join with an invite code.
          </p>
          <Button className="mt-5 gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Create Temple
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50 active:scale-[0.98]"
            onClick={() => navigate('/')}
          >
            <CardContent className="flex items-center gap-3 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Join with Code</span>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50 active:scale-[0.98]"
          >
            <CardContent className="flex items-center gap-3 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Library className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Browse Songs</span>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
            How it works
          </p>
          <div className="space-y-1.5">
            {[
              { n: '1', title: 'Create a Temple', desc: 'Set up your community space' },
              { n: '2', title: 'Add Songs', desc: 'AI structures & transliterates lyrics' },
              { n: '3', title: 'Start a Session', desc: 'Everyone follows in real-time' },
            ].map((item) => (
              <button
                key={item.n}
                className="w-full flex items-center gap-3.5 rounded-xl p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                  {item.n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
