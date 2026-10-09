import { createServerFn } from '@tanstack/react-start'

// The site talks to the FastAPI back end only from the server, so the API
// address stays internal and the browser never needs CORS.
function apiUrl(path: string) {
  const base = process.env.API_URL ?? 'http://localhost:8000'
  return new URL(path, base).toString()
}

export type ApiHealth = { status: string; database: string; version: string }

export const getApiHealth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ApiHealth | null> => {
    try {
      const response = await fetch(apiUrl('/v1/health'))
      if (!response.ok) return null
      return (await response.json()) as ApiHealth
    } catch {
      return null
    }
  },
)
