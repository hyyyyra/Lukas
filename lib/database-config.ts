// Esta estructura permite cambiar fácilmente entre diferentes proveedores de BDD

export const DATABASE_CONFIG = {
  // Laravel Backend con MySQL
  LARAVEL: {
    API_URL: process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api",
  },

  // Supabase (Alternativa recomendada para Next.js)
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  // PostgreSQL directo (solo server-side)
  POSTGRES: {
    HOST: process.env.DATABASE_HOST || "localhost",
    PORT: process.env.DATABASE_PORT || "5432",
    DATABASE: process.env.DATABASE_NAME || "finanzas_app",
    USER: process.env.DATABASE_USER || "",
    PASSWORD: process.env.DATABASE_PASSWORD || "",
  },

  // MongoDB (solo server-side)
  MONGODB: {
    URI: process.env.MONGODB_URI || "",
  },

  // MySQL directo (solo server-side)
  MYSQL: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "finanzas_app",
  },
}

// Tipo de BDD activa
export type DatabaseType = "LARAVEL" | "SUPABASE" | "POSTGRES" | "MONGODB" | "MYSQL" | "LOCAL"

export const ACTIVE_DATABASE: DatabaseType = "MYSQL"

// Helper para saber si estamos usando una BDD real
export function isUsingRemoteDatabase(): boolean {
  return ACTIVE_DATABASE !== "LOCAL"
}

export function getLaravelApiUrl(): string {
  return DATABASE_CONFIG.LARAVEL.API_URL
}

export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "finanzas_app",
}
