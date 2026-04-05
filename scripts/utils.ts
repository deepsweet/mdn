import path from 'node:path'
import { CACHE_FILENAME } from './const.ts'

export const getCacheFile = (datasetPath: string): Bun.BunFile => {
  const snapshotPath = path.dirname(datasetPath)
  const cachePath = path.join(snapshotPath, CACHE_FILENAME)
  const cacheFile = Bun.file(cachePath)

  return cacheFile
}
