import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { FREQ_LABELS, FREQ_FACTORS, toMonthly } from '../context/BudgetContext'

const fmt     = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)
const fmtFull = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n)

const INCOME_FREQS = ['weekly', 'biweekly', 'monthly']

const FREQ_SHORT = { weekly: 'sem.', biweekly: '2 sem.', monthly: 'mois', annual: 'an' }

export default function Income() {
  const { state, dispatch, totalIncome } = useBudget()
  const [newSource, setNewSource] = useState({ name: '', amount: '', freq: 'monthly' })

  const monthly = toMonthly(state.incomeRaw, state.incomeFreq)

  const addSource = () => {
    if (!newSource.name || !newSource.amount) return
    dispatch({ type: 'ADD_OTHER_INCOME', payload: { name: newSource.name, amount: Number(newSource.amount), freq: newSource.freq } })
    setNewSource({ name: '', amount: '', freq: 'monthly' })
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Salaire principal */}
      <div className="card">
        <h2 className="font-bold text-lg text-ia-navy mb-4">Revenu principal</h2>

        {/* Sélecteur fréquence */}
        <div className="flex gap-2 mb-4">
          {INCOME_FREQS.map(f => (
            <button
              key={f}
              onClick={() => dispatch({ type: 'SET_INCOME_FREQ', payload: f })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                state.incomeFreq === f
                  ? 'bg-ia-navy text-white border-ia-navy shadow'
                  : 'bg-white text-ia-muted border-slate-200 hover:border-ia-navy hover:text-ia-navy'
              }`}
            >
              {FREQ_LABELS[f]}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Salaire net {FREQ_LABELS[state.incomeFreq].toLowerCase()} (après impôts)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ia-muted font-medium">$</span>
              <input
                type="number"
                className="input pl-7"
                value={state.incomeRaw || ''}
                onChange={e => dispatch({ type: 'SET_INCOME', payload: { raw: e.target.value, freq: state.incomeFreq } })}
                placeholder="0.00"
                min="0"
              />
            </div>
            <span className="text-sm text-ia-muted shrink-0">/ {FREQ_SHORT[state.incomeFreq]}</span>
          </div>

          {state.incomeRaw > 0 && state.incomeFreq !== 'monthly' && (
            <div className="mt-2 p-2 bg-ia-blue rounded-lg text-xs text-ia-navy">
              Équivalent mensuel : <strong>{fmt(monthly)}</strong>
            </div>
          )}

          {state.incomeRaw > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-ia-gray rounded-lg p-2">
                <div className="text-xs text-ia-muted">Hebdo</div>
                <div className="font-bold text-ia-navy text-sm">{fmt(monthly / (52/12))}</div>
              </div>
              <div className="bg-ia-gray rounded-lg p-2">
                <div className="text-xs text-ia-muted">Mensuel</div>
                <div className="font-bold text-ia-navy text-sm">{fmt(monthly)}</div>
              </div>
              <div className="bg-ia-gray rounded-lg p-2">
                <div className="text-xs text-ia-muted">Annuel</div>
                <div className="font-bold text-ia-navy text-sm">{fmt(monthly * 12)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Autres revenus */}
      <div className="card">
        <h2 className="font-bold text-lg text-ia-navy mb-4">Autres sources de revenus</h2>

        <div className="space-y-3">
          {state.otherIncome.map(src => (
            <div key={src.id} className="flex items-center justify-between bg-ia-gray rounded-xl px-4 py-3">
              <div>
                <div className="font-medium text-sm text-ia-text">{src.name}</div>
                <div className="text-green-700 font-bold text-sm">
                  {fmtFull(src.amount)}
                  <span className="text-ia-muted font-normal text-xs"> / {FREQ_SHORT[src.freq || 'monthly']}</span>
                  {src.freq && src.freq !== 'monthly' && (
                    <span className="text-ia-muted font-normal text-xs ml-2">= {fmt(toMonthly(src.amount, src.freq))} / mois</span>
                  )}
                </div>
              </div>
              <button className="btn-danger" onClick={() => dispatch({ type: 'REMOVE_OTHER_INCOME', payload: src.id })}>
                Supprimer
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <p className="text-sm font-semibold text-ia-navy">Ajouter une source</p>

          {/* Fréquence */}
          <div className="flex gap-2">
            {['weekly', 'biweekly', 'monthly', 'annual'].map(f => (
              <button
                key={f}
                onClick={() => setNewSource(s => ({ ...s, freq: f }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  newSource.freq === f
                    ? 'bg-ia-navy text-white border-ia-navy'
                    : 'bg-white text-ia-muted border-slate-200 hover:border-ia-navy'
                }`}
              >
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Description</label>
              <input type="text" className="input" placeholder="Ex: Freelance, loyer reçu..." value={newSource.name}
                onChange={e => setNewSource(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Montant ({FREQ_LABELS[newSource.freq].toLowerCase()}) ($)</label>
              <input type="number" className="input" placeholder="0.00" value={newSource.amount} min="0"
                onChange={e => setNewSource(s => ({ ...s, amount: e.target.value }))} />
            </div>
          </div>
          <button className="btn-primary" onClick={addSource}>+ Ajouter</button>
        </div>
      </div>

      {/* Total */}
      {totalIncome > 0 && (
        <div className="card bg-ia-navy text-white border-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💰</span>
            <div>
              <div className="text-blue-300 text-sm font-medium">Revenu total mensuel</div>
              <div className="text-3xl font-bold">{fmt(totalIncome)}</div>
              <div className="text-blue-300 text-sm">Annuel : {fmt(totalIncome * 12)}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <AllocationTarget label="Dépenses" pct={75} income={totalIncome} />
            <AllocationTarget label="Investissements" pct={15} income={totalIncome} />
            <AllocationTarget label="Dons" pct={10} income={totalIncome} />
          </div>
        </div>
      )}
    </div>
  )
}

function AllocationTarget({ label, pct, income }) {
  return (
    <div className="bg-ia-navylight rounded-xl p-3">
      <div className="text-xs text-blue-300">{label}</div>
      <div className="font-bold text-ia-gold">{pct}%</div>
      <div className="text-xs font-medium text-white">{new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(income * pct / 100)}</div>
    </div>
  )
}
