import 'server-only'
import { getNextAuthUrl } from '@/lib/env'

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

function normalizeOrigin(origin: string) {
  return origin.endsWith('/') ? origin.slice(0, -1) : origin
}

export function getAppBaseUrl(fallbackOrigin?: string) {
  const nextAuthUrl = getNextAuthUrl()
  if (nextAuthUrl) {
    return normalizeOrigin(nextAuthUrl)
  }

  if (fallbackOrigin) {
    return normalizeOrigin(fallbackOrigin)
  }

  return 'http://localhost:5000'
}

export function isLocalAppOrigin(origin: string) {
  try {
    const { hostname } = new URL(origin)
    return LOCAL_HOSTNAMES.has(hostname)
  } catch {
    return false
  }
}

export function requiresConfiguredEmailDelivery(fallbackOrigin?: string) {
  const baseUrl = getAppBaseUrl(fallbackOrigin)
  return process.env.NODE_ENV === 'production' || !isLocalAppOrigin(baseUrl)
}

export function buildAppUrl(pathname: string, fallbackOrigin?: string) {
  return new URL(pathname, `${getAppBaseUrl(fallbackOrigin)}/`).toString()
}
