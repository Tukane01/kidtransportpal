
import React from "react";

interface LogoProps {
  className?: string;
  simpleLogo?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", simpleLogo = false }) => {
  if (simpleLogo) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src="/lovable-uploads/c699906d-f85e-4efd-adf5-65a19cf3cad9.png" 
          alt="Ride2School Logo" 
          className="h-8 w-auto" 
        />
      </div>
    );
  }

  return (
    <div className={`font-heading flex flex-col items-center ${className}`}>
      <img 
        src="/lovable-uploads/c699906d-f85e-4efd-adf5-65a19cf3cad9.png" 
        alt="Ride2School Logo" 
        className="h-full w-auto max-h-16" 
      />
    </div>
  );
};

export default Logo;
