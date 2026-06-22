import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'HOMEOWNER') {
    return NextResponse.json({ error: 'Only homeowners can add a payment method.' }, { status: 403 })
  }

  void request

  return NextResponse.json(
    {
      error:
        'Homeowner card setup is temporarily unavailable while we finish a billing upgrade.',
    },
    { status: 503 },
  )
}
