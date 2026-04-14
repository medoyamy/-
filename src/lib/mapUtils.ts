export const formatGoogleAddress = (results: google.maps.GeocoderResult[]) => {
  if (!results || results.length === 0) return 'موقع غير معروف';
  
  const components = results[0].address_components;
  let streetNumber = '';
  let route = '';
  let neighborhood = '';
  let sublocality = '';
  let locality = '';
  let administrativeAreaLevel2 = '';
  let administrativeAreaLevel1 = '';
  let country = '';

  components.forEach(component => {
    const types = component.types;
    if (types.includes('street_number')) streetNumber = component.long_name;
    if (types.includes('route')) route = component.long_name;
    if (types.includes('neighborhood')) neighborhood = component.long_name;
    if (types.includes('sublocality')) sublocality = component.long_name;
    if (types.includes('locality')) locality = component.long_name;
    if (types.includes('administrative_area_level_2')) administrativeAreaLevel2 = component.long_name;
    if (types.includes('administrative_area_level_1')) administrativeAreaLevel1 = component.long_name;
    if (types.includes('country')) country = component.long_name;
  });

  const parts = [];
  
  // Building number and Street
  if (streetNumber && route) {
    parts.push(`${streetNumber} ${route}`);
  } else if (route) {
    parts.push(route);
  } else if (streetNumber) {
    parts.push(streetNumber);
  }

  // Area / Neighborhood
  if (neighborhood) {
    parts.push(neighborhood);
  } else if (sublocality) {
    parts.push(sublocality);
  }

  // City
  if (locality) {
    parts.push(locality);
  } else if (administrativeAreaLevel2) {
    parts.push(administrativeAreaLevel2);
  }

  // Governorate
  if (administrativeAreaLevel1) {
    parts.push(administrativeAreaLevel1);
  }

  // Country
  if (country) {
    parts.push(country);
  }

  // Filter out empty parts and join with comma
  return parts.filter(Boolean).join('، ');
};

/**
 * Safely stringify an object that might contain circular references.
 * Replaces circular references with "[Circular]" to prevent JSON.stringify errors.
 * Also handles potential errors during property access.
 */
export function safeStringify(obj: any, indent: number = 0): string {
  const cache = new WeakSet();
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Handle HTML elements which often cause circular issues
          if (value instanceof HTMLElement) {
            return `[HTMLElement: ${value.tagName}]`;
          }
          
          // Handle Error objects specifically (including those from other realms)
          if (value instanceof Error || (value && typeof value === 'object' && 'message' in value && 'stack' in value)) {
            return {
              name: value.name || 'Error',
              message: value.message,
              stack: value.stack,
              ...(value as any)
            };
          }
          
          // Handle Google Maps objects specifically if possible
          if (value.constructor && (value.constructor.name === 'Y2' || value.constructor.name === 'Ka')) {
            return `[GoogleMapsObject: ${value.constructor.name}]`;
          }

          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return value;
      },
      indent
    );
  } catch (error) {
    // Avoid logging the error object itself if it might be circular
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn('safeStringify failed:', errorMsg);
    return `[Unstringifiable Object: ${errorMsg}]`;
  }
}

/**
 * Global Console Patch
 * Intercepts console methods to safely stringify objects before they reach the platform's interceptor.
 * This prevents "Converting circular structure to JSON" errors in the AI Studio environment.
 */
export function patchConsole() {
  if (typeof window === 'undefined' || (window as any).__console_patched) return;

  const methods: (keyof Console)[] = ['log', 'error', 'warn', 'info', 'debug'];
  methods.forEach(method => {
    const original = console[method];
    (console as any)[method] = (...args: any[]) => {
      const safeArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          // If it's an Error, we want to keep its stack and message but avoid circularity
          if (arg instanceof Error) {
            return {
              name: arg.name,
              message: arg.message,
              stack: arg.stack,
              ...(arg as any) // Include other properties safely
            };
          }
          // For other objects, we use safeStringify if they look like they might be circular
          // or just let the original console handle it if we're in a real browser.
          // However, in AI Studio, we should be extra careful.
          try {
            // We don't stringify here, we just return a "cleaned" version of the object
            // that JSON.stringify (used by the platform) can handle.
            return JSON.parse(safeStringify(arg));
          } catch (e) {
            return '[Serialization Failed]';
          }
        }
        return arg;
      });
      return original.apply(console, safeArgs);
    };
  });

  (window as any).__console_patched = true;
}

/**
 * Safely set an item in localStorage, handling QuotaExceededError.
 * If the quota is exceeded, it attempts to clear caches and non-essential data.
 */
export function safeLocalStorageSetItem(key: string, value: string): void {
  const trySet = (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (trySet(key, value)) return;

  const valueSize = value.length;
  console.warn(`LocalStorage quota exceeded for key: ${key}. Value size: ${valueSize} chars. Attempting to clear space...`);

  // Tier 1: Non-essential caches
  const tier1Keys = [
    'cached_posts',
    'cached_stories',
    'avalon_restaurant_cart',
    'avalon_mercato_cart',
    'avalon_assisto_cart',
    'avalon_driver_cart',
    'avalon_deals_cart',
    'avalon_bookings',
    'avalon_join_requests'
  ];

  tier1Keys.forEach(k => {
    if (k !== key) localStorage.removeItem(k);
  });

  if (trySet(key, value)) {
    console.log(`Successfully set ${key} after clearing Tier 1 caches.`);
    return;
  }

  // Tier 2: UI state and tabs
  const tier2Keys = [
    'freshmart_active_tab',
    'freshmart_viewing_category',
    'delivery_active_tab',
    'mercato_active_tab',
    'assisto_active_tab',
    'app_active_tab',
    'app_profile_tab'
  ];

  tier2Keys.forEach(k => {
    if (k !== key) localStorage.removeItem(k);
  });

  if (trySet(key, value)) {
    console.log(`Successfully set ${key} after clearing Tier 2 UI state.`);
    return;
  }

  // Tier 3: Clear everything except the key we're trying to set and critical profile info
  console.warn(`Tier 2 clear failed for ${key}. Clearing all non-critical localStorage...`);
  const criticalKeys = [key, 'active_profile_id', 'current_city', 'current_region'];
  
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(k => {
    if (!criticalKeys.includes(k)) {
      localStorage.removeItem(k);
    }
  });

  if (trySet(key, value)) {
    console.log(`Successfully set ${key} after emergency clear.`);
  } else {
    // Final attempt: clear EVERYTHING
    console.error(`Emergency clear failed for ${key}. Clearing EVERYTHING...`);
    localStorage.clear();
    if (trySet(key, value)) {
      console.log(`Successfully set ${key} after total clear.`);
    } else {
      console.error(`FATAL: Could not set ${key} even after total localStorage clear.`);
    }
  }
}
