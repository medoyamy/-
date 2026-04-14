import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useUser } from '../context/UserContext';

/**
 * Hook to listen for new orders and play a notification sound.
 * Target users: Restaurants and Drivers.
 */
export function useOrderNotifications() {
  const { activeProfile } = useUser();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!activeProfile || !activeProfile.id) return;

    // Only listen if the user is a restaurant or a driver
    if (activeProfile.mode !== 'restaurant' && activeProfile.mode !== 'driver') return;

    // Loud notification sound (Talabat-like alert)
    const soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    audioRef.current = new Audio(soundUrl);
    audioRef.current.volume = 1.0;

    let q;
    if (activeProfile.mode === 'restaurant') {
      // Listen for new orders for this restaurant
      q = query(
        collection(db, 'orders'),
        where('restaurantId', '==', activeProfile.id),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    } else if (activeProfile.mode === 'driver') {
      // Listen for new orders that need a driver
      // In a real app, this would be filtered by location
      q = query(
        collection(db, 'orders'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    }

    if (!q) return;

    let isInitialLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // New order! Play sound
          if (audioRef.current) {
            // Play multiple times for "loud/urgent" effect
            let playCount = 0;
            const playSound = () => {
              if (playCount < 3 && audioRef.current) {
                audioRef.current.play().catch(err => console.log('Audio play blocked by browser policy. User interaction required.'));
                playCount++;
                setTimeout(playSound, 1000);
              }
            };
            playSound();
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [activeProfile]);
}
