import { Link } from '@tanstack/react-router'
import { Activity } from 'lucide-react'

export function TopNav() {
  return (
    <nav className="px-6 py-4 border-b border-white/5 flex items-center gap-8 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(147,51,234,0.4)]">
          <Activity size={14} />
        </div>
        <span className="font-bold text-sm tracking-tight">Jagantara</span>
      </Link>
      <Link to="/projects" className="text-sm text-zinc-500 hover:text-white transition-colors [&.active]:text-white [&.active]:font-semibold">
        Projects
      </Link>
    </nav>
  )
}
