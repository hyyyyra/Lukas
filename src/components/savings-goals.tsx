"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Target, Plus, Trash2 } from "lucide-react"

interface SavingsGoal {
  id: string
  titulo: string
  metaMonto: number
  montoActual: number
}

interface SavingsGoalsProps {
  metas: SavingsGoal[]
  onAdd: (titulo: string, metaMonto: number) => void
  onUpdate: (id: string, montoActual: number) => void
  onRemove: (id: string) => void
  currency: string
}

export function SavingsGoals({ metas, onAdd, onUpdate, onRemove, currency }: SavingsGoalsProps) {
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [metaMonto, setMetaMonto] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (titulo && metaMonto) {
      onAdd(titulo, Number.parseFloat(metaMonto))
      setTitulo("")
      setMetaMonto("")
      setShowForm(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (currency === "CLP") {
      return `$${amount.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `${currency} ${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full border-dashed border-2 h-20">
          <Plus className="mr-2 h-5 w-5" />
          Crear Nueva Meta de Ahorro
        </Button>
      )}

      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-titulo">Nombre de tu meta</Label>
                <Input
                  id="meta-titulo"
                  placeholder="Ej: Mudanza, Viaje, Auto nuevo..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-monto">Monto objetivo ({currency})</Label>
                <Input
                  id="meta-monto"
                  type="number"
                  placeholder="0.00"
                  value={metaMonto}
                  onChange={(e) => setMetaMonto(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Crear Meta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setTitulo("")
                    setMetaMonto("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {metas.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aún no tienes metas de ahorro</p>
          <p className="text-sm mt-1">Crea tu primera meta para comenzar a organizar tus objetivos</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {metas.map((meta) => {
          const progreso = (meta.montoActual / meta.metaMonto) * 100

          return (
            <Card key={meta.id} className="bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{meta.titulo}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Meta: {formatCurrency(meta.metaMonto)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(meta.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{Math.min(progreso, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(progreso, 100)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`monto-${meta.id}`} className="text-sm">
                      Monto ahorrado actual
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`monto-${meta.id}`}
                        type="number"
                        placeholder="0.00"
                        defaultValue={meta.montoActual}
                        step="0.01"
                        min="0"
                        onBlur={(e) => {
                          const newValue = Number.parseFloat(e.target.value) || 0
                          if (newValue !== meta.montoActual) {
                            onUpdate(meta.id, newValue)
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Faltan: {formatCurrency(Math.max(0, meta.metaMonto - meta.montoActual))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
