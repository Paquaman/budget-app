import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RatioBar from './RatioBar'

const fmt = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)

const BABY_STEPS = [
  { step: 1, label: "Fonds d'urgence de 1 000$",  desc: 'Épargner 1 000$ rapidement pour les imprévus.' },
  { step: 2, label: 'Rembourser toutes les dettes', desc: 'Méthode boule de neige: du plus petit au plus grand solde.' },
  { step: 3, label: "Fonds d'urgence complet",      desc: 'Épargner 3 à 6 mois de dépenses.' },
  { step: 4, label: 'Investir 15% pour la retraite',desc: 'REER, CELI, et autres placements retraite.' },
  { step: 5, label: 'Épargne études enfants',        desc: 'REEE et autres épargnes éducation.' },
  { step: 6, label: 'Rembourser la maison',          desc: "Payer l'hypothèque en avance." },
  { step: 7, label: 'Bâtir la richesse et donner',  desc: 'Investir massivement et être généreux.' },
]

const BUDGET_METHODS = [
  {
    id: 'zero',
    label: 'Budget à Zéro',
    author: 'Dave Ramsey',
    icon: '🎯',
    color: 'border-ia-red bg-ia-redlight',
    activeColor: 'bg-ia-navy border-ia-navy',
    desc: 'Chaque dollar a un rôle précis. Revenu − toutes les dépenses = 0. Contrôle total sur chaque poste budgétaire.',
    rules: [
      { label: 'Besoins essentiels',   pct: null, note: 'Chaque catégorie budgétée à la main' },
      { label: 'Épargne / Dettes',     pct: null, note: 'Priorité selon les 7 étapes' },
      { label: 'Budget restant = 0$',  pct: 0,    note: 'Aucun dollar non alloué' },
    ],
  },
  {
    id: '50-30-20',
    label: 'Règle 50-30-20',
    author: 'Elizabeth Warren',
    icon: '⚖️',
    color: 'border-blue-400 bg-blue-50',
    activeColor: 'bg-blue-800 border-blue-800',
    desc: 'Division simple du revenu en trois grandes enveloppes. Facile à appliquer, idéal pour commencer.',
    rules: [
      { label: 'Besoins (loyer, bouffe, transport)', pct: 50, note: '50% du revenu net' },
      { label: 'Désirs (resto, loisirs, abos)',       pct: 30, note: '30% du revenu net' },
      { label: 'Épargne & remb. dettes',              pct: 20, note: '20% du revenu net' },
    ],
  },
  {
    id: 'pay-first',
    label: 'Se payer en premier',
    author: 'Warren Buffett',
    icon: '💡',
    color: 'border-yellow-500 bg-yellow-50',
    activeColor: 'bg-yellow-700 border-yellow-700',
    desc: 'Automatiser l\'épargne dès réception du salaire. Vous vivez avec ce qui reste. L\'enrichissement est automatique.',
    rules: [
      { label: "Épargne & investissements (d'abord!)", pct: 20, note: 'Virement automatique dès le salaire' },
      { label: 'Tout le reste (vivre avec)',            pct: 80, note: 'Aucune règle rigide sur les catégories' },
      { label: 'Dettes',                               pct: null, note: 'Incluses dans les 80%' },
    ],
  },
]

const COLORS_PIE = ['#1B3057', '#C8102E', '#B89A5E', '#2A4A7F', '#6B7D8F', '#0277bd', '#00838f', '#558b2f']

export default function Dashboard() {
  const { state, dispatch, totalIncome, totalBudgeted, totalActual, totalInvestments, totalDebtPayments, totalDebtBalance, remaining, ratios } = useBudget()
  const [mode, setMode] = useState('simple')          // 'simple' | 'detail'
  const [method, setMethod] = useState('zero')        // 'zero' | '50-30-20' | 'pay-first'

  const selectedMethod = BUDGET_METHODS.find(m => m.id === method)

  const expenseByCategory = state.expenses.reduce((acc, e) => {
    if (e.budgeted > 0) acc[e.category] = (acc[e.category] || 0) + Number(e.budgeted)
    return acc
  }, {})

  const pieData = [
    ...Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
    totalInvestments > 0  && { name: 'Investissements', value: totalInvestments },
    totalDebtPayments > 0 && { name: 'Dettes',          value: totalDebtPayments },
  ].filter(Boolean)

  // Cibles selon méthode choisie
  const targets = {
    'zero':      { expenses: 100, investments: 15, housing: 35 },
    '50-30-20':  { needs: 50, wants: 30, savings: 20, housing: 35 },
    'pay-first': { savings: 20, rest: 80, housing: 35 },
  }

  return (
    <div className="space-y-6">

      {/* ── Sélecteur mode simplifié / détaillé ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[
            { id: 'simple', label: '⚡ Simplifié',  desc: 'Vue rapide' },
            { id: 'detail', label: '🔬 Détaillé',   desc: 'Analyse complète' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m.id ? 'bg-ia-navy text-white shadow' : 'text-ia-muted hover:text-ia-navy'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-ia-muted bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          {mode === 'simple' ? 'Indicateurs clés uniquement' : 'Graphiques, ratios et étapes détaillées'}
        </div>
      </div>

      {/* ── Sélecteur méthode budget ── */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-ia-navy font-bold text-sm uppercase tracking-wide">Méthode budgétaire</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUDGET_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${
                method === m.id
                  ? `${m.activeColor} text-white`
                  : `${m.color} hover:shadow-md`
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{m.icon}</span>
                <div>
                  <div className={`font-bold text-sm ${method === m.id ? 'text-white' : 'text-ia-text'}`}>{m.label}</div>
                  <div className={`text-xs ${method === m.id ? 'text-white opacity-75' : 'text-ia-muted'}`}>{m.author}</div>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${method === m.id ? 'text-white opacity-90' : 'text-ia-muted'}`}>
                {m.desc}
              </p>
              {m.rules && (
                <div className="mt-2 space-y-1">
                  {m.rules.map((r, i) => (
                    <div key={i} className={`flex justify-between text-xs ${method === m.id ? 'text-white opacity-80' : 'text-ia-muted'}`}>
                      <span>{r.label}</span>
                      {r.pct !== null && <span className="font-bold">{r.pct}%</span>}
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenus mensuels"   value={fmt(totalIncome)}       color="text-green-700"  bg="bg-green-50"  icon="💰" />
        <StatCard label="Dépenses budg."      value={fmt(totalBudgeted)}     color="text-ia-navy"    bg="bg-ia-blue"   icon="💸" />
        <StatCard label="Investissements"     value={fmt(totalInvestments)}  color="text-ia-gold"    bg="bg-yellow-50" icon="📈" />
        <StatCard
          label="Solde restant"
          value={fmt(remaining)}
          color={remaining >= 0 ? 'text-green-700' : 'text-ia-red'}
          bg={remaining >= 0 ? 'bg-green-50' : 'bg-ia-redlight'}
          icon={remaining >= 0 ? '✅' : '⚠️'}
        />
      </div>

      {/* ── Cibles méthode choisie (simplifié) ── */}
      {totalIncome > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{selectedMethod.icon}</span>
            <div>
              <div className="font-bold text-ia-navy">{selectedMethod.label} — Analyse</div>
              <div className="text-xs text-ia-muted">{selectedMethod.author}</div>
            </div>
          </div>
          {method === 'zero' && (
            <div className="space-y-3">
              <RatioBar label="Logement"           value={ratios.housing}     recommended={35} color="bg-ia-navy"     icon="🏠" />
              <RatioBar label="Toutes dépenses"    value={ratios.expenses}    recommended={75} color="bg-ia-navylight" icon="💸" />
              <RatioBar label="Investissements"    value={ratios.investments} recommended={15} color="bg-yellow-500"  icon="📈" />
              <RatioBar label="Paiements de dettes" value={ratios.debts}     recommended={5}  color="bg-ia-red"      icon="🔴" />
              <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between text-sm font-medium">
                <span className="text-ia-muted">Budget alloué</span>
                <span className={remaining >= 0 ? 'text-green-600' : 'text-ia-red'}>
                  {((totalBudgeted + totalInvestments + totalDebtPayments) / totalIncome * 100).toFixed(1)}% — Reste: {fmt(remaining)}
                </span>
              </div>
            </div>
          )}
          {method === '50-30-20' && (
            <div className="space-y-3">
              {[
                { label: 'Besoins (50%)',         value: totalBudgeted,     target: totalIncome * 0.50, recommended: 50, color: 'bg-ia-navy' },
                { label: 'Désirs (30%)',           value: 0,                 target: totalIncome * 0.30, recommended: 30, color: 'bg-ia-navylight' },
                { label: 'Épargne / Dettes (20%)', value: totalInvestments + totalDebtPayments, target: totalIncome * 0.20, recommended: 20, color: 'bg-yellow-500' },
              ].map(r => (
                <div key={r.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ia-text">{r.label}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-ia-muted">Réel: <strong>{fmt(r.value)}</strong></span>
                      <span className="text-ia-muted">Cible: <strong>{fmt(r.target)}</strong></span>
                    </div>
                  </div>
                  <RatioBar label="" value={totalIncome > 0 ? r.value / totalIncome * 100 : 0} recommended={r.recommended} color={r.color} />
                </div>
              ))}
            </div>
          )}
          {method === 'pay-first' && (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-sm text-yellow-800">
                <strong>Étape 1 :</strong> Virer {fmt(totalIncome * 0.20)} (20%) dès réception du salaire vers épargne/investissements.
              </div>
              <RatioBar label="Épargne & Investissements (cible 20%)" value={ratios.investments} recommended={20} color="bg-yellow-500" icon="💡" />
              <RatioBar label="Logement (cible ≤ 35%)"                value={ratios.housing}     recommended={35} color="bg-ia-navy"    icon="🏠" />
              <div className="text-xs text-ia-muted mt-2 p-2 bg-ia-gray rounded-lg">
                Vous avez {fmt(totalIncome * 0.80)} pour toutes vos autres dépenses (80%).
                Actuel : <strong>{fmt(totalBudgeted + totalDebtPayments)}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mode détaillé uniquement ── */}
      {mode === 'detail' && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-bold text-ia-navy mb-4">Répartition des dépenses</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs text-ia-muted">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-ia-muted text-sm">
                  Entrez vos dépenses pour voir la répartition
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="font-bold text-ia-navy mb-4">Tous les ratios détaillés</h2>
              <div className="space-y-3">
                <RatioBar label="Logement"            value={ratios.housing}     recommended={35} color="bg-ia-navy"      icon="🏠" />
                <RatioBar label="Toutes dépenses"     value={ratios.expenses}    recommended={75} color="bg-ia-navylight" icon="💸" />
                <RatioBar label="Investissements"     value={ratios.investments} recommended={15} color="bg-yellow-500"   icon="📈" />
                <RatioBar label="Paiements de dettes" value={ratios.debts}       recommended={5}  color="bg-ia-red"       icon="🔴" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ia-navy">Les 7 Étapes — Dave Ramsey</h2>
              <span className="text-xs text-ia-muted bg-ia-gray px-2 py-1 rounded-full">Étape actuelle : {state.babyStep}</span>
            </div>
            <div className="grid gap-2">
              {BABY_STEPS.map(({ step, label, desc }) => (
                <button
                  key={step}
                  onClick={() => dispatch({ type: 'SET_BABY_STEP', payload: step })}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    step === state.babyStep
                      ? 'bg-ia-navy text-white shadow-md'
                      : step < state.babyStep
                      ? 'bg-green-50 text-green-800 border border-green-100'
                      : 'bg-ia-gray text-ia-muted hover:bg-ia-blue'
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === state.babyStep ? 'bg-white text-ia-navy'
                    : step < state.babyStep ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-ia-muted'
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
        </>
      )}

      {totalDebtBalance > 0 && (
        <div className="card bg-ia-red text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-bold">Dette totale</div>
              <div className="text-2xl font-bold">{fmt(totalDebtBalance)}</div>
              <div className="text-red-200 text-sm">Méthode boule de neige : remboursez du plus petit au plus grand!</div>
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
        <span className="text-xs font-semibold text-ia-muted uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
