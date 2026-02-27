import React from 'react'

const TYPE_LABELS = {
  VALUE_DIFF:   { label: 'Value Diff',   cls: 'bg-red-100 text-red-700 border-red-200' },
  MISSING_IN_A: { label: 'Missing in A', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  MISSING_IN_B: { label: 'Missing in B', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
}

export default function BreakRow({ brk, onCategorize }) {
  const typeInfo = TYPE_LABELS[brk.type] ?? { label: brk.type, cls: 'bg-gray-100 text-gray-600' }

  return (
    <tr className={`text-sm border-b border-gray-100 transition-colors
      ${brk.suppressed ? 'bg-purple-50 opacity-70' : 'hover:bg-gray-50'}
    `}>
      {/* Type badge */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeInfo.cls}`}>
          {typeInfo.label}
        </span>
      </td>

      {/* Key */}
      <td className="px-3 py-2.5 font-mono text-xs text-gray-700 max-w-[180px] truncate" title={brk.keyValue}>
        {brk.keyValue}
      </td>

      {/* Column */}
      <td className="px-3 py-2.5 text-xs text-gray-600 font-mono">
        {brk.column ?? <span className="text-gray-300">—</span>}
      </td>

      {/* Value A */}
      <td className="px-3 py-2.5 text-xs max-w-[140px]">
        {brk.valueA != null
          ? <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono truncate block" title={brk.valueA}>{brk.valueA}</span>
          : <span className="text-gray-300">—</span>
        }
      </td>

      {/* Value B */}
      <td className="px-3 py-2.5 text-xs max-w-[140px]">
        {brk.valueB != null
          ? <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono truncate block" title={brk.valueB}>{brk.valueB}</span>
          : <span className="text-gray-300">—</span>
        }
      </td>

      {/* Suppressed indicator */}
      <td className="px-3 py-2.5 text-xs text-center">
        {brk.suppressed
          ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">suppressed</span>
          : <span className="text-gray-200">—</span>
        }
      </td>

      {/* Category toggles */}
      <td className="px-3 py-2.5">
        <div className="flex gap-1.5">
          <button
            onClick={() => onCategorize(brk.id, 'good')}
            disabled={brk.suppressed}
            title="Mark as Good Break"
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-all
              ${brk.category === 'good'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'}
              ${brk.suppressed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            Good
          </button>
          <button
            onClick={() => onCategorize(brk.id, 'bad')}
            disabled={brk.suppressed}
            title="Mark as Bad Break"
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-all
              ${brk.category === 'bad'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-600'}
              ${brk.suppressed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            Bad
          </button>
        </div>
      </td>
    </tr>
  )
}
