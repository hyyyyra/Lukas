import mysql from "mysql2/promise"
import { DB_CONFIG } from "./database-config"

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function query(sql: string, params?: any[]) {
  try {
    const pool = getPool()
    const [results] = await pool.execute(sql, params)
    return results
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
