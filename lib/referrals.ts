import { randomBytes } from 'crypto'

export function createReferralCode(prefix = 'HAQ') {
  return `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export function referralRewardText(plan: string) {
  if (plan === 'AGENT') return '1 extra client case export after successful referral'
  if (plan === 'FAMILY') return '7 days extra Family access after successful referral'
  if (plan === 'PRO') return '7 days extra Pro access after successful referral'
  return '1 bonus complaint draft after successful referral'
}
