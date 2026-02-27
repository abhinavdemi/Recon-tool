import React from 'react'
import SummaryDashboard from './SummaryDashboard'
import BreakTable from './BreakTable'

export default function ResultsView({ breaks, stats, rules, fileAName, fileBName, keyColumns, onCategorize, onGoToRules }) {
  const activeBreaks = breaks.filter((b) => !b.suppressed)
  const suppressedCount = breaks.filter((b) => b.suppressed).length

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reconciliation Results</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Key: <span className="font-mono text-gray-700">{keyColumns.join(' + ')}</span>
            {' '}·{' '}
            <span className="font-mono text-gray-700">{fileAName}</span>
            {' vs '}
            <span className="font-mono text-gray-700">{fileBName}</span>
          </p>
        </div>
        <button
          onClick={onGoToRules}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Manage Rules
          {rules.length > 0 && (
            <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {rules.length}
            </span>
          )}
        </button>
      </div>

      <SummaryDashboard stats={stats} breaks={breaks} />

      {breaks.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800">Perfect Match!</h3>
          <p className="text-sm text-green-600 mt-1">No breaks found between the two files.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Breaks
              <span className="ml-2 text-gray-400 font-normal">
                ({activeBreaks.length.toLocaleString()} active
                {suppressedCount > 0 && `, ${suppressedCount} suppressed`})
              </span>
            </h3>
          </div>
          <BreakTable
            breaks={breaks}
            onCategorize={onCategorize}
            fileAName={fileAName}
            fileBName={fileBName}
          />
        </div>
      )}
    </div>
  )
}
