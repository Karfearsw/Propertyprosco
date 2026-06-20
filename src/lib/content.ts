export const blogPosts = [
  {
    slug: 'how-to-hire-a-contractor',
    title: 'The Complete Guide to Hiring a Contractor',
    cat: 'Homeowner Tips',
    date: 'Jan 15, 2025',
    icon: 'Roofing',
    readTime: '8 min',
    summary: 'A practical guide for comparing pros, checking trust signals, and hiring with confidence.',
    body: [
      'Start by defining scope, timing, and budget before you reach out to contractors. Clear project details produce faster, more accurate quotes.',
      'Prioritize verified licensing, insurance, written estimates, and recent customer feedback. These signals matter more than generic promises.',
      'Use messaging and quote comparison workflows to keep every response organized, especially if you are evaluating multiple local pros at once.',
    ],
  },
  {
    slug: 'roofing-cost-guide',
    title: 'How Much Does Roof Replacement Really Cost?',
    cat: 'Cost Guides',
    date: 'Jan 10, 2025',
    icon: 'Roofing',
    readTime: '6 min',
    summary: 'What actually drives roofing price ranges in Rhode Island and similar Northeast markets.',
    body: [
      'Roofing costs vary based on material, tear-off requirements, access, decking condition, and disposal.',
      'The fastest way to compare true value is to request line-item scope, warranty coverage, and timing assumptions in every quote.',
      'Local conditions like weather, roof pitch, and permit needs can shift pricing more than homeowners expect.',
    ],
  },
  {
    slug: 'pro-tips-win-more-leads',
    title: '5 Ways Pros Win More Jobs on Property Pros',
    cat: 'Pro Tips',
    date: 'Jan 5, 2025',
    icon: 'Remodeling',
    readTime: '5 min',
    summary: 'Simple habits that help contractors convert more leads into booked work.',
    body: [
      'Respond quickly, personalize every quote, and make your profile complete enough to build trust on first view.',
      'Keep service areas and specialties current so the right leads match to your business more often.',
      'Strong communication and clear scheduling are still the best differentiators once the lead arrives.',
    ],
  },
  {
    slug: 'realtor-contractor-management',
    title: 'How Smart Realtors Manage Their Contractors',
    cat: 'Realtors',
    date: 'Dec 28, 2024',
    icon: 'Electrical',
    readTime: '7 min',
    summary: 'A coordination playbook for inspection repairs, listings, and closing timelines.',
    body: [
      'The most effective realtor workflows rely on repeatable contractor coordination, shared deadlines, and organized client communication.',
      'Fast quote turnaround matters most when inspection items threaten closing momentum.',
      'A role-aware platform helps realtors keep client, project, and contractor details aligned in one place.',
    ],
  },
  {
    slug: 'winter-home-maintenance',
    title: 'Winter Home Maintenance Checklist',
    cat: 'Homeowner Tips',
    date: 'Dec 20, 2024',
    icon: 'HVAC',
    readTime: '5 min',
    summary: 'Seasonal maintenance tasks that help protect homes before cold-weather damage starts.',
    body: [
      'Inspect roofing, gutters, insulation, heating systems, and exterior drainage before the harshest weather arrives.',
      'Small pre-winter fixes can prevent much larger emergency repair bills.',
      'Property Pros can be used to source specialists by service category and local area when needs change quickly.',
    ],
  },
  {
    slug: 'questions-ask-before-hiring',
    title: '10 Questions to Ask Before Hiring Any Pro',
    cat: 'Homeowner Tips',
    date: 'Dec 15, 2024',
    icon: 'Plumbing',
    readTime: '6 min',
    summary: 'The questions that uncover whether a contractor is actually a strong fit for your job.',
    body: [
      'Ask about licensing, insurance, scope assumptions, scheduling, communication cadence, and change-order handling.',
      'Compare how each pro explains the work, not just the headline price.',
      'Good hiring decisions come from transparency and consistency, not rushed sales pressure.',
    ],
  },
] as const

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
