const CACHE_NAME = 'haqsathi-ai-v3-0-105-motion-hydration-stability'
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`
const OFFLINE_URL = '/offline.html'
const CORE_ASSETS = ['/', OFFLINE_URL, '/icon.svg', '/apple-icon.svg', '/manifest.webmanifest']
const CACHEABLE_DESTINATIONS = new Set(['style', 'script', 'image', 'font'])
const MAX_RUNTIME_ENTRIES = 80
const BYPASS_PREFIXES = [
  '/api/',
  '/_next/data/',
  '/admin',
  '/dashboard',
  '/document-vault',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('haqsathi-ai-') && key !== CACHE_NAME && key !== RUNTIME_CACHE).map((key) => caches.delete(key)))),
      self.registration.navigationPreload ? self.registration.navigationPreload.enable() : Promise.resolve()
    ]).then(() => self.clients.claim())
  )
})

function shouldBypassCache(url) {
  return (
    BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    url.searchParams.has('no-cache') ||
    url.searchParams.has('token') ||
    url.searchParams.has('code')
  )
}

function isSafeNavigationToCache(request, url) {
  if (request.mode !== 'navigate') return false
  if (shouldBypassCache(url)) return false
  return true
}

async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE)
  const keys = await cache.keys()
  if (keys.length <= MAX_RUNTIME_ENTRIES) return
  await Promise.all(keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES).map((request) => cache.delete(request)))
}

async function cacheResponse(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return response
  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone())
  if (cacheName === RUNTIME_CACHE) await trimRuntimeCache()
  return response
}

async function networkFirstNavigation(event, url) {
  try {
    const preload = await event.preloadResponse
    if (preload) return cacheResponse(RUNTIME_CACHE, event.request, preload)
    const response = await fetch(event.request)
    return cacheResponse(RUNTIME_CACHE, event.request, response)
  } catch {
    const cached = isSafeNavigationToCache(event.request, url) ? await caches.match(event.request) : undefined
    if (cached) return cached
    return caches.match(OFFLINE_URL)
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const network = fetch(request)
    .then((response) => cacheResponse(RUNTIME_CACHE, request, response))
    .catch(() => undefined)
  return cached || network || Response.error()
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (shouldBypassCache(url)) return

  if (isSafeNavigationToCache(request, url)) {
    event.respondWith(networkFirstNavigation(event, url))
    return
  }

  if (url.pathname.startsWith('/_next/static/') || CACHEABLE_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'HaqSathi AI reminder', body: event.data ? event.data.text() : 'Aapka follow-up reminder ready hai.' }
  }

  const title = payload.title || 'HaqSathi AI reminder'
  const options = {
    body: payload.body || 'Dashboard open karke next action complete karein.',
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/icon.svg',
    tag: payload.tag || 'haqsathi-reminder',
    renotify: Boolean(payload.renotify),
    data: {
      url: payload.url || '/dashboard',
      createdAt: new Date().toISOString()
    }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && new URL(client.url).pathname === url) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
      return undefined
    })
  )
})
