
// Get Google Maps API key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Function to load Google Maps API dynamically
export const loadGoogleMapsAPI = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    
    // Create script element to load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
};

export const generateMockRoute = (from: string, to: string) => {
  if (window.google && GOOGLE_MAPS_API_KEY) {
    // Use Google Maps Directions API for real routes
    return new Promise((resolve) => {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route({
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK && response) {
          const route = response.routes[0].legs[0];
          
          resolve({
            distance: route.distance,
            duration: route.duration,
            startLocation: {
              lat: route.start_location.lat(),
              lng: route.start_location.lng()
            },
            endLocation: {
              lat: route.end_location.lat(),
              lng: route.end_location.lng()
            },
            polyline: response.routes[0].overview_polyline
          });
        } else {
          // Fallback to mock data if directions request fails
          fallbackMockRoute(resolve);
        }
      });
    });
  }
  
  // If Google Maps API is not available, use mock data
  return new Promise((resolve) => {
    fallbackMockRoute(resolve);
  });
};

const fallbackMockRoute = (resolve: any) => {
  resolve({
    distance: {
      text: `${Math.floor(Math.random() * 10) + 2} km`,
      value: Math.floor(Math.random() * 10000) + 2000,
    },
    duration: {
      text: `${Math.floor(Math.random() * 20) + 10} mins`,
      value: Math.floor(Math.random() * 1200) + 600,
    },
    startLocation: {
      lat: -33.918861 + Math.random() * 0.1,
      lng: 18.423300 + Math.random() * 0.1,
    },
    endLocation: {
      lat: -33.918861 + Math.random() * 0.1,
      lng: 18.423300 + Math.random() * 0.1,
    },
    polyline: "", // Empty for mock data
  });
};

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    }
  });
};

export const generateMockLocation = (
  startLoc: { lat: number; lng: number },
  endLoc: { lat: number; lng: number },
  progress: number
) => {
  // Linear interpolation between start and end based on progress (0-1)
  const lat = startLoc.lat + (endLoc.lat - startLoc.lat) * progress;
  const lng = startLoc.lng + (endLoc.lng - startLoc.lng) * progress;
  
  return { lat, lng };
};

// Initialize Google Maps API when the file is imported
if (typeof window !== 'undefined') {
  loadGoogleMapsAPI().catch(err => {
    console.warn('Failed to load Google Maps API:', err);
  });
}
