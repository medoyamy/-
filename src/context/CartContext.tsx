import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { safeStringify } from '../lib/mapUtils';
import { asyncStorage } from '../lib/storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit?: string;
  selectedOptions?: Record<string, string>;
  storeId?: string;
  storeName?: string;
  restaurantId?: string;
  restaurantName?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  location: string;
  time: string;
  status: 'pending' | 'searching' | 'accepted' | 'on_way' | 'arrived' | 'delivered';
}

export interface DriverRequest {
  id: string;
  category?: string;
  vehicleType: string;
  pickupLocation: string;
  deliveryLocation: string;
  expectedPrice: number;
  notes?: string;
  shipmentDetails?: string;
  friendsNotified?: number;
  status: 'pending' | 'accepted' | 'completed';
}

export interface DealItem {
  id: string;
  name: string;
  price: number;
  image: string;
  managerCommission: number;
  storeId?: string;
  storeName?: string;
}

export interface BookingItem {
  id: string;
  postId: string;
  postContent: string;
  type: 'instant' | 'scheduled' | 'inspection' | 'execution';
  date?: string;
  time?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  authorName: string;
  address?: string;
  notes?: string;
  phone?: string;
  customerName?: string;
}

export interface JoinRequestItem {
  id: string;
  postId: string;
  postContent: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  authorName: string;
  address?: string;
  deliveryMethod?: string;
  notes?: string;
  phone?: string;
  customerName?: string;
}

interface CartContextType {
  // Restaurant Cart
  restaurantCart: { restaurantId: string, restaurantName: string, items: CartItem[] } | null;
  addToRestaurantCart: (item: CartItem, restaurantId: string, restaurantName: string) => boolean;
  clearAndAddToRestaurantCart: (item: CartItem, restaurantId: string, restaurantName: string) => void;
  removeFromRestaurantCart: (id: string) => void;
  updateRestaurantQuantity: (id: string, quantity: number) => void;
  clearRestaurantCart: () => void;

  // Mercato Cart
  mercatoCart: CartItem[];
  addToMercatoCart: (item: CartItem) => void;
  removeFromMercatoCart: (id: string) => void;
  updateMercatoQuantity: (id: string, quantity: number) => void;
  clearMercatoCart: () => void;

  // Assisto Cart
  assistoCart: ServiceItem[];
  addAssistoOrder: (order: Omit<ServiceItem, 'id' | 'status'>) => void;
  updateAssistoStatus: (id: string, status: ServiceItem['status']) => void;
  removeFromAssistoCart: (id: string) => void;
  clearAssistoCart: () => void;

  // Driver Cart
  driverCart: DriverRequest[];
  addDriverRequest: (request: Omit<DriverRequest, 'id' | 'status'>) => void;
  removeFromDriverCart: (id: string) => void;
  clearDriverCart: () => void;

  // Deals Cart
  dealsCart: DealItem[];
  addToDealsCart: (item: DealItem) => void;
  removeFromDealsCart: (id: string) => void;
  clearDealsCart: () => void;

  // Bookings
  bookings: BookingItem[];
  addBooking: (booking: Omit<BookingItem, 'id' | 'status' | 'createdAt'>) => void;
  removeFromBookings: (id: string) => void;
  clearBookings: () => void;

  // Join Requests
  joinRequests: JoinRequestItem[];
  addJoinRequest: (request: Omit<JoinRequestItem, 'id' | 'status' | 'createdAt'>) => void;
  updateJoinRequestQuantity: (id: string, quantity: number) => void;
  removeFromJoinRequests: (id: string) => void;
  clearJoinRequests: () => void;

  // General
  cartCount: number;
  pendingRestaurantItem: { item: CartItem, restaurantId: string, restaurantName: string } | null;
  setPendingRestaurantItem: (data: { item: CartItem, restaurantId: string, restaurantName: string } | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurantCart, setRestaurantCart] = useState<{ restaurantId: string, restaurantName: string, items: CartItem[] } | null>(null);
  const [pendingRestaurantItem, setPendingRestaurantItem] = useState<{ item: CartItem, restaurantId: string, restaurantName: string } | null>(null);
  const [mercatoCart, setMercatoCart] = useState<CartItem[]>([]);
  const [assistoCart, setAssistoCart] = useState<ServiceItem[]>([]);
  const [driverCart, setDriverCart] = useState<DriverRequest[]>([]);
  const [dealsCart, setDealsCart] = useState<DealItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);

  useEffect(() => {
    // Load initial data from AsyncStorage (IndexedDB)
    const loadCache = async () => {
      const savedRestaurant = await asyncStorage.get<any>('avalon_restaurant_cart');
      const savedMercato = await asyncStorage.get<CartItem[]>('avalon_mercato_cart');
      const savedAssisto = await asyncStorage.get<ServiceItem[]>('avalon_assisto_cart');
      const savedDriver = await asyncStorage.get<DriverRequest[]>('avalon_driver_cart');
      const savedDeals = await asyncStorage.get<DealItem[]>('avalon_deals_cart');
      const savedBookings = await asyncStorage.get<BookingItem[]>('avalon_bookings');
      const savedJoin = await asyncStorage.get<JoinRequestItem[]>('avalon_join_requests');

      if (savedRestaurant) setRestaurantCart(savedRestaurant);
      if (savedMercato) setMercatoCart(savedMercato);
      if (savedAssisto) setAssistoCart(savedAssisto);
      if (savedDriver) setDriverCart(savedDriver);
      if (savedDeals) setDealsCart(savedDeals);
      if (savedBookings) setBookings(savedBookings);
      if (savedJoin) setJoinRequests(savedJoin);
    };
    loadCache();
  }, []);

  useEffect(() => {
    asyncStorage.set('avalon_restaurant_cart', restaurantCart);
  }, [restaurantCart]);

  useEffect(() => {
    asyncStorage.set('avalon_mercato_cart', mercatoCart);
  }, [mercatoCart]);

  useEffect(() => {
    asyncStorage.set('avalon_assisto_cart', assistoCart);
  }, [assistoCart]);

  useEffect(() => {
    asyncStorage.set('avalon_driver_cart', driverCart);
  }, [driverCart]);

  useEffect(() => {
    asyncStorage.set('avalon_deals_cart', dealsCart);
  }, [dealsCart]);

  useEffect(() => {
    asyncStorage.set('avalon_bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    asyncStorage.set('avalon_join_requests', joinRequests);
  }, [joinRequests]);

  // Restaurant Logic
  const addToRestaurantCart = (item: CartItem, restaurantId: string, restaurantName: string) => {
    if (restaurantCart && restaurantCart.restaurantId !== restaurantId) {
      // Return false to indicate a mismatch, UI should handle confirmation
      return false;
    }

    setRestaurantCart(prev => {
      const currentItems = prev?.items || [];
      const existing = currentItems.find(i => 
        i.id === item.id && 
        safeStringify(i.selectedOptions || {}) === safeStringify(item.selectedOptions || {})
      );

      let newItems;
      if (existing) {
        newItems = currentItems.map(i => 
          (i.id === item.id && safeStringify(i.selectedOptions || {}) === safeStringify(item.selectedOptions || {}))
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      } else {
        newItems = [...currentItems, item];
      }

      return { restaurantId, restaurantName, items: newItems };
    });
    return true;
  };

  const clearAndAddToRestaurantCart = (item: CartItem, restaurantId: string, restaurantName: string) => {
    setRestaurantCart({ restaurantId, restaurantName, items: [item] });
  };

  const removeFromRestaurantCart = (id: string) => {
    setRestaurantCart(prev => {
      if (!prev) return null;
      const newItems = prev.items.filter(i => i.id !== id);
      if (newItems.length === 0) return null;
      return { ...prev, items: newItems };
    });
  };

  const updateRestaurantQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromRestaurantCart(id);
      return;
    }
    setRestaurantCart(prev => {
      if (!prev) return null;
      return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, quantity } : i) };
    });
  };

  const clearRestaurantCart = () => setRestaurantCart(null);

  // Mercato Logic
  const addToMercatoCart = (item: CartItem) => {
    setMercatoCart(prev => {
      const existing = prev.find(i => 
        i.id === item.id && 
        safeStringify(i.selectedOptions || {}) === safeStringify(item.selectedOptions || {})
      );
      if (existing) {
        return prev.map(i => 
          (i.id === item.id && safeStringify(i.selectedOptions || {}) === safeStringify(item.selectedOptions || {}))
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromMercatoCart = (id: string) => {
    setMercatoCart(prev => prev.filter(i => i.id !== id));
  };

  const updateMercatoQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromMercatoCart(id);
      return;
    }
    setMercatoCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearMercatoCart = () => setMercatoCart([]);

  // Assisto Logic
  const addAssistoOrder = (order: Omit<ServiceItem, 'id' | 'status'>) => {
    const newOrder: ServiceItem = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    setAssistoCart(prev => [...prev, newOrder]);
  };

  const updateAssistoStatus = (id: string, status: ServiceItem['status']) => {
    setAssistoCart(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const removeFromAssistoCart = (id: string) => {
    setAssistoCart(prev => prev.filter(o => o.id !== id));
  };

  const clearAssistoCart = () => setAssistoCart([]);

  // Driver Logic
  const addDriverRequest = (request: Omit<DriverRequest, 'id' | 'status'>) => {
    const newRequest: DriverRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    setDriverCart(prev => [...prev, newRequest]);
  };

  const removeFromDriverCart = (id: string) => {
    setDriverCart(prev => prev.filter(r => r.id !== id));
  };

  const clearDriverCart = () => setDriverCart([]);

  // Deals Logic
  const addToDealsCart = (item: DealItem) => {
    setDealsCart(prev => [...prev, item]);
  };

  const removeFromDealsCart = (id: string) => {
    setDealsCart(prev => prev.filter(d => d.id !== id));
  };

  const clearDealsCart = () => setDealsCart([]);

  // Bookings Logic
  const addBooking = (booking: Omit<BookingItem, 'id' | 'status' | 'createdAt'>) => {
    const newBooking: BookingItem = {
      ...booking,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const removeFromBookings = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const clearBookings = () => setBookings([]);

  // Join Requests Logic
  const addJoinRequest = (request: Omit<JoinRequestItem, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: JoinRequestItem = {
      ...request,
      id: `JR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setJoinRequests(prev => [newRequest, ...prev]);
  };

  const updateJoinRequestQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromJoinRequests(id);
      return;
    }
    setJoinRequests(prev => prev.map(r => r.id === id ? { ...r, quantity } : r));
  };

  const removeFromJoinRequests = (id: string) => {
    setJoinRequests(prev => prev.filter(r => r.id !== id));
  };

  const clearJoinRequests = () => setJoinRequests([]);

  const cartCount = (restaurantCart?.items.length || 0) + mercatoCart.length + assistoCart.length + driverCart.length + dealsCart.length + bookings.length + joinRequests.length;

  return (
    <CartContext.Provider value={{ 
      restaurantCart, addToRestaurantCart, clearAndAddToRestaurantCart, removeFromRestaurantCart, updateRestaurantQuantity, clearRestaurantCart,
      mercatoCart, addToMercatoCart, removeFromMercatoCart, updateMercatoQuantity, clearMercatoCart,
      assistoCart, addAssistoOrder, updateAssistoStatus, removeFromAssistoCart, clearAssistoCart,
      driverCart, addDriverRequest, removeFromDriverCart, clearDriverCart,
      dealsCart, addToDealsCart, removeFromDealsCart, clearDealsCart,
      bookings, addBooking, removeFromBookings, clearBookings,
      joinRequests, addJoinRequest, updateJoinRequestQuantity, removeFromJoinRequests, clearJoinRequests,
      cartCount,
      pendingRestaurantItem, setPendingRestaurantItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
