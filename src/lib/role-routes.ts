export type AppRole = 'HOMEOWNER' | 'PRO' | 'REALTOR' | 'ADMIN'

const roleBaseMap: Record<AppRole, string> = {
  HOMEOWNER: '/homeowner',
  PRO: '/pro',
  REALTOR: '/realtor',
  ADMIN: '/homeowner',
}

export function roleBase(role?: AppRole) {
  if (!role) return '/login'
  return roleBaseMap[role] ?? '/login'
}

export function roleHome(role?: AppRole) {
  const base = roleBase(role)
  if (base === '/login') return base
  return `${base}/dashboard`
}

export function roleSection(role: AppRole | undefined, section: string) {
  const base = roleBase(role)
  if (base === '/login') return base
  return `${base}/${section}`
}
