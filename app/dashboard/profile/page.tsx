import { requireUser } from '@/lib/auth/session'
import { ProfileForm, GoogleAccountCard } from '@/components/forms/profile-form'
import { LogoutButton } from '@/components/forms/auth-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { planDisplayName } from '@/lib/billing/plan-labels'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  return (
    <div>
      <h1 className="text-3xl font-black">Profile settings</h1>
      <p className="mt-2 text-slate-600">Name, login method, plan aur account actions yahan manage karo.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Edit Account</CardTitle></CardHeader>
          <CardContent><ProfileForm name={user.name || ''} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><b>Email:</b> {user.email}</p>
            <p><b>Role:</b> {user.role}</p>
            <p><b>Plan:</b> {planDisplayName(user.plan)}</p>
            <p><b>Login:</b> {user.authProvider?.includes('google') ? 'Email + Google' : 'Email password'}</p>
            <p><b>Email verified:</b> {user.emailVerifiedAt ? 'Yes' : 'Not verified here'}</p>
            <p><b>Joined:</b> {user.createdAt.toDateString()}</p>
          </CardContent>
        </Card>
        <GoogleAccountCard connected={Boolean(user.authProvider?.includes('google'))} />
        <Card>
          <CardHeader><CardTitle>Sign out</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">Logout button navbar se hata diya gaya hai. Ab account logout sirf profile settings me hai.</p>
            <LogoutButton label="Logout from this device" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
