
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Helper function to check if device is mobile
    const checkIsMobile = () => {
      return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
    };

    // Set initial value
    setIsMobile(checkIsMobile());
    
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    
    // Add event listener for resize
    window.addEventListener("resize", handleResize);
    
    // Also listen for orientation changes on mobile devices
    window.addEventListener("orientationchange", handleResize);
    
    // Check if device has touch capability
    const hasTouchScreen = () => {
      if ("maxTouchPoints" in navigator) {
        return navigator.maxTouchPoints > 0;
      } else if ("msMaxTouchPoints" in navigator) {
        return (navigator as any).msMaxTouchPoints > 0;
      } else {
        const mQ = typeof window !== "undefined" && 
          window.matchMedia && window.matchMedia("(pointer:coarse)");
        if (mQ && mQ.media === "(pointer:coarse)") {
          return !!mQ.matches;
        } else if ("orientation" in window) {
          return true; // Deprecated, but good fallback
        } else {
          // Only as a last resort, fall back to user agent
          const UA = navigator.userAgent;
          return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
        }
      }
    };

    // If it's a touch device with small viewport, consider it mobile
    if (hasTouchScreen() && window.innerWidth < 1024) {
      setIsMobile(true);
    }
    
    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isMobile;
}
