
// This is a mock implementation for Google authentication
// In a real app, this would use Firebase Auth or similar service

export const googleSignIn = async (): Promise<{
  success: boolean;
  user?: {
    email: string;
    name: string;
    profilePicture?: string;
  };
  error?: string;
}> => {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In a real implementation, this would open the Google sign-in popup
    // and handle the authentication flow
    
    // For demo, we'll just return a mock successful response
    return {
      success: true,
      user: {
        email: "demo.user@gmail.com",
        name: "Demo User",
        profilePicture: "https://i.pravatar.cc/150?img=3",
      },
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return {
      success: false,
      error: "Failed to sign in with Google. Please try again.",
    };
  }
};

// Helper function to validate South African ID numbers
export const validateSouthAfricanID = (idNumber: string): {
  valid: boolean;
  gender?: "male" | "female";
  age?: number;
  citizenshipStatus?: "citizen" | "permanent-resident";
  luhnValid?: boolean;
} => {
  if (!/^\d{13}$/.test(idNumber)) {
    return { valid: false };
  }
  
  // Extract components
  const yearPrefix = parseInt(idNumber.substring(0, 2));
  const monthCode = parseInt(idNumber.substring(2, 4));
  const dayCode = parseInt(idNumber.substring(4, 6));
  const genderCode = parseInt(idNumber.substring(6, 10));
  const citizenshipCode = parseInt(idNumber.substring(10, 11));
  
  // Validate components
  if (monthCode < 1 || monthCode > 12) {
    return { valid: false };
  }
  
  if (dayCode < 1 || dayCode > 31) {
    return { valid: false };
  }
  
  // Determine gender
  const gender = genderCode < 5000 ? "female" : "male";
  
  // Determine citizenship
  const citizenshipStatus = citizenshipCode === 0 ? "citizen" : "permanent-resident";
  
  // Verify Luhn algorithm
  let sum = 0;
  let alternate = false;
  for (let i = idNumber.length - 1; i >= 0; i--) {
    let n = parseInt(idNumber.substring(i, i + 1));
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }
  const luhnValid = sum % 10 === 0;
  
  // Determine birth year (assuming current century if the person would be less than 100)
  const currentYear = new Date().getFullYear();
  const century = currentYear - (currentYear % 100);
  let birthYear = yearPrefix;
  
  if (birthYear > (currentYear % 100)) {
    birthYear = birthYear + (century - 100);
  } else {
    birthYear = birthYear + century;
  }
  
  // Calculate age
  const birthDate = new Date(birthYear, monthCode - 1, dayCode);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return {
    valid: luhnValid,
    gender,
    age,
    citizenshipStatus,
    luhnValid,
  };
};
