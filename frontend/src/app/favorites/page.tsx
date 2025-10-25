import React, { useState, useEffect } from 'react';
import {
  loadFavorites,
  toggleFavorite,
  isFavorite,
  FavoriteLocation,
} from './favs';

interface FavoritesScreenProps {
  onSelect?: (location: FavoriteLocation) => void; // optional callback when a favorite is clicked
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onSelect }) => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const handleToggle = (fav: FavoriteLocation) => {
    const updated = toggleFavorite(favorites, fav);
    setFavorites(updated);
  };

  if (favorites.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>No favorite locations yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Tap the heart icon on any location to save it.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Favorite Locations</h2>

      <div className="grid gap-3 md:grid-cols-3">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => onSelect && onSelect(fav)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-slate-800">
                {fav.label || 'Unnamed location'}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(fav);
                }}
                className="text-pink-500 hover:text-pink-600"
                title="Remove from favorites"
              >
                ❤️
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {fav.lat.toFixed(3)}, {fav.lng.toFixed(3)}
            </div>

            <div className="text-xs text-gray-400 mt-1">
              Added {new Date(fav.addedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesScreen;