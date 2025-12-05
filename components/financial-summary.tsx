"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface FinancialData {
  ingresos: Array<{ monto: number }>
  gastos: Array<{ monto: number }>
  deudas: Array<{ monto: number }>
  prestamos: Array<{ monto: number }>
  metasAhorro: Array<{ metaMonto: number; montoActual: number }>
  moneda: string
}

export function FinancialSummary({ data, currency }: { data: FinancialData; currency: string }) {
  const totalIngresos = (data.ingresos || []).reduce((sum, item) => sum + item.monto, 0)
  const totalGastos = (data.gastos || []).reduce((sum, item) => sum + item.monto, 0)
  const totalDeudas = (data.deudas || []).reduce((sum, item) => sum + item.monto, 0)
  const totalPrestamos = (data.prestamos || []).reduce((sum, item) => sum + item.monto, 0)

  const totalAhorroObjetivo = (data.metasAhorro || []).reduce((sum, meta) => sum + meta.metaMonto, 0)
  const totalAhorroActual = (data.metasAhorro || []).reduce((sum, meta) => sum + meta.montoActual, 0)
  // </CHANGE>

  const disponible = totalIngresos - totalGastos
  const balance = totalIngresos - totalGastos

  const formatCurrency = (amount: number) => {
    if (currency === "CLP") {
      return `$${amount.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `${currency} ${amount.toFixed(2)}`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <TrendingUp className="h-5 w-5 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-light">{formatCurrency(totalIngresos)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {(data.ingresos || []).length} fuente{(data.ingresos || []).length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/30 to-accent/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-light">{formatCurrency(totalGastos)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {(data.gastos || []).length} gasto{(data.gastos || []).length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Balance Mensual</CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-light ${balance >= 0 ? "text-secondary" : "text-destructive"}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ingresos - Gastos</p>
        </CardContent>
      </Card>

      {totalDeudas > 0 && (
        <Card className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-destructive/10 to-background">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Deudas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-destructive">{formatCurrency(totalDeudas)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(data.deudas || []).length} deuda{(data.deudas || []).length !== 1 ? "s" : ""} pendiente
              {(data.deudas || []).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      )}

      {totalPrestamos > 0 && (
        <Card className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-secondary/10 to-background">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-secondary">{formatCurrency(totalPrestamos)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(data.prestamos || []).length} préstamo{(data.prestamos || []).length !== 1 ? "s" : ""} otorgado
              {(data.prestamos || []).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      )}

      {(data.metasAhorro || []).length > 0 && (
        <Card className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/15 to-background">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progreso de Ahorro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-primary">{formatCurrency(totalAhorroActual)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {formatCurrency(totalAhorroObjetivo)} en {(data.metasAhorro || []).length} meta
              {(data.metasAhorro || []).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      )}
      {/* </CHANGE> */}
    </div>
  )
}
