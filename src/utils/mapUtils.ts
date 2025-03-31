
export const generateMockRoute = (from: string, to: string) => {
  // This would be replaced with actual Google Maps API in a real application
  return {
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
    polyline: "", // Would contain encoded path in real app
  };
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
