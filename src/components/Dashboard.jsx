import { useBudget } from '../context/BudgetContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RatioBar from './RatioBar'

const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

const BABY_STEPS = [
  { step: 1, label: 'Fonds d\'urgence de 1 000$', desc: 'Épargner 1 000$ rapidement pour les imprévus.' },
  { step: 2, label: 'Rembourser toutes les dettes', desc: 'Méthode boule de neige: du plus petit au plus grand solde.' },
  { step: 3, label: 'Fonds d\'urgence complet', desc: 'Épargner 3 à 6 mois de dépenses.' },
  { step: 4, label: 'Investir 15% pour la retraite', desc: 'REER, CELI, et autres placements retraite.' },
  { step: 5, label: 'Épargne études enfants', desc: 'REEE et autres épargnes éducation.' },
  { step: 6, label: 'Rembourser la maison', desc: 'Payer l\'hypothèque en avance.' },
  { step: 7, label: 'Bâtir la richesse et donner', desc: 'Investir massivement et être généreux.' },
]

export default function Dashboard() {
  const { state, dispatch, totalIncome, totalExpenses, totalInvestments, totalDebtPayments, totalDebtBalance, remaining, ratios } = useBudget()

  const expenseByCategory = state.expenses.reduce((acc, e) => {
    if (e.amount > 0) {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    }
    return acc
  }, {})

  const pieData = [
    ...Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
    totalInvestments > 0 && { name: 'Investissements', value: totalInvestments },
    totalDebtPayments > 0 && { name: 'Dettes', value: totalDebtPayments },
  ].filter(Boolean)

  const COLORS = ['#1e3a5f', '#2e7d32', '#f9a825', '#c62828', '#7b1fa2', '#0277bd', '#00838f', '#558b2f', '#ef6c00']

  const currentStep = BABY_STEPS.find(s => s.step === state.babyStep) || BABY_STEPS[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenus mensuels" value={fmt(totalIncome)} color="text-green-700" bg="bg-green-50" icon="💰" />
        <StatCard label="Dépenses totales" value={fmt(totalExpenses)} color="text-blue-700" bg="bg-blue-50" icon="💸" />
        <StatCard label="Investissements" value={fmt(totalInvestments)} color="text-purple-700" bg="bg-purple-50" icon="📈" />
        <StatCard
          label="Solde restant"
          value={fmt(remaining)}
          color={remaining >= 0 ? 'text-green-700' : 'text-red-700'}
          bg={remaining >= 0 ? 'bg-green-50' : 'bg-red-50'}
          icon={remaining >= 0 ? '✅' : '⚠️'}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="font-bold text-lg text-slate-800">Ratios budgétaires</h2>
          <p className="text-xs text-slate-500">Basé sur les recommandations Dave Ramsey</p>
          <RatioBar label="Logement" value={ratios.housing} recommended={35} color="bg-blue-500" icon="🏠" />
          <RatioBar label="Toutes dépenses" value={ratios.expenses} recommended={75} color="bg-indigo-500" icon="💸" />
          <RatioBar label="Investissements" value={ratios.investments} recommended={15} color="bg-green-500" icon="📈" />
          <RatioBar label="Paiements de dettes" value={ratios.debts} recommended={5} color="bg-orange-500" icon="🔴" />
          <RatioBar label="Dons / Charité" value={ratios.giving} recommended={10} color="bg-yellow-500" icon="🤝" />
          {totalIncome > 0 && (
            <div className="mt-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600">Budget alloué</span>
                <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {((totalExpenses + totalInvestments + totalDebtPayments) / totalIncome * 100).toFixed(1)}% / 100%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-bold text-lg text-slate-800 mb-4">Répartition des dépenses</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Entrez vos dépenses pour voir la répartition
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-800">Les 7 Étapes de Dave Ramsey</h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Étape actuelle: {state.babyStep}</span>
        </div>
        <div className="grid gap-2">
          {BABY_STEPS.map(({ step, label, desc }) => (
            <button
              key={step}
              onClick={() => dispatch({ type: 'SET_BABY_STEP', payload: step })}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                step === state.babyStep
                  ? 'bg-ramsey-blue text-white shadow-md'
                  : step < state.babyStep
                  ? 'bg-green-50 text-green-800 border border-green-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                step === state.babyStep ? 'bg-white text-ramsey-blue' : step < state.babyStep ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step < state.babyStep ? '✓' : step}
              </span>
              <div>
                <div className="font-medium text-sm">{label}</div>
                <div className={`text-xs mt-0.5 ${step === state.babyStep ? 'text-blue-200' : 'opacity-70'}`}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {totalDebtBalance > 0 && (
        <div className="card bg-ramsey-red text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-bold">Dette totale</div>
              <div className="text-2xl font-bold">{fmt(totalDebtBalance)}</div>
              <div className="text-red-200 text-sm">Méthode boule de neige: remboursez du plus petit au plus grand!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className={`card ${bg} border-0`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
