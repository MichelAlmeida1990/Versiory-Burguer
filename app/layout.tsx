import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ClientAuthProviderWrapper } from "@/components/providers/client-auth-provider";

export const metadata: Metadata = {
  title: "Versiory Delivery - Sistema de Pedidos Online",
  description: "O sistema que sua empresa merece. Conquistando empreendedores pela facilidade, eficiência e resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientAuthProviderWrapper>
          {children}
        </ClientAuthProviderWrapper>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

