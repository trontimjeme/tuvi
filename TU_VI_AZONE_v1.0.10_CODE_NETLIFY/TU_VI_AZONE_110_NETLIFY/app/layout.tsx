import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Tử Vi · Không gian sống Studio Azone',
  description: 'Lập lá số Tử Vi Đẩu Số bằng thuật toán mã nguồn mở, tra cứu sao và cung.',
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body style={{ margin: 0 }}>{children}</body></html>;
}
