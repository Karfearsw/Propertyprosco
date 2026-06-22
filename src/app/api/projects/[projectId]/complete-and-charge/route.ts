import { NextResponse } from 'next/server'
import { ProjectStatus, QuoteStatus } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<{
    projectId: string
  }>
}

export async function POST(_: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PRO') {
    return NextResponse.json({ error: 'Only pros can complete and charge a project.' }, { status: 403 })
  }

  try {
    const { projectId } = await context.params

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        quotes: {
          where: { status: QuoteStatus.ACCEPTED },
          select: { id: true, proId: true, amount: true },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    if (project.status !== ProjectStatus.IN_PROGRESS) {
      return NextResponse.json({ error: 'Only in-progress projects can be completed.' }, { status: 409 })
    }

    const accepted = project.quotes[0]
    if (!accepted) {
      return NextResponse.json({ error: 'No accepted quote found for this project.' }, { status: 409 })
    }

    if (accepted.proId !== session.user.id) {
      return NextResponse.json({ error: 'Only the hired pro can complete this project.' }, { status: 403 })
    }

    return NextResponse.json(
      {
        error:
          'Project completion billing is temporarily unavailable while we finish a billing upgrade. Please contact support before closing this project.',
      },
      { status: 503 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to complete and charge this project.' }, { status: 500 })
  }
}
