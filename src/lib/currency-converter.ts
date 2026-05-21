export type Currency = "CLP" | "USD" | "EUR"

// Tasas de cambio base (USD como referencia)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92, // 1 USD = 0.92 EUR (aproximado)
  CLP: 950, // 1 USD = 950 CLP (aproximado)
}

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount

  // Convertir a USD primero
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency]

  // Luego convertir a la moneda destino
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency]

  return convertedAmount
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "CLP") {
    return `$${amount.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  return `${currency} ${amount.toFixed(2)}`
}

// Función para actualizar tasas de cambio (útil para futuras integraciones con APIs de tasas)
export function updateExchangeRates(newRates: Partial<Record<Currency, number>>) {
  Object.assign(EXCHANGE_RATES, newRates)
}

export function getExchangeRates(): Record<Currency, number> {
  return { ...EXCHANGE_RATES }
}
