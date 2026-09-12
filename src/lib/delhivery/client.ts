import { getDelhiveryConfig } from './config'

export class DelhiveryError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'DelhiveryError'
  }
}

interface DelhiveryFetchOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>
}

export async function delhiveryFetch<T>(
  path: string,
  options: DelhiveryFetchOptions = {},
): Promise<T> {
  const config = getDelhiveryConfig()
  const url = new URL(path, config.baseUrl)

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Token ${config.apiToken}`)
  headers.set('Accept', headers.get('Accept') ?? 'application/json')

  const res = await fetch(url.toString(), { ...options, headers })

  if (!res.ok) {
    const text = await res.text()
    throw new DelhiveryError(
      `Delhivery ${options.method ?? 'GET'} ${path} failed: ${res.status} ${text.slice(0, 300)}`,
      res.status,
      text,
    )
  }

  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
