import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

export default function Income() {
  const { state, dispatch, totalIncome } = useBudget()
  const [newSource, setNewSource] = useState({ name: '', amount: '' })

  const addSource = () => {
    if (!newSource.name || !newSource.amount) return
    dispatch({ type: 'ADD_OTHER_INCOME', payload: { name: newSource.name, amount: Number(newSource.amount) } })
    setNewSource({ name: '', amount: '' })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <h2 className="font-bold text-lg text-slate-800 mb-4">Revenu principal mensuel</h2>
        <div>
          <label className="label">Salaire net mensuel (après impôts)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                className="input pl-7"
                value={state.monthlyIncome || ''}
                onChange={e => dispatch({ type: 'SET_INCOME', payload: e.target.value })}
                placeholder="0.00"
                min="0"
              />
            </div>
            <span className="text-sm text-slate-500">CAD / mois</span>
          </div>
          {state.monthlyIncome > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Annuel: {fmt(state.monthlyIncome * 12)} · Hebdomadaire: {fmt(state.monthlyIncome / 4.33)}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg text-slate-800 mb-4">Autres sources de revenus</h2>
        <div className="space-y-3">
          {state.otherIncome.map(src => (
            <div key={src.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <div>
                <div className="font-medium text-sm text-slate-800">{src.name}</div>
                <div className="text-green-600 font-bold">{fmt(src.amount)}<span className="text-slate-400 font-normal text-xs"> / mois</span></div>
              </div>
              <button
                className="btn-danger"
                onClick={() => dispatch({ type: 'REMOVE_OTHER_INCOME', payload: src.id })}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <p className="text-sm font-medium text-slate-600">Ajouter une source</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Description</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Freelance, loyer reçu..."
                value={newSource.name}
                onChange={e => setNewSource(s => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Montant mensuel ($)</label>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                value={newSource.amount}
                onChange={e => setNewSource(s => ({ ...s, amount: e.target.value }))}
                min="0"
              />
            </div>
          </div>
          <button className="btn-primary" onClick={addSource}>+ Ajouter</button>
        </div>
      </div>

      {totalIncome > 0 && (
        <div className="card bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <div className="text-sm text-green-700 font-medium">Revenu total mensuel</div>
              <div className="text-3xl font-bold text-green-800">{fmt(totalIncome)}</div>
              <div className="text-sm text-green-600">Annuel: {fmt(totalIncome * 12)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <AllocationTarget label="Dépenses" pct={75} income={totalIncome} color="text-blue-700" />
            <AllocationTarget label="Investissements" pct={15} income={totalIncome} color="text-purple-700" />
            <AllocationTarget label="Dons" pct={10} income={totalIncome} color="text-yellow-700" />
          </div>
        </div>
      )}
    </div>
  )
}

function AllocationTarget({ label, pct, income, color }) {
  const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`font-bold ${color}`}>{pct}%</div>
      <div className="text-xs font-medium text-slate-700">{fmt(income * pct / 100)}</div>
    </div>
  )
}
