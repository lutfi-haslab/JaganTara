import { useEffect, useRef } from 'react'

interface LineChartProps {
  label: string
  value: string | number
  unit?: string
  color?: string
}

// Simple sparkline that maintains a rolling window of up to 60 values
const MAX_POINTS = 60

export function LineChart({ label, value, unit = '', color = '#a855f7' }: LineChartProps) {
  const historyRef = useRef<number[]>([])

  const num = parseFloat(String(value))
  if (!isNaN(num)) {
    historyRef.current = [...historyRef.current.slice(-(MAX_POINTS - 1)), num]
  }

  const history = historyRef.current
  const min = Math.min(...history, 0)
  const max = Math.max(...history, 1)
  const range = max - min || 1

  const W = 300
  const H = 80

  const points = history.map((v, i) => {
    const x = (i / (MAX_POINTS - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  const area = history.length > 1
    ? `M 0,${H} ${history.map((v, i) => {
        const x = (i / (MAX_POINTS - 1)) * W
        const y = H - ((v - min) / range) * H
        return `L ${x},${y}`
      }).join(' ')} L ${W},${H} Z`
    : ''

  return (
    <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col w-full h-full">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label}</span>
        <span className="text-xs font-mono text-zinc-400">{unit}</span>
      </div>
      <div className="text-2xl font-bold font-mono text-zinc-100 mb-3">
        {isNaN(num) ? '---' : num.toFixed(2)}
        <span className="text-sm text-zinc-500 ml-1">{unit}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {area && (
            <path d={area} fill={`url(#grad-${label})`} />
          )}
          {history.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  )
}
