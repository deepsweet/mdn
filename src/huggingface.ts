import fs from 'node:fs/promises'
import path from 'path'
import {
  datasetInfo,
  getHFHubCachePath,
  getRepoFolderName,
  modelInfo,
  scanCachedRepo,
  snapshotDownload
} from '@huggingface/hub'
import { DATASET_DIR, DATASET_REPO, MODEL_FILE, MODEL_REPO } from './const.ts'
import { env } from './env.ts'
import type { CachedRevisionInfo, RepoType } from '@huggingface/hub'

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

const getCachedRepoPath = (name: string, type: RepoType): string => {
  const cachePath = getHFHubCachePath()
  const repoFolderName = getRepoFolderName({ name, type })
  const repoPath = path.join(cachePath, repoFolderName)

  return repoPath
}

const getLatestCachedRepoRevision = async (repoPath: string): Promise<CachedRevisionInfo> => {
  const repo = await scanCachedRepo(repoPath)

  if (repo.revisions.length === 0) {
    throw new Error('Unable to get repo revisions, it needs to be downloaded first')
  }

  const latestRevision = repo.revisions.reduce((latest, current) => {
    if (current.lastModifiedAt > latest.lastModifiedAt) {
      return current
    }

    return latest
  })

  return latestRevision
}

const shouldDownloadSnapshot = async (name: string, type: RepoType, sha: string): Promise<boolean> => {
  try {
    const repoPath = getCachedRepoPath(name, type)
    const latestRevision = await getLatestCachedRepoRevision(repoPath)

    if (latestRevision.commitOid !== sha) {
      await fs.rm(repoPath, { recursive: true, force: true })

      return true
    }
  } catch {
    return true
  }

  return false
}

export const downloadDataset = async (): Promise<void> => {
  const info = await datasetInfo({
    name: DATASET_REPO,
    additionalFields: ['sha'],
    accessToken: env.HF_TOKEN
  })
  const shouldDownload = await shouldDownloadSnapshot(DATASET_REPO, 'dataset', info.sha)

  if (shouldDownload) {
    const snapshotPath = await snapshotDownload({
      repo: `datasets/${DATASET_REPO}`,
      accessToken: env.HF_TOKEN
    })

    const dataPath = path.join(snapshotPath, DATASET_DIR)

    // TODO: nuke this dirty hack after https://github.com/lancedb/lancedb/issues/3197
    await replaceSymlinksWithHardlinks(dataPath)
  }
}

export const getDatasetPath = async (): Promise<string> => {
  if (env.MDN_DATASET_PATH != null) {
    return env.MDN_DATASET_PATH
  }

  const repoPath = getCachedRepoPath(DATASET_REPO, 'dataset')
  const latestRevision = await getLatestCachedRepoRevision(repoPath)
  const datasetPath = path.join(latestRevision.path, DATASET_DIR)

  return datasetPath
}

export const downloadModel = async (): Promise<void> => {
  const info = await modelInfo({
    name: MODEL_REPO,
    additionalFields: ['sha'],
    accessToken: env.HF_TOKEN
  })
  const shouldDownload = await shouldDownloadSnapshot(MODEL_REPO, 'model', info.sha)

  if (shouldDownload) {
    await snapshotDownload({
      repo: MODEL_REPO,
      accessToken: env.HF_TOKEN
    })
  }
}

export const getModelPath = async (): Promise<string> => {
  if (env.MDN_MODEL_PATH != null) {
    return env.MDN_MODEL_PATH
  }

  const repoPath = getCachedRepoPath(MODEL_REPO, 'model')
  const latestRevision = await getLatestCachedRepoRevision(repoPath)
  const modelPath = path.join(latestRevision.path, MODEL_FILE)

  return modelPath
}
