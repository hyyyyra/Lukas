"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { PiggyBank } from "lucide-react"
import { Slider } from "@/src/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

interface SavingsCardProps {
    balanceMensual: number
    formatCurrency: (value: number) => string
    onSavingsChange?: (percentage: number, amount: number) => void
}

export function SavingsCard({
    balanceMensual,
    formatCurrency,
    onSavingsChange
}: SavingsCardProps) {
    const [porcentaje, setPorcentaje] = useState(20)
    const [inputValue, setInputValue] = useState("20")

    const montoAhorro = useMemo(() => {
        return Math.round(balanceMensual * (porcentaje / 100))
    }, [balanceMensual, porcentaje])

    const handleSliderChange = (value: number[]) => {
        const newPercentage = value[0]
        setPorcentaje(newPercentage)
        setInputValue(String(newPercentage))
        onSavingsChange?.(newPercentage, Math.round(balanceMensual * (newPercentage / 100)))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "") // Solo permitir dígitos
        setInputValue(value)

        const numValue = Number.parseInt(value, 10)
        if (!Number.isNaN(numValue)) {
            const clampedValue = Math.min(Math.max(numValue, 0), 100)
            setPorcentaje(clampedValue)
            setInputValue(String(clampedValue)) // Actualizar el input con el valor limitado
            onSavingsChange?.(clampedValue, Math.round(balanceMensual * (clampedValue / 100)))
        } else if (value === "") {
            setPorcentaje(0)
            onSavingsChange?.(0, 0)
        }
    }

    const handleInputBlur = () => {
        const numValue = Number.parseInt(inputValue, 10)
        if (Number.isNaN(numValue) || numValue < 0) {
            setPorcentaje(0)
            setInputValue("0")
        } else if (numValue > 100) {
            setPorcentaje(100)
            setInputValue("100")
        }
    }

    return (
        <Card className="bg-gradient-to-br from-blue-500/20 to-background border-blue-500/20 py-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-blue-600">Capacidad de Ahorro</CardTitle>
                <PiggyBank className="h-5 w-5 text-blue-500/80" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-light text-blue-600">
                    {formatCurrency(montoAhorro)}
                </div>

                {/* Input de porcentaje */}
                <div className="mt-4">
                    <label className="text-xs text-muted-foreground mb-2 block">
                        Porcentaje a ahorrar
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className="w-16 px-2 py-1.5 text-center text-sm font-semibold text-blue-600 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <span className="text-blue-600 text-sm font-medium">%</span>
                    </div>
                </div>

                {/* Slider */}
                <div className="mt-3">
                    <Slider
                        value={[porcentaje]}
                        onValueChange={handleSliderChange}
                        max={100}
                        min={0}
                        step={1}
                        className="[&_[data-slot=slider-track]]:bg-blue-200 [&_[data-slot=slider-range]]:bg-blue-600 [&_[data-slot=slider-thumb]]:border-blue-600 [&_[data-slot=slider-thumb]]:bg-white"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
