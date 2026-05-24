import { NextRequest, NextResponse } from 'next/server'
import { searchEverything } from '@/lib/search'
import { rateLimit } from '@/lib/rate-limit'
export async function GET(req: NextRequest){ const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local'; if(!rateLimit(`search:${ip}`,60,60_000).ok)return NextResponse.json({ok:false,error:'Too many searches'},{status:429}); const q=req.nextUrl.searchParams.get('q')||''; const results=await searchEverything(q,20); return NextResponse.json({ok:true,q,results}) }
