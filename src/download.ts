import { env } from './env.ts'
import { downloadDataset, downloadModel } from './huggingface.ts'

export const downloadDatasetAndModel = async (locale?: string): Promise<void> => {
  if (env.MDN_DATASET_PATH == null) {
    locale ??= env.MDN_DATASET_LOCALE

    await downloadDataset(locale)
  }

  if (env.MDN_MODEL_PATH == null) {
    await downloadModel()
  }
}
