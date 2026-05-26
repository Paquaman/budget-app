import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

const TYPE_LABELS = { emergency: 'Urgence', retirement: 'Retraite', other: 'Autre' }
const TYPE_COLORS = { emergency: '#f9a825', retirement: '#2e7d32', other: '#1e3a5f' }

export default function Investments() {
  const { state, dispatch, totalInvestments, totalIncome } = useBudget()
  const [newInv, setNewInv] = useState({ name: '', amount: '', goal: '', type: 'retirement' })

  const recommended15 = totalIncome * 0.15
  const pct = totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0
  const isOnTrack = pct >= 15

  const addInvestment = () => {
    if (!newInv.name || !newInv.amount) return
    dispatch({
      type: 'ADD_INVESTMENT',
      payload: { name: newInv.name, amount: Number(newInv.amount), goal: Number(newInv.goal || 0), type: newInv.type },
    })
    setNewInv({ name: '', amount: '', goal: '', type: 'retirement' })
  }

  const chartData = state.investments
    .filter(inv => inv.amount > 0 || inv.goal > 0)
    .map(inv => ({ name: inv.name.length > 16 ? inv.name.slice(0, 14) + '…' : inv.name, Mensuel: Number(inv.amount), Objectif: Number(inv.goal) }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`card ${isOnTrack ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-sm font-medium ${isOnTrack ? 'text-green-700' : 'text-yellow-700'}`}>
              {isOnTrack ? '✅ Objectif 15% atteint!' : '⚠️ Objectif: 15% du revenu'}
            </div>
            <div className={`text-3xl font-bold ${isOnTrack ? 'text-green-800' : 'text-yellow-800'}`}>
              {fmt(totalInvestments)} / mois
            </div>
            <div className={`text-sm ${isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
              {pct.toFixed(1)}% du revenu · Recommandé: {fmt(recommended15)}
            </div>
          </div>
          <span className="text-4xl">{isOnTrack ? '🚀' : '📊'}</span>
        </div>
        {totalIncome > 0 && (
          <div className="mt-3 h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isOnTrack ? 'bg-green-500' : 'bg-yellow-400'}`}
              style={{ width: `${Math.min(pct / 15 * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {state.investments.map(inv => (
          <div key={inv.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[inv.type] }} />
                <div>
                  <div className="font-medium text-slate-800">{inv.name}</div>
                  <div className="text-xs text-slate-500">{TYPE_LABELS[inv.type]}</div>
                </div>
              </div>
              <button
                className="text-slate-300 hover:text-red-500 transition-colors text-xl leading-none"
                onClick={() => dispatch({ type: 'REMOVE_INVESTMENT', payload: inv.id })}
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Contribution mensuelle ($)</label>
                <input
                  type="number"
                  className="input"
                  value={inv.amount || ''}
                  onChange={e => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id: inv.id, amount: Number(e.target.value) } })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Objectif annuel ($)</label>
                <input
                  type="number"
                  className="input"
                  value={inv.goal || ''}
                  onChange={e => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id: inv.id, goal: Number(e.target.value) } })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            {inv.goal > 0 && inv.amount > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                Objectif atteint dans: {Math.ceil(inv.goal / inv.amount)} mois · Annuel: {fmt(inv.amount * 12)}
              </div>
            )}
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-slate-700 mb-4">Vue d'ensemble</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}$`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="Mensuel" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card border-dashed">
        <h3 className="font-bold text-slate-700 mb-4">Ajouter un investissement</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Nom</label>
            <input type="text" className="input" placeholder="Ex: REER Banque..." value={newInv.name} onChange={e => setNewInv(s => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={newInv.type} onChange={e => setNewInv(s => ({ ...s, type: e.target.value }))}>
              <option value="emergency">Fonds d'urgence</option>
              <option value="retirement">Retraite</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="label">Contribution mensuelle ($)</label>
            <input type="number" className="input" placeholder="0" value={newInv.amount} onChange={e => setNewInv(s => ({ ...s, amount: e.target.value }))} min="0" />
          </div>
          <div>
            <label className="label">Objectif ($) (optionnel)</label>
            <input type="number" className="input" placeholder="0" value={newInv.goal} onChange={e => setNewInv(s => ({ ...s, goal: e.target.value }))} min="0" />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addInvestment}>+ Ajouter</button>
      </div>
    </div>
  )
}
