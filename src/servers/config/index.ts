const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000"

const TIME_OUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

export { BASE_URL, TIME_OUT }
