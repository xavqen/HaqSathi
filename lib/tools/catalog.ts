export type ToolCategory = 'Most used' | 'Complaint' | 'Money & UPI' | 'Documents' | 'Safety' | 'Legal & escalation' | 'Productivity' | 'Agent'

export type PublicTool = {
  href: string
  title: string
  desc: string
  category: ToolCategory
  badge?: string
}

export const publicTools: PublicTool[] = [
  { href: '/complaint', title: 'AI Complaint Generator', desc: 'Formal complaint email, support chat message and follow-up draft.', category: 'Most used', badge: 'Core' },
  { href: '/upi-help', title: 'UPI Help', desc: 'Wrong transfer, failed payment and fraud first-response guide.', category: 'Most used', badge: 'Urgent' },
  { href: '/scheme-finder', title: 'Government Scheme Finder', desc: 'Possible schemes, eligibility hints, documents and apply steps.', category: 'Most used' },
  { href: '/documents', title: 'Document Checklist', desc: 'Income, caste, domicile, KYC, scholarship and admission checklist.', category: 'Most used' },
  { href: '/tools/smart-complaint-wizard', title: 'Smart Complaint Wizard', desc: 'Readiness score, missing proof, complaint draft and action plan.', category: 'Complaint', badge: 'Smart' },
  { href: '/tools/submission-pack', title: 'Submission Pack', desc: 'Email, WhatsApp, support chat, call script and escalation in one pack.', category: 'Complaint' },
  { href: '/tools/complaint-strength-checker', title: 'Complaint Strength Checker', desc: 'Check whether a complaint draft is weak or strong.', category: 'Complaint' },
  { href: '/tools/call-script-generator', title: 'Call Script Generator', desc: 'Professional script for customer care, bank or helpline calls.', category: 'Complaint' },
  { href: '/tools/status-message-builder', title: 'Status Message Builder', desc: 'Create short follow-up messages for pending issues.', category: 'Complaint' },
  { href: '/tools/refund-negotiation', title: 'Refund Negotiation Builder', desc: 'Refund recovery message ladder and escalation plan.', category: 'Money & UPI' },
  { href: '/tools/chargeback-helper', title: 'Chargeback Helper', desc: 'Bank dispute message, proof checklist and readiness score.', category: 'Money & UPI' },
  { href: '/tools/fee-refund-calculator', title: 'Fee Refund Calculator', desc: 'Estimate refund after fee deduction or partial payment.', category: 'Money & UPI' },
  { href: '/tools/bank-escalation', title: 'Bank Escalation Planner', desc: 'Plan bank complaint escalation with evidence and draft.', category: 'Money & UPI' },
  { href: '/tools/scam-radar', title: 'Scam Radar', desc: 'Paste suspicious SMS, WhatsApp or call text and check risk.', category: 'Safety', badge: 'Viral' },
  { href: '/tools/risk-assessment', title: 'Risk Assessment', desc: 'Understand urgency and safe next steps for risky issues.', category: 'Safety' },
  { href: '/tools/privacy-redactor', title: 'Privacy Redactor', desc: 'Hide phone, email, UPI, OTP and account details before sharing.', category: 'Safety' },
  { href: '/tools/public-post-safety', title: 'Public Post Safety', desc: 'Check tone, privacy and risky claims before posting publicly.', category: 'Safety' },
  { href: '/tools/ocr-autofill', title: 'OCR Autofill', desc: 'Extract complaint fields from screenshot, invoice, PDF or text.', category: 'Documents', badge: 'Autofill' },
  { href: '/tools/document-reader', title: 'AI Document Reader', desc: 'Detect amount, date, company and reference ID from text.', category: 'Documents' },
  { href: '/tools/document-gap-analyzer', title: 'Document Gap Analyzer', desc: 'Find missing documents before applying or filing.', category: 'Documents' },
  { href: '/tools/evidence-checklist', title: 'Evidence Checklist', desc: 'Get proof list based on issue type.', category: 'Documents' },
  { href: '/tools/evidence-timeline-builder', title: 'Evidence Timeline Builder', desc: 'Turn events and proof into a clear case timeline.', category: 'Documents' },
  { href: '/tools/proof-quality-scanner', title: 'Proof Quality Scanner', desc: 'Scan proof quality and identify weak evidence.', category: 'Documents' },
  { href: '/tools/legal-notice-draft', title: 'Legal Notice Style Draft', desc: 'Create a formal notice-style draft with disclaimer.', category: 'Legal & escalation' },
  { href: '/tools/rti-helper', title: 'RTI Application Helper', desc: 'Generate clear RTI questions and application draft.', category: 'Legal & escalation' },
  { href: '/tools/consumer-forum-pack', title: 'Consumer Forum Pack', desc: 'Prepare complaint summary and evidence index.', category: 'Legal & escalation' },
  { href: '/tools/ombudsman-planner', title: 'Ombudsman Planner', desc: 'Check readiness for official escalation.', category: 'Legal & escalation' },
  { href: '/tools/grievance-route-finder', title: 'Grievance Route Finder', desc: 'Find the right route for your issue.', category: 'Legal & escalation' },
  { href: '/tools/authority-router-pro', title: 'Authority Router Pro', desc: 'Choose correct company, bank, authority or grievance route.', category: 'Legal & escalation' },
  { href: '/tools/rights-explainer', title: 'Rights Explainer', desc: 'Understand basic user rights, what to ask, and what proof to keep.', category: 'Legal & escalation' },
  { href: '/tools/appeal-draft', title: 'Appeal Draft Helper', desc: 'Draft a polite appeal or escalation request.', category: 'Legal & escalation' },
  { href: '/tools/notice-reply-draft', title: 'Notice Reply Draft', desc: 'Create a safe reply to a notice or communication.', category: 'Legal & escalation' },
  { href: '/tools/case-coach', title: 'AI Case Coach', desc: 'Get case score, missing proof and next best action.', category: 'Productivity' },
  { href: '/tools/follow-up-automation', title: 'Auto Follow-up Planner', desc: 'Plan 3, 7 and 14 day follow-up messages.', category: 'Productivity' },
  { href: '/tools/deadline-calculator', title: 'Deadline Calculator', desc: 'Calculate follow-up and escalation dates.', category: 'Productivity' },
  { href: '/tools/application-tracker', title: 'Application Tracker', desc: 'Track scheme or document application manually.', category: 'Productivity' },
  { href: '/tools/language-draft-translator', title: 'Language Draft Translator', desc: 'Convert a draft into the selected language style.', category: 'Productivity' },
  { href: '/tools/mobile-readiness', title: 'Mobile Readiness Checker', desc: 'Check whether your workflow is mobile-friendly.', category: 'Productivity' },
  { href: '/tools/sla-planner', title: 'SLA Planner', desc: 'Plan service-level follow-ups, escalation dates and case health checkpoints.', category: 'Productivity' },
  { href: '/tools/service-center-locator', title: 'Service Center Route Planner', desc: 'Plan what to carry and what to ask at a service center.', category: 'Agent' },
  { href: '/tools/family-case-switchboard', title: 'Family Case Switchboard', desc: 'Organize multiple family cases in one view.', category: 'Agent' },
  { href: '/tools/agent-revenue-simulator', title: 'Agent Revenue Simulator', desc: 'Estimate local service agent pricing and monthly revenue.', category: 'Agent' }
]

export const toolCategories: ToolCategory[] = ['Most used', 'Complaint', 'Money & UPI', 'Documents', 'Safety', 'Legal & escalation', 'Productivity', 'Agent']
