import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'
import { useCommunityStore } from '@/stores/community-store'
import { subscribeToSessions } from '@/lib/supabase-db'
import { Loader2 } from 'lucide-react'

// Code-split heavy pages
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))
const Library = lazy(() => import('@/pages/Library').then(m => ({ default: m.Library })))
const SessionHub = lazy(() => import('@/pages/SessionHub').then(m => ({ default: m.SessionHub })))
const TempleDetail = lazy(() => import('@/pages/TempleDetail').then(m => ({ default: m.TempleDetail })))
const GroupDetail = lazy(() => import('@/pages/GroupDetail').then(m => ({ default: m.GroupDetail })))
const SongLibrary = lazy(() => import('@/pages/SongLibrary').then(m => ({ default: m.SongLibrary })))
const AddSong = lazy(() => import('@/pages/AddSong').then(m => ({ default: m.AddSong })))
const SongView = lazy(() => import('@/pages/SongView').then(m => ({ default: m.SongView })))
const LiveSession = lazy(() => import('@/pages/LiveSession').then(m => ({ default: m.LiveSession })))
const JoinGroup = lazy(() => import('@/pages/JoinGroup').then(m => ({ default: m.JoinGroup })))

function Fallback() {
  return <LoadingSkeleton lines={4} />
}

export function App() {
  const loadFromCloud = useCommunityStore((s) => s.loadFromCloud)
  const refreshSessions = useCommunityStore((s) => s.refreshSessions)
  const loaded = useCommunityStore((s) => s.loaded)

  // Load data from Supabase on mount
  useEffect(() => {
    loadFromCloud()
  }, [loadFromCloud])

  // Subscribe to realtime session changes
  useEffect(() => {
    const channel = subscribeToSessions(() => {
      refreshSessions()
    })
    return () => { channel.unsubscribe() }
  }, [refreshSessions])

  // Show loading screen while initial data loads (skip for landing page)
  if (!loaded && typeof window !== 'undefined' && window.location.pathname !== '/') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your communities…</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join/:code" element={<JoinGroup />} />
          <Route path="/session/:groupId" element={<LiveSession />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/session" element={<SessionHub />} />
            <Route path="/temple/:templeId" element={<TempleDetail />} />
            <Route path="/temple/:templeId/songs" element={<SongLibrary />} />
            <Route path="/temple/:templeId/songs/new" element={<AddSong />} />
            <Route path="/temple/:templeId/songs/:songId" element={<SongView />} />
            <Route path="/group/:groupId" element={<GroupDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </TooltipProvider>
  )
}

export default App
