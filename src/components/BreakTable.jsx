import React, { useState, useMemo } from 'react'
import BreakRow from './BreakRow'

const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'active',     label: 'Active' },
  { key: 'good',       label: 'Good' },
  { key: 'bad',        label: 'Bad' },
  { key: 'suppressed', label: 'Suppressed' },
]

const TYPE_FILTERS = [
  { key: 'all',         label: 'All Types' },
  { key: 'VALUE_DIFF',  label: 'Value Diffs' },
  { key: 'MISSING_IN_A', label: 'Missing in A' },
  { key: 'MISSING_IN_B', label: 'Missing in B' },
]

const PAGE_SIZE = 50

export default function BreakTable({ breaks, onCategorize, fileAName, fileBName }) {
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = breaks

    if (filter === 'active')     rows = rows.filter((b) => !b.suppressed && !b.category)
    else if (filter === 'good')  rows = rows.filter((b) => b.category === 'good')
    else if (filter === 'bad')   rows = rows.filter((b) => b.category === 'bad')
    else if (filter === 'suppressed') rows = rows.filter((b) => b.suppressed)

    if (typeFilter !== 'all') rows = rows.filter((b) => b.type === typeFilter)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((b) =>
        b.keyValue?.toLowerCase().includes(q) ||
        b.column?.toLowerCase().includes(q) ||
        b.valueA?.toLowerCase().includes(q) ||
        b.valueB?.toLowerCase().includes(q)
      )
    }

    return rows
  }, [breaks, filter, typeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleFilterChange(f) {
    setFilter(f)
    setPage(1)
  }

  function handleTypeFilterChange(f) {
    setTypeFilter(f)
    setPage(1)
  }

  // Count per filter tab
  function countFor(f) {
    if (f === 'all')        return breaks.length
    if (f === 'active')     return breaks.filter((b) => !b.suppressed && !b.category).length
    if (f === 'good')       return breaks.filter((b) => b.category === 'good').length
    if (f === 'bad')        return breaks.filter((b) => b.category === 'bad').length
    if (f === 'suppressed') return breaks.filter((b) => b.suppressed).length
    return 0
  }

  return (
    <div>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Category tabs */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`px-3 py-1.5 border-r border-gray-200 last:border-r-0 transition-colors font-medium
                ${filter === f.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              {f.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${filter === f.key ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-500'}
              `}>
                {countFor(f.key)}
              </span>
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => handleTypeFilterChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TYPE_FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by key, column, or value…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No breaks match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2.5 text-left">Type</th>
                  <th className="px-3 py-2.5 text-left">Key</th>
                  <th className="px-3 py-2.5 text-left">Column</th>
                  <th className="px-3 py-2.5 text-left">
                    Value A
                    {fileAName && <span className="ml-1 font-normal text-gray-400 normal-case">({fileAName})</span>}
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    Value B
                    {fileBName && <span className="ml-1 font-normal text-gray-400 normal-case">({fileBName})</span>}
                  </th>
                  <th className="px-3 py-2.5 text-center">Suppressed</th>
                  <th className="px-3 py-2.5 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((brk) => (
                  <BreakRow key={brk.id} brk={brk} onCategorize={onCategorize} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              <span>
                Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="px-2.5 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, safePage - 2)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1 border rounded ${p === safePage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-white'}`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="px-2.5 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
