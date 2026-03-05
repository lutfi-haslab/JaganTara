import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Plus, Folder, Layout, Smartphone, Activity } from 'lucide-react'
import { TopNav } from '../components/TopNav'

export const Route = createLazyFileRoute('/projects/')({
  component: Projects,
})

function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  const fetchProjects = async () => {
    const data = await api.projects.list()
    setProjects(data)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    await api.projects.create({ name })
    setName('')
    setShowCreate(false)
    fetchProjects()
  }

  return (
    <div>
      <TopNav />
      <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Projects</h1>
          <p className="text-zinc-500">Manage your IoT environments and dashboards.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-medium transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link 
            key={project.id}
            to="/projects/$id"
            params={{ id: project.id }}
            className="group block p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Folder size={80} />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Folder size={18} className="text-purple-500" />
              {project.name}
            </h3>
            <p className="text-zinc-500 text-sm mb-6 line-clamp-2 min-h-10">
              {project.description || 'No description provided.'}
            </p>
            
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Layout size={14} />
                <span>2 Dashboards</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Smartphone size={14} />
                <span>1 App</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-500/80">
                <Activity size={14} className="status-pulse-online" />
                <span>3 Online</span>
              </div>
            </div>
          </Link>
        ))}
        
        {projects.length === 0 && !showCreate && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <Folder size={48} className="mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-medium text-zinc-400">No projects yet</h3>
            <p className="text-zinc-600 mb-8">Start by creating your first IoT project.</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Create Project &rarr;
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Project Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                  placeholder="e.g. Smart Home Office"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
