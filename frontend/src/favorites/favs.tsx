// favoritesService.ts
// Handles saving, loading, and toggling favorited locations in localStorage

export interface FavoriteLocation {
  id: number;
  lat: number;
  lng: number;
  label?: string;
  addedAt: string;
}

const STORAGE_KEY = 'clairify_favorites';

// Load all favorites from localStorage
export function loadFavorites(): FavoriteLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteLocation[]) : [];
  } catch (err) {
    console.error('Failed to load favorites:', err);
    return [];
  }
}

// Save all favorites back to localStorage
export function saveFavorites(favorites: FavoriteLocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorites:', err);
  }
}

// Check if a specific location is already favorited
export function isFavorite(
  favorites: FavoriteLocation[],
  location: { lat: number; lng: number }
): boolean {
  return favorites.some(
    (f) => f.lat === location.lat && f.lng === location.lng
  );
}

// Add or remove a favorite
export function toggleFavorite(
  favorites: FavoriteLocation[],
  location: { lat: number; lng: number },
  label: string = ''
): FavoriteLocation[] {
  const exists = isFavorite(favorites, location);
  let updated: FavoriteLocation[];

  if (exists) {
    updated = favorites.filter(
      (f) => !(f.lat === location.lat && f.lng === location.lng)
    );
  } else {
    const newFavorite: FavoriteLocation = {
      id: Date.now(),
      lat: location.lat,
      lng: location.lng,
      label,
      addedAt: new Date().toISOString(),
    };
    updated = [newFavorite, ...favorites];
  }

  saveFavorites(updated);
  return updated;
}