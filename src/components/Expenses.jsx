import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

const fmt = (n) =>
  n === 0 ? '$ -' :
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n)

const fmtInput = (n) => (Number(n) === 0 ? '' : String(n))

const CATEGORY_CONFIG = {
  Logement:     { label: 'LOGEMENT',              target: '≤ 25–30 % du revenu net', icon: '🏠', color: 'bg-purple-800',  text: 'text-purple-800',  sub: 'bg-purple-50'  },
  Transport:    { label: 'TRANSPORT',              target: '≤ 15 % du revenu net',    icon: '🚗', color: 'bg-blue-900',    text: 'text-blue-900',    sub: 'bg-blue-50'    },
  Alimentation: { label: 'ALIMENTATION',           target: '≤ 10–15 % du revenu net', icon: '🛒', color: 'bg-green-800',   text: 'text-green-800',   sub: 'bg-green-50'   },
  Santé:        { label: 'SANTÉ & BIEN-ÊTRE',      target: '',                         icon: '🏥', color: 'bg-orange-700',  text: 'text-orange-700',  sub: 'bg-orange-50'  },
  Famille:      { label: 'FAMILLE & ENFANTS',      target: '',                         icon: '👨‍👩‍👧', color: 'bg-indigo-800',  text: 'text-indigo-800',  sub: 'bg-indigo-50'  },
  Loisirs:      { label: 'LOISIRS & DIVERTISSEMENT', target: '5–10 %',                icon: '🎬', color: 'bg-teal-700',    text: 'text-teal-700',    sub: 'bg-teal-50'    },
  Divers:       { label: 'DIVERS & IMPRÉVUS',      target: '',                         icon: '📌', color: 'bg-slate-600',   text: 'text-slate-600',   sub: 'bg-slate-50'   },
}

const ORDERED_CATS = ['Logement', 'Transport', 'Alimentation', 'Santé', 'Famille', 'Loisirs', 'Divers']

export default function Expenses() {
  const { state, dispatch, totalBudgeted, totalActual, totalIncome } = useBudget()
  const [newExp, setNewExp] = useState({ category: 'Logement', name: '', budgeted: '', actual: '', note: '' })
  const [showAdd, setShowAdd] = useState(false)

  const grouped = ORDERED_CATS.reduce((acc, cat) => {
    acc[cat] = state.expenses.filter(e => e.category === cat)
    return acc
  }, {})

  const otherCats = [...new Set(state.expenses.map(e => e.category))].filter(c => !ORDERED_CATS.includes(c))
  otherCats.forEach(cat => { grouped[cat] = state.expenses.filter(e => e.category === cat) })
  const allCats = [...ORDERED_CATS, ...otherCats]

  const addExpense = () => {
    if (!newExp.name || (!newExp.budgeted && !newExp.actual)) return
    dispatch({ type: 'ADD_EXPENSE', payload: { category: newExp.category, name: newExp.name, budgeted: Number(newExp.budgeted || 0), actual: Number(newExp.actual || 0), note: newExp.note } })
    setNewExp({ category: 'Logement', name: '', budgeted: '', actual: '', note: '' })
    setShowAdd(false)
  }

  const totalEcart = totalActual - totalBudgeted

  return (
    <div className="space-y-2 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Dépenses Mensuelles : Budgeté vs Réel</h1>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '✕ Annuler' : '+ Ajouter une dépense'}
        </button>
      </div>

      {showAdd && (
        <div className="card border-dashed mb-4">
          <h3 className="font-bold text-slate-700 mb-3">Nouvelle dépense</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={newExp.category} onChange={e => setNewExp(s => ({ ...s, category: e.target.value }))}>
                {ORDERED_CATS.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c]?.label || c}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Description</label>
              <input type="text" className="input" placeholder="Ex: Netflix..." value={newExp.name} onChange={e => setNewExp(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Budgeté ($)</label>
              <input type="number" className="input" placeholder="0" value={newExp.budgeted} onChange={e => setNewExp(s => ({ ...s, budgeted: e.target.value }))} min="0" />
            </div>
            <div>
              <label className="label">Réel ($)</label>
              <input type="number" className="input" placeholder="0" value={newExp.actual} onChange={e => setNewExp(s => ({ ...s, actual: e.target.value }))} min="0" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Notes</label>
              <input type="text" className="input" placeholder="Optionnel" value={newExp.note} onChange={e => setNewExp(s => ({ ...s, note: e.target.value }))} />
            </div>
          </div>
          <button className="btn-primary mt-3" onClick={addExpense}>Ajouter</button>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {/* En-tête tableau */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] bg-slate-700 text-white text-xs font-bold uppercase tracking-wide">
          <div className="px-4 py-2.5">Catégorie</div>
          <div className="px-3 py-2.5 text-right">Budgeté ($)</div>
          <div className="px-3 py-2.5 text-right">Réel ($)</div>
          <div className="px-3 py-2.5 text-right">Écart ($)</div>
          <div className="px-3 py-2.5 text-right">Annuel budg. ($)</div>
          <div className="px-3 py-2.5">Notes</div>
        </div>

        {allCats.map(cat => {
          const items = grouped[cat] || []
          const cfg = CATEGORY_CONFIG[cat] || { label: cat.toUpperCase(), icon: '📌', color: 'bg-slate-600', text: 'text-slate-600', sub: 'bg-white', target: '' }
          const catBudgeted = items.reduce((s, e) => s + Number(e.budgeted), 0)
          const catActual   = items.reduce((s, e) => s + Number(e.actual), 0)
          const catEcart    = catActual - catBudgeted

          return (
            <div key={cat}>
              {/* En-tête catégorie */}
              <div className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] ${cfg.color} text-white`}>
                <div className="px-4 py-2 font-bold text-sm flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  {cfg.target && <span className="text-xs opacity-75 font-normal">(cible : {cfg.target})</span>}
                </div>
                <div className="px-3 py-2" />
                <div className="px-3 py-2" />
                <div className="px-3 py-2" />
                <div className="px-3 py-2" />
                <div className="px-3 py-2" />
              </div>

              {/* Lignes sous-dépenses */}
              {items.map((exp, i) => {
                const ecart = Number(exp.actual) - Number(exp.budgeted)
                const hasActual = Number(exp.actual) > 0 || Number(exp.budgeted) > 0
                return (
                  <div
                    key={exp.id}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] text-sm border-b border-slate-100 hover:bg-yellow-50 transition-colors ${i % 2 === 0 ? 'bg-white' : cfg.sub}`}
                  >
                    <div className="px-4 py-1.5 text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      {exp.name}
                    </div>
                    <div className="px-2 py-1 text-right">
                      <input
                        type="number"
                        className="w-full text-right text-sm border border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-none rounded px-1 py-0.5 bg-transparent text-blue-700 font-medium"
                        value={fmtInput(exp.budgeted)}
                        onChange={e => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: exp.id, budgeted: Number(e.target.value) || 0 } })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="px-2 py-1 text-right">
                      <input
                        type="number"
                        className="w-full text-right text-sm border border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-none rounded px-1 py-0.5 bg-transparent text-slate-700"
                        value={fmtInput(exp.actual)}
                        onChange={e => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: exp.id, actual: Number(e.target.value) || 0 } })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className={`px-3 py-1.5 text-right font-medium ${
                      !hasActual ? 'text-slate-300' :
                      ecart > 0 ? 'text-red-600' :
                      ecart < 0 ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {!hasActual ? '$ -' : ecart === 0 ? '$ -' : (ecart > 0 ? '+' : '') + fmt(ecart)}
                    </div>
                    <div className="px-3 py-1.5 text-right text-slate-500 text-xs">
                      {Number(exp.budgeted) > 0 ? fmt(Number(exp.budgeted) * 12) : '$ -'}
                    </div>
                    <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between gap-1">
                      <span>{exp.note}</span>
                      <button
                        className="opacity-0 hover:opacity-100 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity text-base leading-none shrink-0"
                        onClick={() => dispatch({ type: 'REMOVE_EXPENSE', payload: exp.id })}
                        title="Supprimer"
                      >×</button>
                    </div>
                  </div>
                )
              })}

              {/* Sous-total catégorie */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] bg-red-50 border-b-2 border-slate-200">
                <div className={`px-4 py-2 text-sm font-bold ${cfg.text}`}>
                  Sous-total {cfg.label.split(' ')[0].charAt(0) + cfg.label.split(' ')[0].slice(1).toLowerCase()}
                </div>
                <div className={`px-3 py-2 text-right text-sm font-bold ${cfg.text}`}>{fmt(catBudgeted)}</div>
                <div className="px-3 py-2 text-right text-sm font-bold text-slate-600">{fmt(catActual)}</div>
                <div className={`px-3 py-2 text-right text-sm font-bold ${
                  catEcart > 0 ? 'text-red-600' : catEcart < 0 ? 'text-green-600' : 'text-slate-400'
                }`}>
                  {catEcart === 0 ? '$ -' : (catEcart > 0 ? '+' : '') + fmt(catEcart)}
                </div>
                <div className="px-3 py-2 text-right text-xs text-slate-500">{fmt(catBudgeted * 12)}</div>
                <div className="px-3 py-2" />
              </div>
            </div>
          )
        })}

        {/* Total général */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] bg-purple-900 text-white">
          <div className="px-4 py-3 font-bold text-sm flex items-center gap-2">
            <span>💰</span> TOTAL DÉPENSES MENSUELLES
          </div>
          <div className="px-3 py-3 text-right font-bold">{fmt(totalBudgeted)}</div>
          <div className="px-3 py-3 text-right font-bold">{fmt(totalActual)}</div>
          <div className={`px-3 py-3 text-right font-bold ${
            totalEcart > 0 ? 'text-red-300' : totalEcart < 0 ? 'text-green-300' : 'text-white'
          }`}>
            {totalEcart === 0 ? '$ -' : (totalEcart > 0 ? '+' : '') + fmt(totalEcart)}
          </div>
          <div className="px-3 py-3 text-right font-bold">{fmt(totalBudgeted * 12)}</div>
          <div className="px-3 py-3">
            {totalIncome > 0 && (
              <span className="text-xs text-purple-300">
                {(totalBudgeted / totalIncome * 100).toFixed(1)}% du revenu
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        Cliquez directement dans les champs Budgeté ou Réel pour modifier. Écart = Réel − Budgeté (rouge = dépassement, vert = économie).
      </p>
    </div>
  )
}
