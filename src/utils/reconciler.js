/**
 * Build a composite key string from a row and a list of key columns.
 */
function buildKey(row, keyColumns) {
  return keyColumns.map((col) => String(row[col] ?? '')).join('|')
}

/**
 * Compare two string values as numbers if both are numeric, otherwise as strings.
 */
function valuesMatch(a, b) {
  if (a === b) return true
  const nA = Number(a)
  const nB = Number(b)
  if (!isNaN(nA) && !isNaN(nB) && a.trim() !== '' && b.trim() !== '') {
    return nA === nB
  }
  return false
}

let breakIdCounter = 0
function nextBreakId() {
  return `break_${String(++breakIdCounter).padStart(5, '0')}`
}

/**
 * Reconcile two parsed files.
 *
 * @param {object} fileA  - { name, headers, rows }
 * @param {object} fileB  - { name, headers, rows }
 * @param {string[]} keyColumns - column names to use as the join key
 * @returns {{ breaks, stats }}
 */
export function reconcile(fileA, fileB, keyColumns) {
  breakIdCounter = 0

  const mapA = new Map()
  for (const row of fileA.rows) {
    const key = buildKey(row, keyColumns)
    mapA.set(key, row)
  }

  const mapB = new Map()
  for (const row of fileB.rows) {
    const key = buildKey(row, keyColumns)
    mapB.set(key, row)
  }

  // All non-key columns from both files
  const allHeaders = Array.from(
    new Set([...fileA.headers, ...fileB.headers].filter((h) => !keyColumns.includes(h)))
  )

  const breaks = []
  let matchedCount = 0

  // Rows in A
  for (const [key, rowA] of mapA.entries()) {
    if (!mapB.has(key)) {
      breaks.push({
        id: nextBreakId(),
        type: 'MISSING_IN_B',
        keyValue: key,
        column: null,
        valueA: null,
        valueB: null,
        category: null,
        suppressed: false,
        suppressedBy: null,
      })
    } else {
      matchedCount++
      const rowB = mapB.get(key)
      for (const col of allHeaders) {
        const vA = rowA[col] ?? ''
        const vB = rowB[col] ?? ''
        if (!valuesMatch(vA, vB)) {
          breaks.push({
            id: nextBreakId(),
            type: 'VALUE_DIFF',
            keyValue: key,
            column: col,
            valueA: vA,
            valueB: vB,
            category: null,
            suppressed: false,
            suppressedBy: null,
          })
        }
      }
    }
  }

  // Rows only in B
  for (const key of mapB.keys()) {
    if (!mapA.has(key)) {
      breaks.push({
        id: nextBreakId(),
        type: 'MISSING_IN_A',
        keyValue: key,
        column: null,
        valueA: null,
        valueB: null,
        category: null,
        suppressed: false,
        suppressedBy: null,
      })
    }
  }

  const valueDiffs = breaks.filter((b) => b.type === 'VALUE_DIFF').length
  const missingInA = breaks.filter((b) => b.type === 'MISSING_IN_A').length
  const missingInB = breaks.filter((b) => b.type === 'MISSING_IN_B').length

  const stats = {
    rowsInA: fileA.rows.length,
    rowsInB: fileB.rows.length,
    matchedRows: matchedCount,
    missingInA,
    missingInB,
    valueDiffs,
    totalBreaks: breaks.length,
  }

  return { breaks, stats }
}
