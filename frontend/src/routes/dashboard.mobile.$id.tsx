import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTelemetry } from '../store/telemetry'
import { Gauge } from '../components/widgets/Gauge'
import { Switch } from '../components/widgets/Switch'
import { ValueDisplay } from '../components/widgets/ValueDisplay'
import { ChevronLeft, MoreHorizontal, Settings, Smartphone } from 'lucide-react'

export const Route = createFileRoute('/dashboard/mobile/$id')({
  component: MobileDashboardViewer,
})

function MobileDashboardViewer() {
  const { id } = Route.useParams()
  const [dashboard, setDashboard] = useState<any>(null)
  
  useEffect(() => {
    fetch(`http://localhost:4000/api/dashboards/${id}`).then(r => r.json()).then(data => {
        setDashboard(data);
    });
  }, [id])

  const telemetry = useTelemetry(dashboard?.projectId || '');

  if (!dashboard) return <div className="p-20 text-center">Loading Mobile View...</div>;

  const blocks = dashboard.config.blocks || [];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans max-w-md mx-auto border-x border-white/5 shadow-2xl overflow-hidden">
       {/* Mobile App Header */}
       <header className="px-6 py-8 flex justify-between items-center bg-zinc-950/20 backdrop-blur-xl border-b border-white/5">
          <div className="p-2 bg-zinc-900 rounded-xl">
             <ChevronLeft size={20} />
          </div>
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold tracking-widest uppercase mb-1">{dashboard.name}</span>
             <div className="flex items-center gap-1.5">
                <div className="status-pulse status-pulse-online" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Connected</span>
             </div>
          </div>
          <div className="p-2 bg-zinc-900 rounded-xl">
             <MoreHorizontal size={20} />
          </div>
       </header>

       {/* Block Content */}
       <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 jagantara-mobile-stack custom-scrollbar">
          {blocks.map((block: any, i: number) => (
             <section key={i} className="w-full">
                {block.type === 'gauge' && (
                  <div className="jagantara-mobile-card">
                    <Gauge label={block.label} value={parseFloat(telemetry[block.datastream] || '0')} unit={block.unit} />
                  </div>
                )}
                {block.type === 'switch' && (
                  <div className="jagantara-mobile-card">
                    <Switch label={block.label} isOn={telemetry[block.datastream] === 'true' || telemetry[block.datastream] === '1'} onToggle={() => {}} />
                  </div>
                )}
                {block.type === 'value' && (
                  <div className="jagantara-mobile-card h-32">
                    <ValueDisplay label={block.label} value={telemetry[block.datastream] || '---'} />
                  </div>
                )}
                {block.type === 'header' && (
                   <h2 className="text-lg font-bold px-2 py-4">{block.text}</h2>
                )}
             </section>
          ))}
          
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
               <Smartphone size={60} className="mb-4" />
               <p className="font-semibold">Your mobile app is empty.</p>
               <p className="text-xs">Add blocks from the designer on your PC.</p>
            </div>
          )}
       </main>

       {/* Bottom Nav Simulation */}
       <nav className="p-6 bg-zinc-950/80 backdrop-blur-3xl border-t border-white/5 flex justify-around items-center">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Smartphone size={20} /></div>
          <div className="p-3 text-zinc-600"><Settings size={20} /></div>
       </nav>
    </div>
  )
}
