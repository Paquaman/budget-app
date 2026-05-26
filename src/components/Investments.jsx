import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { FREQ_LABELS, toMonthly } from '../context/BudgetContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const fmt  = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)
const fmtI = (n) => (Number(n) === 0 ? '' : String(n))
const FS   = { weekly: '/sem.', biweekly: '/2 sem.', monthly: '/mois', annual: '/an' }

const TYPE_LABELS = { emergency: "Fonds d'urgence", retirement: 'Retraite', education: 'Éducation', other: 'Autre' }
const TYPE_COLORS = { emergency: '#B89A5E', retirement: '#1B3057', education: '#2A4A7F', other: '#6B7D8F' }
const ALL_FREQS   = ['weekly', 'biweekly', 'monthly', 'annual']

function FreqPill({ freq, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="text-xs text-ia-muted bg-slate-100 hover:bg-ia-blue hover:text-ia-navy px-2 py-0.5 rounded transition-colors whitespace-nowrap">
        {FS[freq] || '/mois'}
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[150px]">
          {ALL_FREQS.map(f => (
            <button key={f} onClick={() => { onChange(f); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-ia-blue transition-colors ${freq === f ? 'font-bold text-ia-navy' : 'text-ia-muted'}`}>
              {FREQ_LABELS[f]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Investments() {
  const { state, dispatch, totalInvestments, totalIncome } = useBudget()
  const [newInv, setNewInv] = useState({ name: '', balance: '', monthly: '', freq: 'monthly', goal: '', type: 'retirement' })

  const recommended15 = totalIncome * 0.15
  const pct = totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0
  const isOnTrack = pct >= 15
  const totalBalance = state.investments.reduce((s, i) => s + Number(i.balance || 0), 0)

  const addInvestment = () => {
    if (!newInv.name) return
    dispatch({
      type: 'ADD_INVESTMENT',
      payload: { name: newInv.name, balance: Number(newInv.balance || 0), amount: Number(newInv.monthly || 0), freq: newInv.freq, goal: Number(newInv.goal || 0), type: newInv.type },
    })
    setNewInv({ name: '', balance: '', monthly: '', freq: 'monthly', goal: '', type: 'retirement' })
  }

  const chartData = state.investments
    .filter(inv => inv.amount > 0 || inv.balance > 0)
    .map(inv => ({
      name:    inv.name.length > 14 ? inv.name.slice(0, 12) + '…' : inv.name,
      Mensuel: toMonthly(inv.amount, inv.freq),
      Solde:   Number(inv.balance || 0),
    }))

  return (
    <div className="space-y-6 max-w-3xl">

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`card border-0 ${isOnTrack ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isOnTrack ? 'text-green-700' : 'text-yellow-700'}`}>
            {isOnTrack ? '✅ Objectif 15% atteint' : '⚠️ Contributions mensuelles'}
          </div>
          <div className={`text-2xl font-bold ${isOnTrack ? 'text-green-800' : 'text-yellow-800'}`}>{fmt(totalInvestments)}</div>
          <div className={`text-xs mt-1 ${isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
            {pct.toFixed(1)}% du revenu · cible : {fmt(recommended15)}
          </div>
          {totalIncome > 0 && (
            <div className="mt-2 h-2 bg-white rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-700 ${isOnTrack ? 'bg-green-500' : 'bg-yellow-400'}`}
                style={{ width: `${Math.min(pct / 15 * 100, 100)}%` }} />
            </div>
          )}
        </div>
        <div className="card border-0 bg-ia-blue">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-ia-navy">Solde total accumulé</div>
          <div className="text-2xl font-bold text-ia-navy">{fmt(totalBalance)}</div>
          <div className="text-xs mt-1 text-ia-muted">Tous comptes combinés</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[2.2fr_1fr_1.3fr_1fr] bg-ia-navy text-white text-xs font-bold uppercase tracking-wide">
          <div className="px-4 py-2.5">Placement</div>
          <div className="px-3 py-2.5 text-right">Solde actuel ($)</div>
          <div className="px-3 py-2.5 text-right">Contribution</div>
          <div className="px-3 py-2.5 text-right">Objectif ($)</div>
        </div>

        {state.investments.map((inv, i) => {
          const monthlyAmt = toMonthly(inv.amount, inv.freq || 'monthly')
          const progress   = inv.goal > 0 ? Math.min((Number(inv.balance) / Number(inv.goal)) * 100, 100) : null
          const monthsLeft = inv.goal > 0 && monthlyAmt > 0
            ? Math.max(0, Math.ceil((Number(inv.goal) - Number(inv.balance)) / monthlyAmt))
            : null

          return (
            <div key={inv.id} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-ia-gray'}`}>
              <div className="grid grid-cols-[2.2fr_1fr_1.3fr_1fr]">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[inv.type] }} />
                    <span className="font-medium text-sm text-ia-text">{inv.name}</span>
                    <span className="text-xs text-ia-muted bg-slate-100 px-1.5 py-0.5 rounded-full">{TYPE_LABELS[inv.type]}</span>
                  </div>
                  {progress !== null && (
                    <div className="mt-1.5 ml-4">
                      <div className="flex justify-between text-xs text-ia-muted mb-0.5">
                        <span>{progress.toFixed(0)}% atteint</span>
                        {monthsLeft !== null && monthsLeft > 0 && <span>{monthsLeft} mois restants</span>}
                        {monthsLeft === 0 && <span className="text-green-600 font-medium">✓ Objectif atteint!</span>}
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: TYPE_COLORS[inv.type] }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Solde */}
                <div className="px-2 py-3 flex items-start justify-end">
                  <input type="number"
                    className="w-full text-right text-sm border border-transparent hover:border-slate-200 focus:border-ia-navy focus:outline-none rounded px-1 py-0.5 bg-transparent font-semibold text-ia-navy"
                    value={fmtI(inv.balance)}
                    onChange={e => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id: inv.id, balance: Number(e.target.value) || 0 } })}
                    placeholder="0" min="0"
                  />
                </div>

                {/* Contribution + fréquence */}
                <div className="px-2 py-3 flex items-start justify-end gap-1">
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1">
                      <input type="number"
                        className="w-16 text-right text-sm border border-transparent hover:border-slate-200 focus:border-ia-navy focus:outline-none rounded px-1 py-0.5 bg-transparent text-slate-700"
                        value={fmtI(inv.amount)}
                        onChange={e => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id: inv.id, amount: Number(e.target.value) || 0 } })}
                        placeholder="0" min="0"
                      />
                      <FreqPill freq={inv.freq || 'monthly'} onChange={f => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id: inv.id, freq: f } })} />
                    </div>
                    {inv.freq && inv.freq !== 'monthly' && inv.amount > 0 && (
                      <span className="text-xs text-ia-muted">= {fmt(monthlyAmt)}/mois</span>
                    )}
                  </div>
                </div>

                {/* Objectif */}
                <div className="px-2 py-3 flex items-start justify-end gap-1">
                  <input type="number"
                    className="w-full text-right text-sm border border-transparent hover:border-slate-200 focus:border-ia-navy focus:outline-none rounded px-1 py-0.5 bg-transparent text-slate-500"
                    value={fmtI(inv.goal)}
                    onChange={e => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id: inv.id, goal: Number(e.target.value) || 0 } })}
                    placeholder="—" min="0"
                  />
                  <button className="text-slate-200 hover:text-ia-red transition-colors text-lg leading-none shrink-0 mt-0.5"
                    onClick={() => dispatch({ type: 'REMOVE_INVESTMENT', payload: inv.id })}>×</button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Total */}
        <div className="grid grid-cols-[2.2fr_1fr_1.3fr_1fr] bg-ia-navy text-white">
          <div className="px-4 py-2.5 font-bold text-sm">Total</div>
          <div className="px-3 py-2.5 text-right font-bold text-sm">{fmt(totalBalance)}</div>
          <div className="px-3 py-2.5 text-right font-bold text-sm">{fmt(totalInvestments)}<span className="text-xs font-normal text-blue-300">/mois</span></div>
          <div className="px-3 py-2.5" />
        </div>
      </div>

      {/* Graphique */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-ia-navy mb-4">Vue graphique</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k$`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="Solde"   fill="#B89A5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Mensuel" fill="#1B3057" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center text-xs text-ia-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-yellow-600" /> Solde actuel</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-ia-navy" /> Contribution mensuelle</span>
          </div>
        </div>
      )}

      {/* Ajouter */}
      <div className="card border-dashed border-2 border-slate-200">
        <h3 className="font-bold text-ia-navy mb-4">Ajouter un placement</h3>
        <div className="mb-3">
          <label className="label">Fréquence de contribution</label>
          <div className="flex gap-2">
            {ALL_FREQS.map(f => (
              <button key={f} onClick={() => setNewInv(s => ({ ...s, freq: f }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${newInv.freq === f ? 'bg-ia-navy text-white border-ia-navy' : 'bg-white text-ia-muted border-slate-200 hover:border-ia-navy'}`}>
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Nom</label>
            <input type="text" className="input" placeholder="Ex: REER Banque Nationale" value={newInv.name}
              onChange={e => setNewInv(s => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={newInv.type} onChange={e => setNewInv(s => ({ ...s, type: e.target.value }))}>
              <option value="emergency">Fonds d'urgence</option>
              <option value="retirement">Retraite</option>
              <option value="education">Éducation (REEE)</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="label">Solde actuel ($)</label>
            <input type="number" className="input" placeholder="0" value={newInv.balance} min="0"
              onChange={e => setNewInv(s => ({ ...s, balance: e.target.value }))} />
          </div>
          <div>
            <label className="label">Contribution ({(FREQ_LABELS[newInv.freq] || 'Mensuelle').toLowerCase()}) ($)</label>
            <input type="number" className="input" placeholder="0" value={newInv.monthly} min="0"
              onChange={e => setNewInv(s => ({ ...s, monthly: e.target.value }))} />
          </div>
          <div>
            <label className="label">Objectif ($)</label>
            <input type="number" className="input" placeholder="Optionnel" value={newInv.goal} min="0"
              onChange={e => setNewInv(s => ({ ...s, goal: e.target.value }))} />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addInvestment}>+ Ajouter le placement</button>
      </div>
    </div>
  )
}
