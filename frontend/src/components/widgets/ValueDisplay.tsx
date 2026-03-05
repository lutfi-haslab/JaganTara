interface ValueDisplayProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function ValueDisplay({ label, value, icon }: ValueDisplayProps) {
  return (
    <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col w-full h-full justify-between items-start">
      <div className="flex justify-between items-center w-full mb-4">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label}</span>
        {icon && <div className="text-purple-500/50">{icon}</div>}
      </div>
      <div className="text-3xl font-bold font-mono text-zinc-100">{value}</div>
    </div>
  )
}
