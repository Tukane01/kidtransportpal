
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const PaymentSection: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <CardTitle className="text-gray-900">Payment Methods</CardTitle>
          <Button className="bg-schoolride-primary hover:bg-schoolride-secondary text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 sm:py-10">
          <p className="text-gray-700 mb-2">No payment methods added yet</p>
          <Button variant="link" className="text-schoolride-primary">
            Add your first payment method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
