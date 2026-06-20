export function sanitizeStringArray(values: string[] | undefined) {
  return (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
}

type ProCompletionInput = {
  firstName?: string | null
  lastName?: string | null
  businessName?: string | null
  bio?: string | null
  services?: string[]
  serviceArea?: string[]
  yearsExp?: number | null
  licenseNumber?: string | null
  licensed?: boolean | null
  insured?: boolean | null
}

export function calculateProProfileCompletion(profile: ProCompletionInput) {
  const checks = [
    Boolean(profile.firstName?.trim() && profile.lastName?.trim()),
    Boolean(profile.businessName?.trim()),
    Boolean(profile.bio?.trim()),
    sanitizeStringArray(profile.services).length > 0,
    sanitizeStringArray(profile.serviceArea).length > 0,
    Boolean((profile.yearsExp ?? 0) > 0),
    Boolean(profile.licensed && profile.licenseNumber?.trim()),
    Boolean(profile.insured),
  ]

  const completedChecks = checks.filter(Boolean).length

  return Math.round((completedChecks / checks.length) * 100)
}
