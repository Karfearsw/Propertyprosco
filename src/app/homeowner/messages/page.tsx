import MessagesClient from '@/components/messaging/MessagesClient'
import { requireRole } from '@/lib/auth-guards'
import { getMessagingPageData } from '@/lib/messaging'

export const metadata = { title: 'Messages' }

export default async function HomeownerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string; to?: string }>
}) {
  const user = await requireRole('HOMEOWNER')
  const sp = await searchParams
  const initialPartnerId = sp.partnerId ?? sp.to
  const messagingData = await getMessagingPageData(user.id, initialPartnerId)

  return (
    <MessagesClient
      currentUserId={user.id}
      currentUserRole="HOMEOWNER"
      accentColor="green"
      initialConversations={messagingData.conversations}
      initialSelectedPartnerId={messagingData.selectedPartnerId}
      initialMessages={messagingData.messages}
    />
  )
}
