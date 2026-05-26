import { createContext, useContext, useReducer, useEffect } from 'react'

const DATA_VERSION = 3   // bump when INITIAL_EXPENSES structure changes

export const FREQ_FACTORS = {
  weekly:   52 / 12,   // 4.3333
  biweekly: 26 / 12,   // 2.1667
  monthly:  1,
  annual:   1 / 12,
}

export const FREQ_SHORT = {
  weekly:   '/sem.',
  biweekly: '/2 sem.',
  monthly:  '/mois',
  annual:   '/an',
}

export const FREQ_LABELS = {
  weekly:   'Hebdomadaire',
  biweekly: 'Bi-hebdomadaire',
  monthly:  'Mensuel',
  annual:   'Annuel',
}

export const toMonthly = (amount, freq) => Number(amount || 0) * (FREQ_FACTORS[freq] || 1)

const INITIAL_EXPENSES = [
  // LOGEMENT
  { id: 1,  category: 'Logement',     name: 'Loyer ou hypothèque (capital + intérêts)', budgeted: 0, actual: 0, freq: 'monthly', note: '≤ 25-30% du revenu net' },
  { id: 2,  category: 'Logement',     name: 'Taxes foncières (mensuel.)',                budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 3,  category: 'Logement',     name: 'Assurance habitation',                      budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 4,  category: 'Logement',     name: 'Électricité & chauffage',                   budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 5,  category: 'Logement',     name: 'Internet & câble',                          budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 6,  category: 'Logement',     name: 'Entretien & réparations',                   budgeted: 0, actual: 0, freq: 'monthly', note: '1% valeur maison / an' },
  { id: 7,  category: 'Logement',     name: 'Frais de condo',                            budgeted: 0, actual: 0, freq: 'monthly', note: 'Si applicable' },
  // TRANSPORT
  { id: 8,  category: 'Transport',    name: 'Paiement de voiture / leasing',             budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 9,  category: 'Transport',    name: 'Assurance automobile',                      budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 10, category: 'Transport',    name: 'Essence & stationnement',                   budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 11, category: 'Transport',    name: 'Entretien & réparations auto',               budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 12, category: 'Transport',    name: 'Transport en commun',                       budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  // ALIMENTATION
  { id: 13, category: 'Alimentation', name: 'Épicerie',                                  budgeted: 0, actual: 0, freq: 'weekly',  note: '' },
  { id: 14, category: 'Alimentation', name: 'Restaurants & livraison',                   budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 15, category: 'Alimentation', name: 'Café & collations',                         budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  // SANTÉ
  { id: 16, category: 'Santé',        name: 'Assurance maladie / médicaments',           budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 17, category: 'Santé',        name: 'Médecin, dentiste, optométriste',           budgeted: 0, actual: 0, freq: 'annual',  note: '' },
  { id: 18, category: 'Santé',        name: 'Abonnement gym / sport',                    budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 19, category: 'Santé',        name: 'Autres soins de santé',                     budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  // FAMILLE
  { id: 20, category: 'Famille',      name: "Garde d'enfants / CPE",                     budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 21, category: 'Famille',      name: 'École & activités parascolaires',            budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 22, category: 'Famille',      name: 'Vêtements & chaussures',                    budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 23, category: 'Famille',      name: 'Produits ménagers & hygiène',               budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  // LOISIRS
  { id: 24, category: 'Loisirs',      name: 'Abonnements streaming (Netflix, etc.)',     budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 25, category: 'Loisirs',      name: 'Loisirs, voyages, vacances',                budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 26, category: 'Loisirs',      name: 'Cadeaux & dons',                            budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 27, category: 'Loisirs',      name: 'Autres loisirs',                            budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  // DIVERS
  { id: 28, category: 'Divers',       name: 'Téléphone cellulaire',                      budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 29, category: 'Divers',       name: 'Animaux de compagnie',                      budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 30, category: 'Divers',       name: 'Abonnements & logiciels',                   budgeted: 0, actual: 0, freq: 'monthly', note: '' },
  { id: 31, category: 'Divers',       name: 'Divers non planifiés',                      budgeted: 0, actual: 0, freq: 'monthly', note: '' },
]

const INITIAL_STATE = {
  incomeRaw:  0,
  incomeFreq: 'monthly',
  otherIncome: [],
  expenses: INITIAL_EXPENSES,
  investments: [
    { id: 1, name: "Fonds d'urgence (3-6 mois)", balance: 0, amount: 0, freq: 'monthly', goal: 0, type: 'emergency' },
    { id: 2, name: 'REER',                        balance: 0, amount: 0, freq: 'monthly', goal: 0, type: 'retirement' },
    { id: 3, name: 'CELI',                        balance: 0, amount: 0, freq: 'monthly', goal: 0, type: 'retirement' },
    { id: 4, name: 'Investissements',             balance: 0, amount: 0, freq: 'monthly', goal: 0, type: 'other' },
  ],
  debts: [],
  babyStep: 1,
  dataVersion: DATA_VERSION,
}

function migrateExpense(e) {
  return {
    ...e,
    budgeted: e.budgeted ?? e.amount ?? 0,
    actual:   e.actual   ?? 0,
    freq:     e.freq     ?? 'monthly',
    note:     e.note     ?? '',
  }
}

function migrateInvestment(inv) {
  return {
    ...inv,
    balance: inv.balance ?? 0,
    freq:    inv.freq    ?? 'monthly',
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INCOME':
      return { ...state, incomeRaw: Number(action.payload.raw), incomeFreq: action.payload.freq ?? state.incomeFreq }
    case 'SET_INCOME_FREQ':
      return { ...state, incomeFreq: action.payload }
    case 'ADD_OTHER_INCOME':
      return { ...state, otherIncome: [...state.otherIncome, { id: Date.now(), freq: 'monthly', ...action.payload }] }
    case 'REMOVE_OTHER_INCOME':
      return { ...state, otherIncome: state.otherIncome.filter(i => i.id !== action.payload) }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e) }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, { id: Date.now(), budgeted: 0, actual: 0, freq: 'monthly', note: '', ...action.payload }] }
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }
    case 'UPDATE_INVESTMENT':
      return { ...state, investments: state.investments.map(inv => inv.id === action.payload.id ? { ...inv, ...action.payload } : inv) }
    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, { id: Date.now(), balance: 0, freq: 'monthly', ...action.payload }] }
    case 'REMOVE_INVESTMENT':
      return { ...state, investments: state.investments.filter(inv => inv.id !== action.payload) }
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, { id: Date.now(), ...action.payload }] }
    case 'UPDATE_DEBT':
      return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) }
    case 'REMOVE_DEBT':
      return { ...state, debts: state.debts.filter(d => d.id !== action.payload) }
    case 'SET_BABY_STEP':
      return { ...state, babyStep: action.payload }
    default:
      return state
  }
}

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, () => {
    try {
      const saved = localStorage.getItem('budget-ramsey')
      if (!saved) return INITIAL_STATE
      const p = JSON.parse(saved)
      const base = {
        ...INITIAL_STATE,
        ...p,
        incomeRaw:   p.incomeRaw  ?? p.monthlyIncome ?? 0,
        incomeFreq:  p.incomeFreq ?? 'monthly',
        investments: (p.investments ?? INITIAL_STATE.investments).map(migrateInvestment),
        dataVersion: DATA_VERSION,
      }

      // If data is old (wrong categories), reset expenses but keep user amounts by name match
      if (!p.dataVersion || p.dataVersion < DATA_VERSION) {
        const oldByName = {}
        ;(p.expenses ?? []).forEach(e => {
          const key = (e.name || '').toLowerCase().trim()
          oldByName[key] = e
        })
        base.expenses = INITIAL_EXPENSES.map(e => {
          const old = oldByName[(e.name || '').toLowerCase().trim()]
          return old
            ? { ...e, budgeted: old.budgeted ?? old.amount ?? 0, actual: old.actual ?? 0, note: old.note ?? e.note }
            : e
        })
      } else {
        const savedExpenses = (p.expenses ?? []).map(migrateExpense)
        const savedIds = new Set(savedExpenses.map(e => e.id))
        base.expenses = [
          ...savedExpenses,
          ...INITIAL_EXPENSES.filter(e => !savedIds.has(e.id)),
        ].sort((a, b) => a.id - b.id)
      }

      return base
    } catch {
      return INITIAL_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('budget-ramsey', JSON.stringify(state))
  }, [state])

  const totalIncome       = toMonthly(state.incomeRaw, state.incomeFreq)
                            + state.otherIncome.reduce((s, i) => s + toMonthly(i.amount, i.freq), 0)
  const totalBudgeted     = state.expenses.reduce((s, e) => s + toMonthly(e.budgeted, e.freq), 0)
  const totalActual       = state.expenses.reduce((s, e) => s + toMonthly(e.actual,   e.freq), 0)
  const totalInvestments  = state.investments.reduce((s, i) => s + toMonthly(i.amount, i.freq), 0)
  const totalDebtPayments = state.debts.reduce((s, d) => s + Number(d.monthlyPayment || 0), 0)
  const totalDebtBalance  = state.debts.reduce((s, d) => s + Number(d.balance || 0), 0)
  const remaining         = totalIncome - totalBudgeted - totalInvestments - totalDebtPayments

  const housingBudgeted = state.expenses.filter(e => e.category === 'Logement')
    .reduce((s, e) => s + toMonthly(e.budgeted, e.freq), 0)
  const foodBudgeted = state.expenses.filter(e => e.category === 'Alimentation')
    .reduce((s, e) => s + toMonthly(e.budgeted, e.freq), 0)
  const transportBudgeted = state.expenses.filter(e => e.category === 'Transport')
    .reduce((s, e) => s + toMonthly(e.budgeted, e.freq), 0)
  const givingBudgeted = state.expenses.filter(e => e.name.toLowerCase().includes('don'))
    .reduce((s, e) => s + toMonthly(e.budgeted, e.freq), 0)

  const ratios = {
    housing:     totalIncome > 0 ? (housingBudgeted   / totalIncome) * 100 : 0,
    food:        totalIncome > 0 ? (foodBudgeted       / totalIncome) * 100 : 0,
    transport:   totalIncome > 0 ? (transportBudgeted  / totalIncome) * 100 : 0,
    expenses:    totalIncome > 0 ? (totalBudgeted      / totalIncome) * 100 : 0,
    investments: totalIncome > 0 ? (totalInvestments   / totalIncome) * 100 : 0,
    debts:       totalIncome > 0 ? (totalDebtPayments  / totalIncome) * 100 : 0,
    giving:      totalIncome > 0 ? (givingBudgeted     / totalIncome) * 100 : 0,
  }

  const totalExpenses = totalBudgeted // backward compat

  return (
    <BudgetContext.Provider value={{
      state, dispatch,
      totalIncome, totalBudgeted, totalActual, totalExpenses,
      totalInvestments, totalDebtPayments, totalDebtBalance,
      remaining, ratios,
    }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  return useContext(BudgetContext)
}
