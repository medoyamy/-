import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { safeStringify } from '../lib/mapUtils';
import { syncStorage } from '../lib/storage';

export type UserMode = 'user' | 'merchant' | 'provider' | 'driver' | 'deal_manager' | 'deal_provider' | 'admin' | 'restaurant';
// ... (rest of the types remain the same)
export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  category?: string;
  stock?: number;
  unit?: string;
  brand?: string;
  expiryDate?: string;
  weight?: string;
  options?: ProductOption[];
  status?: 'available' | 'out_of_stock' | 'preorder';
}

export interface UserProfile {
  id: string;
  uid: string; // The owner's Firebase Auth UID
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  mode: UserMode;
  categories: string[];
  location: string;
  lat?: number;
  lng?: number;
  avatar?: string;
  cover?: string;
  description?: string;
  shortBio?: string;
  cv?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  category?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  type?: string;
  workExperience?: string;
  education?: string;
  hobbies?: string;
  interests?: string;
  favoritePlaces?: string;
  privacySettings?: Record<string, 'public' | 'friends' | 'friends_of_friends' | 'only_me'>;
  isPage?: boolean;
  status?: 'pending' | 'active' | 'rejected';
  rejectionReason?: string;
  city?: string;
  region?: string;
  parentId?: string;
  products?: Product[];
  internalCategories?: string[];
  createdAt?: string;
  points?: number;
  balance?: number;
  rating?: number;
  isPremium?: boolean;
  isReal?: boolean;
  // Management fields
  taxFile?: string;
  idCard?: string;
  license?: string;
  workingHours?: string;
  commissionRate?: number;
  subscriptionRate?: number;
  contractStatus?: 'unsigned' | 'signed' | 'expired';
  specializations?: string[];
  performanceScore?: number;
  sectionId?: string;
}

interface UserContextType {
  profiles: UserProfile[];
  activeProfileId: string;
  activeProfile: UserProfile;
  mainProfile: UserProfile;
  switchProfile: (id: string) => void;
  createProfile: (profile: Omit<UserProfile, 'id' | 'uid' | 'isPage' | 'parentId' | 'products' | 'internalCategories' | 'createdAt' | 'email'>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  addProduct: (profileId: string, product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (profileId: string, productId: string) => Promise<void>;
  addInternalCategory: (profileId: string, category: string) => Promise<void>;
  deleteInternalCategory: (profileId: string, category: string) => Promise<void>;
  updateMainCategories: (profileId: string, categories: string[]) => Promise<void>;
  updateUserLocation: (profileId: string, location: string, lat?: number, lng?: number) => Promise<void>;
  updateProfileDetails: (profileId: string, details: Partial<UserProfile>) => Promise<void>;
  updatePoints: (profileId: string, amount: number) => Promise<void>;
  updateBalance: (profileId: string, amount: number) => Promise<void>;
  approveProfile: (profileId: string) => Promise<void>;
  rejectProfile: (profileId: string, reason: string) => Promise<void>;
  auth: any;
  userMode: UserMode;
  userName: string;
  userLocation: string;
  currentCity: string;
  currentRegion: string;
  setCurrentCity: (city: string) => void;
  setCurrentRegion: (region: string) => void;
  userCategory: string;
  setUserCategory: (category: string) => void;
  setUserMode: (mode: UserMode) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  id: 'loading',
  uid: '',
  name: 'Loading...',
  email: '',
  mode: 'user',
  categories: [],
  location: '',
  points: 0,
  balance: 0,
  isPremium: false,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return syncStorage.get('active_profile_id') || 'main';
  });
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState(() => syncStorage.get('current_city') || 'القاهرة');
  const [currentRegion, setCurrentRegion] = useState(() => syncStorage.get('current_region') || 'الكل');

  React.useEffect(() => {
    syncStorage.set('current_city', currentCity);
    syncStorage.set('current_region', currentRegion);
  }, [currentCity, currentRegion]);

  React.useEffect(() => {
    syncStorage.set('active_profile_id', activeProfileId);
  }, [activeProfileId]);

  React.useEffect(() => {
    let unsubscribePages: (() => void) | null = null;
    let unsubscribeUserProfiles: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listeners
      if (unsubscribePages) unsubscribePages();
      if (unsubscribeUserProfiles) unsubscribeUserProfiles();

      // 1. Fetch all public pages/stores globally
      // We allow this even for unauthenticated users if the rules allow it
      const isAdminEmail = user && (user.email === 'mo7amdevo@gmail.com' || user.email === 'mo7amedevo@gmail.com');
      
      const pagesQuery = isAdminEmail
        ? query(collection(db, 'users'), where('isPage', '==', true))
        : query(collection(db, 'users'), where('isPage', '==', true), where('status', '==', 'active'));

      unsubscribePages = onSnapshot(pagesQuery, (snapshot) => {
        const fetchedPages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            categories: data.categories || []
          } as UserProfile;
        });
        
        setProfiles(prev => {
          const userProfiles = prev.filter(p => !p.isPage || (user && p.uid === user.uid));
          const otherPages = fetchedPages.filter(p => !user || p.uid !== user.uid);
          return [...userProfiles, ...otherPages];
        });
      }, (error) => {
        // Only log error if it's not a permission error for unauthenticated users
        // or if we really expect it to work.
        if (!(!user && error.message.includes('permission'))) {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
      });

      if (user) {
        // 2. Fetch all profiles belonging to this user
        const q = query(collection(db, 'users'), where('uid', '==', user.uid));
        unsubscribeUserProfiles = onSnapshot(q, (snapshot) => {
          const fetchedUserProfiles = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              categories: data.categories || []
            } as UserProfile;
          });
          
          setProfiles(prev => {
            const globalPages = prev.filter(p => p.isPage && p.uid !== user.uid);
            return [...fetchedUserProfiles, ...globalPages];
          });
          
          const main = fetchedUserProfiles.find(p => p.id === user.uid);
          const isAdminEmail = user.email === 'mo7amdevo@gmail.com' || user.email === 'mo7amedevo@gmail.com';
          
          if (activeProfileId === 'main') {
            setActiveProfileId(user.uid);
          }

          if (!main) {
            const newMain: UserProfile = {
              id: user.uid,
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              mode: isAdminEmail ? 'admin' : 'user',
              categories: [],
              location: '',
              avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
              description: 'الحساب الأساسي',
              createdAt: new Date().toISOString(),
              points: 0,
              balance: 0,
              isPremium: false
            };
            setDoc(doc(db, 'users', user.uid), newMain).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
          } else if (isAdminEmail && main.mode !== 'admin') {
            updateDoc(doc(db, 'users', user.uid), { mode: 'admin' }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
          }

          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        });
      } else {
        setProfiles(prev => prev.filter(p => p.isPage));
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribePages) unsubscribePages();
      if (unsubscribeUserProfiles) unsubscribeUserProfiles();
      unsubscribeAuth();
    };
  }, []);

  const mainProfile = profiles.find(p => p.id === auth.currentUser?.uid) || profiles[0] || DEFAULT_PROFILE;
  const activeProfile = profiles.find(p => p.id === activeProfileId) || mainProfile;

  const switchProfile = (id: string) => {
    const targetProfile = profiles.find(p => p.id === id);
    if (!targetProfile) return;
    
    // Allow switching to main profile or active pages
    if (targetProfile.id === auth.currentUser?.uid || targetProfile.status === 'active') {
      setActiveProfileId(id);
    }
  };

  const createProfile = async (profileData: any) => {
    if (!auth.currentUser) return;
    const id = Math.random().toString(36).substr(2, 9);
    const newProfile: UserProfile = {
      ...profileData,
      id,
      uid: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      isPage: true,
      status: 'pending', // Default to pending for moderation
      parentId: auth.currentUser.uid,
      products: [],
      internalCategories: [],
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', id), newProfile);
      setActiveProfileId(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    }
  };

  const addProduct = async (profileId: string, productData: any) => {
    if (profileId === 'main' || profileId === 'loading') return;
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profileId), {
        products: [...(profile.products || []), newProduct]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const deleteProduct = async (profileId: string, productId: string) => {
    if (profileId === 'main' || profileId === 'loading') return;
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profileId), {
        products: (profile.products || []).filter(prod => prod.id !== productId)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const addInternalCategory = async (profileId: string, category: string) => {
    if (profileId === 'main' || profileId === 'loading') return;
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profileId), {
        internalCategories: [...(profile.internalCategories || []), category]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const deleteInternalCategory = async (profileId: string, category: string) => {
    if (profileId === 'main' || profileId === 'loading') return;
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profileId), {
        internalCategories: (profile.internalCategories || []).filter(c => c !== category)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const updateMainCategories = async (profileId: string, categories: string[]) => {
    if (profileId === 'main' || profileId === 'loading') return;
    try {
      await updateDoc(doc(db, 'users', profileId), { categories });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const updateUserLocation = async (profileId: string, location: string, lat?: number, lng?: number) => {
    if (profileId === 'main' || profileId === 'loading') return;
    try {
      await updateDoc(doc(db, 'users', profileId), { location, lat, lng });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };
  
  const updateProfileDetails = async (profileId: string, details: any) => {
    if (profileId === 'main' || profileId === 'loading') return;
    try {
      await updateDoc(doc(db, 'users', profileId), details);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const updatePoints = async (profileId: string, amount: number) => {
    if (profileId === 'main' || profileId === 'loading') return;
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profileId), {
        points: (profile.points || 0) + amount
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const updateBalance = async (profileId: string, amount: number) => {
    if (profileId === 'main' || profileId === 'loading') return;
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profileId), {
        balance: (profile.balance || 0) + amount
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const deleteProfile = async (id: string) => {
    if (id === auth.currentUser?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      if (activeProfileId === id) setActiveProfileId('main');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  const approveProfile = async (profileId: string) => {
    try {
      await updateDoc(doc(db, 'users', profileId), { status: 'active', rejectionReason: null });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const rejectProfile = async (profileId: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'users', profileId), { status: 'rejected', rejectionReason: reason });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profileId}`);
    }
  };

  const setUserCategory = async (category: string) => {
    if (activeProfileId === 'main' || activeProfileId === 'loading') return;
    try {
      await updateDoc(doc(db, 'users', activeProfileId), { categories: [category] });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${activeProfileId}`);
    }
  };

  const setUserMode = async (mode: UserMode) => {
    if (mode === 'user') {
      setActiveProfileId(auth.currentUser?.uid || 'main');
      return;
    }
    const existingPage = profiles.find(p => p.mode === mode && p.isPage);
    if (existingPage) {
      setActiveProfileId(existingPage.id);
    } else {
      if (activeProfileId === 'main' || activeProfileId === 'loading') return;
      try {
        await updateDoc(doc(db, 'users', activeProfileId), { mode });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${activeProfileId}`);
      }
    }
  };

  return (
    <UserContext.Provider value={{ 
      profiles,
      activeProfileId,
      activeProfile,
      mainProfile,
      switchProfile,
      createProfile,
      deleteProfile,
      addProduct,
      deleteProduct,
      addInternalCategory,
      deleteInternalCategory,
      updateMainCategories,
      updateUserLocation,
      updateProfileDetails,
      updatePoints,
      updateBalance,
      approveProfile,
      rejectProfile,
      auth,
      userMode: activeProfile.mode,
      userName: activeProfile.name,
      userLocation: activeProfile.location,
      currentCity,
      currentRegion,
      setCurrentCity,
      setCurrentRegion,
      userCategory: activeProfile.categories[0] || '',
      setUserCategory,
      setUserMode,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
