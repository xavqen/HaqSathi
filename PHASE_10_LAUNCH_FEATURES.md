# HaqSathi AI Phase 10 - Launch Features

## Added in v1.1.0

### 1. Real document vault upload
- Private Supabase Storage upload endpoint: `/api/document-vault/upload`
- Signed 5-minute download URL endpoint: `/api/document-vault/download`
- File validation: PDF/JPG/PNG/WEBP, max 5MB
- Dashboard UI: `/dashboard/document-vault`

Required env:

```env
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="documents"
```

Supabase bucket setup:
1. Supabase Dashboard -> Storage -> New bucket
2. Name: `documents`
3. Keep bucket private
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code

### 2. Real password reset flow
- Forgot password request: `/forgot-password`
- Reset page: `/reset-password?token=...`
- Token hashing + expiry in database
- Resend email support
- Local dev mode returns reset link when `RESEND_API_KEY` is empty

Run DB sync after update:

```powershell
npm run db:generate
npm run db:push
```

### 3. Live Razorpay checkout
- Creates real Razorpay orders when keys are configured
- Opens Razorpay Checkout on pricing/billing pages
- Verifies payment signature through `/api/billing/verify`
- Updates user plan after successful payment

Required env:

```env
RAZORPAY_KEY_ID="rzp_test_xxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="xxx"
RAZORPAY_WEBHOOK_SECRET="xxx"
```

### 4. Next.js 16 conflict cleanup
If your project still has `middleware.ts`, run:

```powershell
npm run clean:next-conflict
npm run dev
```

Next.js 16 uses `proxy.ts`; `middleware.ts` + `proxy.ts` cannot both exist.
