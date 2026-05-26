import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

export default function Debts() {
  const { state, dispatch, totalDebtBalance, totalDebtPayments } = useBudget()
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', interestRate: '', monthlyPayment: '', type: 'credit' })

  const DEBT_TYPES = { credit: '💳 Carte de crédit', car: '🚗 Voiture', student: '🎓 Prêt étudiant', personal: '💰 Prêt personnel', other: '📌 Autre' }

  const sortedDebts = [...state.debts].sort((a, b) => Number(a.balance) - Number(b.balance))

  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance) return
    dispatch({ type: 'ADD_DEBT', payload: { ...newDebt, balance: Number(newDebt.balance), interestRate: Number(newDebt.interestRate || 0), monthlyPayment: Number(newDebt.monthlyPayment || 0) } })
    setNewDebt({ name: '', balance: '', interestRate: '', monthlyPayment: '', type: 'credit' })
  }

  const monthsToPayoff = (balance, payment, rate) => {
    if (!payment || payment <= 0) return null
    if (!rate || rate <= 0) return Math.ceil(balance / payment)
    const r = rate / 100 / 12
    return Math.ceil(Math.log(payment / (payment - balance * r)) / Math.log(1 + r))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {totalDebtBalance > 0 && (
        <div className="card bg-ramsey-red text-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <div className="flex-1">
              <div className="text-red-200 text-sm font-medium">Dette totale — Méthode Boule de Neige</div>
              <div className="text-3xl font-bold">{fmt(totalDebtBalance)}</div>
              <div className="text-red-200 text-sm">Paiements mensuels: {fmt(totalDebtPayments)}</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-red-900 bg-opacity-40 rounded-xl text-sm text-red-100">
            <strong>Stratégie Ramsey:</strong> Payez le minimum sur toutes les dettes. Mettez tout le surplus sur la plus <em>petite</em> dette d'abord. Une fois remboursée, passez à la suivante.
          </div>
        </div>
      )}

      {sortedDebts.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-lg text-slate-800 mb-1">Liste des dettes</h2>
          <p className="text-xs text-slate-500 mb-4">Triées du plus petit au plus grand solde (méthode boule de neige)</p>
          <div className="space-y-4">
            {sortedDebts.map((debt, i) => {
              const months = monthsToPayoff(Number(debt.balance), Number(debt.monthlyPayment), Number(debt.interestRate))
              const years = months ? Math.floor(months / 12) : null
              const remMonths = months ? months % 12 : null
              return (
                <div key={debt.id} className={`border rounded-xl p-4 ${i === 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">CIBLE</span>}
                      <div>
                        <div className="font-medium text-slate-800">{debt.name}</div>
                        <div className="text-xs text-slate-500">{DEBT_TYPES[debt.type] || debt.type}</div>
                      </div>
                    </div>
                    <button
                      className="text-slate-300 hover:text-red-500 transition-colors text-xl"
                      onClick={() => dispatch({ type: 'REMOVE_DEBT', payload: debt.id })}
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Solde ($)</label>
                      <input
                        type="number"
                        className="input"
                        value={debt.balance || ''}
                        onChange={e => dispatch({ type: 'UPDATE_DEBT', payload: { id: debt.id, balance: Number(e.target.value) } })}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="label">Taux (%)</label>
                      <input
                        type="number"
                        className="input"
                        value={debt.interestRate || ''}
                        onChange={e => dispatch({ type: 'UPDATE_DEBT', payload: { id: debt.id, interestRate: Number(e.target.value) } })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="label">Paiement mensuel ($)</label>
                      <input
                        type="number"
                        className="input"
                        value={debt.monthlyPayment || ''}
                        onChange={e => dispatch({ type: 'UPDATE_DEBT', payload: { id: debt.id, monthlyPayment: Number(e.target.value) } })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  {months && (
                    <div className="mt-2 text-xs text-slate-500">
                      Remboursement estimé:&nbsp;
                      <strong className="text-slate-700">
                        {years ? `${years} an${years > 1 ? 's' : ''} ` : ''}{remMonths ? `${remMonths} mois` : ''}
                      </strong>
                      {debt.interestRate > 0 && (
                        <span className="ml-2 text-red-500">
                          · Intérêts totaux: {fmt((Number(debt.monthlyPayment) * months) - Number(debt.balance))}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card border-dashed">
        <h3 className="font-bold text-slate-700 mb-4">Ajouter une dette</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Nom de la dette</label>
            <input type="text" className="input" placeholder="Ex: Visa BMO" value={newDebt.name} onChange={e => setNewDebt(s => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={newDebt.type} onChange={e => setNewDebt(s => ({ ...s, type: e.target.value }))}>
              {Object.entries(DEBT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Solde actuel ($)</label>
            <input type="number" className="input" placeholder="0" value={newDebt.balance} onChange={e => setNewDebt(s => ({ ...s, balance: e.target.value }))} min="0" />
          </div>
          <div>
            <label className="label">Taux d'intérêt (%)</label>
            <input type="number" className="input" placeholder="0.0" value={newDebt.interestRate} onChange={e => setNewDebt(s => ({ ...s, interestRate: e.target.value }))} min="0" step="0.1" />
          </div>
          <div>
            <label className="label">Paiement mensuel ($)</label>
            <input type="number" className="input" placeholder="0" value={newDebt.monthlyPayment} onChange={e => setNewDebt(s => ({ ...s, monthlyPayment: e.target.value }))} min="0" />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addDebt}>+ Ajouter la dette</button>
      </div>
    </div>
  )
}
