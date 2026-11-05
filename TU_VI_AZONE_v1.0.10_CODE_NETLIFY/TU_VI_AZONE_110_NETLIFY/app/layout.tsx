import type { Metadata } from 'next';
const title = '✓ AZONE STUDIO GENCHART';
const description = '✓ TỬ VI KHÔNG GIAN SỐNG';
const site = 'https://tuvi-dun.vercel.app';
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title, description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'vi_VN', siteName: 'AZONE STUDIO', url: '/', title, description,
    images: [{ url: '/site/share-preview.png', width: 1200, height: 630, alt: 'AZONE STUDIO GENCHART — TỬ VI KHÔNG GIAN SỐNG' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/site/share-preview.png'] },
  icons: { icon: '/site/azone-emblem.svg' },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body style={{ margin: 0 }}>{children}</body></html>;
}
