export default function RatioBar({ label, value, recommended, color = 'bg-blue-500', icon }) {
  const pct = Math.min(value, 100)
  const isOver = value > recommended
  const isOk = value <= recommended && value > 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${isOver ? 'text-red-600' : isOk ? 'text-green-600' : 'text-slate-400'}`}>
            {value.toFixed(1)}%
          </span>
          <span className="text-slate-400 text-xs">/ {recommended}% recommandé</span>
        </div>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-400 opacity-60"
          style={{ left: `${Math.min(recommended, 100)}%` }}
        />
      </div>
    </div>
  )
}
