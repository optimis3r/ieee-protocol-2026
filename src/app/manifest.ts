import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IEEE Protocol: The Network',
    short_name: 'IEEE Protocol',
    description: 'Interactive Alternate Reality Game PWA for IEEE operatives.',
    start_url: '/play',
    display: 'standalone',
    background_color: '#24273a',
    theme_color: '#1e2030',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
