import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getLaunchChecks } from '@/lib/launch/checks'
export async function GET(){ await requireAdmin(); const checks=await getLaunchChecks(); return NextResponse.json({ok:true,checks,passed:checks.filter((c)=>c.ok).length,total:checks.length}) }
