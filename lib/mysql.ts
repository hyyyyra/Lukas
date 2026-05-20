import sql from "mssql"
import { DB_CONFIG } from "./database-config"

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool({
      server: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      options: {
        encrypt: DB_CONFIG.encrypt,
        trustServerCertificate: DB_CONFIG.trustServerCertificate,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    })
      .connect()
      .catch((error) => {
        pool = null
        throw error
      })
  }
  return pool
}

function toSqlServerQuery(rawSql: string) {
  let paramIndex = 0
  return rawSql.replace(/\?/g, () => `@p${paramIndex++}`)
}

export async function query(sql: string, params?: any[]) {
  try {
    const connection = await getPool()
    const request = connection.request()
    const queryParams = params || []

    queryParams.forEach((value, index) => {
      request.input(`p${index}`, value ?? null)
    })

    const normalizedSql = toSqlServerQuery(sql)
    const isInsert = /^\s*insert\b/i.test(sql)
    const finalSql = isInsert ? `${normalizedSql}; SELECT CAST(SCOPE_IDENTITY() as int) AS insertId;` : normalizedSql
    const result = await request.query(finalSql)

    if (isInsert) {
      const sets = result.recordsets ?? []
      let insertId: number | null = null
      for (let i = sets.length - 1; i >= 0; i--) {
        const row = sets[i]?.[0] as Record<string, unknown> | undefined
        if (!row) continue
        const raw =
          row.insertId ??
          row.INSERTID ??
          row.insertid ??
          (Object.keys(row).length === 1 ? Object.values(row)[0] : undefined)
        if (raw !== undefined && raw !== null) {
          insertId = typeof raw === "bigint" ? Number(raw) : Number(raw)
          break
        }
      }
      return {
        insertId: Number.isFinite(insertId) ? insertId : null,
        rowsAffected: result.rowsAffected?.[0] ?? 0,
      }
    }

    if (/^\s*select\b/i.test(sql)) {
      return result.recordset
    }

    return {
      rowsAffected: result.rowsAffected?.[0] ?? 0,
    }
  } catch (error: any) {
    console.error("[v0] Error en query SQL:", error)
    throw new Error(`Error en base de datos: ${error.message}`)
  }
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
