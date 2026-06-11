import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'HaqSathi AI',
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'local',
    environment: process.env.APP_ENV || process.env.NODE_ENV || 'local',
    monitoring: {
      clientErrorLogging: process.env.CLIENT_ERROR_LOG_DRY_RUN === 'true' ? 'dry-run' : 'active',
      errorMonitoring: process.env.ERROR_MONITORING_ENABLED === 'false' ? 'disabled' : 'enabled',
      autoIncidents: process.env.ERROR_AUTO_INCIDENTS === 'true' ? 'enabled' : 'manual',
      webhookAlerts: process.env.ERROR_ALERT_WEBHOOK_URL ? 'configured' : 'not-configured'
    },
    timestamp: new Date().toISOString()
  })
}
