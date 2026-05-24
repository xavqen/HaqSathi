import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { rateLimit } from '@/lib/rate-limit'
export async function POST(req: NextRequest){ const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local'; if(!rateLimit(`client-error:${ip}`,20,60_000).ok)return NextResponse.json({ok:false},{status:429}); if(process.env.CLIENT_ERROR_LOG_DRY_RUN==='true')return NextResponse.json({ok:true,dryRun:true}); const user=await getCurrentUser(); const body=await req.json().catch(()=>({})); await db.userActivity.create({data:{userId:user?.id||null,action:'CLIENT_ERROR',entity:'Browser',metadata:{message:String(body.message||'').slice(0,500),path:String(body.path||'').slice(0,300)}}}).catch(()=>undefined); return NextResponse.json({ok:true}) }
