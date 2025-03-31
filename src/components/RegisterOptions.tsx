
import React from "react";
import { Card } from "@/components/ui/card";
import { User, Car } from "lucide-react";

interface RegisterOptionsProps {
  onSelect: (type: "parent" | "driver") => void;
}

const RegisterOptions: React.FC<RegisterOptionsProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-center">I want to register as:</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <Card
          className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-schoolride-primary"
          onClick={() => onSelect("parent")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-schoolride-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-schoolride-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">Parent</h3>
              <p className="text-sm text-muted-foreground">
                Register to request safe rides for your children
              </p>
            </div>
          </div>
        </Card>
        
        <Card
          className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-schoolride-primary"
          onClick={() => onSelect("driver")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-schoolride-primary/10 p-3 rounded-full">
              <Car className="h-6 w-6 text-schoolride-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">Driver</h3>
              <p className="text-sm text-muted-foreground">
                Register to provide safe transportation services
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterOptions;
