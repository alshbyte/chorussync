import { motion } from 'framer-motion'
import { Plus, Users, Music } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold font-serif">My Communities</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your temples and groups
        </p>

        {/* Empty state */}
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800">
            <Users className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-300">
            No communities yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-xs">
            Create a temple to start organizing your group recitals, or join one with an invite code.
          </p>
          <button className="mt-6 flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500">
            <Plus className="h-4 w-4" />
            Create Temple
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200">
            <Music className="h-5 w-5 text-orange-500" />
            Join with Code
          </button>
          <button className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200">
            <Users className="h-5 w-5 text-orange-500" />
            Browse Temples
          </button>
        </div>
      </motion.div>
    </div>
  )
}
