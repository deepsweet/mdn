import lancedb from '@lancedb/lancedb'
import { env } from './env.ts'
import { vectorize } from './vectorize.ts'
import type { rerankers, Table } from '@lancedb/lancedb'
import type { LlamaEmbeddingContext } from 'node-llama-cpp'

export type TQueryResult = {
  text: string,
  _score: number,
  _relevance_score: number
}

// https://docs.lancedb.com/search/hybrid-search
export const queryHybrid = async (llamaContext: LlamaEmbeddingContext, table: Table, reranker: rerankers.RRFReranker, text: string): Promise<TQueryResult[]> => {
  const vector = await vectorize(llamaContext, text)

  const results = await table
    .query()
    .nearestTo(vector)
    .fullTextSearch(text)
    .rerank(reranker)
    .limit(env.MDN_SEARCH_RESULTS_LIMIT)
    .toArray() as TQueryResult[]

  return results
}

export const createReranker = async (): Promise<rerankers.RRFReranker> => {
  const reranker = await lancedb.rerankers.RRFReranker.create()

  return reranker
}
