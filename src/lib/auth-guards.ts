import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { type AppRole, roleHome } from '@/lib/role-routes'

export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }
  return session.user
}

export async function requireRole(role: AppRole) {
  const user = await requireUser()
  if (user.role !== role) {
    redirect(roleHome(user.role as AppRole))
  }
  return user
}
