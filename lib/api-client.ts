import type { Currency } from "./currency-converter"

// Cliente API para comunicarse con Next.js
export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = "/api"
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem("auth_token", token)
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token")
    }
    return this.token
  }

  clearToken() {
    this.token = null
    localStorage.removeItem("auth_token")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error desconocido" }))
      throw new Error(error.message || "Error en la solicitud")
    }

    return response.json()
  }

  // Autenticación
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.token)
    return data
  }

  async register(name: string, email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
    this.setToken(data.token)
    return data
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" })
    this.clearToken()
  }

  // Perfil de usuario
  async getUserProfile() {
    return this.request<{ id: number; name: string; email: string; currency: Currency }>("/user/profile")
  }

  async updateCurrency(currency: Currency) {
    return this.request("/user/currency", {
      method: "PUT",
      body: JSON.stringify({ currency }),
    })
  }

  // Ingresos
  async getIngresos() {
    return this.request<any[]>("/ingresos")
  }

  async createIngreso(nombre: string, monto: number) {
    return this.request("/ingresos", {
      method: "POST",
      body: JSON.stringify({ nombre, monto }),
    })
  }

  // Gastos
  async getGastos() {
    return this.request<any[]>("/gastos")
  }

  async createGasto(nombre: string, monto: number) {
    return this.request("/gastos", {
      method: "POST",
      body: JSON.stringify({ nombre, monto }),
    })
  }
  async deleteIngreso(id: string) {
    return this.request(`/ingresos/${id}`, { method: "DELETE" })
  }

  async deleteGasto(id: string) {
    return this.request(`/gastos/${id}`, { method: "DELETE" })
  }

  // Deudas
  async getDeudas() {
    return this.request<any[]>("/deudas")
  }

  async createDeuda(nombre: string, monto: number, tasa: number) {
    return this.request("/deudas", {
      method: "POST",
      body: JSON.stringify({ nombre, monto, tasa }),
    })
  }

  async deleteDeuda(id: string) {
    return this.request(`/deudas/${id}`, { method: "DELETE" })
  }

  // Préstamos
  async getPrestamos() {
    return this.request<any[]>("/prestamos")
  }

  async createPrestamo(nombre: string, monto: number, tasa: number) {
    return this.request("/prestamos", {
      method: "POST",
      body: JSON.stringify({ nombre, monto, tasa }),
    })
  }

  async deletePrestamo(id: string) {
    return this.request(`/prestamos/${id}`, { method: "DELETE" })
  }

  // Metas de ahorro
  async getMetasAhorro() {
    return this.request<any[]>("/metas-ahorro")
  }

  async createMetaAhorro(titulo: string, metaMonto: number) {
    return this.request("/metas-ahorro", {
      method: "POST",
      body: JSON.stringify({ titulo, meta_monto: metaMonto }),
    })
  }

  async updateMetaAhorro(id: string, montoActual: number) {
    return this.request(`/metas-ahorro/${id}`, {
      method: "PUT",
      body: JSON.stringify({ monto_actual: montoActual }),
    })
  }

  async deleteMetaAhorro(id: string) {
    return this.request(`/metas-ahorro/${id}`, { method: "DELETE" })
  }
}

// Instancia singleton del cliente
export const apiClient = new ApiClient()
