import { notFound } from 'next/navigation';
import { ShoppingListService } from '@/lib/services/shopping-list-service';

interface SharedListPageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedShoppingListPage({ params }: SharedListPageProps) {
  const { token } = await params;

  if (!token || token.length > 32) {
    notFound();
  }

  const list = await ShoppingListService.getListByToken(token);

  if (!list) {
    notFound();
  }

  const items = list.items || [];
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lista de compras compartida</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{list.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} artículo{items.length !== 1 ? 's' : ''}
            {total > 0 && ` — Total: $${total.toFixed(2)} MXN`}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Lista vacía</p>
        ) : (
          <div className="space-y-1">
            {unchecked.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-gray-900 dark:text-gray-100">{item.item}</span>
                  {(item.amount || item.unit) && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                      {item.amount} {item.unit}
                    </span>
                  )}
                </div>
                {item.price != null && (
                  <span className="text-sm text-gray-500">${item.price.toFixed(2)}</span>
                )}
              </div>
            ))}

            {checked.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <span className="text-sm text-gray-400 font-medium">
                    Completados ({checked.length})
                  </span>
                </div>
                {checked.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="w-5 h-5 rounded border-2 border-green-400 bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-400 line-through">{item.item}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
