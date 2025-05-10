
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface MapProps {
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  className?: string;
}

// Map component that uses Google Maps API
const Map: React.FC<MapProps> = ({ startLocation, endLocation, currentLocation, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // Check if the Google Maps API is loaded
    if (!window.google || !mapRef.current) {
      // If not loaded, load a mock map instead
      renderMockMap();
      return;
    }

    // Initialize the map
    const mapOptions: google.maps.MapOptions = {
      center: startLocation || { lat: -33.918861, lng: 18.423300 },
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      fullscreenControl: false
    };

    // Create a new map instance
    const mapInstance = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = mapInstance;

    // Clear any existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers if locations are provided
    if (startLocation) {
      const startMarker = new google.maps.Marker({
        position: startLocation,
        map: mapInstance,
        title: "Pickup",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4361EE",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2
        }
      });
      markersRef.current.push(startMarker);
    }

    if (endLocation) {
      const endMarker = new google.maps.Marker({
        position: endLocation,
        map: mapInstance,
        title: "Dropoff",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#F72585",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2
        }
      });
      markersRef.current.push(endMarker);
    }

    if (currentLocation) {
      const currentMarker = new google.maps.Marker({
        position: currentLocation,
        map: mapInstance,
        title: "Current Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4CC9F0",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2
        }
      });
      markersRef.current.push(currentMarker);
    }

    // Draw route if start and end locations are provided
    if (startLocation && endLocation) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4361EE',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
      
      directionsRenderer.setMap(mapInstance);
      
      directionsService.route({
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK && response) {
          directionsRenderer.setDirections(response);
          
          // Fit the map to the route bounds
          if (response.routes[0].bounds) {
            mapInstance.fitBounds(response.routes[0].bounds);
          }
        }
      });
    }
    
    return () => {
      // Clean up
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [startLocation, endLocation, currentLocation]);

  // Fallback function to render a mock map when Google Maps API is not available
  const renderMockMap = () => {
    if (!mapRef.current) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = mapRef.current.clientWidth;
    canvas.height = mapRef.current.clientHeight;
    
    // Draw mock map
    ctx.fillStyle = "#e6e8eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines to make it look like a map
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 20; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let i = 20; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    // Draw route if start and end locations are provided
    if (startLocation && endLocation) {
      const startX = canvas.width * 0.2;
      const startY = canvas.height * 0.7;
      const endX = canvas.width * 0.8;
      const endY = canvas.height * 0.3;
      
      // Draw route path
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + (endX - startX) * 0.4,
        startY - 50,
        startX + (endX - startX) * 0.6,
        endY + 50,
        endX,
        endY
      );
      ctx.strokeStyle = "#4361EE";
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Draw start marker
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#4361EE";
      ctx.fill();
      
      // Draw end marker
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#F72585";
      ctx.fill();
      
      // Draw current location if available
      if (currentLocation) {
        const currentX = startX + (endX - startX) * 0.4;
        const currentY = startY - 20;
        
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#4CC9F0";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Add map to DOM
    mapRef.current.innerHTML = "";
    mapRef.current.appendChild(canvas);
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[200px] flex items-center justify-center text-gray-400"
      >
        Loading map...
      </div>
      <div className="p-2 text-xs text-center text-muted-foreground">
        Map visualization
      </div>
    </Card>
  );
};

export default Map;
