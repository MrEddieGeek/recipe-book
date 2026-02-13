'use client';

import { useState } from 'react';

interface FavoriteButtonProps {
  recipeId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({
  recipeId,
  initialFavorited = false,
  size = 'sm',
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    // Optimistic update
    setIsFavorited((prev) => !prev);
    setBusy(true);

    try {
      const res = await fetch(`/api/recipes/${recipeId}/favorite`, {
        method: 'POST',
      });
      if (res.ok) {
        const { isFavorited: serverValue } = await res.json();
        setIsFavorited(serverValue);
      } else {
        // Revert on error
        setIsFavorited((prev) => !prev);
      }
    } catch {
      setIsFavorited((prev) => !prev);
    } finally {
      setBusy(false);
    }
  };

  const sizeClasses = size === 'md' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className="p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-colors disabled:opacity-50"
    >
      <svg
        className={`${sizeClasses} transition-colors ${
          isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'
        }`}
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
