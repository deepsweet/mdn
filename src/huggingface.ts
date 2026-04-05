import fs from 'node:fs/promises'
import path from 'path'
import {
  downloadFileToCacheDir,
  getHFHubCachePath,
  getRepoFolderName,
  scanCachedRepo,
  snapshotDownload
} from '@huggingface/hub'
import { CACHE_FILENAME, DATASET_REPO, MODEL_FILE, MODEL_REPO, TABLE_FILENAME } from './const.ts'
import { env } from './env.ts'
import type { RepoType } from '@huggingface/hub'

const replaceSymlinksWithHardlinks = async (dir: string): Promise<void> => {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isSymbolicLink()) {
      const target = await fs.readlink(fullPath)
      const sourcePath = path.resolve(dir, target)

      await fs.unlink(fullPath)
      await fs.link(sourcePath, fullPath)

      continue
    }

    if (entry.isDirectory()) {
      await replaceSymlinksWithHardlinks(fullPath)
    }
  }
}

const getLatestCachedRepoRevision = async (name: string, type: RepoType): Promise<string> => {
  const cachePath = getHFHubCachePath()
  const repoFolderName = getRepoFolderName({ name, type })
  const repoPath = path.join(cachePath, repoFolderName)
  const repo = await scanCachedRepo(repoPath)

  if (repo.revisions.length === 0) {
    throw new Error('Unable to get model path, it needs to be downloaded first')
  }

  const latestRevision = repo.revisions.reduce((latest, current) => {
    if (current.lastModifiedAt > latest.lastModifiedAt) {
      return current
    }

    return latest
  })

  return latestRevision.path
}

export const downloadDataset = async (): Promise<void> => {
  const dirPath = await snapshotDownload({
    repo: `datasets/${DATASET_REPO}`,
    // @ts-expect-error - `path` property actually spreads in runtime but not in types
    path: `data/${TABLE_FILENAME}`
  })
  const dataPath = path.join(dirPath, 'data')

  // TODO: nuke this dirty hack after https://github.com/lancedb/lancedb/issues/3197
  await replaceSymlinksWithHardlinks(dataPath)
}

export const getDatasetPath = async (): Promise<string> => {
  if (env.MDN_DATASET_PATH != null) {
    return env.MDN_DATASET_PATH
  }

  const latestRevisionPath = await getLatestCachedRepoRevision(DATASET_REPO, 'dataset')
  const datasetPath = path.join(latestRevisionPath, 'data')

  return datasetPath
}

export const downloadModel = async (): Promise<void> => {
  await snapshotDownload({
    repo: MODEL_REPO
  })
}

export const getModelPath = async (): Promise<string> => {
  if (env.MDN_MODEL_PATH != null) {
    return env.MDN_MODEL_PATH
  }

  const latestRevisionPath = await getLatestCachedRepoRevision(MODEL_REPO, 'model')
  const modelPath = path.join(latestRevisionPath, MODEL_FILE)

  return modelPath
}

export const downloadCacheFile = async (): Promise<void> => {
  await downloadFileToCacheDir({
    repo: `datasets/${DATASET_REPO}`,
    path: `data/${CACHE_FILENAME}`
  })
}
