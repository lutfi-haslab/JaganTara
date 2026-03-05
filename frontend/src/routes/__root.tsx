import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      <nav className="px-6 py-4 border-b border-white/5 flex gap-8 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <Link 
          to="/" 
          className="text-sm uppercase tracking-widest text-zinc-500 hover:text-white transition-all duration-300 [&.active]:text-white [&.active]:font-semibold"
        >
          Jagantara
        </Link>
        <Link 
          to="/projects" 
          className="text-sm uppercase tracking-widest text-zinc-500 hover:text-white transition-all duration-300 [&.active]:text-white [&.active]:font-semibold"
        >
          Projects
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  ),
})
