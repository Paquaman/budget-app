import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

const CATEGORIES = ['Logement', 'Alimentation', 'Transport', 'Santé', 'Assurances', 'Services', 'Personnel', 'Loisirs', 'Don', 'Autre']
const ICONS = { Logement: '🏠', Alimentation: '🛒', Transport: '🚗', Santé: '🏥', Assurances: '🛡️', Services: '⚡', Personnel: '👤', Loisirs: '🎬', Don: '🤝', Autre: '📌' }

export default function Expenses() {
  const { state, dispatch, totalExpenses, totalIncome } = useBudget()
  const [newExp, setNewExp] = useState({ category: 'Alimentation', name: '', amount: '' })
  const [expandedCat, setExpandedCat] = useState(null)

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = state.expenses.filter(e => e.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  const addExpense = () => {
    if (!newExp.name || !newExp.amount) return
    dispatch({
      type: 'ADD_EXPENSE',
      payload: { category: newExp.category, name: newExp.name, amount: Number(newExp.amount), recommended: 0, icon: ICONS[newExp.category] || '📌' },
    })
    setNewExp(s => ({ ...s, name: '', amount: '' }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {totalIncome > 0 && (
        <div className="card bg-blue-50 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium">Total des dépenses</div>
              <div className="text-2xl font-bold text-blue-800">{fmt(totalExpenses)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">
                {(totalExpenses / totalIncome * 100).toFixed(1)}% du revenu
              </div>
              <div className={`text-sm font-medium ${totalExpenses / totalIncome <= 0.75 ? 'text-green-600' : 'text-red-600'}`}>
                {totalExpenses / totalIncome <= 0.75 ? '✓ Dans les limites' : '⚠ Au-dessus de 75%'}
              </div>
            </div>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => {
        const subtotal = items.reduce((s, e) => s + Number(e.amount), 0)
        const isOpen = expandedCat === cat
        return (
          <div key={cat} className="card">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setExpandedCat(isOpen ? null : cat)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{ICONS[cat] || '📌'}</span>
                <span className="font-bold text-slate-800">{cat}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{items.length} poste{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">{fmt(subtotal)}</span>
                <span className="text-slate-400">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>
            {isOpen && (
              <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                {items.map(exp => (
                  <div key={exp.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-slate-600">{exp.name}</label>
                      {exp.recommended > 0 && totalIncome > 0 && (
                        <div className="text-xs text-slate-400">
                          Recommandé: {fmt(totalIncome * exp.recommended / 100)} ({exp.recommended}%)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-32">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          className="input pl-6 text-right"
                          value={exp.amount || ''}
                          onChange={e => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: exp.id, amount: e.target.value } })}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <button
                        className="text-slate-300 hover:text-red-500 transition-colors text-lg leading-none"
                        onClick={() => dispatch({ type: 'REMOVE_EXPENSE', payload: exp.id })}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="card border-dashed">
        <h3 className="font-bold text-slate-700 mb-4">Ajouter une dépense</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Catégorie</label>
            <select
              className="input"
              value={newExp.category}
              onChange={e => setNewExp(s => ({ ...s, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Netflix, gym..."
              value={newExp.name}
              onChange={e => setNewExp(s => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Montant mensuel ($)</label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={newExp.amount}
              onChange={e => setNewExp(s => ({ ...s, amount: e.target.value }))}
              min="0"
            />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addExpense}>+ Ajouter la dépense</button>
      </div>
    </div>
  )
}
