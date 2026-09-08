import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import {
  defaultGeneratorConfig,
  equalsIgnoreCase,
} from '../shared/conventions.ts'
import type { GeneratorConfig, GeneratorTableConfig } from '../shared/types.ts'

export function generatorConfigPath(solutionPath: string): string {
  return path.join(path.dirname(solutionPath), 'generator.json')
}

function plateConfigPath(solutionPath: string): string {
  return path.join(path.dirname(solutionPath), 'plate.json')
}

export async function loadOrCreateGeneratorConfig(
  solutionPath: string,
): Promise<{ config: GeneratorConfig; path: string }> {
  const filePath = generatorConfigPath(solutionPath)
  if (await fileExists(filePath)) {
    return { config: await readGeneratorConfig(filePath), path: filePath }
  }

  const legacyPath = plateConfigPath(solutionPath)
  if (await fileExists(legacyPath)) {
    const config = await readGeneratorConfig(legacyPath)
    await writeGeneratorConfig(filePath, config)
    await rename(legacyPath, `${legacyPath}.bak`).catch(() => undefined)
    return { config, path: filePath }
  }

  const config = defaultGeneratorConfig()
  await writeGeneratorConfig(filePath, config)
  return { config, path: filePath }
}

export async function writeGeneratorConfig(
  filePath: string,
  config: GeneratorConfig,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(normalizeConfig(config), null, 2)}\n`)
}

export function applyPrimaryTable(
  config: GeneratorConfig,
  tableName: string,
  primary: boolean,
): GeneratorConfig {
  const others = config.primaryTables.filter(
    (name) => !equalsIgnoreCase(name, tableName),
  )
  const existing = config.primaryTables.find((name) =>
    equalsIgnoreCase(name, tableName),
  )

  return {
    ...config,
    primaryTables: primary
      ? [...others, existing ?? tableName].sort((left, right) =>
          left.localeCompare(right),
        )
      : others,
  }
}

export function applyTableNotes(
  config: GeneratorConfig,
  tableName: string,
  notes: string,
): GeneratorConfig {
  const key =
    Object.keys(config.tables).find((name) =>
      equalsIgnoreCase(name, tableName),
    ) ?? tableName
  const current: GeneratorTableConfig = { ...(config.tables[key] ?? {}) }
  const trimmed = notes.trim()
  const tables = { ...config.tables }
  if (!trimmed) {
    delete current.notes
    if (Object.keys(current).length === 0) delete tables[key]
    else tables[key] = current
  } else {
    tables[key] = { ...current, notes: trimmed }
  }
  return { ...config, tables }
}

export function tableNotes(
  config: GeneratorConfig,
  tableName: string,
): string {
  const entry = Object.entries(config.tables).find(([name]) =>
    equalsIgnoreCase(name, tableName),
  )
  return entry?.[1]?.notes?.trim() ?? ''
}

async function readGeneratorConfig(filePath: string): Promise<GeneratorConfig> {
  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8')) as Partial<
      GeneratorConfig & { bridgeObjects?: unknown }
    >
    return normalizeConfig({
      version: 1,
      primaryTables: Array.isArray(parsed.primaryTables)
        ? parsed.primaryTables.filter((value) => typeof value === 'string')
        : [],
      tables: normalizeTables(parsed.tables),
    })
  } catch {
    return defaultGeneratorConfig()
  }
}

function normalizeTables(
  value: unknown,
): Record<string, GeneratorTableConfig> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const tables: Record<string, GeneratorTableConfig> = {}
  for (const [name, entry] of Object.entries(value)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const notes = (entry as GeneratorTableConfig).notes
    tables[name] = {
      notes: typeof notes === 'string' ? notes : undefined,
    }
  }
  return tables
}

function normalizeConfig(config: GeneratorConfig): GeneratorConfig {
  return {
    version: 1,
    primaryTables: [...config.primaryTables],
    tables: { ...config.tables },
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
