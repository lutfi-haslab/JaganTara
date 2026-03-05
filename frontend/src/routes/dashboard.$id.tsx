import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { api } from '../services/api'
import { useTelemetry } from '../store/telemetry'
import { Gauge } from '../components/widgets/Gauge'
import { Switch } from '../components/widgets/Switch'
import { ValueDisplay } from '../components/widgets/ValueDisplay'
import { LineChart } from '../components/widgets/LineChart'
import { WidgetDesigner, type WidgetConfig } from '../components/widgets/WidgetDesigner'
import {
  Activity, ChevronLeft, Edit2, LayoutGrid,
  Save, Server, Settings, Smartphone, Wifi, WifiOff, X, Zap,
} from 'lucide-react'

// ─── react-grid-layout setup ──────────────────────────────────────────────────
const RGL = WidthProvider(GridLayout)
const ROW_HEIGHT = 90
const GRID_COLS = 12
const TABS = ['Dashboard', 'Timeline', 'Device Info', 'Actions Log']
const TIME_RANGES = ['Current', '1H', '6H', '1 Day', '1 Week', '1 Month', 'Custom']

export const Route = createFileRoute('/dashboard/$id')({
  component: DashboardViewer,
})

function migrateWidgets(raw: any[]): WidgetConfig[] {
  return (raw || []).map((w: any, i: number) => ({
    id: w.id ?? crypto.randomUUID(),
    type: w.type ?? 'value',
    label: w.label ?? 'Widget',
    datastream: w.datastream ?? '',
    unit: w.unit,
    min: w.min ?? 0,
    max: w.max ?? 100,
    color: w.color ?? '#a855f7',
    x: w.x ?? (i * 3) % GRID_COLS,
    y: w.y ?? Math.floor((i * 3) / GRID_COLS) * 2,
    w: w.w ?? 3,
    h: w.h ?? 2,
  }))
}

// ─── Widget Grid (react-grid-layout v1 API) ───────────────────────────────────
function WidgetGrid({
  widgets,
  isEditing,
  telemetry,
  onLayoutChange,
  onDelete,
}: {
  widgets: WidgetConfig[]
  isEditing: boolean
  telemetry: Record<string, string>
  onLayoutChange: (l: any[]) => void
  onDelete: (id: string) => void
}) {
  const layout = widgets.map(w => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    minW: 2,
    minH: 1,
  }))

  return (
    <RGL
      layout={layout}
      cols={GRID_COLS}
      rowHeight={ROW_HEIGHT}
      isDraggable={isEditing}
      isResizable={isEditing}
      compactType={null}
      preventCollision={false}
      onLayoutChange={onLayoutChange}
      margin={[12, 12]}
      containerPadding={[0, 0]}
    >
      {widgets.map(widget => (
        <div
          key={widget.id}
          className={`group relative rounded-2xl overflow-hidden transition-all duration-200 ${
            isEditing ? 'ring-1 ring-purple-500/30 cursor-move hover:ring-purple-400/50' : ''
          }`}
          style={{
            background: 'rgba(16,16,26,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Delete button (edit mode) */}
          {isEditing && (
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onDelete(widget.id) }}
              className="absolute top-2 right-2 z-20 p-1 bg-zinc-900/90 hover:bg-red-600 rounded-lg text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={11} />
            </button>
          )}

          {/* Edit mode dashed border */}
          {isEditing && (
            <div className="absolute inset-0 border border-dashed border-purple-500/20 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
          )}

          <div className="w-full h-full">
            {widget.type === 'gauge' && (
              <Gauge label={widget.label} value={parseFloat(telemetry[widget.datastream] || '0')} min={widget.min} max={widget.max} unit={widget.unit} />
            )}
            {widget.type === 'switch' && (
              <Switch label={widget.label} isOn={telemetry[widget.datastream] === 'true' || telemetry[widget.datastream] === '1'} onToggle={v => console.log('toggle', widget.datastream, v)} />
            )}
            {widget.type === 'value' && (
              <ValueDisplay label={widget.label} value={telemetry[widget.datastream] || '—'} />
            )}
            {widget.type === 'chart' && (
              <LineChart label={widget.label} value={telemetry[widget.datastream] || '0'} unit={widget.unit} color={widget.color} />
            )}
          </div>
        </div>
      ))}
    </RGL>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function DashboardViewer() {
  const { id } = Route.useParams()
  const [dashboard, setDashboard] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [devices, setDevices] = useState<any[]>([])
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showDesigner, setShowDesigner] = useState(false)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'live' | 'offline'>('connecting')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [timeRange, setTimeRange] = useState('Current')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    api.dashboards.get(id).then(data => {
      setDashboard(data)
      setWidgets(migrateWidgets(data.config?.widgets))
      if (data.projectId) {
        api.projects.devices(data.projectId).then(setDevices).catch(() => {})
        api.projects.get(data.projectId).then(setProject).catch(() => {})
      }
    })
  }, [id])

  const telemetry = useTelemetry(dashboard?.projectId ?? '')

  useEffect(() => {
    let ws: WebSocket, timer: ReturnType<typeof setTimeout>
    function connect() {
      ws = new WebSocket('ws://localhost:4001')
      ws.onopen = () => setWsStatus('live')
      ws.onerror = () => setWsStatus('offline')
      ws.onclose = () => { setWsStatus('offline'); timer = setTimeout(connect, 3000) }
    }
    connect()
    return () => { clearTimeout(timer); ws?.close() }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 3000)
  }

  // Efficient layout change using Map lookups
  const onLayoutChange = useCallback((newLayout: any[]) => {
    const map = new Map(newLayout.map(l => [l.i, l]))
    setWidgets(prev => prev.map(w => {
      const l = map.get(w.id)
      return l ? { ...w, x: l.x, y: l.y, w: l.w, h: l.h } : w
    }))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.dashboards.update(id, { config: { widgets } })
      showToast('Dashboard saved!')
      setIsEditing(false)
    } finally { setSaving(false) }
  }

  if (!dashboard) return (
    <div className="h-screen flex items-center justify-center gap-3 text-zinc-500">
      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading dashboard…</span>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-[#09090f] text-zinc-100 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl text-sm">
          <span className="text-green-400">✓</span> {toast}
          <button onClick={() => setToast(null)} className="text-zinc-600 hover:text-white ml-1"><X size={13} /></button>
        </div>
      )}

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-[52px] border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center px-4 gap-3 z-50">
        <Link to="/projects" className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white">
          <ChevronLeft size={18} />
        </Link>
        <div className="w-px h-5 bg-white/8" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(147,51,234,0.4)]">
            <Activity size={13} />
          </div>
          <span className="font-bold text-sm">Jagantara</span>
        </div>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-500">{project?.name}</span>
        <span className="text-zinc-700">/</span>
        <span className="text-sm font-semibold">{dashboard.name}</span>

        <div className="flex-1" />

        {/* WS status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
          wsStatus === 'live' ? 'text-green-400 border-green-500/20 bg-green-500/8' :
          wsStatus === 'connecting' ? 'text-yellow-300 border-yellow-500/20 bg-yellow-500/8' :
          'text-zinc-500 border-zinc-700 bg-zinc-800/50'
        }`}>
          {wsStatus === 'live' ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span className="font-medium">{wsStatus === 'live' ? 'Live' : wsStatus === 'connecting' ? 'Connecting…' : 'Offline'}</span>
        </div>

        {/* Edit toggle */}
        <button
          onClick={() => setIsEditing(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isEditing
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Edit2 size={12} />
          {isEditing ? 'Editing…' : 'Edit Layout'}
        </button>

        {isEditing && (
          <>
            <button
              onClick={() => setShowDesigner(true)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-all"
            >
              + Widgets
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {saving
                ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                : <Save size={12} />
              }
              Save
            </button>
          </>
        )}

        <button className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
          <Settings size={15} />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ──────────────────────────────────────────── */}
        <aside className={`flex-shrink-0 border-r border-white/5 bg-zinc-950/50 flex flex-col transition-all duration-200 ${sidebarOpen ? 'w-52' : 'w-[52px]'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center h-10 border-b border-white/5 text-zinc-600 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <LayoutGrid size={14} />
          </button>
          <nav className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
            {sidebarOpen ? (
              <div className="space-y-4 pt-1">
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-700 px-2 mb-1">Devices</p>
                  {devices.length === 0 && <p className="text-[10px] text-zinc-700 px-2 py-1">No devices</p>}
                  {devices.map(d => (
                    <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 cursor-pointer group">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      <span className="text-xs text-zinc-400 group-hover:text-white transition-colors truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-700 px-2 mb-1">Current</p>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <LayoutGrid size={12} className="text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-purple-300 truncate font-medium">{dashboard.name}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-700 px-2 mb-1">Navigate</p>
                  <Link to="/projects" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 text-zinc-500 hover:text-white transition-colors text-xs">
                    <Server size={12} /> All Projects
                  </Link>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs">
                    <Smartphone size={12} /> Mobile App
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs">
                    <Zap size={12} /> Flow Engine
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 pt-1">
                <button title="Devices" className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white"><Server size={16} /></button>
                <button title="Dashboard" className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><LayoutGrid size={16} /></button>
                <button title="Mobile" className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white"><Smartphone size={16} /></button>
                <button title="Flows" className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white"><Zap size={16} /></button>
              </div>
            )}
          </nav>
        </aside>

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex-shrink-0 border-b border-white/5 bg-zinc-950/30">
            <div className="flex items-center px-5">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-medium transition-all relative ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab}
                  {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_#a855f7]" />}
                </button>
              ))}
            </div>
            {activeTab === 'Dashboard' && (
              <div className="flex items-center gap-1.5 px-5 pb-2.5">
                {TIME_RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeRange === r
                        ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]'
                        : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Widget canvas */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {activeTab === 'Dashboard' && (
              widgets.length === 0 ? (
                <div className="min-h-[400px] h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-3xl">
                  <LayoutGrid size={48} className="text-zinc-700" />
                  <p className="text-zinc-500 font-medium text-sm">No widgets yet</p>
                  <button
                    onClick={() => { setIsEditing(true); setShowDesigner(true) }}
                    className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm text-zinc-300 font-semibold transition-all"
                  >
                    Open Designer →
                  </button>
                </div>
              ) : (
                <WidgetGrid
                  widgets={widgets}
                  isEditing={isEditing}
                  telemetry={telemetry}
                  onLayoutChange={onLayoutChange}
                  onDelete={wid => setWidgets(p => p.filter(w => w.id !== wid))}
                />
              )
            )}
            {activeTab === 'Timeline' && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Timeline — Coming Soon</div>
            )}
            {activeTab === 'Device Info' && (
              <div className="max-w-lg space-y-3">
                {devices.map(d => (
                  <div key={d.id} className="p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                    <p className="font-semibold text-sm">{d.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">Type: {d.type}</p>
                    <p className="text-xs mt-0.5">Status: <span className={d.status === 'online' ? 'text-green-400' : 'text-zinc-500'}>{d.status}</span></p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {d.datastreams?.map((ds: any) => (
                        <span key={ds.id} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400 font-mono">
                          {ds.key} ({ds.type})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Actions Log' && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Actions Log — Coming Soon</div>
            )}
          </div>
        </div>
      </div>

      {/* Widget Designer slide-in */}
      {showDesigner && (
        <WidgetDesigner
          dashboardId={id}
          widgets={widgets}
          devices={devices}
          onSave={newWidgets => { setWidgets(newWidgets); showToast('Widgets updated!'); setShowDesigner(false) }}
          onClose={() => setShowDesigner(false)}
        />
      )}
    </div>
  )
}
