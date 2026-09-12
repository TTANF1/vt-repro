export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</div>
}
