import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pivo — CRM para Criadores de Conteúdo",
  description:
    "Gerencie suas campanhas com marcas como um profissional. O CRM feito para o influenciador brasileiro.",
  keywords: ["influencer", "criador de conteúdo", "CRM", "campanhas", "marcas"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
