
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Helper function to check if device is mobile
    const checkIsMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT;
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
    
    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isMobile;
}
