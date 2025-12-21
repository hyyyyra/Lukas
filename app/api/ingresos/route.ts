import { NextResponse } from "next/server"
import { query } from "@/lib/mysql"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [userId] = decoded.split(":")

    if (!userId) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    const ingresos = await query(
      "SELECT ID_INGRESO as id, TITULO_INGRESO as nombre, MONTO_INGRESO as monto FROM ingreso WHERE ID_USUARIO = ? ORDER BY FECHA_INGRESO DESC",
      [userId]
    )

    return NextResponse.json(ingresos)
  } catch (error: any) {
    console.error("Error obteniendo ingresos:", error)
    return NextResponse.json({ message: "Error al obtener ingresos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [userId] = decoded.split(":")

    if (!userId) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    const { nombre, monto } = await request.json()

    if (!nombre || !monto) {
      return NextResponse.json({ message: "Nombre y monto son requeridos" }, { status: 400 })
    }

    const result: any = await query(
      "INSERT INTO ingreso (TITULO_INGRESO, MONTO_INGRESO, ID_USUARIO) VALUES (?, ?, ?)",
      [nombre, monto, userId]
    )

    return NextResponse.json({
      id: result.insertId,
      nombre,
      monto,
    })
  } catch (error: any) {
    console.error("Error creando ingreso:", error)
    return NextResponse.json({ message: "Error al crear ingreso" }, { status: 500 })
  }
}
