import React from 'react'

function StatCard({ label, value, sub, color = 'gray' }) {
  const colors = {
    gray:   'bg-white border-gray-200 text-gray-900',
    blue:   'bg-blue-50 border-blue-200 text-blue-900',
    green:  'bg-green-50 border-green-200 text-green-900',
    red:    'bg-red-50 border-red-200 text-red-900',
    amber:  'bg-amber-50 border-amber-200 text-amber-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function SummaryDashboard({ stats, breaks }) {
  const good = breaks.filter((b) => b.category === 'good').length
  const bad = breaks.filter((b) => b.category === 'bad').length
  const uncategorized = breaks.filter((b) => !b.suppressed && !b.category).length
  const suppressed = breaks.filter((b) => b.suppressed).length

  // Break counts by column (top 5)
  const byColumn = {}
  for (const b of breaks.filter((b) => b.type === 'VALUE_DIFF')) {
    byColumn[b.column] = (byColumn[b.column] ?? 0) + 1
  }
  const topColumns = Object.entries(byColumn)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div>
      {/* Main stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Rows in A"     value={stats.rowsInA}      color="gray" />
        <StatCard label="Rows in B"     value={stats.rowsInB}      color="gray" />
        <StatCard label="Matched"       value={stats.matchedRows}   color="blue" />
        <StatCard label="Missing in A"  value={stats.missingInA}    color={stats.missingInA > 0 ? 'amber' : 'gray'} />
        <StatCard label="Missing in B"  value={stats.missingInB}    color={stats.missingInB > 0 ? 'amber' : 'gray'} />
        <StatCard label="Value Diffs"   value={stats.valueDiffs}    color={stats.valueDiffs > 0 ? 'red' : 'gray'} />
      </div>

      {/* Break analysis */}
      {breaks.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Categorization */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Break Categorization</h3>
            <div className="space-y-2">
              {[
                { label: 'Good Breaks',    value: good,          bar: 'bg-green-400' },
                { label: 'Bad Breaks',     value: bad,           bar: 'bg-red-400'   },
                { label: 'Uncategorized',  value: uncategorized, bar: 'bg-gray-300'  },
                { label: 'Suppressed',     value: suppressed,    bar: 'bg-purple-300'},
              ].map(({ label, value, bar }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`${bar} h-2 rounded-full transition-all`}
                      style={{ width: breaks.length ? `${(value / breaks.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top break columns */}
          {topColumns.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Break Columns</h3>
              <div className="space-y-2">
                {topColumns.map(([col, count]) => (
                  <div key={col} className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 truncate w-28 shrink-0 font-mono">{col}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${(count / (topColumns[0]?.[1] ?? 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
