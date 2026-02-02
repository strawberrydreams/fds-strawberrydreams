export const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '-'
  }
  return value.toLocaleString()
}

export const formatPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return '-'
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return '-'
  }
  return `${(numeric * 100).toFixed(1)}%`
}

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '-'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString()
}

export const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return '-'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString()
}
