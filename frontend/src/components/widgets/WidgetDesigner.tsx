import { useState } from 'react'
import { X, Sliders } from 'lucide-react'

export interface WidgetConfig {
  id: string
  type: 'gauge' | 'switch' | 'value' | 'chart'
  label: string
  datastream: string
  unit?: string
  min?: number
  max?: number
  color?: string
  // react-grid-layout position
  x: number
  y: number
  w: number
  h: number
}

interface WidgetDesignerProps {
  dashboardId: string
  widgets: WidgetConfig[]
  onSave: (widgets: WidgetConfig[]) => void
  onClose: () => void
  devices?: Array<{ id: string; name: string; datastreams?: Array<{ id: string; key: string; type: string }> }>
}

const WIDGET_TYPES: { type: WidgetConfig['type']; label: string; icon: string; desc: string }[] = [
  { type: 'value',  label: 'Value',  icon: '⟡', desc: 'Large numeric readout.' },
  { type: 'gauge',  label: 'Gauge',  icon: '◑', desc: 'Circular arc gauge.' },
  { type: 'chart',  label: 'Chart',  icon: '↗', desc: 'Real-time sparkline.' },
  { type: 'switch', label: 'Switch', icon: '⏻', desc: 'Boolean toggle.' },
]

function makeWidget(count: number): WidgetConfig {
  return {
    id: crypto.randomUUID(),
    type: 'value',
    label: 'New Widget',
    datastream: '',
    unit: '',
    min: 0,
    max: 100,
    color: '#a855f7',
    x: (count * 3) % 12,
    y: Math.floor((count * 3) / 12) * 2,
    w: 3,
    h: 2,
  }
}

export function WidgetDesigner({ dashboardId: _id, widgets, onSave, onClose, devices = [] }: WidgetDesignerProps) {
  const [list, setList] = useState<WidgetConfig[]>(widgets)
  const [sel, setSel] = useState<number | null>(list.length > 0 ? 0 : null)

  const dsOptions = devices.flatMap(d =>
    (d.datastreams || []).map(ds => ({ value: `${d.id}.${ds.id}`, label: `${d.name} › ${ds.key}` }))
  )

  const add = () => {
    const w = makeWidget(list.length)
    setList(p => [...p, w])
    setSel(list.length)
  }

  const del = (i: number) => {
    setList(p => p.filter((_, idx) => idx !== i))
    setSel(null)
  }

  const upd = (i: number, patch: Partial<WidgetConfig>) =>
    setList(p => p.map((w, idx) => (idx === i ? { ...w, ...patch } : w)))

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
            <h2 className="text-sm font-bold">Widget Designer</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{list.length} widget{list.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(list)}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-all"
            >
              Save Layout
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Widget list */}
          <div className="w-44 border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {list.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => setSel(i)}
                  className={`w-full text-left p-2.5 rounded-xl mb-1 transition-all text-xs border ${
                    sel === i
                      ? 'bg-purple-500/15 border-purple-500/25 text-white'
                      : 'hover:bg-zinc-800/50 text-zinc-400 border-transparent'
                  }`}
                >
                  <div className="font-medium truncate">{w.label || 'Unnamed'}</div>
                  <div className="text-[10px] text-zinc-600 uppercase mt-0.5">{w.type}</div>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-white/5">
              <button
                onClick={add}
                className="w-full py-2 border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 rounded-xl text-[11px] text-zinc-500 hover:text-purple-400 transition-all"
              >
                + Add Widget
              </button>
            </div>
          </div>

          {/* Properties */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {cur == null ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-25">
                <Sliders size={36} className="mb-2" />
                <p className="text-xs">Select or add a widget</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Type selector */}
                <div>
                  <label className={labelCls}>Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WIDGET_TYPES.map(wt => (
                      <button
                        key={wt.type}
                        onClick={() => upd(sel!, { type: wt.type })}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          cur.type === wt.type
                            ? 'border-purple-500/40 bg-purple-500/10 text-white'
                            : 'border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{wt.icon}</div>
                        <div className="font-bold">{wt.label}</div>
                        <div className="text-[10px] text-zinc-600">{wt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Label</label>
                  <input
                    className={inputCls}
                    value={cur.label}
                    onChange={e => upd(sel!, { label: e.target.value })}
                    placeholder="e.g. Temperature"
                  />
                </div>

                <div>
                  <label className={labelCls}>Datastream</label>
                  {dsOptions.length > 0 ? (
                    <select
                      className={inputCls}
                      value={cur.datastream}
                      onChange={e => upd(sel!, { datastream: e.target.value })}
                    >
                      <option value="">— Select datastream —</option>
                      {dsOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      className={`${inputCls} font-mono`}
                      value={cur.datastream}
                      onChange={e => upd(sel!, { datastream: e.target.value })}
                      placeholder="deviceId.datastreamId"
                    />
                  )}
                </div>

                <div>
                  <label className={labelCls}>Unit</label>
                  <input className={inputCls} value={cur.unit || ''} onChange={e => upd(sel!, { unit: e.target.value })} placeholder="°C, %, V …" />
                </div>

                {(cur.type === 'gauge' || cur.type === 'chart') && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelCls}>Min</label>
                      <input type="number" className={inputCls} value={cur.min ?? 0} onChange={e => upd(sel!, { min: +e.target.value })} />
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>Max</label>
                      <input type="number" className={inputCls} value={cur.max ?? 100} onChange={e => upd(sel!, { max: +e.target.value })} />
                    </div>
                  </div>
                )}

                {cur.type === 'chart' && (
                  <div>
                    <label className={labelCls}>Line Colour</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={cur.color || '#a855f7'} onChange={e => upd(sel!, { color: e.target.value })} className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                      <input className={`${inputCls} flex-1 font-mono`} value={cur.color || '#a855f7'} onChange={e => upd(sel!, { color: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* Grid Size */}
                <div>
                  <label className={labelCls}>Grid Size</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-zinc-600 mb-1 block">Columns</label>
                      <select className={inputCls} value={cur.w} onChange={e => upd(sel!, { w: +e.target.value })}>
                        {[2,3,4,5,6,8,12].map(n => <option key={n} value={n}>{n} cols</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-zinc-600 mb-1 block">Rows</label>
                      <select className={inputCls} value={cur.h} onChange={e => upd(sel!, { h: +e.target.value })}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} row{n>1?'s':''}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => del(sel!)}
                    className="w-full py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                  >
                    Remove Widget
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
