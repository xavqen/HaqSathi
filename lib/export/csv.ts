function cell(value: unknown) {
  if (value === null || value === undefined) return ''
  const text = String(value).replace(/\r?\n/g, ' ')
  if (/[",]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function toCsv(headers: string[], rows: unknown[][]) {
  return [headers.map(cell).join(','), ...rows.map((row) => row.map(cell).join(','))].join('\n')
}

export function csvResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store'
    }
  })
}
