import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTelemetry } from '../store/telemetry'
import { Gauge } from '../components/widgets/Gauge'
import { Switch } from '../components/widgets/Switch'
import { ValueDisplay } from '../components/widgets/ValueDisplay'
import { LineChart } from '../components/widgets/LineChart'
import { api } from '../services/api'
import {
  ChevronLeft, ChevronDown, ChevronUp, Edit2, MoreHorizontal,
  Plus, Save, Settings, Smartphone, Wifi, WifiOff, X,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/mobile/$id')({
  component: MobileDashboardViewer,
})

// ─── Types ──────────────────────────────────────────────────────────────────
interface MobileBlock {
  id: string
  type: 'gauge' | 'switch' | 'value' | 'chart' | 'header' | 'spacer'
  label?: string
  datastream?: string
  unit?: string
  color?: string
  text?: string   // for header blocks
  height?: number // for spacer blocks
}

const BLOCK_TYPES: { type: MobileBlock['type']; icon: string; label: string }[] = [
  { type: 'value',  icon: '⟡', label: 'Value Display' },
  { type: 'gauge',  icon: '◑', label: 'Gauge' },
  { type: 'chart',  icon: '↗', label: 'Line Chart' },
  { type: 'switch', icon: '⏻', label: 'Switch' },
  { type: 'header', icon: '§', label: 'Header Text' },
  { type: 'spacer', icon: '↕', label: 'Spacer' },
]

function makeBlock(): MobileBlock {
  return { id: crypto.randomUUID(), type: 'value', label: 'New Block', datastream: '', unit: '' }
}

// ─── Mobile Designer Panel ──────────────────────────────────────────────────
function MobileDesigner({
  blocks,
  devices,
  onSave,
  onClose,
}: {
  blocks: MobileBlock[]
  devices: any[]
  onSave: (blocks: MobileBlock[]) => void
  onClose: () => void
}) {
  const [list, setList] = useState<MobileBlock[]>(blocks)
  const [sel, setSel] = useState<number | null>(list.length > 0 ? 0 : null)

  const dsOptions = devices.flatMap((d: any) =>
    (d.datastreams || []).map((ds: any) => ({ value: `${d.id}.${ds.id}`, label: `${d.name} › ${ds.key}` }))
  )

  const add = () => {
    const b = makeBlock()
    setList(p => [...p, b])
    setSel(list.length)
  }
  const del = (i: number) => { setList(p => p.filter((_, idx) => idx !== i)); setSel(null) }
  const moveUp = (i: number) => {
    if (i === 0) return
    setList(p => { const a = [...p]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a })
    setSel(i - 1)
  }
  const moveDown = (i: number) => {
    setList(p => {
      if (i >= p.length - 1) return p
      const a = [...p]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a
    })
    setSel(i + 1)
  }
  const upd = (i: number, patch: Partial<MobileBlock>) =>
    setList(p => p.map((b, idx) => idx === i ? { ...b, ...patch } : b))

  const cur = sel !== null ? list[sel] : null
  const inputCls = 'w-full px-3 py-2 bg-zinc-900 border border-white/8 rounded-xl text-sm text-white outline-none focus:border-purple-500 transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold'

  return (
    <div className="fixed inset-0 z-[100] flex" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="flex-1" onClick={onClose} />
      <aside className="w-[460px] bg-[#0c0c18] border-l border-white/8 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold">Mobile Designer</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{list.length} block{list.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onSave(list)} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-all">
              Save
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><X size={16} /></button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Block list */}
          <div className="w-44 border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {list.map((b, i) => (
                <div key={b.id} className={`flex items-center gap-1 mb-1 rounded-xl border transition-all ${
                  sel === i ? 'bg-purple-500/15 border-purple-500/25' : 'border-transparent hover:bg-zinc-800/40'
                }`}>
                  <button onClick={() => setSel(i)} className="flex-1 text-left p-2.5 min-w-0 text-xs">
                    <div className={`font-medium truncate ${sel === i ? 'text-white' : 'text-zinc-400'}`}>{b.label || b.text || 'Block'}</div>
                    <div className="text-[10px] text-zinc-600 uppercase mt-0.5">{b.type}</div>
                  </button>
                  <div className="flex flex-col pr-1">
                    <button onClick={() => moveUp(i)} className="p-0.5 text-zinc-600 hover:text-white transition-colors"><ChevronUp size={12} /></button>
                    <button onClick={() => moveDown(i)} className="p-0.5 text-zinc-600 hover:text-white transition-colors"><ChevronDown size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-white/5">
              <button
                onClick={add}
                className="w-full py-2 border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 rounded-xl text-[11px] text-zinc-500 hover:text-purple-400 transition-all"
              >
                <Plus size={11} className="inline mr-1" /> Add Block
              </button>
            </div>
          </div>

          {/* Block properties */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {cur == null ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-25">
                <Smartphone size={36} className="mb-2" />
                <p className="text-xs">Select or add a block</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Block type */}
                <div>
                  <label className={labelCls}>Block Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BLOCK_TYPES.map(bt => (
                      <button
                        key={bt.type}
                        onClick={() => upd(sel!, { type: bt.type })}
                        className={`p-2 rounded-xl border text-xs transition-all ${
                          cur.type === bt.type
                            ? 'border-purple-500/40 bg-purple-500/10 text-white'
                            : 'border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <div className="text-base mb-0.5">{bt.icon}</div>
                        <div className="text-[10px] font-bold">{bt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header block: text */}
                {cur.type === 'header' && (
                  <div>
                    <label className={labelCls}>Header Text</label>
                    <input className={inputCls} value={cur.text || ''} onChange={e => upd(sel!, { text: e.target.value })} placeholder="Section title…" />
                  </div>
                )}

                {/* Spacer block: height */}
                {cur.type === 'spacer' && (
                  <div>
                    <label className={labelCls}>Height (px)</label>
                    <input type="number" className={inputCls} value={cur.height || 24} onChange={e => upd(sel!, { height: +e.target.value })} />
                  </div>
                )}

                {/* All data blocks */}
                {cur.type !== 'header' && cur.type !== 'spacer' && (
                  <>
                    <div>
                      <label className={labelCls}>Label</label>
                      <input className={inputCls} value={cur.label || ''} onChange={e => upd(sel!, { label: e.target.value })} placeholder="e.g. Temperature" />
                    </div>

                    <div>
                      <label className={labelCls}>Datastream</label>
                      {dsOptions.length > 0 ? (
                        <select className={inputCls} value={cur.datastream || ''} onChange={e => upd(sel!, { datastream: e.target.value })}>
                          <option value="">— Select —</option>
                          {dsOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input className={`${inputCls} font-mono`} value={cur.datastream || ''} onChange={e => upd(sel!, { datastream: e.target.value })} placeholder="deviceId.datastreamId" />
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Unit</label>
                      <input className={inputCls} value={cur.unit || ''} onChange={e => upd(sel!, { unit: e.target.value })} placeholder="°C, %, V …" />
                    </div>

                    {cur.type === 'chart' && (
                      <div>
                        <label className={labelCls}>Line Colour</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={cur.color || '#a855f7'} onChange={e => upd(sel!, { color: e.target.value })} className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                          <input className={`${inputCls} font-mono flex-1`} value={cur.color || '#a855f7'} onChange={e => upd(sel!, { color: e.target.value })} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-2 border-t border-white/5">
                  <button onClick={() => del(sel!)} className="w-full py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                    Remove Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

// ─── Main Mobile Dashboard Viewer ───────────────────────────────────────────
function MobileDashboardViewer() {
  const { id } = Route.useParams()
  const [dashboard, setDashboard] = useState<any>(null)
  const [blocks, setBlocks] = useState<MobileBlock[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [wsLive, setWsLive] = useState(false)
  const [isDesigning, setIsDesigning] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.dashboards.get(id).then(data => {
      setDashboard(data)
      // Support both .blocks (mobile format) and .widgets (web format)
      setBlocks((data.config?.blocks || []).map((b: any) => ({ id: b.id ?? crypto.randomUUID(), ...b })))
      if (data.projectId) {
        api.projects.devices(data.projectId).then(setDevices).catch(() => {})
      }
    })
    const ws = new WebSocket('ws://localhost:4001')
    ws.onopen = () => setWsLive(true)
    ws.onerror = () => setWsLive(false)
    ws.onclose = () => setWsLive(false)
    return () => ws.close()
  }, [id])

  const telemetry = useTelemetry(dashboard?.projectId ?? '')

  const handleSave = async (newBlocks: MobileBlock[]) => {
    setSaving(true)
    try {
      await api.dashboards.update(id, { config: { blocks: newBlocks } })
      setBlocks(newBlocks)
      setIsDesigning(false)
    } finally {
      setSaving(false)
    }
  }

  if (!dashboard) return (
    <div className="h-screen flex items-center justify-center gap-3 text-zinc-500 text-sm">
      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      Loading…
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" style={{ maxWidth: 420, margin: '0 auto', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', minHeight: '100dvh' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between bg-zinc-950/95 backdrop-blur-xl border-b border-white/5">
        <Link to="/projects" className="p-2 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors">
          <ChevronLeft size={17} />
        </Link>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold tracking-wider">{dashboard.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {wsLive
              ? <><Wifi size={9} className="text-green-400" /><span className="text-[10px] text-green-400">Live</span></>
              : <><WifiOff size={9} className="text-zinc-600" /><span className="text-[10px] text-zinc-600">Offline</span></>
            }
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsDesigning(true)}
            className="p-2 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-purple-400"
            title="Open Designer"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-2 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors">
            <MoreHorizontal size={17} />
          </button>
        </div>
      </header>

      {/* Block stack */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-28 space-y-3">
        {blocks.map(block => (
          <section key={block.id} className="w-full">
            {block.type === 'header' && (
              <h2 className="text-base font-bold px-1 pt-2 pb-1 text-zinc-200">{block.text || 'Section'}</h2>
            )}
            {block.type === 'spacer' && (
              <div style={{ height: block.height || 16 }} />
            )}
            {block.type === 'value' && (
              <div className="jagantara-mobile-card" style={{ minHeight: 110 }}>
                <ValueDisplay label={block.label || ''} value={telemetry[block.datastream || ''] || '—'} />
              </div>
            )}
            {block.type === 'gauge' && (
              <div className="jagantara-mobile-card">
                <Gauge label={block.label || ''} value={parseFloat(telemetry[block.datastream || ''] || '0')} unit={block.unit} />
              </div>
            )}
            {block.type === 'switch' && (
              <div className="jagantara-mobile-card">
                <Switch
                  label={block.label || ''}
                  isOn={telemetry[block.datastream || ''] === 'true' || telemetry[block.datastream || ''] === '1'}
                  onToggle={() => {}}
                />
              </div>
            )}
            {block.type === 'chart' && (
              <div className="jagantara-mobile-card" style={{ minHeight: 160 }}>
                <LineChart label={block.label || ''} value={telemetry[block.datastream || ''] || '0'} unit={block.unit} color={block.color} />
              </div>
            )}
          </section>
        ))}

        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-20">
            <Smartphone size={56} className="mb-4" />
            <p className="font-semibold text-sm">Mobile app is empty.</p>
            <p className="text-xs mt-1">Tap the edit icon to add blocks.</p>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-6 py-4 bg-zinc-950/90 backdrop-blur-3xl border-t border-white/5 flex justify-around items-center">
        <div className="p-2.5 bg-purple-500/10 rounded-2xl text-purple-400"><Smartphone size={20} /></div>
        <button onClick={() => setIsDesigning(true)} className="p-2.5 rounded-2xl text-zinc-600 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
          <Edit2 size={20} />
        </button>
        <div className="p-2.5 text-zinc-600 hover:text-white transition-colors cursor-pointer"><Settings size={20} /></div>
      </nav>

      {/* Mobile Designer */}
      {isDesigning && (
        <MobileDesigner
          blocks={blocks}
          devices={devices}
          onSave={handleSave}
          onClose={() => setIsDesigning(false)}
        />
      )}

      {saving && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-zinc-900 rounded-2xl px-6 py-4 flex items-center gap-3 border border-white/10">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Saving…</span>
          </div>
        </div>
      )}
    </div>
  )
}
