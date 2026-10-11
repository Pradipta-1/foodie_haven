import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FoodItem } from '../types';
import { MOCK_FOOD_ITEMS } from '../data/mockData';
import { useToast } from './ToastContext';
import { foodApi, checkBackendHealth } from '../lib/api';

interface FoodContextType {
  foodItems: FoodItem[];
  isDbConnected: boolean;
  getFoodById: (id: string) => FoodItem | undefined;
  toggleAvailability: (foodId: string) => void;
  saveFoodItem: (item: FoodItem) => void;
  deleteFoodItem: (foodId: string) => void;
  resetCatalog: () => void;
  syncWithDatabase: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

const FOOD_SYNC_CHANNEL = 'foodie_menu_sync_channel';
const CATALOG_STORAGE_KEY = 'foodie_admin_catalog';

// Helper to eliminate duplicate food items based on unique ID or normalized dish name
export function deduplicateFoodItems(items: FoodItem[]): FoodItem[] {
  if (!Array.isArray(items)) return [];

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const unique: FoodItem[] = [];

  for (const item of items) {
    if (!item) continue;
    const rawId = String(item.id || (item as any)._id || '').trim();
    const rawName = String(item.name || '').trim();
    const normalizedName = rawName.toLowerCase().replace(/\s+/g, ' ');

    if (!normalizedName) continue;

    // Check if duplicate by ID or duplicate by normalized name
    if ((rawId && seenIds.has(rawId)) || seenNames.has(normalizedName)) {
      continue; // Duplicate item! Skip and do not include
    }

    if (rawId) seenIds.add(rawId);
    seenNames.add(normalizedName);
    unique.push(item);
  }

  // Preserve canonical menu order with Coca Cola at the end if present
  const cocaCola = unique.find(
    (i) => i.name.toLowerCase().trim() === 'coca cola' || i.id === 'drink-4'
  );
  if (cocaCola) {
    const withoutCola = unique.filter((i) => i !== cocaCola);
    return [...withoutCola, cocaCola];
  }

  return unique;
}

// Helper to merge stored items with default mock data and deduplicate
function getInitialFoodItems(): FoodItem[] {
  if (typeof window === 'undefined') return deduplicateFoodItems(MOCK_FOOD_ITEMS);

  const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Build lookup maps by ID and by normalized name from MOCK_FOOD_ITEMS
        const mockById = new Map(MOCK_FOOD_ITEMS.map((item) => [item.id, item]));
        const mockByName = new Map(
          MOCK_FOOD_ITEMS.map((item) => [item.name.toLowerCase().trim(), item])
        );

        // Map parsed items with enhanced mock details
        const synced = parsed.map((item: FoodItem) => {
          const normName = item.name?.toLowerCase().trim() || '';
          const mock = mockById.get(item.id) || mockByName.get(normName);
          if (mock) {
            return {
              ...mock,
              id: item.id || mock.id,
              isAvailable: item.isAvailable !== undefined ? item.isAvailable : mock.isAvailable,
              price: item.price > 50 ? item.price : mock.price,
            };
          }
          return item;
        });

        // Track existing IDs AND existing normalized names to avoid injecting duplicate mock items
        const existingIds = new Set(synced.map((p: FoodItem) => p.id));
        const existingNames = new Set(synced.map((p: FoodItem) => p.name?.toLowerCase().trim()));

        const missingItems = MOCK_FOOD_ITEMS.filter(
          (m) => !existingIds.has(m.id) && !existingNames.has(m.name.toLowerCase().trim())
        );

        // Strict deduplication of entire catalog
        const merged = deduplicateFoodItems([...synced, ...missingItems]);
        localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      return deduplicateFoodItems(MOCK_FOOD_ITEMS);
    }
  }

  const initial = deduplicateFoodItems(MOCK_FOOD_ITEMS);
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(getInitialFoodItems);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const { showWarning, showSuccess, showInfo } = useToast();
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Sync with MongoDB backend
  const syncWithDatabase = async () => {
    try {
      const health = await checkBackendHealth();
      setIsDbConnected(health.isOnline);

      if (health.isOnline) {
        const dbFoods = await foodApi.getAll();
        if (Array.isArray(dbFoods) && dbFoods.length > 0) {
          const formatted: FoodItem[] = dbFoods.map((f: any) => ({
            id: f._id || f.id,
            name: f.name,
            description: f.description,
            price: f.price,
            originalPrice: f.originalPrice,
            category: f.category,
            image: f.image,
            isVeg: f.isVeg,
            rating: f.rating || 4.5,
            ratingCount: f.ratingCount || 10,
            isAvailable: f.isAvailable !== undefined ? f.isAvailable : true,
            isPopular: f.isPopular,
            isChefSpecial: f.isChefSpecial,
            prepTimeMinutes: f.prepTimeMinutes || 15,
            calories: f.calories,
            ingredients: f.ingredients || [],
            customizations: f.customizations,
            addOns: f.addOns,
          }));

          const deduped = deduplicateFoodItems(formatted);
          setFoodItems(deduped);
          localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(deduped));
        }
      }
    } catch (e) {
      // offline fallback
      setIsDbConnected(false);
    }
  };

  // Check DB on startup
  useEffect(() => {
    syncWithDatabase();
  }, []);

  // Initialize persistent BroadcastChannel & storage listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const ch = new BroadcastChannel(FOOD_SYNC_CHANNEL);
        channelRef.current = ch;

        ch.onmessage = (event) => {
          if (event.data && event.data.type === 'MENU_SYNC' && Array.isArray(event.data.foodItems)) {
            setFoodItems(deduplicateFoodItems(event.data.foodItems));
            const meta = event.data.meta;
            if (meta?.action === 'toggle_availability' && meta.foodName) {
              if (meta.isAvailable) {
                showInfo(`🍽️ "${meta.foodName}" is back in stock!`);
              } else {
                showWarning(`⚠️ "${meta.foodName}" is now marked Sold Out`);
              }
            }
          }
        };
      } catch (e) {}
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CATALOG_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setFoodItems(deduplicateFoodItems(parsed));
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<FoodItem[]>;
      if (Array.isArray(customEvent.detail)) {
        setFoodItems(deduplicateFoodItems(customEvent.detail));
      }
    };
    window.addEventListener('foodie_menu_custom_sync', handleCustomEvent);

    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const deduped = deduplicateFoodItems(parsed);
            setFoodItems((prev) => {
              if (prev.length !== deduped.length || JSON.stringify(prev) !== JSON.stringify(deduped)) {
                return deduped;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    }, 400);

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch (e) {}
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('foodie_menu_custom_sync', handleCustomEvent);
      clearInterval(interval);
    };
  }, [showInfo, showWarning]);

  // Helper to persist and broadcast menu updates
  const syncAndBroadcastMenu = (
    updated: FoodItem[],
    meta?: { foodName?: string; isAvailable?: boolean; action?: string }
  ) => {
    const deduped = deduplicateFoodItems(updated);
    setFoodItems(deduped);

    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(deduped));
    } catch (e) {}

    try {
      window.dispatchEvent(new CustomEvent('foodie_menu_custom_sync', { detail: deduped }));
    } catch (e) {}

    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: 'MENU_SYNC',
          foodItems: deduped,
          meta,
        });
      } catch (e) {}
    }
  };

  const getFoodById = (id: string): FoodItem | undefined => {
    return foodItems.find((item) => item.id === id || (item as any)._id === id);
  };

  const toggleAvailability = async (foodId: string) => {
    let targetName = '';
    let nextState = false;

    const updated = foodItems.map((item) => {
      if (item.id === foodId || (item as any)._id === foodId) {
        targetName = item.name;
        nextState = !item.isAvailable;
        return { ...item, isAvailable: nextState };
      }
      return item;
    });

    syncAndBroadcastMenu(updated, {
      foodName: targetName,
      isAvailable: nextState,
      action: 'toggle_availability',
    });

    // Sync to MongoDB backend if connected
    try {
      await foodApi.toggleAvailability(foodId);
    } catch (e) {}

    if (nextState) {
      showSuccess(`"${targetName}" is now In Stock ✓`);
    } else {
      showWarning(`"${targetName}" is now Out of Stock ✕`);
    }
  };

  const saveFoodItem = async (food: FoodItem) => {
    const existingIndex = foodItems.findIndex(
      (f) =>
        f.id === food.id ||
        (f as any)._id === food.id ||
        f.name.trim().toLowerCase() === food.name.trim().toLowerCase()
    );

    let updated: FoodItem[];

    if (existingIndex >= 0) {
      const existingId = foodItems[existingIndex].id;
      const mergedFood = { ...food, id: existingId };
      updated = [...foodItems];
      updated[existingIndex] = mergedFood;
      showSuccess(`Updated "${food.name}"`);
      try {
        await foodApi.update(existingId, mergedFood);
      } catch (e) {}
    } else {
      updated = [food, ...foodItems];
      showSuccess(`Added "${food.name}" to menu`);
      try {
        await foodApi.create(food);
      } catch (e) {}
    }

    syncAndBroadcastMenu(updated, {
      foodName: food.name,
      action: existingIndex >= 0 ? 'update_food' : 'add_food',
    });
  };

  const deleteFoodItem = async (foodId: string) => {
    const item = foodItems.find((f) => f.id === foodId || (f as any)._id === foodId);
    if (!item) return;

    const updated = foodItems.filter((f) => f.id !== foodId && (f as any)._id !== foodId);
    syncAndBroadcastMenu(updated, {
      foodName: item.name,
      action: 'delete_food',
    });

    try {
      await foodApi.delete(foodId);
    } catch (e) {}

    showWarning(`Deleted "${item.name}" from menu`);
  };

  const resetCatalog = () => {
    syncAndBroadcastMenu(deduplicateFoodItems(MOCK_FOOD_ITEMS), { action: 'reset' });
    showSuccess('Menu catalog reset to standard store menu');
  };

  return (
    <FoodContext.Provider
      value={{
        foodItems,
        isDbConnected,
        getFoodById,
        toggleAvailability,
        saveFoodItem,
        deleteFoodItem,
        resetCatalog,
        syncWithDatabase,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
}
