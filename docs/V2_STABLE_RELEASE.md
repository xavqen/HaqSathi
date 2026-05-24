# HaqSathi AI v2.0.0 Stable Release

This release moves the project from RC to stable launch package.

## Release status

- Version: `2.0.0`
- Mode: Feature freeze
- Framework: Next.js `16.2.6`
- Prisma: `6.19.3`
- Database: PostgreSQL / Supabase compatible
- Auth: custom cookie auth with DB users
- Storage: Supabase service-role storage integration
- Payments: Razorpay-ready checkout and verification flow
- Email: Resend-ready transactional structure

## Stable release rules

1. Do not add new features before first production launch.
2. Fix only build errors, runtime errors, env issues, mobile UI bugs, and payment/email/storage integration bugs.
3. Keep Prisma pinned to `6.19.3` unless doing a separate Prisma 7 migration branch.
4. Keep `proxy.ts`; do not re-add `middleware.ts`.
5. Run `npm run ship:prod` before deployment.

## Final command

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run ship:prod
npm run dev
```
