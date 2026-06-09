import axios from "axios";

// During dev, vite proxies /api -> http://localhost:3000 (see vite.config.ts),
// so a relative base works without CORS headaches. To point at a deployed
// API instead, set VITE_API_URL in a .env file.
const baseURL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Normalize axios errors into a human-readable, pt-BR friendly message.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (error.code === "ERR_NETWORK")
      return "Não foi possível conectar à API. Verifique se o servidor está rodando na porta 3000.";
    if (error.response?.status)
      return `${fallback} (HTTP ${error.response.status}).`;
  }
  return fallback;
}
