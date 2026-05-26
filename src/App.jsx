import { useState } from 'react'
import { BudgetProvider, useBudget } from './context/BudgetContext'
import Dashboard from './components/Dashboard'
import Income from './components/Income'
import Expenses from './components/Expenses'
import Investments from './components/Investments'
import Debts from './components/Debts'

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'income', label: 'Revenus', icon: '💰' },
  { id: 'expenses', label: 'Dépenses', icon: '💸' },
  { id: 'investments', label: 'Investissements', icon: '📈' },
  { id: 'debts', label: 'Dettes', icon: '🔴' },
]

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { totalIncome, totalExpenses, totalDebtBalance, remaining } = useBudget()

  const panels = { dashboard: Dashboard, income: Income, expenses: Expenses, investments: Investments, debts: Debts }
  const ActivePanel = panels[activeTab]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-ramsey-blue text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-ramsey-gold rounded-xl w-10 h-10 flex items-center justify-center text-xl font-bold text-ramsey-blue shadow">$</div>
            <div>
              <div className="font-bold text-lg leading-tight">Budget Ramsey</div>
              <div className="text-blue-300 text-xs">Gestion financière · Dave Ramsey</div>
            </div>
          </div>
          {totalIncome > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-blue-300 text-xs">Revenus</div>
                <div className="font-bold text-green-300">{new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(totalIncome)}</div>
              </div>
              <div className="w-px h-8 bg-blue-700" />
              <div className="text-center">
                <div className="text-blue-300 text-xs">Solde</div>
                <div className={`font-bold ${remaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(remaining)}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex gap-1 py-3 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link shrink-0 ${activeTab === tab.id ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'debts' && totalDebtBalance > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">!</span>
              )}
            </button>
          ))}
        </nav>

        <main className="pb-12">
          <ActivePanel />
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white text-center py-4 text-xs text-slate-400">
        Budget Ramsey — Inspiré des principes de Dave Ramsey · Données sauvegardées localement
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  )
}
