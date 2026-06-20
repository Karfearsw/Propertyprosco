'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatRelative, getInitials } from '@/lib/utils'
import { LoaderCircle, Search, Send } from 'lucide-react'
import EmptyState from '@/components/brand/EmptyState'

type AppRole = 'HOMEOWNER' | 'PRO' | 'REALTOR' | 'ADMIN'
type FilterKey = 'all' | 'unread' | 'role'

interface ConversationSummary {
  partnerId: string
  name: string | null
  image: string | null
  role: AppRole
  lastMessage: string
  lastAt: string
  unread: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
  sender: {
    id: string
    name: string | null
    image: string | null
    role: AppRole
  }
}

const accentMap: Record<string, string> = {
  red:  'bg-pp-red',
  green: 'bg-pp-green',
  gold: 'bg-pp-gold',
}

const accentSoftMap: Record<string, string> = {
  red: 'bg-red-50 text-pp-red border-red-100',
  green: 'bg-green-50 text-pp-green border-green-100',
  gold: 'bg-amber-50 text-pp-gold border-amber-100',
}

const roleLabelMap: Record<AppRole, string> = {
  HOMEOWNER: 'Homeowner',
  PRO: 'Pro',
  REALTOR: 'Realtor',
  ADMIN: 'Admin',
}

function roleFilterLabel(role: AppRole) {
  if (role === 'PRO') return 'Homeowners'
  if (role === 'HOMEOWNER') return 'Pros'
  if (role === 'REALTOR') return 'Pros'
  return 'Role'
}

function roleFilterTarget(role: AppRole): AppRole | null {
  if (role === 'PRO') return 'HOMEOWNER'
  if (role === 'HOMEOWNER') return 'PRO'
  if (role === 'REALTOR') return 'PRO'
  return null
}

function lastMessageLabel(conversation: ConversationSummary) {
  if (!conversation.lastMessage) return 'No messages yet'
  return conversation.lastMessage
}

export default function MessagesClient({
  currentUserId,
  currentUserRole,
  initialConversations,
  initialSelectedPartnerId,
  initialMessages,
  accentColor = 'red',
}: {
  currentUserId: string
  currentUserRole: AppRole
  initialConversations: ConversationSummary[]
  initialSelectedPartnerId: string | null
  initialMessages: Message[]
  accentColor?: string
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedPartnerId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sending, setSending] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const skipInitialThreadFetch = useRef(Boolean(initialSelectedPartnerId))
  const bottomRef = useRef<HTMLDivElement>(null)
  const accentBg = accentMap[accentColor] ?? 'bg-pp-red'
  const accentSoft = accentSoftMap[accentColor] ?? 'bg-red-50 text-pp-red border-red-100'
  const roleTarget = roleFilterTarget(currentUserRole)

  const refreshConversations = useCallback(async () => {
    const res = await fetch('/api/messages', { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error ?? 'Failed to load conversations')
    }
    setConversations(json.conversations ?? [])
  }, [])

  const loadMessages = useCallback(async (partnerId: string, silent = false) => {
    if (!silent) {
      setLoadingThread(true)
    }
    setError(null)
    const res = await fetch(`/api/messages?partnerId=${partnerId}`, { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok) {
      if (!silent) {
        setMessages([])
      }
      throw new Error(json.error ?? 'Failed to load messages')
    }
    setMessages(json.messages ?? [])
    setConversations((current) => {
      const existing = current.find((conversation) => conversation.partnerId === partnerId)
      if (existing || !json.partner) {
        return current.map((conversation) =>
          conversation.partnerId === partnerId ? { ...conversation, unread: 0 } : conversation,
        )
      }

      return [
        {
          partnerId,
          name: json.partner.name,
          image: json.partner.image,
          role: json.partner.role,
          lastMessage: '',
          lastAt: new Date(0).toISOString(),
          unread: 0,
        },
        ...current,
      ]
    })
    await refreshConversations()
    if (!silent) {
      setLoadingThread(false)
    }
  }, [refreshConversations])

  useEffect(() => {
    if (!selectedId) return
    if (skipInitialThreadFetch.current) {
      skipInitialThreadFetch.current = false
      return
    }

    void loadMessages(selectedId).catch((err: unknown) => {
      setLoadingThread(false)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    })
  }, [loadMessages, selectedId])

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshConversations().catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [refreshConversations])

  useEffect(() => {
    if (!selectedId) return
    const interval = setInterval(() => {
      void loadMessages(selectedId, true).catch(() => {})
    }, 8000)
    return () => clearInterval(interval)
  }, [loadMessages, selectedId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMsg() {
    if (!content.trim() || !selectedId || sending) return
    setSending(true)
    setError(null)

    try {
      const messageContent = content.trim()
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedId, content: messageContent }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to send message')
      }

      setMessages((current) => [...current, json])
      setContent('')
      await refreshConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesQuery =
        !query ||
        (conversation.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(query.toLowerCase()) ||
        roleLabelMap[conversation.role].toLowerCase().includes(query.toLowerCase())

      if (!matchesQuery) return false
      if (filter === 'unread') return conversation.unread > 0
      if (filter === 'role' && roleTarget) return conversation.role === roleTarget
      return true
    })
  }, [conversations, filter, query, roleTarget])

  const selectedConversation =
    conversations.find((conversation) => conversation.partnerId === selectedId) ?? null
  const unreadCount = conversations.reduce((count, conversation) => count + conversation.unread, 0)

  return (
    <div className="flex h-[calc(100vh-60px)] min-h-[640px]">
      <div className="flex w-80 shrink-0 flex-col border-r border-pp-border bg-white">
        <div className="border-b border-pp-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[18px] font-black text-pp-dark">Messages</h1>
              <p className="mt-1 text-[12px] font-semibold text-pp-gray">
                {unreadCount > 0 ? `${unreadCount} unread across active conversations` : 'Stay on top of replies and follow-ups'}
              </p>
            </div>
            <div className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${accentSoft}`}>
              {conversations.length}
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-xl border border-pp-border bg-pp-bg px-3 py-2.5">
            <Search className="size-4 text-pp-gray" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent text-[13px] font-semibold text-pp-dark outline-none placeholder:text-pp-gray"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                filter === 'all' ? 'border-pp-dark bg-pp-dark text-white' : 'border-pp-border text-pp-gray hover:border-pp-dark hover:text-pp-dark'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                filter === 'unread' ? 'border-pp-dark bg-pp-dark text-white' : 'border-pp-border text-pp-gray hover:border-pp-dark hover:text-pp-dark'
              }`}
            >
              Unread
            </button>
            {roleTarget && (
              <button
                onClick={() => setFilter('role')}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                  filter === 'role' ? 'border-pp-dark bg-pp-dark text-white' : 'border-pp-border text-pp-gray hover:border-pp-dark hover:text-pp-dark'
                }`}
              >
                {roleFilterLabel(currentUserRole)}
              </button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-4">
              <EmptyState
                title="No conversations yet"
                body="New messages appear here when a homeowner, pro, or realtor starts a conversation with you."
              />
            </div>
          )}

          {conversations.length > 0 && filteredConversations.length === 0 && (
            <div className="p-4">
              <EmptyState
                title="No matching conversations"
                body="Try a different search term or switch filters to view more threads."
              />
            </div>
          )}

          {filteredConversations.map((conversation) => (
            <button
              key={conversation.partnerId}
              onClick={() => setSelectedId(conversation.partnerId)}
              className={`w-full border-b border-gray-50 px-4 py-3.5 text-left transition hover:bg-pp-bg ${
                selectedId === conversation.partnerId ? 'bg-pp-bg' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentBg} text-[13px] font-black text-white`}>
                  {getInitials(conversation.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="truncate text-[13px] font-black text-pp-dark">
                      {conversation.name ?? 'User'}
                    </div>
                    <div className="shrink-0 text-[11px] font-bold text-pp-gray">
                      {conversation.lastMessage ? formatRelative(conversation.lastAt) : 'New'}
                    </div>
                  </div>
                  <div className={`mt-1 truncate text-[12px] ${conversation.unread > 0 ? 'font-black text-pp-dark' : 'font-semibold text-pp-gray'}`}>
                    {lastMessageLabel(conversation)}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="rounded-full border border-pp-border bg-pp-bg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-pp-gray">
                      {roleLabelMap[conversation.role]}
                    </div>
                    {conversation.unread > 0 && (
                      <div className={`min-w-6 rounded-full px-2 py-0.5 text-center text-[10px] font-black text-white ${accentBg}`}>
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selectedConversation ? (
          <>
            <div className="flex h-16 items-center justify-between gap-4 border-b border-pp-border bg-white px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${accentBg} text-[12px] font-black text-white`}>
                  {getInitials(selectedConversation.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-black text-pp-dark">
                    {selectedConversation.name ?? 'User'}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-pp-gray">
                    <span>{roleLabelMap[selectedConversation.role]}</span>
                    <span className="text-pp-border">•</span>
                    <span>{messages.length > 0 ? `${messages.length} messages in thread` : 'Ready for a first message'}</span>
                  </div>
                </div>
              </div>
              <div className={`hidden rounded-full border px-3 py-1 text-[11px] font-black md:block ${accentSoft}`}>
                {selectedConversation.unread > 0 ? `${selectedConversation.unread} unread` : 'Up to date'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-pp-bg p-4">
              {loadingThread && (
                <div className="mb-3 flex items-center justify-center gap-2 text-[12px] font-bold text-pp-gray">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading latest messages...
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
                  {error}
                </div>
              )}

              {messages.length === 0 && (
                <EmptyState
                  title="No messages in this thread"
                  body="Send a quick intro or follow-up to get the conversation started."
                />
              )}

              <div className="space-y-3">
                {messages.map((message) => {
                  const mine = message.senderId === currentUserId
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold leading-relaxed ${
                          mine
                            ? `${accentBg} rounded-br-sm text-white`
                            : 'rounded-bl-sm border border-pp-border bg-white text-pp-dark'
                        }`}
                      >
                        {message.content}
                        <div className={`mt-1 text-[10px] font-bold ${mine ? 'text-white/70' : 'text-pp-gray'}`}>
                          {formatRelative(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-pp-border bg-white p-3">
              <div className="mb-2 text-[11px] font-bold text-pp-gray">
                Notifications for this conversation route directly here and mark inbound items read when you open the thread.
              </div>
              <div className="flex gap-2">
                <input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && !event.shiftKey && sendMsg()}
                  placeholder={`Message ${selectedConversation.name ?? 'this contact'}...`}
                  className="flex-1 rounded-xl border border-pp-border px-3.5 py-2.5 text-[14px] outline-none focus:border-pp-red"
                />
                <button
                  onClick={sendMsg}
                  disabled={!content.trim() || sending}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-white disabled:opacity-40 ${accentBg}`}
                >
                  {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              title="Select a conversation"
              body="Choose a contact from the left to view the full thread, clear unread state, and reply in context."
            />
          </div>
        )}
      </div>
    </div>
  )
}
