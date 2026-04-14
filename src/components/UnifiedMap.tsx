import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Search, Navigation } from 'lucide-react';

interface UnifiedMapProps {
  center: { lat: number, lng: number };
  zoom: number;
  children?: React.ReactNode;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onLocationUpdate?: (pos: { lat: number, lng: number }) => void;
  accentColor?: string;
  categories?: any[];
  activeCategory?: any;
  onCategoryChange?: (id: any) => void;
  nearbySearchType?: string;
  onPlacesFound?: (places: any[]) => void;
  onDistanceUpdate?: (distance: number) => void;
  origin?: { lat: number, lng: number } | null;
  destination?: { lat: number, lng: number } | null;
  waypoints?: { location: { lat: number, lng: number }, stopover: boolean }[];
  disableAutoCenter?: boolean;
}

const mapContainerStyle = { width: '100%', height: '100%' };

const simpleMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }
];

export const UnifiedMap: React.FC<UnifiedMapProps> = ({
  center,
  zoom,
  children,
  placeholder = "ابحث في الخريطة...",
  onSearch,
  onClick,
  onLocationUpdate,
  origin,
  destination,
  waypoints,
  // These props are accepted to prevent lint errors in pages, but simplified for now
  accentColor,
  categories,
  activeCategory,
  onCategoryChange,
  nearbySearchType,
  onPlacesFound,
  onDistanceUpdate,
  disableAutoCenter = false,
}) => {
  
  const isLoaded = typeof window !== 'undefined' && !!window.google;

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const lastRequestRef = useRef<string>("");

  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);

  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(newPos);
          map?.panTo(newPos);
          onLocationUpdate?.(newPos);
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  }, [map, onLocationUpdate]);

  useEffect(() => {
    if (isLoaded) {
      handleGetCurrentLocation();
    }
  }, [isLoaded, handleGetCurrentLocation]);

  useEffect(() => {
    const currentRequest = JSON.stringify({ origin, destination, waypoints });
    if (lastRequestRef.current === currentRequest) return;
    lastRequestRef.current = currentRequest;

    if (isLoaded && origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints || [],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result);
            
            // Calculate total distance from all legs
            const totalDistance = result.routes[0].legs.reduce((acc, leg) => {
              return acc + (leg.distance?.value || 0);
            }, 0);
            
            // Convert to KM
            const dist = Number((totalDistance / 1000).toFixed(1));
            if (dist !== lastDistanceRef.current) {
              lastDistanceRef.current = dist;
              onDistanceUpdate?.(dist);
            }
          }
        }
      );
    } else {
      setDirectionsResponse(null);
      if (lastDistanceRef.current !== 0) {
        lastDistanceRef.current = 0;
        onDistanceUpdate?.(0);
      }
    }
  }, [isLoaded, origin, destination, waypoints, onDistanceUpdate]);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-center p-6">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-black text-gray-900 mb-2">جاري تحميل الخريطة...</p>
        <p className="text-[10px] font-bold text-gray-400 max-w-[200px]">
          إذا استغرق الأمر وقتاً طويلاً، يرجى التأكد من تفعيل حساب الدفع (Billing) في Google Cloud Console.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-slate-100 text-right">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={(!disableAutoCenter && userLocation) ? userLocation : center}
        zoom={zoom}
        onLoad={onLoad}
        onClick={onClick}
        options={{ 
          disableDefaultUI: true,
          styles: simpleMapStyle,
          zoomControl: false,
          gestureHandling: 'greedy'
        }}
      >
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeWeight: 3,
                strokeColor: '#ffffff',
                scale: 7
            }}
          />
        )}

        {directionsResponse && (
          <DirectionsRenderer 
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: "#000000",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true
            }}
          />
        )}

        {origin && (
          <Marker 
            position={origin}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#000000",
              fillOpacity: 1,
              strokeWeight: 4,
              strokeColor: "#ffffff",
              scale: 8
            }}
          />
        )}
        {destination && (
          <Marker 
            position={destination}
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              fillColor: "#000000",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: 6
            }}
          />
        )}

        {children}
      </GoogleMap>

      {/* Category Bar */}
      {categories && categories.length > 0 && (
        <div className="absolute top-4 left-0 right-0 z-[1000] px-4">
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange?.(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-[11px] font-black shadow-xl transition-all border whitespace-nowrap ${
                  activeCategory === cat.id
                    ? (accentColor === 'blue' ? 'bg-blue-600 border-blue-600' : 'bg-red-600 border-red-600') + ' text-white'
                    : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute left-6 bottom-32 z-[1000]">
        <button 
          onClick={handleGetCurrentLocation} 
          className="p-4 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 active:scale-95 transition-all"
        >
          <Navigation size={22} />
        </button>
      </div>
    </div>
  );
};
