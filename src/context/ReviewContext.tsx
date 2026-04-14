import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  targetId: string;
  targetType: 'profile' | 'post' | 'product';
  source: string;
  targetName?: string;
  rating: number;
  content: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  rejectReview: (id: string) => Promise<void>;
  loading: boolean;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isAdminEmail = user.email === 'mo7amdevo@gmail.com' || user.email === 'mo7amedevo@gmail.com';
        const q = isAdminEmail
          ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
          : query(collection(db, 'reviews'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedReviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
            } as Review;
          });
          setReviews(fetchedReviews);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'reviews');
          setLoading(false);
        });

        return () => unsubscribe();
      } else {
        setReviews([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const addReview = async (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    try {
      const newReview: Review = {
        ...reviewData,
        id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'reviews', id), newReview);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reviews/${id}`);
    }
  };

  const approveReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'active' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  const rejectReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'rejected' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, approveReview, rejectReview, loading }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}
