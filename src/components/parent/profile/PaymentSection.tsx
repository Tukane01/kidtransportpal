
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const PaymentSection: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900">Payment Methods</CardTitle>
          <Button className="bg-schoolride-primary hover:bg-schoolride-secondary text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10">
          <p className="text-gray-700">No payment methods added yet</p>
          <Button variant="link" className="text-schoolride-primary">
            Add your first payment method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
