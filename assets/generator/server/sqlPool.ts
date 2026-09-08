import sql from 'mssql'

export function quoteId(identifier: string): string {
  return `[${identifier.replaceAll(']', ']]')}]`
}

export async function withSql<T>(
  connectionString: string,
  fn: (pool: sql.ConnectionPool) => Promise<T>,
): Promise<T> {
  const config = sql.ConnectionPool.parseConnectionString(connectionString)
  config.options = {
    ...config.options,
    trustServerCertificate: config.options?.trustServerCertificate ?? true,
  }

  const pool = new sql.ConnectionPool(config)
  try {
    await pool.connect()
    return await fn(pool)
  } catch (error) {
    throw new Error(friendlySqlError(error))
  } finally {
    await pool.close()
  }
}

export function friendlySqlError(error: unknown): string {
  if (!(error instanceof Error)) return 'Failed to read the database schema.'

  const code =
    'code' in error && typeof error.code === 'string' ? error.code : undefined

  switch (code) {
    case 'ELOGIN':
      return `SQL Server login failed. ${error.message}`
    case 'ETIMEOUT':
      return `Timed out connecting to SQL Server. ${error.message}`
    case 'ESOCKET':
      return `Could not reach SQL Server. ${error.message}`
    default:
      return `Failed to read the database schema. ${error.message}`
  }
}
