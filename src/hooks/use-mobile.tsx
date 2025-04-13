
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
    
    // Improved touch screen detection with type safety
    const hasTouchScreen = () => {
      // Use type guard to ensure navigator is defined
      if (typeof navigator !== 'undefined') {
        if ('maxTouchPoints' in navigator) {
          return navigator.maxTouchPoints > 0;
        } else if ('msMaxTouchPoints' in navigator) {
          return (navigator as any).msMaxTouchPoints > 0;
        } else {
          // Fixed userAgent access with proper type checking
          const mobileUA = /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i;
          return navigator.userAgent !== undefined && mobileUA.test(navigator.userAgent);
        }
      }
      return false;
    };

    // If it's a touch device with small viewport, consider it mobile
    if (hasTouchScreen() && window.innerWidth < 1024) {
      setIsMobile(true);
    }
    
    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
