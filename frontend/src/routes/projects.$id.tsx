import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Layout, Smartphone, Activity, Zap, Settings, ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/projects/$id')({
  component: ProjectDetail,
})

function ProjectDetail() {
  const { id } = Route.useParams()
  const [project, setProject] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('devices')

  useEffect(() => {
    api.projects.get(id)
      .then(setProject)
      .catch(() => setError('Project not found or connection error'))
  }, [id])

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-2xl font-bold mb-4">{error}</h2>
      <Link to="/projects" className="text-purple-400 hover:text-purple-300">Return to Projects &rarr;</Link>
    </div>
  )

  if (!project) return (

    <div className="h-[500px] flex items-center justify-center">
      <div className="status-pulse-online" />
      <span className="ml-4 text-zinc-500">Loading project...</span>
    </div>
  )

  const tabs = [
    { id: 'devices', label: 'Devices', icon: Activity },
    { id: 'web', label: 'Web Dashboards', icon: Layout },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone },
    { id: 'flow', label: 'Flow Engine', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="px-8 py-6 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/projects" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <span className="px-3 py-1 bg-zinc-800 text-xs font-mono text-zinc-400 rounded-full border border-white/5">
            {project.id.slice(0, 8)}
          </span>
        </div>

        <nav className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto bg-zinc-950/30 p-8 custom-scrollbar">
          {activeTab === 'devices' && <DeviceList projectId={id} />}
          {activeTab === 'web' && <DashboardList type="web" projectId={id} />}
          {activeTab === 'mobile' && <DashboardList type="mobile_app" projectId={id} />}
          {activeTab === 'flow' && <div className="text-zinc-500 text-center py-20 font-medium">Visual Flow Designer Coming Soon</div>}
          {activeTab === 'settings' && <div className="text-zinc-500 text-center py-20 font-medium text-sm">Project Configurations</div>}
      </main>
    </div>
  )
}

function DeviceList({ projectId }: { projectId: string }) {
  const [devices, setDevices] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('ESP32')

  const fetchDevices = () => api.projects.devices(projectId).then(setDevices)

  useEffect(() => {
    fetchDevices()
  }, [projectId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.projects.createDevice(projectId, { name, type })
    setName('')
    setShowCreate(false)
    fetchDevices()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {devices.map(device => (
         <div key={device.id} className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h4 className="font-semibold text-lg">{device.name}</h4>
                  <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{device.type}</p>
               </div>
               <div className={`status-pulse ${device.status === 'online' ? 'status-pulse-online' : 'status-pulse-offline'}`} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
               {device.datastreams?.map((ds: any) => (
                 <span key={ds.id} className="px-2 py-1 bg-zinc-800/50 rounded-md text-[10px] uppercase tracking-wider text-zinc-400 border border-white/5">
                    {ds.key}: {ds.type}
                 </span>
               ))}
               <button className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[10px] uppercase text-purple-400 font-bold border border-purple-500/20">
                  + Add Stream
               </button>
            </div>
         </div>
       ))}
       <button 
          onClick={() => setShowCreate(true)}
          className="p-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/10 transition-all"
        >
          <Activity size={32} className="mb-2" />
          <span>Add New Device</span>
       </button>

       {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Provision New Device</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Device Name</label>
                <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Living Room Controller" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Device Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl text-white outline-none focus:border-purple-500 transition-colors">
                  <option>ESP32</option>
                  <option>ESP8266</option>
                  <option>Raspberry Pi</option>
                  <option>Arduino</option>
                  <option>Generic MQTT</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl">Cancel</button>
                <button type="submit" className="flex-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold">Register Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardList({ type, projectId }: { type: 'web' | 'mobile_app', projectId: string }) {
    const [dashboards, setDashboards] = useState<any[]>([])
    const [showCreate, setShowCreate] = useState(false)
    const [name, setName] = useState('')

    const fetchDashboards = () => api.projects.dashboards(projectId).then(setDashboards)

    useEffect(() => {
      fetchDashboards()
    }, [projectId])

    const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault()
      await api.projects.createDashboard(projectId, { name, type, config: { widgets: [] } })
      setName('')
      setShowCreate(false)
      fetchDashboards()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {dashboards.filter(d => d.type === type).map(dashboard => (
             <Link 
               key={dashboard.id} 
               to={type === 'web' ? "/dashboard/$id" : "/dashboard/mobile/$id"}
               params={{ id: dashboard.id }}
               className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   {type === 'web' ? <Layout size={60} /> : <Smartphone size={60} />}
                </div>
                <h4 className="font-semibold text-xl mb-1">{dashboard.name}</h4>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-6">
                   {type === 'web' ? 'Web Analytics' : 'Mobile Interface'}
                </p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                   <span className="text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300">
                     Design Mode &rarr;
                   </span>
                   <button className="text-zinc-500 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}><Settings size={16} /></button>
                </div>
             </Link>
           ))}
           <button 
              onClick={() => setShowCreate(true)}
              className="p-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/10 transition-all font-medium"
            >
              {type === 'web' ? <Layout size={32} className="mb-2" /> : <Smartphone size={32} className="mb-2" />}
              <span>New {type === 'web' ? 'Analytics Dashboard' : 'Mobile Controller'}</span>
           </button>

           {showCreate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6">Create {type === 'web' ? 'Web Dashboard' : 'Mobile Interface'}</h2>
                  <form onSubmit={handleCreate}>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Display Name</label>
                      <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Master Control Panel" />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl">Cancel</button>
                      <button type="submit" className="flex-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold">Create</button>
                    </div>
                  </form>
                </div>
              </div>
           )}
        </div>
    )
}
