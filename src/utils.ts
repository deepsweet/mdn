export const getTableName = (locale: string): string => {
  return `mdn-${locale}`
}

export const getTableFileName = (locale: string): string => {
  const tableName = getTableName(locale)

  return `${tableName}.lance`
}

export const getCacheFileName = (locale: string): string => {
  return `cache-${locale}.json`
}
