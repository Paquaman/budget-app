import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RatioBar from './RatioBar'

const fmt  = (n) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)
const pctF = (n) => `${n.toFixed(1)}%`

const BABY_STEPS = [
  { step: 1, label: "Fonds d'urgence de 1 000$",   desc: 'Épargner 1 000$ rapidement pour les imprévus.' },
  { step: 2, label: 'Rembourser toutes les dettes',  desc: 'Méthode boule de neige : du plus petit au plus grand solde.' },
  { step: 3, label: "Fonds d'urgence complet",       desc: 'Épargner 3 à 6 mois de dépenses.' },
  { step: 4, label: 'Investir 15% pour la retraite', desc: 'REER, CELI, et autres placements retraite.' },
  { step: 5, label: 'Épargne études enfants',         desc: 'REEE et autres épargnes éducation.' },
  { step: 6, label: 'Rembourser la maison',           desc: "Payer l'hypothèque en avance." },
  { step: 7, label: 'Bâtir la richesse et donner',   desc: 'Investir massivement et être généreux.' },
]

// Ratios recommandés Ramsey par catégorie
const RAMSEY_RATIOS = [
  { key: 'housing',     label: 'Logement',          range: '25–35%', min: 25, max: 35, recommended: 30, icon: '🏠', color: 'bg-purple-600' },
  { key: 'food',        label: 'Alimentation',       range: '10–15%', min: 10, max: 15, recommended: 12, icon: '🛒', color: 'bg-green-600'  },
  { key: 'transport',   label: 'Transport',           range: '10–15%', min: 10, max: 15, recommended: 12, icon: '🚗', color: 'bg-blue-600'   },
  { key: 'investments', label: 'Investissements',     range: '15%',    min: 15, max: 15, recommended: 15, icon: '📈', color: 'bg-yellow-500' },
  { key: 'giving',      label: 'Dons / Charité',      range: '10%',    min: 10, max: 10, recommended: 10, icon: '🤝', color: 'bg-ia-gold'    },
  { key: 'debts',       label: 'Dettes (objectif 0%)',range: '0%',     min: 0,  max: 0,  recommended: 0,  icon: '🔴', color: 'bg-ia-red'     },
]

const BUDGET_METHODS = [
  {
    id: 'zero',
    label: 'Budget à Zéro',
    author: 'Dave Ramsey',
    icon: '🎯',
    border: 'border-ia-red',
    activeBg: 'bg-ia-navy border-ia-navy',
    desc: 'Chaque dollar a un rôle précis. Revenu − toutes les dépenses = 0. Contrôle total sur chaque poste budgétaire.',
    pills: [{ label: 'Chaque dollar alloué' }, { label: 'Budget = 0$' }, { label: '7 étapes' }],
  },
  {
    id: '50-30-20',
    label: 'Règle 50-30-20',
    author: 'Elizabeth Warren',
    icon: '⚖️',
    border: 'border-blue-400',
    activeBg: 'bg-blue-800 border-blue-800',
    desc: 'Division simple du revenu : 50% besoins, 30% désirs, 20% épargne & dettes. Idéal pour commencer.',
    pills: [{ label: '50% besoins' }, { label: '30% désirs' }, { label: '20% épargne' }],
  },
  {
    id: 'pay-first',
    label: 'Se payer en premier',
    author: 'Warren Buffett',
    icon: '💡',
    border: 'border-yellow-500',
    activeBg: 'bg-yellow-700 border-yellow-700',
    desc: "Automatiser l'épargne dès réception du salaire. Vous vivez avec ce qui reste. L'enrichissement est automatique.",
    pills: [{ label: '20% épargne auto' }, { label: 'Virement immédiat' }, { label: '80% pour vivre' }],
  },
]

const COLORS_PIE = ['#1B3057', '#C8102E', '#B89A5E', '#2A4A7F', '#6B7D8F', '#0277bd', '#00838f', '#558b2f']

export default function Dashboard() {
  const { state, dispatch, totalIncome, totalBudgeted, totalActual, totalInvestments, totalDebtPayments, totalDebtBalance, remaining, ratios } = useBudget()
  const [mode,   setMode]   = useState('simple')
  const [method, setMethod] = useState('zero')

  const expenseByCategory = state.expenses.reduce((acc, e) => {
    if (e.budgeted > 0) acc[e.category] = (acc[e.category] || 0) + Number(e.budgeted)
    return acc
  }, {})

  const pieData = [
    ...Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
    totalInvestments  > 0 && { name: 'Investissements', value: totalInvestments },
    totalDebtPayments > 0 && { name: 'Dettes',          value: totalDebtPayments },
  ].filter(Boolean)

  const getRatioStatus = (value, min, max) => {
    if (max === 0) return value === 0 ? 'ok' : 'over'
    if (value >= min && value <= max) return 'ok'
    if (value < min) return 'under'
    return 'over'
  }

  return (
    <div className="space-y-6">

      {/* Mode simplifié / détaillé */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[
            { id: 'simple', label: '⚡ Simplifié' },
            { id: 'detail', label: '🔬 Détaillé'  },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === m.id ? 'bg-ia-navy text-white shadow' : 'text-ia-muted hover:text-ia-navy'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-ia-muted bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          {mode === 'simple' ? 'Indicateurs clés uniquement' : 'Graphiques, ratios et étapes détaillées'}
        </span>
      </div>

      {/* Sélecteur méthode */}
      <div className="card p-4">
        <p className="text-xs font-bold text-ia-muted uppercase tracking-widest mb-3">Méthode budgétaire</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUDGET_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${method === m.id ? `${m.activeBg} text-white` : `bg-white ${m.border} hover:shadow-md`}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <div className={`font-bold text-sm ${method === m.id ? 'text-white' : 'text-ia-text'}`}>{m.label}</div>
                  <div className={`text-xs ${method === m.id ? 'text-white opacity-75' : 'text-ia-muted'}`}>{m.author}</div>
                </div>
              </div>
              <p className={`text-xs leading-relaxed mb-2 ${method === m.id ? 'text-white opacity-90' : 'text-ia-muted'}`}>{m.desc}</p>
              <div className="flex flex-wrap gap-1">
                {m.pills.map((p, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${method === m.id ? 'bg-white bg-opacity-20 text-white' : 'bg-slate-100 text-ia-muted'}`}>
                    {p.label}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenus mensuels"  value={fmt(totalIncome)}       color="text-green-700" bg="bg-green-50"    icon="💰" />
        <StatCard label="Dépenses budg."     value={fmt(totalBudgeted)}     color="text-ia-navy"   bg="bg-ia-blue"     icon="💸" />
        <StatCard label="Investissements"    value={fmt(totalInvestments)}  color="text-yellow-700" bg="bg-yellow-50"  icon="📈" />
        <StatCard label="Solde restant"      value={fmt(remaining)}
          color={remaining >= 0 ? 'text-green-700' : 'text-ia-red'}
          bg={remaining >= 0 ? 'bg-green-50' : 'bg-red-50'}
          icon={remaining >= 0 ? '✅' : '⚠️'}
        />
      </div>

      {/* ── Analyse selon méthode ── */}
      {totalIncome > 0 && (
        <>
          {/* ── DAVE RAMSEY : tableau de ratios recommandés ── */}
          {method === 'zero' && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-bold text-ia-navy">Répartition recommandée — Dave Ramsey</div>
                  <div className="text-xs text-ia-muted">Basée sur votre revenu mensuel de {fmt(totalIncome)}</div>
                </div>
              </div>

              {/* Tableau des ratios */}
              <div className="rounded-xl overflow-hidden border border-slate-200 mb-4">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] bg-ia-navy text-white text-xs font-bold uppercase tracking-wide">
                  <div className="px-3 py-2">Catégorie</div>
                  <div className="px-3 py-2 text-right">Recommandé</div>
                  <div className="px-3 py-2 text-right">Montant cible</div>
                  <div className="px-3 py-2 text-right">Votre budget</div>
                  <div className="px-3 py-2 text-center">Statut</div>
                </div>
                {RAMSEY_RATIOS.map((r, i) => {
                  const actual = ratios[r.key] || 0
                  const actualAmt = totalIncome * actual / 100
                  const targetAmt = totalIncome * r.recommended / 100
                  const status = getRatioStatus(actual, r.min, r.max)
                  return (
                    <div key={r.key} className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] text-sm border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-ia-gray'}`}>
                      <div className="px-3 py-2.5 flex items-center gap-2 font-medium text-ia-text">
                        <span>{r.icon}</span> {r.label}
                      </div>
                      <div className="px-3 py-2.5 text-right text-ia-muted font-medium">{r.range}</div>
                      <div className="px-3 py-2.5 text-right text-ia-navy font-semibold">{fmt(targetAmt)}</div>
                      <div className={`px-3 py-2.5 text-right font-bold ${
                        status === 'ok'    ? 'text-green-600' :
                        status === 'over'  ? 'text-ia-red'    : 'text-yellow-600'
                      }`}>
                        {fmt(actualAmt)}
                        <span className="text-xs font-normal ml-1 opacity-70">({pctF(actual)})</span>
                      </div>
                      <div className="px-3 py-2.5 flex items-center justify-center">
                        {status === 'ok'    && <span className="text-green-600 font-bold text-base">✓</span>}
                        {status === 'over'  && <span className="text-ia-red   font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded-full">Au-dessus</span>}
                        {status === 'under' && <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-1.5 py-0.5 rounded-full">En dessous</span>}
                      </div>
                    </div>
                  )
                })}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] bg-slate-100 text-sm font-bold">
                  <div className="px-3 py-2 text-ia-navy">Solde non alloué</div>
                  <div className="px-3 py-2 text-right text-ia-muted">0%</div>
                  <div className="px-3 py-2 text-right text-ia-navy">{fmt(0)}</div>
                  <div className={`px-3 py-2 text-right font-bold ${remaining >= 0 ? 'text-green-600' : 'text-ia-red'}`}>
                    {fmt(remaining)}
                  </div>
                  <div className="px-3 py-2 flex items-center justify-center">
                    {remaining === 0 && <span className="text-green-600 font-bold">✓</span>}
                    {remaining > 0  && <span className="text-yellow-600 text-xs font-bold bg-yellow-50 px-1.5 py-0.5 rounded-full">À allouer</span>}
                    {remaining < 0  && <span className="text-ia-red    text-xs font-bold bg-red-50   px-1.5 py-0.5 rounded-full">Déficit</span>}
                  </div>
                </div>
              </div>

              {/* Barres visuelles */}
              <div className="space-y-2.5">
                {RAMSEY_RATIOS.map(r => (
                  <RatioBar key={r.key} label={r.label} value={ratios[r.key] || 0} recommended={r.recommended} color={r.color} icon={r.icon} />
                ))}
              </div>
            </div>
          )}

          {/* ── 50-30-20 ── */}
          {method === '50-30-20' && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚖️</span>
                <div>
                  <div className="font-bold text-ia-navy">Analyse 50-30-20 — Elizabeth Warren</div>
                  <div className="text-xs text-ia-muted">Revenu mensuel : {fmt(totalIncome)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Besoins', pct: 50, value: totalBudgeted, color: 'bg-ia-navy text-white', bar: 'bg-ia-navy' },
                  { label: 'Désirs',  pct: 30, value: 0,             color: 'bg-blue-100 text-blue-900', bar: 'bg-blue-500' },
                  { label: 'Épargne', pct: 20, value: totalInvestments + totalDebtPayments, color: 'bg-yellow-50 text-yellow-900', bar: 'bg-yellow-500' },
                ].map(e => {
                  const target = totalIncome * e.pct / 100
                  const diff = e.value - target
                  return (
                    <div key={e.label} className={`rounded-xl p-4 ${e.color}`}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-1">{e.label}</div>
                      <div className="text-2xl font-bold">{e.pct}%</div>
                      <div className="text-sm font-semibold mt-1">{fmt(target)}</div>
                      {e.value > 0 && (
                        <div className={`text-xs mt-2 font-medium ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          Réel: {fmt(e.value)} ({diff >= 0 ? '+' : ''}{fmt(diff)})
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <RatioBar label="Besoins (50%)" value={totalIncome > 0 ? totalBudgeted / totalIncome * 100 : 0} recommended={50} color="bg-ia-navy" />
              <div className="mt-2">
                <RatioBar label="Épargne & Dettes (20%)" value={totalIncome > 0 ? (totalInvestments + totalDebtPayments) / totalIncome * 100 : 0} recommended={20} color="bg-yellow-500" />
              </div>
            </div>
          )}

          {/* ── Se payer en premier ── */}
          {method === 'pay-first' && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="font-bold text-ia-navy">Se payer en premier — Warren Buffett</div>
                  <div className="text-xs text-ia-muted">Revenu mensuel : {fmt(totalIncome)}</div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                <div className="font-bold text-yellow-800 mb-1">📌 Action immédiate</div>
                <div className="text-sm text-yellow-700">
                  Virer <strong>{fmt(totalIncome * 0.20)}</strong> (20%) dès réception du salaire vers vos comptes d'épargne/investissement.
                  Il vous reste <strong>{fmt(totalIncome * 0.80)}</strong> pour toutes vos dépenses.
                </div>
              </div>
              <div className="space-y-3">
                <RatioBar label={`Épargne & Investissements — cible 20% (${fmt(totalIncome * 0.20)})`}
                  value={ratios.investments} recommended={20} color="bg-yellow-500" icon="💡" />
                <RatioBar label={`Logement — cible ≤ 35% (${fmt(totalIncome * 0.35)})`}
                  value={ratios.housing} recommended={35} color="bg-ia-navy" icon="🏠" />
              </div>
              <div className="mt-4 p-3 bg-ia-gray rounded-xl text-xs text-ia-muted">
                Dépenses actuelles : <strong className="text-ia-text">{fmt(totalBudgeted + totalDebtPayments)}</strong>
                {' '}/ Budget disponible : <strong className="text-ia-text">{fmt(totalIncome * 0.80)}</strong>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mode détaillé uniquement */}
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
                <div className="flex items-center justify-center h-48 text-ia-muted text-sm">Entrez vos dépenses pour voir la répartition</div>
              )}
            </div>

            <div className="card">
              <h2 className="font-bold text-ia-navy mb-4">Tous les ratios</h2>
              <div className="space-y-3">
                <RatioBar label="Logement"            value={ratios.housing}     recommended={35} color="bg-ia-navy"      icon="🏠" />
                <RatioBar label="Alimentation"        value={ratios.food}        recommended={12} color="bg-green-600"    icon="🛒" />
                <RatioBar label="Transport"           value={ratios.transport}   recommended={12} color="bg-blue-600"     icon="🚗" />
                <RatioBar label="Investissements"     value={ratios.investments} recommended={15} color="bg-yellow-500"   icon="📈" />
                <RatioBar label="Toutes dépenses"     value={ratios.expenses}    recommended={75} color="bg-ia-navylight" icon="💸" />
                <RatioBar label="Paiements de dettes" value={ratios.debts}       recommended={5}  color="bg-ia-red"       icon="🔴" />
              </div>
            </div>
          </div>

          {/* 7 étapes seulement pour Ramsey */}
          {method === 'zero' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-ia-navy">Les 7 Étapes — Dave Ramsey</h2>
                <span className="text-xs text-ia-muted bg-ia-gray px-2 py-1 rounded-full">Étape actuelle : {state.babyStep}</span>
              </div>
              <div className="grid gap-2">
                {BABY_STEPS.map(({ step, label, desc }) => (
                  <button key={step} onClick={() => dispatch({ type: 'SET_BABY_STEP', payload: step })}
                    className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                      step === state.babyStep ? 'bg-ia-navy text-white shadow-md'
                      : step < state.babyStep ? 'bg-green-50 text-green-800 border border-green-100'
                      : 'bg-ia-gray text-ia-muted hover:bg-ia-blue'
                    }`}>
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
          )}
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
