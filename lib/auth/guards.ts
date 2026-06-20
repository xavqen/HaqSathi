// Compatibility guard exports for admin API routes.
// Keep auth checks centralized in session.ts so pages and route handlers use one policy.
export { getCurrentUser, requireAdmin, requireUser } from '@/lib/auth/session'
