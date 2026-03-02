import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'

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
