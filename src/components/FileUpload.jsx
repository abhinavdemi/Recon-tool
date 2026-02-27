import React, { useRef, useState } from 'react'

function DropZone({ label, file, onFile, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  function handleChange(e) {
    const f = e.target.files[0]
    if (f) onFile(f)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer select-none
        ${dragging ? 'border-blue-500 bg-blue-50' : ''}
        ${file && !dragging ? 'border-green-400 bg-green-50' : ''}
        ${!file && !dragging ? 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {file ? (
        <>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-green-700 text-sm">{file.name}</p>
          <p className="text-xs text-green-600 mt-1">{file.rows.length.toLocaleString()} rows · {file.headers.length} columns</p>
          <p className="text-xs text-gray-400 mt-3">Click to replace</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 text-sm">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Drop a CSV file or click to browse</p>
        </>
      )}
    </div>
  )
}

function ColumnPreview({ file }) {
  if (!file) return null
  const preview = file.rows.slice(0, 3)
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
      <table className="text-xs w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {file.headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {file.headers.map((h) => (
                <td key={h} className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-[120px] truncate">{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {file.rows.length > 3 && (
        <p className="text-xs text-gray-400 px-3 py-1.5 border-t border-gray-100">
          +{(file.rows.length - 3).toLocaleString()} more rows
        </p>
      )}
    </div>
  )
}

export default function FileUpload({ fileA, fileB, loading, onFileA, onFileB, onNext }) {
  return (
    <div className="max-w-4xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload Files to Reconcile</h2>
      <p className="text-sm text-gray-500 mb-6">Upload two CSV files. They'll be compared row-by-row to find differences.</p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">File A (source)</p>
          <DropZone label="Drop File A here" file={fileA} onFile={onFileA} disabled={loading} />
          <ColumnPreview file={fileA} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">File B (target)</p>
          <DropZone label="Drop File B here" file={fileB} onFile={onFileB} disabled={loading} />
          <ColumnPreview file={fileB} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!fileA || !fileB || loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm
            hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Parsing…' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
