import { createContext, useContext, useReducer, useEffect } from 'react'

const INITIAL_EXPENSES = [
  // LOGEMENT
  { id: 1,  category: 'Logement',     name: 'Loyer ou hypothèque (capital + intérêts)', budgeted: 0, actual: 0, note: '≤ 25-30% du revenu net' },
  { id: 2,  category: 'Logement',     name: 'Taxes foncières (mensuel.)',                budgeted: 0, actual: 0, note: '' },
  { id: 3,  category: 'Logement',     name: 'Assurance habitation',                      budgeted: 0, actual: 0, note: '' },
  { id: 4,  category: 'Logement',     name: 'Électricité & chauffage',                   budgeted: 0, actual: 0, note: '' },
  { id: 5,  category: 'Logement',     name: 'Internet & câble',                          budgeted: 0, actual: 0, note: '' },
  { id: 6,  category: 'Logement',     name: 'Entretien & réparations',                   budgeted: 0, actual: 0, note: '1% valeur maison / an' },
  { id: 7,  category: 'Logement',     name: 'Frais de condo',                            budgeted: 0, actual: 0, note: 'Si applicable' },
  // TRANSPORT
  { id: 8,  category: 'Transport',    name: 'Paiement de voiture / leasing',             budgeted: 0, actual: 0, note: '' },
  { id: 9,  category: 'Transport',    name: 'Assurance automobile',                      budgeted: 0, actual: 0, note: '' },
  { id: 10, category: 'Transport',    name: 'Essence & stationnement',                   budgeted: 0, actual: 0, note: '' },
  { id: 11, category: 'Transport',    name: 'Entretien & réparations auto',               budgeted: 0, actual: 0, note: '' },
  { id: 12, category: 'Transport',    name: 'Transport en commun',                       budgeted: 0, actual: 0, note: '' },
  // ALIMENTATION
  { id: 13, category: 'Alimentation', name: 'Épicerie',                                  budgeted: 0, actual: 0, note: '' },
  { id: 14, category: 'Alimentation', name: 'Restaurants & livraison',                   budgeted: 0, actual: 0, note: '' },
  { id: 15, category: 'Alimentation', name: 'Café & collations',                         budgeted: 0, actual: 0, note: '' },
  // SANTÉ
  { id: 16, category: 'Santé',        name: 'Assurance maladie / médicaments',           budgeted: 0, actual: 0, note: '' },
  { id: 17, category: 'Santé',        name: 'Médecin, dentiste, optométriste',           budgeted: 0, actual: 0, note: '' },
  { id: 18, category: 'Santé',        name: 'Abonnement gym / sport',                    budgeted: 0, actual: 0, note: '' },
  { id: 19, category: 'Santé',        name: 'Autres soins de santé',                     budgeted: 0, actual: 0, note: '' },
  // FAMILLE
  { id: 20, category: 'Famille',      name: "Garde d'enfants / CPE",                     budgeted: 0, actual: 0, note: '' },
  { id: 21, category: 'Famille',      name: 'École & activités parascolaires',            budgeted: 0, actual: 0, note: '' },
  { id: 22, category: 'Famille',      name: 'Vêtements & chaussures',                    budgeted: 0, actual: 0, note: '' },
  { id: 23, category: 'Famille',      name: 'Produits ménagers & hygiène',               budgeted: 0, actual: 0, note: '' },
  // LOISIRS
  { id: 24, category: 'Loisirs',      name: 'Abonnements streaming (Netflix, etc.)',     budgeted: 0, actual: 0, note: '' },
  { id: 25, category: 'Loisirs',      name: 'Loisirs, voyages, vacances',                budgeted: 0, actual: 0, note: '' },
  { id: 26, category: 'Loisirs',      name: 'Cadeaux & dons',                            budgeted: 0, actual: 0, note: '' },
  { id: 27, category: 'Loisirs',      name: 'Autres loisirs',                            budgeted: 0, actual: 0, note: '' },
  // DIVERS
  { id: 28, category: 'Divers',       name: 'Téléphone cellulaire',                      budgeted: 0, actual: 0, note: '' },
  { id: 29, category: 'Divers',       name: 'Animaux de compagnie',                      budgeted: 0, actual: 0, note: '' },
  { id: 30, category: 'Divers',       name: 'Abonnements & logiciels',                   budgeted: 0, actual: 0, note: '' },
  { id: 31, category: 'Divers',       name: 'Divers non planifiés',                      budgeted: 0, actual: 0, note: '' },
]

const INITIAL_STATE = {
  monthlyIncome: 0,
  otherIncome: [],
  expenses: INITIAL_EXPENSES,
  investments: [
    { id: 1, name: "Fonds d'urgence (3-6 mois)", amount: 0, goal: 0, type: 'emergency' },
    { id: 2, name: 'REER',                        amount: 0, goal: 0, type: 'retirement' },
    { id: 3, name: 'CELI',                        amount: 0, goal: 0, type: 'retirement' },
    { id: 4, name: 'Investissements',             amount: 0, goal: 0, type: 'other' },
  ],
  debts: [],
  babyStep: 1,
}

function migrateExpense(e) {
  // handle old data that used 'amount' instead of 'budgeted'
  return {
    ...e,
    budgeted: e.budgeted ?? e.amount ?? 0,
    actual:   e.actual   ?? 0,
    note:     e.note     ?? '',
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INCOME':
      return { ...state, monthlyIncome: Number(action.payload) }
    case 'ADD_OTHER_INCOME':
      return { ...state, otherIncome: [...state.otherIncome, { id: Date.now(), ...action.payload }] }
    case 'REMOVE_OTHER_INCOME':
      return { ...state, otherIncome: state.otherIncome.filter(i => i.id !== action.payload) }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, { id: Date.now(), budgeted: 0, actual: 0, note: '', ...action.payload }] }
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }
    case 'UPDATE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.map(inv =>
          inv.id === action.payload.id ? { ...inv, ...action.payload } : inv
        ),
      }
    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, { id: Date.now(), ...action.payload }] }
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
      const parsed = JSON.parse(saved)
      return {
        ...INITIAL_STATE,
        ...parsed,
        expenses: parsed.expenses ? parsed.expenses.map(migrateExpense) : INITIAL_EXPENSES,
      }
    } catch {
      return INITIAL_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('budget-ramsey', JSON.stringify(state))
  }, [state])

  const totalIncome         = state.monthlyIncome + state.otherIncome.reduce((s, i) => s + Number(i.amount), 0)
  const totalBudgeted       = state.expenses.reduce((s, e) => s + Number(e.budgeted), 0)
  const totalActual         = state.expenses.reduce((s, e) => s + Number(e.actual), 0)
  const totalInvestments    = state.investments.reduce((s, i) => s + Number(i.amount), 0)
  const totalDebtPayments   = state.debts.reduce((s, d) => s + Number(d.monthlyPayment || 0), 0)
  const totalDebtBalance    = state.debts.reduce((s, d) => s + Number(d.balance || 0), 0)
  const remaining           = totalIncome - totalBudgeted - totalInvestments - totalDebtPayments

  const housingBudgeted = state.expenses.filter(e => e.category === 'Logement').reduce((s, e) => s + Number(e.budgeted), 0)
  const givingBudgeted  = state.expenses.filter(e => e.category === 'Loisirs' && e.name.includes('Dons')).reduce((s, e) => s + Number(e.budgeted), 0)

  const ratios = {
    housing:     totalIncome > 0 ? (housingBudgeted   / totalIncome) * 100 : 0,
    expenses:    totalIncome > 0 ? (totalBudgeted      / totalIncome) * 100 : 0,
    investments: totalIncome > 0 ? (totalInvestments   / totalIncome) * 100 : 0,
    debts:       totalIncome > 0 ? (totalDebtPayments  / totalIncome) * 100 : 0,
    giving:      totalIncome > 0 ? (givingBudgeted     / totalIncome) * 100 : 0,
  }

  // kept for backward compat with Dashboard
  const totalExpenses = totalBudgeted

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
