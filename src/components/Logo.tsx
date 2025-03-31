
import React from "react";

interface LogoProps {
  className?: string;
  simpleLogo?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", simpleLogo = false }) => {
  if (simpleLogo) {
    return (
      <div className={`text-schoolride-primary font-bold text-2xl ${className}`}>
        SchoolRide
      </div>
    );
  }

  return (
    <div className={`font-heading ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 55C25 47.268 31.268 41 39 41H81C88.732 41 95 47.268 95 55V65C95 67.761 92.761 70 90 70H30C27.239 70 25 67.761 25 65V55Z"
          fill="#4361EE"
        />
        <path
          d="M35 30C35 25.582 38.582 22 43 22H77C81.418 22 85 25.582 85 30V42H35V30Z"
          fill="#4CC9F0"
        />
        <circle cx="43" cy="55" r="5" fill="#F8F9FA" />
        <circle cx="77" cy="55" r="5" fill="#F8F9FA" />
        <path
          d="M45 15H75L70 22H50L45 15Z"
          fill="#3F37C9"
        />
        <rect x="55" y="10" width="10" height="5" fill="#F72585" />
      </svg>
      <div className="text-xl font-bold text-schoolride-primary mt-2">SchoolRideApp</div>
    </div>
  );
};

export default Logo;
