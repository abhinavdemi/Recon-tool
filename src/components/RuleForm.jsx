import React, { useState } from 'react'

const RULE_TYPES = [
  {
    key: 'numeric_tolerance',
    label: 'Numeric Tolerance',
    description: 'Suppress when the absolute difference between values is within a threshold.',
    example: 'e.g. ignore price diffs < 0.01',
    needsColumn: true,
  },
  {
    key: 'value_in',
    label: 'Value In List',
    description: 'Suppress when either value is in a comma-separated list.',
    example: 'e.g. ignore if status is CANCELLED or VOID',
    needsColumn: true,
  },
  {
    key: 'column_ignore',
    label: 'Ignore Column',
    description: 'Suppress all breaks in a specific column regardless of values.',
    example: 'e.g. always ignore the "timestamp" column',
    needsColumn: true,
  },
  {
    key: 'regex_match',
    label: 'Regex Match',
    description: 'Suppress when either value matches a regular expression.',
    example: 'e.g. ignore IDs starting with TEST_',
    needsColumn: true,
  },
]

function ParamsFields({ type, params, onChange }) {
  if (type === 'numeric_tolerance') {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Tolerance</label>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 0.01"
          value={params.tolerance ?? ''}
          onChange={(e) => onChange({ ...params, tolerance: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Suppress if |valueA − valueB| ≤ this threshold</p>
      </div>
    )
  }

  if (type === 'value_in') {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Values (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g. CANCELLED, VOID, PENDING"
          value={params.values ?? ''}
          onChange={(e) => onChange({ ...params, values: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Suppress if either value matches any item in this list</p>
      </div>
    )
  }

  if (type === 'regex_match') {
    let valid = true
    try { if (params.pattern) new RegExp(params.pattern) } catch { valid = false }
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Pattern (regex)</label>
        <input
          type="text"
          placeholder="e.g. ^TEST_"
          value={params.pattern ?? ''}
          onChange={(e) => onChange({ ...params, pattern: e.target.value })}
          className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono
            ${!valid && params.pattern ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
        />
        {!valid && params.pattern && (
          <p className="text-xs text-red-500 mt-1">Invalid regular expression</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Suppress if either value matches this regex</p>
      </div>
    )
  }

  // column_ignore has no extra params
  return null
}

export default function RuleForm({ columns, existingRule, onSave, onCancel }) {
  const [name, setName] = useState(existingRule?.name ?? '')
  const [type, setType] = useState(existingRule?.type ?? 'numeric_tolerance')
  const [column, setColumn] = useState(existingRule?.column ?? (columns[0] ?? ''))
  const [params, setParams] = useState(existingRule?.params ?? {})

  const ruleTypeMeta = RULE_TYPES.find((r) => r.key === type)

  function isValid() {
    if (!name.trim()) return false
    if (!column) return false
    if (type === 'numeric_tolerance') {
      const t = Number(params.tolerance)
      return !isNaN(t) && t >= 0
    }
    if (type === 'value_in') return (params.values ?? '').trim().length > 0
    if (type === 'regex_match') {
      try { new RegExp(params.pattern); return (params.pattern ?? '').trim().length > 0 } catch { return false }
    }
    return true // column_ignore
  }

  function handleSave() {
    if (!isValid()) return
    onSave({ name: name.trim(), type, column, params, enabled: existingRule?.enabled ?? true })
  }

  return (
    <div className="space-y-4">
      {/* Rule name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Rule Name</label>
        <input
          type="text"
          placeholder="e.g. Small price tolerance"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Rule type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Rule Type</label>
        <div className="grid grid-cols-2 gap-2">
          {RULE_TYPES.map((rt) => (
            <button
              key={rt.key}
              type="button"
              onClick={() => { setType(rt.key); setParams({}) }}
              className={`text-left px-3 py-2.5 border rounded-lg text-sm transition-all
                ${type === rt.key
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
            >
              <p className="font-medium text-xs">{rt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{rt.example}</p>
            </button>
          ))}
        </div>
        {ruleTypeMeta && (
          <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded px-3 py-1.5">{ruleTypeMeta.description}</p>
        )}
      </div>

      {/* Column selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Apply to Column</label>
        <select
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Type-specific params */}
      <ParamsFields type={type} params={params} onChange={setParams} />

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={!isValid()}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {existingRule ? 'Update Rule' : 'Add Rule'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
