
// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Mock function to send OTP via SMS
export const sendOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
  // In a real app, this would call an API to send SMS
  console.log(`Sending OTP ${otp} to ${phoneNumber}`);
  
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return true;
};

// Verify the OTP
export const verifyOTP = (inputOtp: string, actualOtp: string): boolean => {
  return inputOtp === actualOtp;
};
