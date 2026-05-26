import { useState } from 'react'
import { BudgetProvider, useBudget } from './context/BudgetContext'
import Dashboard from './components/Dashboard'
import Income from './components/Income'
import Expenses from './components/Expenses'
import Investments from './components/Investments'
import Debts from './components/Debts'

const TABS = [
  { id: 'dashboard',   label: 'Tableau de bord', icon: '📊' },
  { id: 'income',      label: 'Revenus',          icon: '💰' },
  { id: 'expenses',    label: 'Dépenses',          icon: '💸' },
  { id: 'investments', label: 'Investissements',   icon: '📈' },
  { id: 'debts',       label: 'Dettes',            icon: '🔴' },
]

const fmt = (n) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { totalIncome, totalBudgeted, totalDebtBalance, remaining } = useBudget()

  const panels = { dashboard: Dashboard, income: Income, expenses: Expenses, investments: Investments, debts: Debts }
  const ActivePanel = panels[activeTab]

  return (
    <div className="min-h-screen bg-ia-gray">
      {/* Header */}
      <header className="bg-ia-navy text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              {/* Logo iA stylisé */}
              <div className="flex items-center gap-1">
                <div className="w-9 h-9 bg-ia-red rounded-lg flex items-center justify-center font-black text-white text-sm leading-none shadow">
                  iA
                </div>
                <div className="w-1 h-9 bg-ia-gold rounded-full mx-1 opacity-60" />
              </div>
              <div>
                <div className="font-bold text-base leading-tight tracking-wide">Budget Personnel</div>
                <div className="text-xs text-blue-300 font-medium tracking-wider uppercase">Centre Financier Ste-Foy</div>
              </div>
            </div>

            {totalIncome > 0 && (
              <div className="hidden md:flex items-center gap-5 text-sm">
                <Stat label="Revenus" value={fmt(totalIncome)} color="text-green-300" />
                <div className="w-px h-8 bg-ia-navylight" />
                <Stat label="Dépenses budg." value={fmt(totalBudgeted)} color="text-blue-200" />
                <div className="w-px h-8 bg-ia-navylight" />
                <Stat
                  label="Solde"
                  value={fmt(remaining)}
                  color={remaining >= 0 ? 'text-green-300' : 'text-red-300'}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 pb-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link shrink-0 ${activeTab === tab.id ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'debts' && totalDebtBalance > 0 && (
                  <span className="bg-ia-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <ActivePanel />
      </main>

      <footer className="border-t border-slate-200 bg-white text-center py-3 text-xs text-ia-muted">
        <span className="font-semibold text-ia-navy">iA Gestion Privée</span> · Centre Financier Ste-Foy · Données sauvegardées localement
      </footer>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <div className="text-blue-400 text-xs">{label}</div>
      <div className={`font-bold ${color}`}>{value}</div>
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
