interface HeaderProps {
  user?: { email?: string; full_name?: string } | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {user?.full_name || 'Recipe Book'}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
