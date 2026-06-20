import MessagesClient from '@/components/messaging/MessagesClient'
import { requireRole } from '@/lib/auth-guards'
import { getMessagingPageData } from '@/lib/messaging'

export const metadata = { title: 'Messages' }

export default async function RealtorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string; to?: string }>
}) {
  const user = await requireRole('REALTOR')
  const sp = await searchParams
  const messagingData = await getMessagingPageData(user.id, sp.partnerId ?? sp.to)

  return (
    <MessagesClient
      currentUserId={user.id}
      currentUserRole="REALTOR"
      accentColor="gold"
      initialConversations={messagingData.conversations}
      initialSelectedPartnerId={messagingData.selectedPartnerId}
      initialMessages={messagingData.messages}
    />
  )
}
