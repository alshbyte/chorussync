import { Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { Settings } from '@/pages/Settings'
import { Library } from '@/pages/Library'
import { SessionHub } from '@/pages/SessionHub'
import { TempleDetail } from '@/pages/TempleDetail'
import { GroupDetail } from '@/pages/GroupDetail'
import { SongLibrary } from '@/pages/SongLibrary'
import { AddSong } from '@/pages/AddSong'
import { SongView } from '@/pages/SongView'
import { LiveSession } from '@/pages/LiveSession'
import { JoinGroup } from '@/pages/JoinGroup'

export function App() {
  return (
    <TooltipProvider>
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
      </Routes>
    </TooltipProvider>
  )
}

export default App
