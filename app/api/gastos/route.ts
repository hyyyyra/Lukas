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

    const gastos = await query(
      "SELECT ID_GASTO as id, TITULO_GASTO as nombre, MONTO_GASTO as monto, PAGADO as pagado FROM gastos WHERE ID_USUARIO = ? ORDER BY FECHA_GASTO DESC",
      [userId]
    )

    return NextResponse.json(gastos)
  } catch (error: any) {
    console.error("Error obteniendo gastos:", error)
    return NextResponse.json({ message: "Error al obtener gastos" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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

    const { id, pagado } = await request.json()

    if (id === undefined || pagado === undefined) {
      return NextResponse.json({ message: "ID y estado de pago son requeridos" }, { status: 400 })
    }

    await query("UPDATE gastos SET PAGADO = ? WHERE ID_GASTO = ? AND ID_USUARIO = ?", [pagado, id, userId])

    return NextResponse.json({ message: "Gasto actualizado" })
  } catch (error: any) {
    console.error("Error actualizando gasto:", error)
    return NextResponse.json({ message: "Error al actualizar el gasto" }, { status: 500 })
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
      "INSERT INTO gastos (TITULO_GASTO, MONTO_GASTO, ID_USUARIO) VALUES (?, ?, ?)",
      [nombre, monto, userId]
    )

    return NextResponse.json({
      id: result.insertId,
      nombre,
      monto,
    })
  } catch (error: any) {
    console.error("Error creando gasto:", error)
    return NextResponse.json({ message: "Error al crear gasto" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    await query("DELETE FROM gastos WHERE ID_GASTO = ? AND ID_USUARIO = ?", [id, userId])

    return NextResponse.json({ message: "Gasto eliminado" })
  } catch (error: any) {
    console.error("Error eliminando gasto:", error)
    return NextResponse.json({ message: "Error al eliminar gasto" }, { status: 500 })
  }
}
