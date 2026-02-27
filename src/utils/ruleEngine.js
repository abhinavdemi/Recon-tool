/**
 * Evaluate a single rule against a single break.
 * Returns true if the rule suppresses this break.
 */
function ruleMatches(rule, brk) {
  if (!rule.enabled) return false
  // Missing-row breaks can only be suppressed by column_ignore (no column to compare)
  if (brk.type !== 'VALUE_DIFF' && rule.type !== 'column_ignore') return false

  switch (rule.type) {
    case 'column_ignore': {
      // Suppress all breaks for the given column (or all missing-row breaks if column is '*')
      if (rule.column === '*') return true
      return brk.column === rule.column || brk.type !== 'VALUE_DIFF'
        ? rule.column === brk.column
        : false
    }

    case 'numeric_tolerance': {
      if (brk.column !== rule.column) return false
      const nA = Number(brk.valueA)
      const nB = Number(brk.valueB)
      if (isNaN(nA) || isNaN(nB)) return false
      return Math.abs(nA - nB) <= Number(rule.params.tolerance)
    }

    case 'value_in': {
      if (brk.column !== rule.column) return false
      const list = (rule.params.values ?? '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
      return list.includes(brk.valueA) || list.includes(brk.valueB)
    }

    case 'regex_match': {
      if (brk.column !== rule.column) return false
      try {
        const re = new RegExp(rule.params.pattern)
        return re.test(brk.valueA) || re.test(brk.valueB)
      } catch {
        return false
      }
    }

    default:
      return false
  }
}

/**
 * Apply all rules to a break array.
 * Returns a new break array with suppressed / suppressedBy fields updated.
 */
export function applyRules(breaks, rules) {
  return breaks.map((brk) => {
    for (const rule of rules) {
      if (ruleMatches(rule, brk)) {
        return { ...brk, suppressed: true, suppressedBy: rule.id }
      }
    }
    return { ...brk, suppressed: false, suppressedBy: null }
  })
}

/**
 * Count how many breaks a specific rule would suppress (independently of other rules).
 */
export function countRuleSuppression(rule, breaks) {
  return breaks.filter((b) => ruleMatches(rule, b)).length
}
