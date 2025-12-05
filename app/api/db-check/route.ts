import { NextResponse } from "next/server"
import { query } from "@/lib/mysql"

export async function GET() {
  try {
    const result = await query("SELECT 1 as connected")
    return NextResponse.json({
      status: "connected",
      database: "MySQL",
      message: "Conexión exitosa",
      result,
    })
  } catch (error: any) {
    console.error("[v0] Error de conexión:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "No se pudo conectar a la base de datos",
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
