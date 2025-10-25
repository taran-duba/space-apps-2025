// favoritesService.ts
// Handles saving, loading, and toggling favorited locations in localStorage

import { createClient } from '@/utils/supabase/client';

export interface FavoriteLocation {
  id: number;
  lat: number;
  lng: number;
  label?: string;
  addedAt: string;
}

const STORAGE_KEY = 'clairify_favorites';
const SUPABASE_TABLE = 'favorites';

// Load all favorites from Supabase
export function loadFavorites(): FavoriteLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cached = raw ? (JSON.parse(raw) as FavoriteLocation[]) : [];
    void loadFavoritesFromDB().then((remote) => {
      if (remote.length) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        } catch {}
      }
    });
    return cached;
  } catch (err) {
    console.error('Failed to load favorites:', err);
    return [];
  }
}

// Save all favorites back to Supabase
export function saveFavorites(favorites: FavoriteLocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorites (local cache):', err);
  }
  void (async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Supabase auth error while saving favorites:', userError);
        return;
      }
      if (!user) {
        return;
      }
      const { error: delErr } = await supabase
        .from(SUPABASE_TABLE)
        .delete()
        .eq('user_id', user.id);
      if (delErr) {
        console.error('Failed to clear existing favorites:', delErr);
      }
      if (favorites.length === 0) return;
      const rows = favorites.map((f) => ({
        user_id: user.id,
        lat: f.lat,
        lng: f.lng,
        label: f.label ?? null,
        added_at: f.addedAt,
      }));
      const { error: insErr } = await supabase.from(SUPABASE_TABLE).insert(rows);
      if (insErr) {
        console.error('Failed to insert favorites:', insErr);
      }
    } catch (e) {
      console.error('Unexpected error saving favorites to Supabase:', e);
    }
  })();
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

// Async: Load favorites from Supabase for the current user and sync local cache
export async function loadFavoritesFromDB(): Promise<FavoriteLocation[]> {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Supabase auth error while loading favorites:', userError);
      return [];
    }
    if (!user) {
      return [];
    }
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('lat,lng,label,added_at')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });
    console.log(data);
    if (error) {
      console.error('Failed to load favorites from Supabase:', error);
      return [];
    }
    const mapped: FavoriteLocation[] = (data ?? []).map((row: any, idx: number) => ({
      id: Date.now() + idx,
      lat: row.lat,
      lng: row.lng,
      label: row.label ?? undefined,
      addedAt: row.added_at,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
    } catch {}
    return mapped;
  } catch (e) {
    console.error('Unexpected error loading favorites from Supabase:', e);
    return [];
  }
}