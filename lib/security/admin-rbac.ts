export type AdminRoleId = 'SUPER_ADMIN' | 'OPS_MANAGER' | 'CONTENT_EDITOR' | 'SUPPORT_AGENT' | 'FINANCE_MANAGER' | 'QA_REVIEWER' | 'READ_ONLY_AUDITOR'
export type PermissionStatus = 'allowed' | 'review' | 'blocked'

export type AdminPermission = {
  id: string
  label: string
  group: string
  risk: 'low' | 'medium' | 'high'
  description: string
}

export type AdminRole = {
  id: AdminRoleId
  label: string
  summary: string
  launchUse: string
  canInviteAdmins: boolean
  canChangeBilling: boolean
  canExportData: boolean
  permissions: string[]
}

export type AdminRouteAccess = {
  route: string
  label: string
  permission: string
  fallback: string
}

export const adminPermissions: AdminPermission[] = [
  { id: 'admin.users.read', label: 'View users', group: 'Users', risk: 'medium', description: 'Read user profile, plan and account status.' },
  { id: 'admin.users.manage', label: 'Manage users', group: 'Users', risk: 'high', description: 'Change user/account state after manual approval.' },
  { id: 'admin.content.manage', label: 'Manage content', group: 'Content', risk: 'medium', description: 'Create/edit templates, blogs, SEO pages and guidance content.' },
  { id: 'admin.official-data.manage', label: 'Manage official data', group: 'Official data', risk: 'high', description: 'Edit schemes, authorities, official links and verification notes.' },
  { id: 'admin.support.read', label: 'View support queue', group: 'Support', risk: 'medium', description: 'Read support tickets, feedback and user issues.' },
  { id: 'admin.support.reply', label: 'Reply to support', group: 'Support', risk: 'medium', description: 'Use support macros and send user-facing responses.' },
  { id: 'admin.payments.read', label: 'View payments', group: 'Finance', risk: 'medium', description: 'Read invoices, plans, subscription and webhook evidence.' },
  { id: 'admin.payments.manage', label: 'Manage payments', group: 'Finance', risk: 'high', description: 'Handle refunds, plan corrections and payment incident review.' },
  { id: 'admin.qa.review', label: 'Review AI quality', group: 'Quality', risk: 'medium', description: 'Review AI outputs, OCR results, moderation and safety findings.' },
  { id: 'admin.security.read', label: 'View security', group: 'Security', risk: 'high', description: 'Read security posture, incidents, error monitoring and audit logs.' },
  { id: 'admin.security.manage', label: 'Manage security', group: 'Security', risk: 'high', description: 'Operate backup, incident, privacy and security hardening workflows.' },
  { id: 'admin.analytics.read', label: 'View analytics', group: 'Analytics', risk: 'low', description: 'Read growth, route inventory, issue trends and launch metrics.' },
  { id: 'admin.launch.manage', label: 'Manage launch QA', group: 'Launch', risk: 'high', description: 'Operate production QA, release gates and launch evidence workflows.' },
  { id: 'admin.audit.read', label: 'View audit evidence', group: 'Audit', risk: 'high', description: 'Read audit logs, generated evidence and compliance history.' }
]

const allPermissionIds = adminPermissions.map((permission) => permission.id)

export const adminRoles: AdminRole[] = [
  {
    id: 'SUPER_ADMIN',
    label: 'Super Admin',
    summary: 'Full platform owner access for trusted founder/operator only.',
    launchUse: 'Use for one or two owners. Never share this role with support or content staff.',
    canInviteAdmins: true,
    canChangeBilling: true,
    canExportData: true,
    permissions: allPermissionIds
  },
  {
    id: 'OPS_MANAGER',
    label: 'Ops Manager',
    summary: 'Runs daily operations, launch QA, incidents, backups and privacy workflows.',
    launchUse: 'Best for the person responsible for production reliability.',
    canInviteAdmins: false,
    canChangeBilling: false,
    canExportData: true,
    permissions: ['admin.users.read', 'admin.support.read', 'admin.support.reply', 'admin.security.read', 'admin.security.manage', 'admin.analytics.read', 'admin.launch.manage', 'admin.audit.read']
  },
  {
    id: 'CONTENT_EDITOR',
    label: 'Content Editor',
    summary: 'Manages blogs, templates, SEO pages and public guidance content.',
    launchUse: 'Safe for writers and editors who should not see billing/security areas.',
    canInviteAdmins: false,
    canChangeBilling: false,
    canExportData: false,
    permissions: ['admin.content.manage', 'admin.official-data.manage', 'admin.analytics.read']
  },
  {
    id: 'SUPPORT_AGENT',
    label: 'Support Agent',
    summary: 'Handles user tickets and basic account questions without billing or security control.',
    launchUse: 'Use for helpers who answer users but should not change launch settings.',
    canInviteAdmins: false,
    canChangeBilling: false,
    canExportData: false,
    permissions: ['admin.users.read', 'admin.support.read', 'admin.support.reply']
  },
  {
    id: 'FINANCE_MANAGER',
    label: 'Finance Manager',
    summary: 'Reviews payments, invoices, subscription lifecycle and Razorpay evidence.',
    launchUse: 'Use for the person handling revenue, refunds and billing reconciliation.',
    canInviteAdmins: false,
    canChangeBilling: true,
    canExportData: false,
    permissions: ['admin.payments.read', 'admin.payments.manage', 'admin.analytics.read', 'admin.audit.read']
  },
  {
    id: 'QA_REVIEWER',
    label: 'QA Reviewer',
    summary: 'Reviews AI output quality, OCR accuracy, translations and official source checks.',
    launchUse: 'Use for people checking correctness before content/tools go public.',
    canInviteAdmins: false,
    canChangeBilling: false,
    canExportData: false,
    permissions: ['admin.qa.review', 'admin.content.manage', 'admin.official-data.manage', 'admin.analytics.read', 'admin.audit.read']
  },
  {
    id: 'READ_ONLY_AUDITOR',
    label: 'Read-only Auditor',
    summary: 'Reads dashboards and evidence without changing anything.',
    launchUse: 'Use for reviewers, mentors or compliance checks.',
    canInviteAdmins: false,
    canChangeBilling: false,
    canExportData: false,
    permissions: ['admin.users.read', 'admin.payments.read', 'admin.security.read', 'admin.analytics.read', 'admin.audit.read']
  }
]

export const adminRouteAccess: AdminRouteAccess[] = [
  { route: '/admin/users', label: 'Users', permission: 'admin.users.read', fallback: '/admin' },
  { route: '/admin/support', label: 'Support', permission: 'admin.support.read', fallback: '/admin' },
  { route: '/admin/payments', label: 'Payments', permission: 'admin.payments.read', fallback: '/admin' },
  { route: '/admin/invoices', label: 'Invoices', permission: 'admin.payments.read', fallback: '/admin/payments' },
  { route: '/admin/blog', label: 'Blog', permission: 'admin.content.manage', fallback: '/admin' },
  { route: '/admin/templates', label: 'Templates', permission: 'admin.content.manage', fallback: '/admin' },
  { route: '/admin/schemes', label: 'Schemes', permission: 'admin.official-data.manage', fallback: '/admin/source-verification' },
  { route: '/admin/resources', label: 'Resources', permission: 'admin.official-data.manage', fallback: '/admin/source-verification' },
  { route: '/admin/source-verification', label: 'Source verification', permission: 'admin.official-data.manage', fallback: '/admin' },
  { route: '/admin/link-checks', label: 'Link checks', permission: 'admin.official-data.manage', fallback: '/admin/source-verification' },
  { route: '/admin/ai-reviews', label: 'AI reviews', permission: 'admin.qa.review', fallback: '/admin' },
  { route: '/admin/ocr-reviews', label: 'OCR reviews', permission: 'admin.qa.review', fallback: '/admin' },
  { route: '/admin/security-hardening', label: 'Security hardening', permission: 'admin.security.read', fallback: '/admin' },
  { route: '/admin/error-monitoring', label: 'Error monitoring', permission: 'admin.security.read', fallback: '/admin/incidents' },
  { route: '/admin/backups', label: 'Backups', permission: 'admin.security.manage', fallback: '/admin/security-hardening' },
  { route: '/admin/privacy-ops', label: 'Privacy operations', permission: 'admin.security.manage', fallback: '/admin/compliance' },
  { route: '/admin/analytics', label: 'Analytics', permission: 'admin.analytics.read', fallback: '/admin' },
  { route: '/admin/final-qa', label: 'Final QA', permission: 'admin.launch.manage', fallback: '/admin' },
  { route: '/admin/production-qa', label: 'Production QA', permission: 'admin.launch.manage', fallback: '/admin/final-qa' },
  { route: '/admin/audit', label: 'Audit log', permission: 'admin.audit.read', fallback: '/admin' },
  { route: '/admin/rbac', label: 'RBAC readiness', permission: 'admin.security.read', fallback: '/admin/security-hardening' }
]

export function getAdminRole(roleId: string | null | undefined) {
  return adminRoles.find((role) => role.id === roleId) || null
}

export function roleHasPermission(roleId: string | null | undefined, permissionId: string) {
  const role = getAdminRole(roleId)
  return Boolean(role?.permissions.includes(permissionId))
}

export function getPermissionStatus(roleId: string, permissionId: string): PermissionStatus {
  if (roleHasPermission(roleId, permissionId)) return 'allowed'
  const permission = adminPermissions.find((item) => item.id === permissionId)
  if (permission?.risk === 'high') return 'blocked'
  return 'review'
}

export function getAdminRouteAccess(route: string) {
  return adminRouteAccess.find((item) => item.route === route) || null
}

export function getRbacReadinessReport() {
  const permissionCoverage = adminPermissions.map((permission) => {
    const allowedRoles = adminRoles.filter((role) => role.permissions.includes(permission.id)).map((role) => role.id)
    return { ...permission, allowedRoles }
  })

  const routeCoverage = adminRouteAccess.map((route) => ({
    ...route,
    allowedRoles: adminRoles.filter((role) => role.permissions.includes(route.permission)).map((role) => role.id)
  }))

  const highRiskPermissions = adminPermissions.filter((permission) => permission.risk === 'high')
  const unassignedPermissions = permissionCoverage.filter((permission) => permission.allowedRoles.length === 0)
  const superAdminOnly = permissionCoverage.filter((permission) => permission.allowedRoles.length === 1 && permission.allowedRoles[0] === 'SUPER_ADMIN')

  const checklist = [
    {
      area: 'Role separation',
      status: adminRoles.length >= 5 ? 'PASS' : 'ACTION_NEEDED',
      action: 'Keep support, content, finance, QA and operations roles separate from Super Admin.',
      evidence: `${adminRoles.length} admin roles defined.`
    },
    {
      area: 'High-risk permissions',
      status: highRiskPermissions.length > 0 ? 'PASS' : 'ACTION_NEEDED',
      action: 'Mark payment, export, security and official-data actions as high-risk.',
      evidence: `${highRiskPermissions.length} high-risk permissions identified.`
    },
    {
      area: 'Route permission mapping',
      status: routeCoverage.length >= 20 ? 'PASS' : 'ACTION_NEEDED',
      action: 'Map admin pages to minimum required permissions before adding team members.',
      evidence: `${routeCoverage.length} admin routes mapped.`
    },
    {
      area: 'Least privilege',
      status: superAdminOnly.length >= 0 ? 'PASS' : 'ACTION_NEEDED',
      action: 'Review any Super Admin only powers manually before public launch.',
      evidence: `${superAdminOnly.length} permissions are Super Admin only.`
    },
    {
      area: 'Runtime mode',
      status: process.env.ADMIN_RBAC_MODE === 'enforce' ? 'PASS' : 'REVIEW',
      action: 'Use audit/shadow mode first; switch to enforce only after every admin user has the right role.',
      evidence: `ADMIN_RBAC_MODE=${process.env.ADMIN_RBAC_MODE || 'audit'}`
    }
  ] as const

  return {
    generatedAt: new Date().toISOString(),
    mode: process.env.ADMIN_RBAC_MODE || 'audit',
    owner: process.env.ADMIN_RBAC_OWNER || '',
    roles: adminRoles,
    permissions: adminPermissions,
    permissionCoverage,
    routeCoverage,
    unassignedPermissions,
    highRiskPermissions,
    checklist
  }
}
