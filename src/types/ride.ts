
export interface Child {
  id: string;
  name: string;
  surname: string;
  schoolAddress: string;
  schoolName: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  color: string;
  registrationNumber: string;
}

export interface Ride {
  id: string;
  parentId: string;
  driverId?: string;
  childId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: string;
  dropoffTime?: string;
  status: "requested" | "accepted" | "inProgress" | "completed" | "cancelled" | "scheduled";
  otp: string;
  price: number;
  driverName?: string;
  driverImage?: string;
  childName?: string;
  parentName?: string;
  parentImage?: string;
  parentPhone?: string;
  driverLocation?: any;
  carDetails?: string;
}

export interface RideRequest {
  parentId: string;
  childId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: Date;
  price?: number;
}
