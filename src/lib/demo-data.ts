export const demoCredentials = [
  {
    role: 'Homeowner',
    email: 'demo.homeowner@propertyprosco.com',
    password: 'DemoHomeowner123!',
    href: '/login',
  },
  {
    role: 'Pro',
    email: 'demo.pro@propertyprosco.com',
    password: 'DemoPro123!',
    href: '/login',
  },
  {
    role: 'Realtor',
    email: 'demo.realtor@propertyprosco.com',
    password: 'DemoRealtor123!',
    href: '/login',
  },
]

export const demoHighlights = {
  homeowner: {
    name: 'Maria Santos',
    statLine: '2 active projects · 1 saved pro · 1 unread message',
    cards: [
      { title: 'Roof replacement', meta: 'Providence, RI', status: '3 quotes received' },
      { title: 'Kitchen repaint', meta: 'Cranston, RI', status: 'In progress' },
    ],
  },
  pro: {
    name: 'Kevin Harris',
    statLine: '2 leads this week · $11,650 quoted · 4.9 rating',
    cards: [
      { title: 'Roofing lead', meta: 'Providence, RI', status: '$8,000-$12,000 budget' },
      { title: 'Electrical repair', meta: 'Warwick, RI', status: 'Quote accepted' },
    ],
  },
  realtor: {
    name: 'Amy Lee',
    statLine: '2 active clients · 1 project in flight · billing active',
    cards: [
      { title: 'Elmwood listing repairs', meta: 'Providence, RI', status: 'Electrical quote accepted' },
      { title: 'Client coordination', meta: 'Warwick, RI', status: 'Inspection follow-up' },
    ],
  },
}
