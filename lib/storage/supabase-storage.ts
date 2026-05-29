const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

export function getStorageConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'documents'
  return { supabaseUrl, serviceKey, bucket }
}

export function validateVaultFile(file: File) {
  if (!file || file.size <= 0) return 'Document file required.'
  if (file.size > MAX_FILE_SIZE) return 'File size max 5MB rakho.'
  if (!ALLOWED_TYPES.has(file.type)) return 'Only PDF, JPG, PNG, WEBP allowed.'
  return null
}

export function safeStorageName(name: string) {
  const clean = name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return clean || `document-${Date.now()}`
}

export async function uploadVaultFile({ userId, file }: { userId: string; file: File }) {
  const { supabaseUrl, serviceKey, bucket } = getStorageConfig()
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase Storage not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.')
  }

  const error = validateVaultFile(file)
  if (error) throw new Error(error)

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `${userId}/${Date.now()}-${safeStorageName(file.name || `document.${ext}`)}`
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': file.type,
      'x-upsert': 'false'
    },
    body: Buffer.from(await file.arrayBuffer())
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = typeof data?.message === 'string' ? data.message : `Upload failed with ${response.status}`
    throw new Error(message)
  }

  return path
}

export async function createSignedVaultUrl(storagePath: string) {
  const { supabaseUrl, serviceKey, bucket } = getStorageConfig()
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase Storage not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.')
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${storagePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 300 })
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(typeof data?.message === 'string' ? data.message : 'Signed URL create failed')
  const signedPath = data?.signedURL || data?.signedUrl
  if (!signedPath) throw new Error('Signed URL not returned by storage provider')
  return signedPath.startsWith('http') ? signedPath : `${supabaseUrl}/storage/v1${signedPath}`
}


export async function checkVaultStorageHealth() {
  const { supabaseUrl, serviceKey, bucket } = getStorageConfig()
  const checks = { supabaseUrl: Boolean(supabaseUrl), serviceKey: Boolean(serviceKey), bucket }
  if (!supabaseUrl || !serviceKey) return { ok: false, checks, error: 'Supabase Storage env not configured.' }

  const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
  }).catch((error) => error instanceof Error ? error : new Error('Storage connection failed'))

  if (response instanceof Error) return { ok: false, checks, error: response.message }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { ok: false, checks, status: response.status, error: typeof data?.message === 'string' ? data.message : 'Storage bucket check failed' }
  }
  return { ok: true, checks, bucketInfo: data }
}
