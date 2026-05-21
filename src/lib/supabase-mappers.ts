type CategoriaNested = {
  ID: number
  NOMBRE_CATEGORIA: string
  TIPO_CATEGORIAS?: { NOMBRE_TIPO: string } | { NOMBRE_TIPO: string }[] | null
}

type CategoriaRaw = CategoriaNested | CategoriaNested[] | null | undefined

/** Forma que devuelve Supabase en joins (relaciones a veces como array). */
export type MovimientoRowRaw = {
  UUID: string
  MONTO: number
  DESCRIPCION?: string | null
  CREATED_AT?: string
  FINISHED_AT?: string | null
  ID_CATEGORIA?: number
  CATEGORIAS?: CategoriaRaw
}

export type MovimientoRow = {
  UUID: string
  MONTO: number
  DESCRIPCION?: string | null
  CREATED_AT?: string
  FINISHED_AT?: string | null
  ID_CATEGORIA?: number
  CATEGORIAS?: {
    ID: number
    NOMBRE_CATEGORIA: string
    TIPO_CATEGORIAS?: { NOMBRE_TIPO: string } | null
  } | null
}

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function normalizeCategoria(cat: CategoriaRaw): MovimientoRow["CATEGORIAS"] {
  const c = unwrap(cat)
  if (!c) return null

  const tipo = unwrap(c.TIPO_CATEGORIAS)

  return {
    ID: c.ID,
    NOMBRE_CATEGORIA: c.NOMBRE_CATEGORIA,
    TIPO_CATEGORIAS: tipo ?? null,
  }
}

export function normalizeMovimientoRow(row: MovimientoRowRaw): MovimientoRow {
  return {
    UUID: row.UUID,
    MONTO: row.MONTO,
    DESCRIPCION: row.DESCRIPCION,
    CREATED_AT: row.CREATED_AT,
    FINISHED_AT: row.FINISHED_AT,
    ID_CATEGORIA: row.ID_CATEGORIA,
    CATEGORIAS: normalizeCategoria(row.CATEGORIAS),
  }
}

export function mapMovimiento(row: MovimientoRowRaw | null | undefined) {
  if (!row) {
    throw new Error("Registro no encontrado")
  }

  const normalized = normalizeMovimientoRow(row)
  const categoriaNombre = normalized.CATEGORIAS?.NOMBRE_CATEGORIA

  return {
    id: normalized.UUID,
    uuid: normalized.UUID,
    nombre: normalized.DESCRIPCION?.trim() || categoriaNombre || "",
    monto: Number(normalized.MONTO),
    descripcion: normalized.DESCRIPCION ?? null,
    pagado: !!normalized.FINISHED_AT,
    id_categoria: normalized.ID_CATEGORIA,
    created_at: normalized.CREATED_AT,
    finished_at: normalized.FINISHED_AT,
    categoria: normalized.CATEGORIAS
      ? {
          id: normalized.CATEGORIAS.ID,
          nombre: normalized.CATEGORIAS.NOMBRE_CATEGORIA,
          tipo: normalized.CATEGORIAS.TIPO_CATEGORIAS?.NOMBRE_TIPO,
        }
      : undefined,
  }
}

export function mapMovimientos(rows: MovimientoRowRaw[] | null | undefined) {
  return (rows ?? []).map((row) => mapMovimiento(row))
}
