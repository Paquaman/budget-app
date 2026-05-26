import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { FREQ_LABELS, FREQ_SHORT, toMonthly } from '../context/BudgetContext'

const FS = FREQ_SHORT

const fmt = (n) =>
  n === 0 ? '$ -' :
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n)

const fmtM = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

const fmtInput = (n) => (Number(n) === 0 ? '' : String(n))

const CATEGORY_CONFIG = {
  Logement:     { label: 'LOGEMENT',                target: '≤ 25–30 % du revenu net', icon: '🏠', color: 'bg-purple-800',  text: 'text-purple-800',  sub: 'bg-purple-50'  },
  Transport:    { label: 'TRANSPORT',                target: '≤ 15 % du revenu net',    icon: '🚗', color: 'bg-blue-900',    text: 'text-blue-900',    sub: 'bg-blue-50'    },
  Alimentation: { label: 'ALIMENTATION',             target: '≤ 10–15 % du revenu net', icon: '🛒', color: 'bg-green-800',   text: 'text-green-800',   sub: 'bg-green-50'   },
  Santé:        { label: 'SANTÉ & BIEN-ÊTRE',        target: '',                         icon: '🏥', color: 'bg-orange-700',  text: 'text-orange-700',  sub: 'bg-orange-50'  },
  Famille:      { label: 'FAMILLE & ENFANTS',        target: '',                         icon: '👨‍👩‍👧', color: 'bg-indigo-800',  text: 'text-indigo-800',  sub: 'bg-indigo-50'  },
  Loisirs:      { label: 'LOISIRS & DIVERTISSEMENT', target: '5–10 %',                  icon: '🎬', color: 'bg-teal-700',    text: 'text-teal-700',    sub: 'bg-teal-50'    },
  Divers:       { label: 'DIVERS & IMPRÉVUS',        target: '',                         icon: '📌', color: 'bg-slate-600',   text: 'text-slate-600',   sub: 'bg-slate-50'   },
}

const ORDERED_CATS = ['Logement', 'Transport', 'Alimentation', 'Santé', 'Famille', 'Loisirs', 'Divers']
const ALL_FREQS    = ['weekly', 'biweekly', 'monthly', 'annual']

function FreqBadge({ freq, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-ia-muted bg-slate-100 hover:bg-ia-blue hover:text-ia-navy px-1.5 py-0.5 rounded transition-colors whitespace-nowrap"
        title="Changer la fréquence"
      >
        {FS[freq] || '/mois'}
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px]">
          {ALL_FREQS.map(f => (
            <button
              key={f}
              onClick={() => { onChange(f); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-ia-blue transition-colors ${freq === f ? 'font-bold text-ia-navy' : 'text-ia-muted'}`}
            >
              {FREQ_LABELS[f]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Expenses() {
  const { state, dispatch, totalBudgeted, totalActual, totalIncome } = useBudget()
  const [newExp, setNewExp] = useState({ category: 'Logement', name: '', budgeted: '', actual: '', freq: 'monthly', note: '' })
  const [showAdd, setShowAdd] = useState(false)

  const grouped = ORDERED_CATS.reduce((acc, cat) => {
    acc[cat] = state.expenses.filter(e => e.category === cat)
    return acc
  }, {})
  const otherCats = [...new Set(state.expenses.map(e => e.category))].filter(c => !ORDERED_CATS.includes(c))
  otherCats.forEach(cat => { grouped[cat] = state.expenses.filter(e => e.category === cat) })
  const allCats = [...ORDERED_CATS, ...otherCats]

  const addExpense = () => {
    if (!newExp.name) return
    dispatch({ type: 'ADD_EXPENSE', payload: { category: newExp.category, name: newExp.name, budgeted: Number(newExp.budgeted || 0), actual: Number(newExp.actual || 0), freq: newExp.freq, note: newExp.note } })
    setNewExp({ category: 'Logement', name: '', budgeted: '', actual: '', freq: 'monthly', note: '' })
    setShowAdd(false)
  }

  const totalEcart = totalActual - totalBudgeted

  return (
    <div className="space-y-2 max-w-5xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-ia-navy">Dépenses Mensuelles : Budgeté vs Réel</h1>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '✕ Annuler' : '+ Ajouter une dépense'}
        </button>
      </div>

      {showAdd && (
        <div className="card border-dashed mb-4">
          <h3 className="font-bold text-ia-navy mb-3">Nouvelle dépense</h3>
          <div className="mb-3">
            <label className="label">Fréquence</label>
            <div className="flex gap-2">
              {ALL_FREQS.map(f => (
                <button key={f} onClick={() => setNewExp(s => ({ ...s, freq: f }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${newExp.freq === f ? 'bg-ia-navy text-white border-ia-navy' : 'bg-white text-ia-muted border-slate-200 hover:border-ia-navy'}`}>
                  {FREQ_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={newExp.category} onChange={e => setNewExp(s => ({ ...s, category: e.target.value }))}>
                {ORDERED_CATS.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c]?.label || c}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="label">Description</label>
              <input type="text" className="input" placeholder="Ex: Netflix..." value={newExp.name}
                onChange={e => setNewExp(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Budgeté ($)</label>
              <input type="number" className="input" placeholder="0" value={newExp.budgeted} min="0"
                onChange={e => setNewExp(s => ({ ...s, budgeted: e.target.value }))} />
            </div>
            <div>
              <label className="label">Réel ($)</label>
              <input type="number" className="input" placeholder="0" value={newExp.actual} min="0"
                onChange={e => setNewExp(s => ({ ...s, actual: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input type="text" className="input" placeholder="Optionnel" value={newExp.note}
                onChange={e => setNewExp(s => ({ ...s, note: e.target.value }))} />
            </div>
          </div>
          <button className="btn-primary mt-3" onClick={addExpense}>Ajouter</button>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {/* En-tête */}
        <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1fr_0.9fr] bg-slate-700 text-white text-xs font-bold uppercase tracking-wide">
          <div className="px-4 py-2.5">Catégorie</div>
          <div className="px-3 py-2.5 text-right">Budgeté ($)</div>
          <div className="px-3 py-2.5 text-right">Réel ($)</div>
          <div className="px-3 py-2.5 text-right">Écart ($)</div>
          <div className="px-3 py-2.5 text-right">Ann. budg. ($)</div>
          <div className="px-3 py-2.5">Notes</div>
        </div>

        {allCats.map(cat => {
          const items  = grouped[cat] || []
          const cfg    = CATEGORY_CONFIG[cat] || { label: cat.toUpperCase(), icon: '📌', color: 'bg-slate-600', text: 'text-slate-600', sub: 'bg-white', target: '' }
          const catBudM = items.reduce((s, e) => s + toMonthly(e.budgeted, e.freq), 0)
          const catActM = items.reduce((s, e) => s + toMonthly(e.actual,   e.freq), 0)
          const catEcart = catActM - catBudM

          return (
            <div key={cat}>
              {/* Header catégorie */}
              <div className={`grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1fr_0.9fr] ${cfg.color} text-white`}>
                <div className="px-4 py-2 font-bold text-sm flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  {cfg.target && <span className="text-xs opacity-75 font-normal">(cible : {cfg.target})</span>}
                </div>
                <div className="col-span-5" />
              </div>

              {/* Lignes */}
              {items.map((exp, i) => {
                const budM  = toMonthly(exp.budgeted, exp.freq)
                const actM  = toMonthly(exp.actual,   exp.freq)
                const ecart = actM - budM
                const hasData = budM > 0 || actM > 0

                return (
                  <div key={exp.id}
                    className={`grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1fr_0.9fr] text-sm border-b border-slate-100 hover:bg-yellow-50 transition-colors ${i % 2 === 0 ? 'bg-white' : cfg.sub}`}
                  >
                    <div className="px-4 py-1.5 text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      <span className="truncate">{exp.name}</span>
                    </div>

                    {/* Budgeté + fréquence */}
                    <div className="px-2 py-1 text-right flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        className="w-16 text-right text-sm border border-transparent hover:border-slate-200 focus:border-ia-navy focus:outline-none rounded px-1 py-0.5 bg-transparent text-ia-navy font-medium"
                        value={fmtInput(exp.budgeted)}
                        onChange={e => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: exp.id, budgeted: Number(e.target.value) || 0 } })}
                        placeholder="0"
                        min="0"
                      />
                      <FreqBadge freq={exp.freq || 'monthly'} onChange={f => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: exp.id, freq: f } })} />
                    </div>

                    {/* Réel */}
                    <div className="px-2 py-1 text-right flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        className="w-16 text-right text-sm border border-transparent hover:border-slate-200 focus:border-ia-navy focus:outline-none rounded px-1 py-0.5 bg-transparent text-slate-700"
                        value={fmtInput(exp.actual)}
                        onChange={e => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: exp.id, actual: Number(e.target.value) || 0 } })}
                        placeholder="0"
                        min="0"
                      />
                      <span className="text-xs text-slate-300">{FS[exp.freq] || '/mois'}</span>
                    </div>

                    {/* Écart mensuel */}
                    <div className={`px-3 py-1.5 text-right font-medium text-xs ${
                      !hasData ? 'text-slate-300' :
                      ecart > 0 ? 'text-red-600' : ecart < 0 ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {!hasData ? '—' : ecart === 0 ? '—' : (ecart > 0 ? '+' : '') + fmtM(ecart)}
                    </div>

                    {/* Annuel budgété (mensuel × 12) */}
                    <div className="px-3 py-1.5 text-right text-xs text-slate-500">
                      {budM > 0 ? fmtM(budM * 12) : '—'}
                    </div>

                    {/* Notes + supprimer */}
                    <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between gap-1">
                      <span className="truncate">{exp.note}</span>
                      <button
                        className="text-slate-200 hover:text-red-400 transition-colors text-base leading-none shrink-0"
                        onClick={() => dispatch({ type: 'REMOVE_EXPENSE', payload: exp.id })}
                        title="Supprimer"
                      >×</button>
                    </div>
                  </div>
                )
              })}

              {/* Sous-total catégorie */}
              <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1fr_0.9fr] bg-red-50 border-b-2 border-slate-200">
                <div className={`px-4 py-2 text-sm font-bold ${cfg.text}`}>
                  Sous-total {cfg.label.split(' ')[0].toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </div>
                <div className={`px-3 py-2 text-right text-sm font-bold ${cfg.text}`}>{fmtM(catBudM)}</div>
                <div className="px-3 py-2 text-right text-sm font-bold text-slate-600">{fmtM(catActM)}</div>
                <div className={`px-3 py-2 text-right text-sm font-bold ${catEcart > 0 ? 'text-red-600' : catEcart < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                  {catEcart === 0 ? '—' : (catEcart > 0 ? '+' : '') + fmtM(catEcart)}
                </div>
                <div className="px-3 py-2 text-right text-xs text-slate-500">{fmtM(catBudM * 12)}</div>
                <div className="px-3 py-2" />
              </div>
            </div>
          )
        })}

        {/* Total général */}
        <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1fr_0.9fr] bg-ia-navy text-white">
          <div className="px-4 py-3 font-bold text-sm flex items-center gap-2">💰 TOTAL DÉPENSES MENSUELLES</div>
          <div className="px-3 py-3 text-right font-bold">{fmtM(totalBudgeted)}</div>
          <div className="px-3 py-3 text-right font-bold">{fmtM(totalActual)}</div>
          <div className={`px-3 py-3 text-right font-bold ${totalEcart > 0 ? 'text-red-300' : totalEcart < 0 ? 'text-green-300' : ''}`}>
            {totalEcart === 0 ? '—' : (totalEcart > 0 ? '+' : '') + fmtM(totalEcart)}
          </div>
          <div className="px-3 py-3 text-right font-bold">{fmtM(totalBudgeted * 12)}</div>
          <div className="px-3 py-3 text-xs text-blue-300">
            {totalIncome > 0 && `${(totalBudgeted / totalIncome * 100).toFixed(1)}% du revenu`}
          </div>
        </div>
      </div>

      <p className="text-xs text-ia-muted mt-2">
        Cliquez sur la fréquence (<span className="font-mono bg-slate-100 px-1 rounded">/mois</span>) pour la modifier. Les montants sont automatiquement convertis en équivalent mensuel.
      </p>
    </div>
  )
}
