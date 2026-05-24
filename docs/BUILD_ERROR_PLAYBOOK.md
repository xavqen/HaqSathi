# Build Error Playbook

Use this only after Phase 20. Do not add new features until the build is clean.

## 1. Clean Next proxy conflict

```powershell
npm run clean:next-conflict
```

If the app says both `middleware.ts` and `proxy.ts` exist, delete `middleware.ts` and `.next`.

## 2. Verify installed versions

```powershell
npm run prisma:version
```

Expected:

```text
prisma         6.19.3
@prisma/client 6.19.3
```

Do not upgrade Prisma to 7 until the schema and client adapter are migrated.

## 3. Check database

```powershell
npm run db:doctor
npm run db:push
npm run db:seed
```

If `P1000` appears, reset Supabase database password and paste fresh `DATABASE_URL` and `DIRECT_URL`.

## 4. Build

```powershell
npm run release:final-check
npm run build
```

If build fails, copy only the first real error block and fix that first.

## 5. Production env gates

Required for launch:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `RESEND_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
