import { NextResponse } from "next/server"
import { query } from "@/lib/mysql"

export async function GET(request: Request) {
  console.log("Ejecuto INSERT GET")
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

    const prestamos = await query(
      "SELECT ID_PRESTAMO as id, TITULO_PRESTAMO as nombre, MONTO_PRESTAMO as monto FROM prestamo WHERE ID_USUARIO = ? ORDER BY FECHA_PRESTAMO DESC",
      [userId]
    )

    return NextResponse.json(prestamos)
  } catch (error: any) {
    console.error("Error obteniendo préstamos:", error)
    return NextResponse.json({ message: "Error al obtener préstamos" }, { status: 500 })
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
      "INSERT INTO prestamo (TITULO_PRESTAMO, MONTO_PRESTAMO,FECHA_REGISTRO, ESTADO_PAGO, ID_USUARIO) VALUES (?, ?, ?, ?, ?)",
      [nombre, monto, new Date(), 1, userId]
    )

    return NextResponse.json({
      id: result.insertId,
      nombre,
      monto,
    })
  } catch (error: any) {
    console.error("Error creando préstamo:", error)
    return NextResponse.json({ message: "Error al crear préstamo" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  console.log("Ejecuto DELETE")
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 })
    }

    await query("DELETE FROM prestamo WHERE ID_PRESTAMO = ? AND ID_USUARIO = ?", [id, userId])

    return NextResponse.json({ message: "Préstamo eliminado" })
  } catch (error: any) {
    console.error("Error eliminando préstamo:", error)
    return NextResponse.json({ message: "Error al eliminar préstamo" }, { status: 500 })
  }
}
