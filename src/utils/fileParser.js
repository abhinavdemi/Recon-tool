import Papa from 'papaparse'

/**
 * Parse a CSV File object into { name, headers, rows }.
 * rows is an array of plain objects keyed by header name.
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const fatal = results.errors.find((e) => e.type === 'Delimiter' || e.type === 'Quotes')
          if (fatal) {
            reject(new Error(`Parse error: ${fatal.message}`))
            return
          }
        }
        const headers = results.meta.fields ?? []
        const rows = results.data.map((row) => {
          const clean = {}
          for (const h of headers) clean[h] = String(row[h] ?? '').trim()
          return clean
        })
        resolve({ name: file.name, headers, rows })
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}

/**
 * Detect file type and dispatch to the right parser.
 * Currently only CSV is supported.
 */
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    return parseCSV(file)
  }
  throw new Error(`Unsupported file type: .${ext}. Please upload a CSV file.`)
}
