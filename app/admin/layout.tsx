export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout simples - não bloqueia renderização
  // Cada página admin decide o que fazer se não autenticado
  return <>{children}</>;
}
