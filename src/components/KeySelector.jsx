import React from 'react'

export default function KeySelector({ fileA, fileB, keyColumns, onKeyColumnsChange, onBack, onReconcile, loading }) {
  // Only columns present in BOTH files can be used as keys
  const commonHeaders = fileA.headers.filter((h) => fileB.headers.includes(h))
  const fileAOnly = fileA.headers.filter((h) => !fileB.headers.includes(h))
  const fileBOnly = fileB.headers.filter((h) => !fileA.headers.includes(h))

  function toggleKey(col) {
    if (keyColumns.includes(col)) {
      onKeyColumnsChange(keyColumns.filter((k) => k !== col))
    } else {
      onKeyColumnsChange([...keyColumns, col])
    }
  }

  // Preview: what the composite key looks like for first 3 rows
  const previewRows = fileA.rows.slice(0, 4).map((row) => ({
    key: keyColumns.map((k) => row[k] ?? '').join(' | '),
    row,
  }))

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Key Columns</h2>
      <p className="text-sm text-gray-500 mb-6">
        Choose one or more columns that uniquely identify each row. These will be used to match records between the two files.
      </p>

      {/* Column selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Columns in both files</h3>
        {commonHeaders.length === 0 ? (
          <p className="text-sm text-red-500">No common columns found between the two files.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {commonHeaders.map((col) => {
              const selected = keyColumns.includes(col)
              return (
                <button
                  key={col}
                  onClick={() => toggleKey(col)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                    ${selected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                >
                  {selected && <span className="mr-1">✓</span>}
                  {col}
                </button>
              )
            })}
          </div>
        )}

        {(fileAOnly.length > 0 || fileBOnly.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            {fileAOnly.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1.5">Only in File A</p>
                <div className="flex flex-wrap gap-1.5">
                  {fileAOnly.map((col) => (
                    <span key={col} className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded text-xs">{col}</span>
                  ))}
                </div>
              </div>
            )}
            {fileBOnly.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1.5">Only in File B</p>
                <div className="flex flex-wrap gap-1.5">
                  {fileBOnly.map((col) => (
                    <span key={col} className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded text-xs">{col}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Key preview */}
      {keyColumns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Key preview
            <span className="ml-2 font-normal text-gray-400">({keyColumns.join(' + ')})</span>
          </h3>
          <div className="space-y-1.5">
            {previewRows.map(({ key }, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <code className="text-sm bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-800 font-mono">
                  {key || <em className="text-gray-400">empty</em>}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {keyColumns.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 mb-5">
          Select at least one key column to continue.
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onReconcile}
          disabled={keyColumns.length === 0 || loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm
            hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Reconciling…' : 'Run Reconciliation →'}
        </button>
      </div>
    </div>
  )
}
