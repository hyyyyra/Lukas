import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SavingsCard } from "./savings-card"

interface FinancialData {
  ingresos: Array<{ nombre: string; monto: number }>
  gastos: Array<{ nombre: string; monto: number }>
  moneda: string
}

export function FinancialSummary({ data, currency }: { data: FinancialData; currency: string }) {
  const totalIngresos = (data.ingresos || []).reduce((sum, item) => sum + item.monto, 0)
  const totalGastos = (data.gastos || []).reduce((sum, item) => sum + item.monto, 0)

  const rawBalance = totalIngresos - totalGastos
  const [savingsAmount, setSavingsAmount] = useState(0)

  // Inicializar el ahorro con el 20% por defecto (coincidiendo con el estado inicial de SavingsCard)
  useEffect(() => {
    setSavingsAmount(Math.round(rawBalance * 0.20))
  }, [rawBalance])

  const formatCurrency = (amount: number) => {
    if (currency === "CLP") {
      return `$${Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
    }
    return `${currency} ${amount.toFixed(2)}`
  }

  const balanceRestante = rawBalance - savingsAmount

  return (
    <div className="mb-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-secondary">{formatCurrency(totalIngresos)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(data.ingresos || []).length} fuente{(data.ingresos || []).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-background border-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-destructive">{formatCurrency(totalGastos)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(data.gastos || []).length} gasto{(data.gastos || []).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Wallet className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance Mensual</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-foreground">
              {formatCurrency(balanceRestante)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Restante después de ahorro</p>
          </CardContent>
          <div className="absolute bottom-2 left-6">
            <p className="text-[10px] text-muted-foreground/60 transition-colors">
              Total sin ahorro: {formatCurrency(rawBalance)}
            </p>
          </div>
        </Card>

        <SavingsCard
          balanceMensual={rawBalance}
          formatCurrency={formatCurrency}
          onSavingsChange={(_, amount) => setSavingsAmount(amount)}
        />
      </div>
    </div>
  )
}
