import { useReducer, useCallback } from 'react'
import { parseFile } from '../utils/fileParser'
import { reconcile } from '../utils/reconciler'
import { applyRules } from '../utils/ruleEngine'

const initialState = {
  step: 1,
  fileA: null,       // { name, headers, rows }
  fileB: null,
  keyColumns: [],    // string[]
  breaks: [],        // Break[]
  stats: null,       // reconciliation stats
  rules: [],         // SuppressionRule[]
  error: null,
  loading: false,
}

let ruleIdCounter = 0
function nextRuleId() {
  return `rule_${String(++ruleIdCounter).padStart(3, '0')}`
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'SET_FILE_A':
      return { ...state, fileA: action.payload, keyColumns: [], breaks: [], stats: null, error: null }

    case 'SET_FILE_B':
      return { ...state, fileB: action.payload, keyColumns: [], breaks: [], stats: null, error: null }

    case 'SET_KEY_COLUMNS':
      return { ...state, keyColumns: action.payload }

    case 'RUN_RECON': {
      const { breaks, stats } = action.payload
      const withRules = applyRules(breaks, state.rules)
      return { ...state, breaks: withRules, stats, loading: false, error: null }
    }

    case 'CATEGORIZE_BREAK': {
      const { id, category } = action.payload
      return {
        ...state,
        breaks: state.breaks.map((b) =>
          b.id === id ? { ...b, category: b.category === category ? null : category } : b
        ),
      }
    }

    case 'ADD_RULE': {
      const rule = { id: nextRuleId(), ...action.payload }
      const newRules = [...state.rules, rule]
      return { ...state, rules: newRules, breaks: applyRules(state.breaks, newRules) }
    }

    case 'UPDATE_RULE': {
      const newRules = state.rules.map((r) =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      )
      return { ...state, rules: newRules, breaks: applyRules(state.breaks, newRules) }
    }

    case 'DELETE_RULE': {
      const newRules = state.rules.filter((r) => r.id !== action.payload)
      return { ...state, rules: newRules, breaks: applyRules(state.breaks, newRules) }
    }

    case 'TOGGLE_RULE': {
      const newRules = state.rules.map((r) =>
        r.id === action.payload ? { ...r, enabled: !r.enabled } : r
      )
      return { ...state, rules: newRules, breaks: applyRules(state.breaks, newRules) }
    }

    case 'GO_TO_STEP':
      return { ...state, step: action.payload, error: null }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function useReconState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadFileA = useCallback(async (file) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const parsed = await parseFile(file)
      dispatch({ type: 'SET_FILE_A', payload: parsed })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const loadFileB = useCallback(async (file) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const parsed = await parseFile(file)
      dispatch({ type: 'SET_FILE_B', payload: parsed })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const setKeyColumns = useCallback((cols) => {
    dispatch({ type: 'SET_KEY_COLUMNS', payload: cols })
  }, [])

  const runReconciliation = useCallback(() => {
    const { fileA, fileB, keyColumns } = state
    if (!fileA || !fileB || keyColumns.length === 0) return
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const result = reconcile(fileA, fileB, keyColumns)
      dispatch({ type: 'RUN_RECON', payload: result })
      dispatch({ type: 'GO_TO_STEP', payload: 3 })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    }
  }, [state])

  const categorizeBreak = useCallback((id, category) => {
    dispatch({ type: 'CATEGORIZE_BREAK', payload: { id, category } })
  }, [])

  const addRule = useCallback((rule) => {
    dispatch({ type: 'ADD_RULE', payload: rule })
  }, [])

  const updateRule = useCallback((rule) => {
    dispatch({ type: 'UPDATE_RULE', payload: rule })
  }, [])

  const deleteRule = useCallback((id) => {
    dispatch({ type: 'DELETE_RULE', payload: id })
  }, [])

  const toggleRule = useCallback((id) => {
    dispatch({ type: 'TOGGLE_RULE', payload: id })
  }, [])

  const goToStep = useCallback((step) => {
    dispatch({ type: 'GO_TO_STEP', payload: step })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    state,
    loadFileA,
    loadFileB,
    setKeyColumns,
    runReconciliation,
    categorizeBreak,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    goToStep,
    reset,
  }
}
