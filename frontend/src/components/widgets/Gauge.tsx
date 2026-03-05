import { useEffect, useState } from 'react'

interface GaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
}

export function Gauge({ label, value, min = 0, max = 100, unit = '%' }: GaugeProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const strokeDasharray = `${percentage} 100`;

  return (
    <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col items-center">
      <h5 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 font-bold">{label}</h5>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <path
            className="stroke-zinc-800"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="stroke-purple-500 transition-all duration-500 ease-out"
            strokeWidth="3"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono">{value}</span>
          <span className="text-[10px] text-zinc-500 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  )
}
