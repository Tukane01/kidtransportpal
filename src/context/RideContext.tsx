
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface Child {
  id: string;
  name: string;
  surname: string;
  idNumber: string;
  schoolName: string;
  schoolAddress: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  vinNumber: string;
  ownerIdNumber: string;
}

export interface Ride {
  id: string;
  parentId: string;
  childId: string;
  driverId: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: Date;
  status: "requested" | "accepted" | "inProgress" | "completed" | "cancelled";
  otp: string;
  createdAt: Date;
  price: number;
  parentRating?: number;
  driverRating?: number;
  currentLocation?: { lat: number; lng: number };
}

interface RideContextType {
  children: Child[];
  addChild: (child: Omit<Child, "id">) => Promise<boolean>;
  updateChild: (childId: string, data: Partial<Child>) => Promise<boolean>;
  deleteChild: (childId: string) => Promise<boolean>;
  
  cars: Car[];
  addCar: (car: Omit<Car, "id">) => Promise<boolean>;
  updateCar: (carId: string, data: Partial<Car>) => Promise<boolean>;
  deleteCar: (carId: string) => Promise<boolean>;
  
  rides: Ride[];
  requestRide: (rideData: Partial<Ride>) => Promise<boolean>;
  updateRideStatus: (rideId: string, status: Ride["status"]) => Promise<boolean>;
  getCurrentRide: () => Ride | null;
  
  isLoading: boolean;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

// Initial empty data structures
const INITIAL_CHILDREN: Child[] = [];
const INITIAL_CARS: Car[] = [];
const INITIAL_RIDES: Ride[] = [];

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [childrenData, setChildrenData] = useState<Child[]>([...INITIAL_CHILDREN]);
  const [carsData, setCarsData] = useState<Car[]>([...INITIAL_CARS]);
  const [ridesData, setRidesData] = useState<Ride[]>([...INITIAL_RIDES]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize empty data structures
  useEffect(() => {
    if (!currentUser) return;
    
    // In a real app, this would be done through API calls to fetch user-specific data
    setChildrenData([]);
    setCarsData([]);
    setRidesData([]);
  }, [currentUser]);
  
  const addChild = async (child: Omit<Child, "id">): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newChild: Child = {
        ...child,
        id: `child-${Date.now()}`,
      };
      
      setChildrenData(prev => [...prev, newChild]);
      toast.success(`${child.name} has been added successfully`);
      return true;
    } catch (error) {
      console.error("Error adding child:", error);
      toast.error("Failed to add child");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateChild = async (childId: string, data: Partial<Child>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setChildrenData(prev => 
        prev.map(child => 
          child.id === childId ? { ...child, ...data } : child
        )
      );
      
      toast.success("Child information updated");
      return true;
    } catch (error) {
      console.error("Error updating child:", error);
      toast.error("Failed to update child information");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteChild = async (childId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setChildrenData(prev => prev.filter(child => child.id !== childId));
      
      toast.success("Child removed successfully");
      return true;
    } catch (error) {
      console.error("Error deleting child:", error);
      toast.error("Failed to remove child");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const addCar = async (car: Omit<Car, "id">): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newCar: Car = {
        ...car,
        id: `car-${Date.now()}`,
      };
      
      setCarsData(prev => [...prev, newCar]);
      toast.success(`${car.make} ${car.model} has been added successfully`);
      return true;
    } catch (error) {
      console.error("Error adding car:", error);
      toast.error("Failed to add vehicle");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCar = async (carId: string, data: Partial<Car>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setCarsData(prev => 
        prev.map(car => 
          car.id === carId ? { ...car, ...data } : car
        )
      );
      
      toast.success("Vehicle information updated");
      return true;
    } catch (error) {
      console.error("Error updating car:", error);
      toast.error("Failed to update vehicle information");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteCar = async (carId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setCarsData(prev => prev.filter(car => car.id !== carId));
      
      toast.success("Vehicle removed successfully");
      return true;
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to remove vehicle");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestRide = async (rideData: Partial<Ride>): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newRide: Ride = {
        id: `ride-${Date.now()}`,
        parentId: currentUser.id,
        childId: rideData.childId || "",
        driverId: null, // Will be assigned when a driver accepts
        pickupAddress: rideData.pickupAddress || "",
        dropoffAddress: rideData.dropoffAddress || "",
        pickupTime: rideData.pickupTime || new Date(),
        status: "requested",
        otp,
        createdAt: new Date(),
        price: Math.floor(25 + Math.random() * 30), // Random price between 25-55
        ...rideData
      };
      
      setRidesData(prev => [...prev, newRide]);
      
      toast.success("Ride requested successfully");
      return true;
    } catch (error) {
      console.error("Error requesting ride:", error);
      toast.error("Failed to request ride");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateRideStatus = async (rideId: string, status: Ride["status"]): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setRidesData(prev => 
        prev.map(ride => 
          ride.id === rideId 
            ? { 
                ...ride, 
                status,
                // If driver is accepting the ride, assign their ID
                driverId: status === "accepted" && currentUser.role === "driver" 
                  ? currentUser.id 
                  : ride.driverId
              } 
            : ride
        )
      );
      
      let message = "";
      switch (status) {
        case "accepted":
          message = "Ride accepted";
          break;
        case "inProgress":
          message = "Ride started";
          break;
        case "completed":
          message = "Ride completed";
          break;
        case "cancelled":
          message = "Ride cancelled";
          break;
        default:
          message = "Ride status updated";
      }
      
      toast.success(message);
      return true;
    } catch (error) {
      console.error("Error updating ride status:", error);
      toast.error("Failed to update ride status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCurrentRide = (): Ride | null => {
    if (!currentUser) return null;
    
    // Find ride that is in progress or accepted
    const currentRide = ridesData.find(ride => 
      (ride.status === "inProgress" || ride.status === "accepted") &&
      (
        (currentUser.role === "parent" && ride.parentId === currentUser.id) ||
        (currentUser.role === "driver" && ride.driverId === currentUser.id)
      )
    );
    
    return currentRide || null;
  };
  
  const value = {
    children: childrenData,
    addChild,
    updateChild,
    deleteChild,
    
    cars: carsData,
    addCar,
    updateCar,
    deleteCar,
    
    rides: ridesData,
    requestRide,
    updateRideStatus,
    getCurrentRide,
    
    isLoading
  };
  
  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export const useRide = (): RideContextType => {
  const context = useContext(RideContext);
  
  if (context === undefined) {
    throw new Error("useRide must be used within a RideProvider");
  }
  
  return context;
};
