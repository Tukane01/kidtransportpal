
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase, handleDatabaseError } from "@/integrations/supabase/client";

// Define validation schema for payment method
const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19, "Card number is too long"),
  cardholderName: z.string().min(3, "Cardholder name is required"),
  expiryDate: z.string().min(5, "Expiry date is required").max(5, "Expiry date format should be MM/YY"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV is too long")
});

interface PaymentMethod {
  id: string;
  user_id: string;
  card_number: string;
  cardholder_name: string;
  expiry_date: string;
  last_four: string;
  created_at: string;
}

const PaymentSection: React.FC = () => {
  const isMobile = useIsMobile();
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { profile } = useSupabaseAuth();
  
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      cvv: ""
    }
  });

  React.useEffect(() => {
    if (profile?.id) {
      fetchPaymentMethods();
    }
  }, [profile?.id]);
  
  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      // This query would need a payment_methods table to be created in the database
      // This is just a placeholder for now, as the table doesn't exist yet
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', profile?.id || '');
      
      if (error) {
        throw error;
      }
      
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      // Don't show error toast since the table might not exist yet
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPayment = () => {
    setIsAddingPayment(true);
  };
  
  const handleCancelAddPayment = () => {
    setIsAddingPayment(false);
    form.reset();
  };
  
  const onSubmitPayment = async (values: z.infer<typeof paymentSchema>) => {
    try {
      setIsLoading(true);
      
      // Mask card number for security
      const lastFour = values.cardNumber.slice(-4);
      const maskedCardNumber = "*".repeat(values.cardNumber.length - 4) + lastFour;
      
      // This would insert into the payment_methods table if it existed
      // For now, we'll just show a success message
      /* 
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: profile?.id,
          card_number: maskedCardNumber,
          cardholder_name: values.cardholderName,
          expiry_date: values.expiryDate,
          last_four: lastFour
        });
      
      if (error) throw error;
      */
      
      setIsAddingPayment(false);
      form.reset();
      toast.success("Payment method would be added. Feature coming soon!");
      // After adding, refresh the list
      // fetchPaymentMethods();
    } catch (error: any) {
      handleDatabaseError(error, "Add payment method");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <CardTitle className="text-gray-900">Payment Methods</CardTitle>
          {!isAddingPayment && (
            <Button 
              className="bg-schoolride-primary hover:bg-schoolride-secondary text-white w-full sm:w-auto"
              onClick={handleAddPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Add Payment
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAddingPayment ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPayment)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="1234 5678 9012 3456" 
                        className="bg-white text-gray-800 border-gray-300" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Cardholder Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="John Doe" 
                        className="bg-white text-gray-800 border-gray-300" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="MM/YY" 
                          className="bg-white text-gray-800 border-gray-300" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">CVV</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="123" 
                          type="password"
                          className="bg-white text-gray-800 border-gray-300" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelAddPayment}
                  className="border-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-schoolride-primary hover:bg-schoolride-secondary text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Payment Method"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{method.cardholder_name}</p>
                  <p className="text-sm text-gray-600">**** **** **** {method.last_four}</p>
                  <p className="text-xs text-gray-500">Expires: {method.expiry_date}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    toast.info("Delete functionality coming soon");
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-10">
            <p className="text-gray-700 mb-2">No payment methods added yet</p>
            <Button 
              variant="link" 
              className="text-schoolride-primary"
              onClick={handleAddPayment}
              disabled={isLoading}
            >
              Add your first payment method
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
