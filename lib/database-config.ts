// Esta estructura permite cambiar fácilmente entre diferentes proveedores de BDD

export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "9999"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "finanzas_app",
}
