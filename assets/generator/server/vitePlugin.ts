import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { findDefaultSolution } from './findDefaultSolution.ts'
import { generateTable, type GenerateMode } from './generateTable.ts'
import { loadSolution } from './loadSolution.ts'
import { pickSolutionFile } from './nativeDialog.ts'
import { setTableNotes } from './setNotes.ts'
import { setPrimaryTable } from './setPrimaryTable.ts'
import { writeController } from './writeController.ts'
import { fixEnums, writeEnums } from './writeEnum.ts'

export function plateServerPlugin(): Plugin {
  return {
    name: 'generator-server',
    configureServer(server) {
      server.middlewares.use('/api/default-solution', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleDefaultSolution(res)
      })

      server.middlewares.use('/api/select-solution', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleSelectSolution(res)
      })

      server.middlewares.use('/api/load-solution', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleLoadSolution(req, res)
      })

      server.middlewares.use('/api/write-enum', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleWriteEnum(req, res)
      })

      server.middlewares.use('/api/fix-enums', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleFixEnums(req, res)
      })

      server.middlewares.use('/api/generate', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleGenerate(req, res, 'generate')
      })

      server.middlewares.use('/api/replace', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleGenerate(req, res, 'replace')
      })

      server.middlewares.use('/api/set-primary-table', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleSetPrimaryTable(req, res)
      })

      server.middlewares.use('/api/set-notes', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleSetNotes(req, res)
      })

      server.middlewares.use('/api/write-controller', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleWriteController(req, res)
      })
    },
  }
}

async function handleDefaultSolution(res: ServerResponse): Promise<void> {
  try {
    const path = await findDefaultSolution()
    sendJson(res, 200, path ? { path } : { missing: true })
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleSelectSolution(res: ServerResponse): Promise<void> {
  try {
    const selected = await pickSolutionFile()
    if (!selected) {
      sendJson(res, 200, { cancelled: true })
      return
    }

    const result = await loadSolution(selected)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleLoadSolution(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    if (!solutionPath) {
      sendJson(res, 400, { error: 'A solution path is required.' })
      return
    }

    const result = await loadSolution(solutionPath)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleWriteEnum(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    const enumNames = readStringList(body.enumName, body.enumNames)
    if (!solutionPath || enumNames.length === 0) {
      sendJson(res, 400, {
        error: 'A solution path and at least one enum name are required.',
      })
      return
    }

    const result = await writeEnums(solutionPath, enumNames)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleFixEnums(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    if (!solutionPath) {
      sendJson(res, 400, { error: 'A solution path is required.' })
      return
    }

    const result = await fixEnums(solutionPath)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleGenerate(
  req: IncomingMessage,
  res: ServerResponse,
  mode: GenerateMode,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    const tableName = readString(body.tableName)
    if (!solutionPath || !tableName) {
      sendJson(res, 400, {
        error: 'A solution path and tableName are required.',
      })
      return
    }

    const result = await generateTable(solutionPath, tableName, mode)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleSetPrimaryTable(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    const tableName = readString(body.tableName)
    if (!solutionPath || !tableName) {
      sendJson(res, 400, {
        error: 'A solution path and tableName are required.',
      })
      return
    }
    if (typeof body.primary !== 'boolean') {
      sendJson(res, 400, { error: 'primary must be a boolean.' })
      return
    }

    const result = await setPrimaryTable(solutionPath, tableName, body.primary)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleSetNotes(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    const tableName = readString(body.tableName)
    if (!solutionPath || !tableName) {
      sendJson(res, 400, {
        error: 'A solution path and tableName are required.',
      })
      return
    }
    if (typeof body.notes !== 'string') {
      sendJson(res, 400, { error: 'notes must be a string.' })
      return
    }

    const result = await setTableNotes(solutionPath, tableName, body.notes)
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function handleWriteController(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody(req)
    const solutionPath = readString(body.path)
    const tableName = readString(body.tableName)
    if (!solutionPath || !tableName) {
      sendJson(res, 400, {
        error: 'A solution path and tableName are required.',
      })
      return
    }

    const result = await writeController(solutionPath, tableName, {
      controllerName: readString(body.controllerName) || undefined,
      properties: Array.isArray(body.properties)
        ? readStringList(undefined, body.properties)
        : undefined,
      methods: Array.isArray(body.methods)
        ? readStringList(undefined, body.methods)
        : undefined,
      overwrite: body.overwrite === true,
    })
    sendJson(res, result.error ? 422 : 200, result)
  } catch (error) {
    sendJson(res, 500, { error: errorMessage(error) })
  }
}

async function readJsonBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  const raw = await readBody(req)
  if (!raw.trim()) return {}

  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request body must be a JSON object.')
  }

  return parsed as Record<string, unknown>
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', reject)
  })
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readStringList(single: unknown, many: unknown): string[] {
  if (typeof single === 'string' && single.trim()) return [single.trim()]
  if (!Array.isArray(many)) return []
  return many.filter(
    (name): name is string => typeof name === 'string' && name.trim().length > 0,
  )
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected server error.'
}
