import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, MapPin, Search, CheckCircle2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { formatGoogleAddress, safeStringify } from '../lib/mapUtils';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string, coords: { lat: number; lng: number }) => void;
  title: string;
  initialLocation?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const deliveryMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
];

export default function MapPickerModal({ isOpen, onClose, onSelect, title, initialLocation }: MapPickerModalProps) {
  // التأكد من أن مكتبة جوجل محملة عالمياً في التطبيق
  const isLoaded = typeof window !== 'undefined' && !!window.google;

  const [search, setSearch] = useState(initialLocation || '');
  const [position, setPosition] = useState({ lat: 31.0409, lng: 31.3785 }); // المنصورة كبداية
  const [address, setAddress] = useState(initialLocation || 'جاري تحديد العنوان...');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const getAddress = useCallback(async (lat: number, lng: number) => {
    if (!window.google) return;
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results[0]) {
        const cleanAddress = formatGoogleAddress(response.results);
        setAddress(cleanAddress);
        setSearch(cleanAddress);
      }
    } catch (error) {
      console.error("خطأ في تحديد العنوان:", safeStringify(error));
    }
  }, []);

  const handleSearch = async () => {
    if (!search || !window.google) return;
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ address: search });
      if (response.results && response.results[0]) {
        const newPos = response.results[0].geometry.location.toJSON();
        setPosition(newPos);
        const cleanAddress = formatGoogleAddress(response.results);
        setAddress(cleanAddress);
        mapRef.current?.panTo(newPos);
      }
    } catch (error) {
      console.error("خطأ في البحث:", safeStringify(error));
    }
  };

  const handleConfirm = () => {
    onSelect(address, position);
    onClose();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(newPos);
          setPosition(newPos);
          mapRef.current?.panTo(newPos);
          getAddress(newPos.lat, newPos.lng);
        },
        (error) => console.error("خطأ الموقع:", safeStringify(error)),
        { enableHighAccuracy: true }
      );
    }
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = place.geometry.location.toJSON();
        setPosition(newPos);
        
        // Use the same formatting logic for autocomplete results
        const cleanAddress = place.formatted_address ? 
          formatGoogleAddress([{ address_components: place.address_components } as google.maps.GeocoderResult]) : 
          'موقع محدد';
          
        setAddress(cleanAddress);
        setSearch(cleanAddress);
        mapRef.current?.panTo(newPos);
      }
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Auto-locate on mount
  useEffect(() => {
    if (isOpen && isLoaded) {
      getCurrentLocation();
    }
  }, [isOpen, isLoaded]);

  const onMapIdle = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        const newPos = { lat: center.lat(), lng: center.lng() };
        // Use a larger threshold to avoid micro-movements triggering loops
        const diff = Math.abs(newPos.lat - position.lat) + Math.abs(newPos.lng - position.lng);
        if (diff > 0.0001) {
          setPosition(newPos);
          getAddress(newPos.lat, newPos.lng);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden flex flex-col h-[85vh] shadow-2xl text-right"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            {isLoaded ? (
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: "eg" },
                  fields: ["address_components", "geometry", "formatted_address"],
                }}
              >
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="ابحث عن منطقة أو شارع..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-11 pl-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100"
                />
              </Autocomplete>
            ) : (
              <input 
                type="text" 
                disabled
                placeholder="جاري تحميل البحث..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-11 pl-4 text-sm font-bold outline-none"
              />
            )}
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-100">
            <MapPin size={16} className="text-red-600 flex-shrink-0" />
            <p className="text-[10px] font-bold text-gray-700 truncate">{address}</p>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={position}
              zoom={15}
              onLoad={onMapLoad}
              onIdle={onMapIdle}
              options={{ 
                disableDefaultUI: true, 
                zoomControl: false,
                styles: deliveryMapStyle,
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
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-black text-gray-900 mb-2">جاري تحميل الخريطة...</p>
              <p className="text-[10px] font-bold text-gray-400">
                يرجى التأكد من تفعيل حساب الدفع (Billing) في Google Cloud Console.
              </p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10]">
             <MapPin size={48} className="text-red-600 drop-shadow-lg animate-bounce" />
          </div>
          <button onClick={getCurrentLocation} className="absolute bottom-6 right-6 z-[20] bg-white p-3 rounded-2xl shadow-xl text-red-600"><Navigation size={24} /></button>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button onClick={handleConfirm} className="w-full py-4 bg-red-600 text-white rounded-2xl text-base font-black flex items-center justify-center gap-2">
            <CheckCircle2 size={20} /> تأكيد الموقع المختار
          </button>
        </div>
      </motion.div>
    </div>
  );
}