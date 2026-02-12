import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';

// Disable static generation for authenticated routes
export const dynamic = 'force-dynamic';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication required - personal use only
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={{ full_name: 'Mi Libro de Recetas' }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
