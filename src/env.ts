import { z } from 'zod'

export const env = z.object({
  MDN_DATASET_PATH: z.string().optional(),
  MDN_MODEL_PATH: z.string().optional(),
  MDN_MODEL_TTL: z.number().default(1800),
  MDN_QUERY_DESCRIPTION: z.string().default('Natural language query for hybrid vector and full-text search'),
  MDN_SEARCH_RESULTS_LIMIT: z.coerce.number().default(3),
  HF_TOKEN: z.string().optional()
}).parse(process.env)
