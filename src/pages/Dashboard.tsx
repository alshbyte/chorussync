import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Music, Library, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-serif">My Communities</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Temples, groups & live sessions
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Beta
          </Badge>
        </div>

        {/* Empty State */}
        <Card className="mt-6 border-dashed bg-card/30">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4 text-base">No communities yet</CardTitle>
            <CardDescription className="mt-2 max-w-xs">
              Create a temple to start organizing your group recitals, or join one with an invite code.
            </CardDescription>
            <Button className="mt-6 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Create Temple
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card
            className="cursor-pointer bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
            onClick={() => navigate('/join')}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Join with Code</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer bg-card/50 hover:bg-card hover:border-primary/30 transition-all">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <Library className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Browse Songs</span>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            How it works
          </h2>
          <div className="space-y-2">
            {[
              { step: '1', title: 'Create a Temple', desc: 'Set up your community space' },
              { step: '2', title: 'Add Songs', desc: 'AI helps structure & transliterate lyrics' },
              { step: '3', title: 'Start a Session', desc: 'Everyone follows your lead in real-time' },
            ].map((item) => (
              <Card key={item.step} className="bg-card/30">
                <CardContent className="flex items-center gap-4 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
