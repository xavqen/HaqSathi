# Production Environment Matrix

Paste these in Vercel Project Settings → Environment Variables.

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `AUTH_SECRET` | Yes | Cookie/session signing secret |
| `DATABASE_URL` | Yes | Supabase transaction pooler URL, port `6543` |
| `DIRECT_URL` | Yes | Supabase direct/session URL, port `5432` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side private storage/admin access |
| `SUPABASE_STORAGE_BUCKET` | Yes | Usually `documents` |
| `OPENAI_API_KEY` or `GEMINI_API_KEY` | Optional but recommended | AI generation |
| `RESEND_API_KEY` | Required for email | Forgot password/reminders/support emails |
| `RAZORPAY_KEY_ID` | Required for payments | Server payment order creation |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Required for payments | Client checkout key |
| `RAZORPAY_KEY_SECRET` | Required for payments | Signature verification |
| `RAZORPAY_WEBHOOK_SECRET` | Recommended | Webhook verification |

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `RAZORPAY_KEY_SECRET`, or `AUTH_SECRET` in frontend code.
