'use client'

import { useState } from 'react'
import { Copy, Mail, MessageSquare, Share2 } from 'lucide-react'

interface ReferralShareCardProps {
  code: string
  shareUrl: string
  emailHref: string
  smsHref: string
}

export default function ReferralShareCard({ code, shareUrl, emailHref, smsHref }: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false)

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="bg-white border border-pp-border rounded-2xl p-6 mb-4">
      <h2 className="text-[15px] font-black text-pp-dark mb-2">Your referral link</h2>
      <p className="text-[13px] font-bold text-pp-gray mb-5">
        Share this code or link with other realtors. Tracking begins automatically when someone signs up through it.
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-pp-border bg-pp-bg p-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[1px] text-pp-gray">Referral code</div>
            <div className="text-[18px] font-black tracking-[0.2em] text-pp-dark">{code}</div>
          </div>
          <button
            type="button"
            onClick={() => copyValue(code)}
            className="flex items-center gap-1.5 rounded-lg bg-pp-dark px-3 py-2 text-[12px] font-black text-white hover:bg-pp-dark-2 transition-all"
          >
            <Copy size={13} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-pp-border bg-pp-bg p-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-black uppercase tracking-[1px] text-pp-gray">Share URL</div>
            <div className="truncate text-[13px] font-bold text-pp-dark">{shareUrl}</div>
          </div>
          <button
            type="button"
            onClick={() => copyValue(shareUrl)}
            className="flex items-center gap-1.5 rounded-lg border border-pp-border px-3 py-2 text-[12px] font-black text-pp-dark hover:border-pp-gold hover:text-pp-gold transition-all"
          >
            <Share2 size={13} />
            Copy Link
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={emailHref} className="inline-flex items-center gap-1.5 rounded-xl bg-pp-gold px-4 py-2.5 text-[13px] font-black text-white hover:bg-amber-800 transition-all">
          <Mail size={14} />
          Email Invite
        </a>
        <a href={smsHref} className="inline-flex items-center gap-1.5 rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-gold hover:text-pp-gold transition-all">
          <MessageSquare size={14} />
          Text Invite
        </a>
      </div>
    </div>
  )
}
