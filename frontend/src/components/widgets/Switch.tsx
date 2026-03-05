interface SwitchProps {
  label: string;
  isOn: boolean;
  onToggle: (state: boolean) => void;
}

export function Switch({ label, isOn, onToggle }: SwitchProps) {
  return (
    <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex justify-between items-center w-full">
      <span className="text-sm font-medium text-zinc-400">{label}</span>
      <button 
        onClick={() => onToggle(!isOn)}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
          isOn ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-zinc-800'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
          isOn ? 'left-7' : 'left-1'
        }`} />
      </button>
    </div>
  )
}
