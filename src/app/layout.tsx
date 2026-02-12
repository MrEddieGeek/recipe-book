import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Libro de Recetas',
  description: 'Tu colección personal de recetas y planificador de comidas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
