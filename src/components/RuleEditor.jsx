import React, { useState } from 'react'
import RuleForm from './RuleForm'
import { countRuleSuppression } from '../utils/ruleEngine'

const TYPE_LABELS = {
  numeric_tolerance: 'Numeric Tolerance',
  value_in:          'Value In List',
  column_ignore:     'Ignore Column',
  regex_match:       'Regex Match',
}

function RuleCard({ rule, breaks, onEdit, onDelete, onToggle }) {
  const suppressCount = countRuleSuppression(rule, breaks)

  return (
    <div className={`bg-white border rounded-xl p-4 transition-all ${rule.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-gray-900">{rule.name}</h4>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {TYPE_LABELS[rule.type] ?? rule.type}
            </span>
            {!rule.enabled && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Disabled</span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Column: <code className="font-mono text-gray-700">{rule.column}</code></span>
            {rule.type === 'numeric_tolerance' && (
              <span>Tolerance: <code className="font-mono text-gray-700">{rule.params?.tolerance}</code></span>
            )}
            {rule.type === 'value_in' && (
              <span>Values: <code className="font-mono text-gray-700">{rule.params?.values}</code></span>
            )}
            {rule.type === 'regex_match' && (
              <span>Pattern: <code className="font-mono text-gray-700">/{rule.params?.pattern}/</code></span>
            )}
          </div>

          <div className="mt-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
              ${suppressCount > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}
            `}>
              {suppressCount > 0 ? `Suppresses ${suppressCount} break${suppressCount !== 1 ? 's' : ''}` : 'No breaks suppressed'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggle(rule.id)}
            title={rule.enabled ? 'Disable rule' : 'Enable rule'}
            className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {rule.enabled ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onEdit(rule)}
            title="Edit rule"
            className="p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            title="Delete rule"
            className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RuleEditor({ rules, breaks, columns, onAdd, onUpdate, onDelete, onToggle, onBack }) {
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const totalSuppressed = breaks.filter((b) => b.suppressed).length

  function handleSave(ruleData) {
    if (editingRule) {
      onUpdate({ id: editingRule.id, ...ruleData })
    } else {
      onAdd(ruleData)
    }
    setShowForm(false)
    setEditingRule(null)
  }

  function handleEdit(rule) {
    setEditingRule(rule)
    setShowForm(true)
  }

  function handleCancelForm() {
    setShowForm(false)
    setEditingRule(null)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Suppression Rules</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Write rules to automatically suppress known or expected breaks.
            {totalSuppressed > 0 && (
              <span className="ml-1 text-purple-600 font-medium">
                {totalSuppressed} break{totalSuppressed !== 1 ? 's' : ''} currently suppressed.
              </span>
            )}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingRule(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Rule
          </button>
        )}
      </div>

      {/* Rule Form */}
      {showForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingRule ? 'Edit Rule' : 'New Rule'}
          </h3>
          {columns.length === 0 ? (
            <p className="text-sm text-red-500">No non-key columns available to create rules for.</p>
          ) : (
            <RuleForm
              columns={columns}
              existingRule={editingRule}
              onSave={handleSave}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 && !showForm ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">No rules yet</p>
          <p className="text-gray-400 text-xs mt-1">Add a rule to suppress expected or known breaks automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              breaks={breaks}
              onEdit={handleEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Results
        </button>
      </div>
    </div>
  )
}
