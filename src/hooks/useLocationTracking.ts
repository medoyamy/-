import { useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function useLocationTracking(trackingId: string | null, isActive: boolean) {
  useEffect(() => {
    if (!trackingId || !isActive) return;

    let watchId: number;

    const startTracking = () => {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await setDoc(doc(db, 'driver_locations', trackingId), {
                lat: latitude,
                lng: longitude,
                updatedAt: serverTimestamp(),
              }, { merge: true });
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, `driver_locations/${trackingId}`);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
          }
        );
      }
    };

    startTracking();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trackingId, isActive]);
}
