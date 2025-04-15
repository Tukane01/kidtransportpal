
import { z } from "zod";

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .refine(
    (email) => {
      // Check format and doesn't contain more than three numbers
      const digits = email.replace(/[^0-9]/g, "");
      return email.includes("@") && digits.length <= 3;
    },
    { message: "Email should not contain more than 3 numbers" }
  );

// South African phone number validation
export const phoneSchema = z
  .string()
  .regex(/^0[0-9]{9}$/, "Phone number must start with 0 and be 10 digits long");

// Name validation (at least 3 chars, no numbers)
export const nameSchema = z
  .string()
  .min(3, "Must be at least 3 characters")
  .max(30, "Must be less than 30 characters")
  .refine((name) => !/\d/.test(name), {
    message: "Names cannot contain numbers",
  });

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// South African ID number validation
export const idNumberSchema = z
  .string()
  .length(13, "ID number must be exactly 13 digits")
  .regex(/^\d+$/, "ID number must contain only digits")
  .refine(
    (id) => {
      // Basic South African ID validation

      // Check the format first (13 digits)
      if (!/^\d{13}$/.test(id)) return false;
      
      // Extract birth year, month, and day
      const year = parseInt(id.substring(0, 2));
      const month = parseInt(id.substring(2, 4));
      const day = parseInt(id.substring(4, 6));
      
      // Extract gender digit
      const genderDigit = parseInt(id.substring(6, 10));
      
      // Extract citizenship status
      const citizenshipStatus = parseInt(id.substring(10, 11));
      
      // Validate birth date components
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      
      // Validate citizenship status (0 for SA citizen, 1 for permanent resident)
      if (citizenshipStatus !== 0 && citizenshipStatus !== 1) return false;
      
      // Perform Luhn algorithm check on the full ID number
      let sum = 0;
      let alternate = false;
      for (let i = id.length - 1; i >= 0; i--) {
        let n = parseInt(id.substring(i, i + 1));
        if (alternate) {
          n *= 2;
          if (n > 9) {
            n = (n % 10) + 1;
          }
        }
        sum += n;
        alternate = !alternate;
      }
      
      return sum % 10 === 0;
    },
    { message: "Invalid South African ID number" }
  );

// Vehicle registration number validation
export const vehicleRegSchema = z
  .string()
  .min(5, "Vehicle registration number is too short")
  .max(10, "Vehicle registration number is too long");

// Basic school validation
export const schoolNameSchema = z
  .string()
  .min(3, "School name must be at least 3 characters")
  .max(100, "School name is too long");

// Basic address validation
export const addressSchema = z
  .string()
  .min(10, "Address is too short")
  .max(200, "Address is too long");

// OTP Validation
export const otpSchema = z.string().length(6, "OTP must be 6 digits");

// Helper function to check if a person is within required age range (for ID validation)
export const checkAgeFromIdNumber = (idNumber: string): { isValid: boolean; age: number } => {
  if (!/^\d{13}$/.test(idNumber)) {
    return { isValid: false, age: 0 };
  }

  // Extract birth year, month, and day
  let year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));

  // Determine century
  const currentYear = new Date().getFullYear();
  const century = currentYear - (currentYear % 100);
  
  // If the extracted year is greater than the current year's last two digits,
  // then the person was born in the previous century
  if (year > (currentYear % 100)) {
    year = year + (century - 100);
  } else {
    year = year + century;
  }

  // Create birth date
  const birthDate = new Date(year, month - 1, day);
  
  // Calculate age
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // For drivers: age must be between 25 and 65
  const isValidDriverAge = age >= 25 && age <= 65;
  
  // Return age info
  return { isValid: isValidDriverAge, age };
};

// Function to validate gender from ID number
export const getGenderFromIdNumber = (idNumber: string): "male" | "female" | null => {
  if (!/^\d{13}$/.test(idNumber)) {
    return null;
  }
  
  const genderDigits = parseInt(idNumber.substring(6, 10));
  
  if (genderDigits >= 0 && genderDigits <= 4999) {
    return "female";
  } else if (genderDigits >= 5000 && genderDigits <= 9999) {
    return "male";
  }
  
  return null;
};

// Form schema for parent registration
export const parentRegistrationSchema = z.object({
  name: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  idNumber: idNumberSchema,
  hasChild: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Form schema for driver registration
export const driverRegistrationSchema = z.object({
  name: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  idNumber: idNumberSchema,
  hasCar: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Child registration schema
export const childRegistrationSchema = z.object({
  name: nameSchema,
  surname: nameSchema,
  idNumber: z.string().length(13, "ID number must be exactly 13 digits"),
  schoolName: schoolNameSchema,
  schoolAddress: addressSchema,
});

// Car registration schema
export const carRegistrationSchema = z.object({
  make: z.string().min(2, "Car make is required"),
  model: z.string().min(2, "Car model is required"),
  registrationNumber: vehicleRegSchema,
  color: z.string().min(3, "Car color is required"),
  vinNumber: z.string().min(17, "VIN number must be 17 characters").max(17, "VIN number must be 17 characters"),
  ownerIdNumber: idNumberSchema,
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
