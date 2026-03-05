import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useTelemetry } from '../store/telemetry'
import { Gauge } from '../components/widgets/Gauge'
import { Switch } from '../components/widgets/Switch'
import { ValueDisplay } from '../components/widgets/ValueDisplay'
import { Grid, Plus, Edit2, Play, Save, Settings, X } from 'lucide-react'

export const Route = createFileRoute('/dashboard/$id')({
  component: DashboardViewer,
})

function DashboardViewer() {
  const { id } = Route.useParams()
  const [dashboard, setDashboard] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [widgets, setWidgets] = useState<any[]>([])
  
  useEffect(() => {
    // Actually the project id should be derived from the dashboard
    // For now we assume we can fetch dashboard by its id
    fetch(`http://localhost:4000/api/dashboards/${id}`).then(r => r.json()).then(data => {
        setDashboard(data);
        setWidgets(data.config.widgets || []);
    });
  }, [id])

  const telemetry = useTelemetry(dashboard?.projectId || '');

  if (!dashboard) return <div className="p-20 text-center animate-pulse">Initializing Dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
       {/* Dashboard Toolbar */}
       <header className="px-6 py-4 bg-zinc-900/50 backdrop-blur-3xl border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Grid size={18} />
             </div>
             <div>
                <h1 className="text-sm font-bold uppercase tracking-[0.2em]">{dashboard.name}</h1>
                <p className="text-[10px] text-zinc-500 font-mono">ID: {dashboard.id}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {isEditing ? (
                <>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs font-bold transition-all">
                      <Plus size={14} /> Add Widget
                   </button>
                   <button 
                     onClick={() => setIsEditing(false)}
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-md text-xs font-bold transition-all"
                   >
                      <Save size={14} /> Save Layout
                   </button>
                </>
             ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700/80 rounded-md text-xs font-bold transition-all text-zinc-400"
                >
                   <Edit2 size={14} /> Designer
                </button>
             )}
             <button className="p-2 bg-zinc-800/50 rounded-md text-zinc-500 hover:text-white transition-all"><Settings size={16} /></button>
          </div>
       </header>

       {/* Grid Area */}
       <main className="flex-1 p-8">
          <div className="grid grid-cols-12 auto-rows-[120px] gap-4">
             {widgets.map((widget, i) => (
               <div 
                 key={i} 
                 className="relative group bg-zinc-950/40 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10"
                 style={{
                    gridColumn: `span ${widget.w || 2}`,
                    gridRow: `span ${widget.h || 2}`
                 }}
               >
                  {isEditing && (
                    <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-[2px] border-2 border-dashed border-purple-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-move">
                       <div className="flex gap-2">
                          <button className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white"><Settings size={14} /></button>
                          <button className="p-2 bg-red-900/50 rounded-lg text-red-400 hover:bg-red-500 hover:text-white"><X size={14} /></button>
                       </div>
                    </div>
                  )}
                  {widget.type === 'gauge' && (
                    <Gauge 
                      label={widget.label} 
                      value={parseFloat(telemetry[widget.datastream] || '0')} 
                      unit={widget.unit}
                    />
                  )}
                  {widget.type === 'switch' && (
                    <Switch 
                      label={widget.label} 
                      isOn={telemetry[widget.datastream] === 'true' || telemetry[widget.datastream] === '1'} 
                      onToggle={(val) => {
                          // TODO: Implement command emit
                          console.log('Toggle', widget.datastream, val);
                      }}
                    />
                  )}
                  {widget.type === 'value' && (
                    <ValueDisplay 
                       label={widget.label}
                       value={telemetry[widget.datastream] || 'N/A'}
                    />
                  )}
               </div>
             ))}
             
             {widgets.length === 0 && !isEditing && (
               <div className="col-span-12 py-32 text-center border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center">
                  <Play size={40} className="text-zinc-700 mb-4" />
                  <p className="text-zinc-600 mb-6 font-medium">This dashboard is blank.</p>
                  <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all text-sm font-bold">Launch Designer</button>
               </div>
             )}
          </div>
       </main>
    </div>
  )
}
