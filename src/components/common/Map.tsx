
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface MapProps {
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  className?: string;
}

// Mock Map component - in a real app this would use Google Maps API
const Map: React.FC<MapProps> = ({ startLocation, endLocation, currentLocation, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // In a real implementation, this would initialize Google Maps
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
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }
    };
  }, [startLocation, endLocation, currentLocation]);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[200px] flex items-center justify-center text-gray-400"
      >
        Loading map...
      </div>
      <div className="p-2 text-xs text-center text-muted-foreground">
        Map visualization (Google Maps API would be used in production)
      </div>
    </Card>
  );
};

export default Map;
