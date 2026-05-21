const BASE_URL = ""

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    }
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || `Error en ${method} ${endpoint}`)
    }
    return res.json()
  }

  async register(name: string, email: string, password: string) {
    return this.request("POST", "/api/auth/register", { name, email, password })
  }

  async login(email: string, password: string) {
    return this.request("POST", "/api/auth/login", { email, password })
  }

  async getUserProfile() {
    return this.request("GET", "/api/auth/profile")
  }

  async getIngresos() {
    return this.request("GET", "/api/ingresos")
  }

  async createIngreso(nombre: string, monto: number, id_categoria?: number) {
    return this.request("POST", "/api/ingresos", {
      nombre,
      descripcion: nombre,
      monto,
      id_categoria,
    })
  }

  async updateIngreso(
    uuid: string,
    data: Partial<{ monto: number; descripcion: string; nombre: string; id_categoria: number; finished_at: string | null; pagado: boolean }>,
  ) {
    return this.request("PATCH", "/api/ingresos", { uuid, ...data })
  }

  async deleteIngreso(uuid: string) {
    return this.request("DELETE", `/api/ingresos?uuid=${uuid}`)
  }

  async getGastos() {
    return this.request("GET", "/api/gastos")
  }

  async createGasto(nombre: string, monto: number, id_categoria?: number) {
    return this.request("POST", "/api/gastos", {
      nombre,
      descripcion: nombre,
      monto,
      id_categoria,
    })
  }

  async updateGasto(
    uuid: string,
    data: Partial<{ monto: number; descripcion: string; nombre: string; id_categoria: number; finished_at: string | null; pagado: boolean }>,
  ) {
    return this.request("PATCH", "/api/gastos", { uuid, ...data })
  }

  async updateGastoStatus(uuid: string, pagado: boolean) {
    return this.updateGasto(uuid, { pagado })
  }

  async deleteGasto(uuid: string) {
    return this.request("DELETE", `/api/gastos?uuid=${uuid}`)
  }

  async getCategorias(tipo?: 1 | 2) {
    const params = tipo ? `?tipo=${tipo}` : ""
    return this.request("GET", `/api/categorias${params}`)
  }
}

export const apiClient = new ApiClient()
