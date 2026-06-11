export type OnboardingAssistantStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type OnboardingAssistantPriority = 'P0' | 'P1' | 'P2'

export type OnboardingAssistantControl = {
  id: string
  label: string
  status: OnboardingAssistantStatus
  priority: OnboardingAssistantPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type OnboardingAssistantStep = {
  id: string
  label: string
  priority: OnboardingAssistantPriority
  goal: string
  safePrompt: string
  recommendedRoute: string
  safetyRule: string
}

export type UserOnboardingGuideInput = {
  preferredState?: string | null
  mainGoal?: string | null
  language?: string | null
  completedSteps?: unknown
} | null | undefined

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

function safeMode(name: string, fallback = 'guided') {
  return ['guided', 'manual_review', 'dry_run', 'rules_only', 'disabled'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: OnboardingAssistantStatus,
  priority: OnboardingAssistantPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): OnboardingAssistantControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const assistantSteps: OnboardingAssistantStep[] = [
  {
    id: 'goal-detection',
    label: 'Goal detection',
    priority: 'P0',
    goal: 'Understand whether the user needs complaint, refund, UPI help, scheme guidance or documents.',
    safePrompt: 'Ask for issue type, state and non-sensitive summary only.',
    recommendedRoute: '/dashboard/onboarding',
    safetyRule: 'Do not ask for OTPs, passwords, UPI PINs, CVV, full bank/card details or private IDs.'
  },
  {
    id: 'tool-routing',
    label: 'Tool routing',
    priority: 'P0',
    goal: 'Route the user to the safest first useful tool.',
    safePrompt: 'Offer complaint generator, UPI helper, documents checklist, scheme finder or status tracker based on selected goal.',
    recommendedRoute: '/tools',
    safetyRule: 'Show guidance-only disclaimer and official verification reminder before high-risk actions.'
  },
  {
    id: 'language-state-context',
    label: 'Language and state context',
    priority: 'P1',
    goal: 'Use selected language/state to make copy easier without overclaiming official accuracy.',
    safePrompt: 'Prefer simple language and ask user to verify state-specific official portals.',
    recommendedRoute: '/profile/settings',
    safetyRule: 'Keep important legal/payment/privacy terms consistent across translations.'
  },
  {
    id: 'first-success-path',
    label: 'First success path',
    priority: 'P1',
    goal: 'Help the user finish one meaningful action in the first session.',
    safePrompt: 'Suggest one small next step: create draft, save reminder, check documents or open official source.',
    recommendedRoute: '/dashboard',
    safetyRule: 'Never push payment, document upload or account linking before trust and safety messages are visible.'
  },
  {
    id: 'privacy-safe-education',
    label: 'Privacy-safe education',
    priority: 'P0',
    goal: 'Teach users what not to share before they use AI/chat/upload flows.',
    safePrompt: 'Warn about OTP, password, UPI PIN, CVV, full bank/card details and private documents.',
    recommendedRoute: '/privacy',
    safetyRule: 'Repeat sensitive-data warning anywhere the user can paste, speak or upload private content.'
  }
]

const controls: OnboardingAssistantControl[] = [
  control(
    'owner-assigned',
    'Onboarding owner assigned',
    configured('ONBOARDING_ASSISTANT_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `ONBOARDING_ASSISTANT_OWNER=${env('ONBOARDING_ASSISTANT_OWNER') || 'empty'}`,
    'A named product/support owner reviews first-run prompts, routing and onboarding outcomes.',
    'Owner saved in env/evidence pack and /admin/onboarding-assistant screenshot.',
    'New users may get confusing guidance without anyone owning the first-session experience.'
  ),
  control(
    'mode-safe',
    'Assistant mode is safe',
    safeMode('ONBOARDING_ASSISTANT_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `ONBOARDING_ASSISTANT_MODE=${env('ONBOARDING_ASSISTANT_MODE', 'guided')}`,
    'Mode is guided, manual_review, dry_run, rules_only or disabled.',
    'Readiness report showing a safe guided/onboarding mode.',
    'Unknown assistant mode can trigger unreviewed prompts or unsafe automation.'
  ),
  control(
    'p0-route-review',
    'P0 routes reviewed',
    enabled('ONBOARDING_P0_ROUTES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ONBOARDING_P0_ROUTES_REVIEWED=${env('ONBOARDING_P0_ROUTES_REVIEWED', 'false')}`,
    'Dashboard onboarding, complaint, UPI help, documents, schemes and privacy routes are tested on mobile and desktop.',
    'Screenshots for P0 first-run routes plus completed checklist evidence.',
    'Users may get routed to broken or confusing first actions.'
  ),
  control(
    'sensitive-data-warning',
    'Sensitive-data warning reviewed',
    enabled('ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED=${env('ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED', 'false')}`,
    'Onboarding clearly warns users not to share OTPs, passwords, UPI PINs, CVV, full bank/card data or private IDs.',
    'Onboarding page screenshot and warning copy review evidence.',
    'New users can paste/speak/upload secrets into AI or support flows.'
  ),
  control(
    'language-routing-review',
    'Language and state routing reviewed',
    enabled('ONBOARDING_LANGUAGE_ROUTING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `ONBOARDING_LANGUAGE_ROUTING_REVIEWED=${env('ONBOARDING_LANGUAGE_ROUTING_REVIEWED', 'false')}`,
    'Language/state choices produce clear next steps without claiming official translation or eligibility guarantees.',
    'Hindi/English plus one regional-language screenshot and official-source reminder evidence.',
    'Localized onboarding can overpromise accuracy or send users to irrelevant routes.'
  ),
  control(
    'first-action-analytics-review',
    'First-action analytics reviewed',
    enabled('ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P2',
    `ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED=${env('ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED', 'false')}`,
    'Only privacy-safe aggregate onboarding events are measured after consent and never include complaint/document text.',
    'Analytics event allowlist and redaction proof for onboarding events.',
    'Growth tracking can leak sensitive user intent or complaint details.'
  )
]

export function getRecommendedFirstRunGuide(input: UserOnboardingGuideInput) {
  const completedSteps = Array.isArray(input?.completedSteps) ? input.completedSteps as string[] : []
  const goal = String(input?.mainGoal || 'COMPLAINT').toUpperCase()
  const language = input?.language || 'ENGLISH'
  const state = input?.preferredState || 'your state'

  const routeMap: Record<string, { label: string; href: string; reason: string }> = {
    COMPLAINT: { label: 'Create complaint draft', href: '/complaint', reason: 'Best first action for refund, service issue or written complaint.' },
    REFUND: { label: 'Create refund complaint', href: '/complaint', reason: 'Start with a clean refund timeline and proof checklist.' },
    UPI_HELP: { label: 'Open UPI urgent help', href: '/upi-help', reason: 'Use urgent safety steps before sharing any sensitive payment details.' },
    SCHEME: { label: 'Find schemes', href: '/scheme-finder', reason: `Use ${state} and your goal to discover possible official schemes.` },
    DOCUMENTS: { label: 'Open document checklist', href: '/documents', reason: 'Prepare required documents before form filling or uploads.' },
    OTHER: { label: 'Explore tools', href: '/tools', reason: 'Pick the closest safe helper from the tool directory.' }
  }

  const next = routeMap[goal] || routeMap.COMPLAINT
  const progress = Math.min(100, Math.round((completedSteps.length / 5) * 100))

  return {
    goal,
    language,
    preferredState: state,
    progress,
    next,
    safetyReminder: 'Never share OTP, password, UPI PIN, CVV, full bank/card details or private IDs inside AI, chat, voice or upload fields.',
    checklist: [
      { id: 'profile', label: 'Confirm state, goal and language', done: completedSteps.includes('PROFILE') },
      { id: 'first-tool', label: 'Try one useful tool', done: completedSteps.includes('FIRST_COMPLAINT') },
      { id: 'reminder', label: 'Save one follow-up reminder', done: completedSteps.includes('FIRST_REMINDER') },
      { id: 'documents', label: 'Check required documents', done: completedSteps.includes('DOCUMENTS') },
      { id: 'official-source', label: 'Verify final action on official source', done: completedSteps.includes('SCHEME_SEARCH') }
    ]
  }
}

export function getOnboardingAssistantReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.54-onboarding-assistant-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      guidedSteps: assistantSteps.length
    },
    controls,
    assistantSteps,
    nextAction: blocked
      ? 'Fix blocked onboarding assistant mode before exposing guided onboarding.'
      : manualRequired
        ? 'Complete P0 first-run route and sensitive-data warning review before public onboarding promotion.'
        : 'Onboarding assistant is ready for guarded production rollout.',
    firstRunChecklist: [
      'User can choose goal, language and state without friction on mobile.',
      'Next action routes to one useful tool instead of overwhelming the user.',
      'Sensitive-data warning is visible before AI, chat, voice and upload flows.',
      'Guidance-only disclaimer and official verification reminder are visible for high-risk topics.',
      'Analytics uses only consent-aware aggregate events and no raw complaint/document text.'
    ],
    unsafePromptRules: [
      'Do not ask users to enter OTP, password, UPI PIN, CVV or full card/bank details.',
      'Do not claim government approval, legal certainty or guaranteed refund/scheme success.',
      'Do not route users to upload private documents until vault safety and privacy notices are visible.',
      'Do not personalize with sensitive data unless the user intentionally saved it in profile/onboarding.'
    ]
  }
}
