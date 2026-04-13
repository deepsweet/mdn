import type { TVector } from '../src/types.ts'

export type TIngestData = {
  text: string,
  file: string,
  vector: TVector
}

export type TCache = {
  timestamp: number,
  files: Record<string, string>
}
