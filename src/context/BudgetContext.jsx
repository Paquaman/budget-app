import { createContext, useContext, useReducer, useEffect } from 'react'

const INITIAL_STATE = {
  currency: 'CAD',
  monthlyIncome: 0,
  otherIncome: [],
  expenses: [
    { id: 1, category: 'Logement', name: 'Loyer / Hypothèque', amount: 0, recommended: 25, icon: '🏠' },
    { id: 2, category: 'Logement', name: 'Assurance habitation', amount: 0, recommended: 3, icon: '🏠' },
    { id: 3, category: 'Alimentation', name: 'Épicerie', amount: 0, recommended: 10, icon: '🛒' },
    { id: 4, category: 'Alimentation', name: 'Restaurants', amount: 0, recommended: 5, icon: '🍽️' },
    { id: 5, category: 'Transport', name: 'Véhicule / Transport', amount: 0, recommended: 10, icon: '🚗' },
    { id: 6, category: 'Transport', name: 'Carburant', amount: 0, recommended: 5, icon: '⛽' },
    { id: 7, category: 'Santé', name: 'Assurance santé', amount: 0, recommended: 5, icon: '🏥' },
    { id: 8, category: 'Santé', name: 'Médicaments / Soins', amount: 0, recommended: 3, icon: '💊' },
    { id: 9, category: 'Assurances', name: 'Assurance vie', amount: 0, recommended: 5, icon: '🛡️' },
    { id: 10, category: 'Services', name: 'Téléphone', amount: 0, recommended: 3, icon: '📱' },
    { id: 11, category: 'Services', name: 'Internet', amount: 0, recommended: 2, icon: '🌐' },
    { id: 12, category: 'Services', name: 'Électricité / Gaz', amount: 0, recommended: 5, icon: '💡' },
    { id: 13, category: 'Personnel', name: 'Vêtements', amount: 0, recommended: 3, icon: '👕' },
    { id: 14, category: 'Loisirs', name: 'Divertissement', amount: 0, recommended: 5, icon: '🎬' },
    { id: 15, category: 'Don', name: 'Don / Charité', amount: 0, recommended: 10, icon: '🤝' },
  ],
  investments: [
    { id: 1, name: 'Fonds d\'urgence (3-6 mois)', amount: 0, goal: 0, type: 'emergency' },
    { id: 2, name: 'REER', amount: 0, goal: 0, type: 'retirement' },
    { id: 3, name: 'CELI', amount: 0, goal: 0, type: 'retirement' },
    { id: 4, name: 'Investissements', amount: 0, goal: 0, type: 'other' },
  ],
  debts: [],
  babyStep: 1,
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
          e.id === action.payload.id ? { ...e, amount: Number(action.payload.amount) } : e
        ),
      }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, { id: Date.now(), ...action.payload }] }
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
      return {
        ...state,
        debts: state.debts.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d),
      }
    case 'REMOVE_DEBT':
      return { ...state, debts: state.debts.filter(d => d.id !== action.payload) }
    case 'SET_BABY_STEP':
      return { ...state, babyStep: action.payload }
    case 'LOAD':
      return action.payload
    default:
      return state
  }
}

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, () => {
    try {
      const saved = localStorage.getItem('budget-ramsey')
      return saved ? JSON.parse(saved) : INITIAL_STATE
    } catch {
      return INITIAL_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('budget-ramsey', JSON.stringify(state))
  }, [state])

  const totalIncome = state.monthlyIncome + state.otherIncome.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpenses = state.expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalInvestments = state.investments.reduce((s, i) => s + Number(i.amount), 0)
  const totalDebtPayments = state.debts.reduce((s, d) => s + Number(d.monthlyPayment || 0), 0)
  const totalDebtBalance = state.debts.reduce((s, d) => s + Number(d.balance || 0), 0)
  const remaining = totalIncome - totalExpenses - totalInvestments - totalDebtPayments

  const ratios = {
    housing: totalIncome > 0
      ? (state.expenses.filter(e => e.category === 'Logement').reduce((s, e) => s + Number(e.amount), 0) / totalIncome) * 100
      : 0,
    expenses: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
    investments: totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0,
    debts: totalIncome > 0 ? (totalDebtPayments / totalIncome) * 100 : 0,
    giving: totalIncome > 0
      ? (state.expenses.filter(e => e.category === 'Don').reduce((s, e) => s + Number(e.amount), 0) / totalIncome) * 100
      : 0,
  }

  return (
    <BudgetContext.Provider value={{ state, dispatch, totalIncome, totalExpenses, totalInvestments, totalDebtPayments, totalDebtBalance, remaining, ratios }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  return useContext(BudgetContext)
}
