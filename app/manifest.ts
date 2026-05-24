import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return { name: 'HaqSathi AI', short_name: 'HaqSathi', description: 'Complaint, refund, UPI, document aur scheme help simple Hinglish me.', start_url: '/', scope: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#047857', orientation: 'portrait', categories: ['productivity','utilities','education'], icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }, { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml', purpose: 'any' }] }
}
