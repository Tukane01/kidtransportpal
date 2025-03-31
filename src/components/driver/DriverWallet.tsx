
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useRide } from "@/context/RideContext";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, BanknoteIcon, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

const DriverWallet: React.FC = () => {
  const { currentUser } = useAuth();
  const { rides } = useRide();
  const [amount, setAmount] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  
  // Mock transactions data (in a real app, this would come from an API)
  const recentTransactions: Transaction[] = [
    {
      id: "tx1",
      type: "credit",
      amount: 150.00,
      description: "Ride payment",
      date: new Date(2023, 8, 15).toISOString(),
    },
    {
      id: "tx2",
      type: "credit",
      amount: 120.50,
      description: "Ride payment",
      date: new Date(2023, 8, 14).toISOString(),
    },
    {
      id: "tx3",
      type: "debit",
      amount: 200.00,
      description: "Withdrawal to bank account",
      date: new Date(2023, 8, 10).toISOString(),
    },
    {
      id: "tx4",
      type: "credit",
      amount: 180.75,
      description: "Ride payment",
      date: new Date(2023, 8, 8).toISOString(),
    },
  ];
  
  // Calculate statistics
  const totalEarnings = rides
    .filter(ride => ride.status === "completed" && ride.driverId)
    .reduce((total, ride) => total + ride.price, 0);
  
  const weeklyEarnings = rides
    .filter(ride => {
      const rideDate = new Date(ride.pickupTime);
      const now = new Date();
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return (
        ride.status === "completed" && 
        ride.driverId && 
        rideDate >= oneWeekAgo
      );
    })
    .reduce((total, ride) => total + ride.price, 0);
  
  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (withdrawAmount > (currentUser?.walletBalance || 0)) {
      toast.error("Insufficient funds in your wallet");
      return;
    }
    
    setIsWithdrawing(true);
    
    // Simulate withdrawal process
    setTimeout(() => {
      toast.success(`R${withdrawAmount.toFixed(2)} successfully withdrawn to your bank account`);
      setIsWithdrawing(false);
      setAmount("");
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Wallet</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-gradient-to-r from-schoolride-primary to-schoolride-secondary rounded-lg text-white p-6">
                <div className="mb-4">
                  <Wallet className="h-10 w-10 opacity-80" />
                </div>
                <div className="text-sm opacity-80">Available Balance</div>
                <div className="text-3xl font-bold mt-1">
                  R {currentUser?.walletBalance || 0}.00
                </div>
                <div className="text-sm opacity-80 mt-1">
                  {currentUser?.email}
                </div>
                <Button className="mt-4 bg-white text-schoolride-primary hover:bg-gray-100">
                  Add Money
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <h3 className="text-xl font-bold mt-1">R {totalEarnings.toFixed(2)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <h3 className="text-xl font-bold mt-1">R {weeklyEarnings.toFixed(2)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BanknoteIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Withdraw Money</CardTitle>
                  <CardDescription>
                    Transfer funds to your bank account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (R)</Label>
                      <Input
                        id="amount"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleWithdraw} 
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? "Processing..." : "Withdraw to Bank Account"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="earnings">Earnings</TabsTrigger>
                      <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="mt-4 space-y-2">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id}>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                transaction.type === "credit" 
                                  ? "bg-green-100" 
                                  : "bg-orange-100"
                              }`}>
                                {transaction.type === "credit" ? (
                                  <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                                ) : (
                                  <ArrowDownRight className={`h-4 w-4 text-orange-600`} />
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="font-medium text-sm">
                                  {transaction.description}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.date), "dd MMM yyyy")}
                                </div>
                              </div>
                            </div>
                            
                            <div className={`font-medium ${
                              transaction.type === "credit" 
                                ? "text-green-600" 
                                : "text-orange-600"
                            }`}>
                              {transaction.type === "credit" ? "+" : "-"}
                              R {transaction.amount.toFixed(2)}
                            </div>
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="earnings" className="mt-4 space-y-2">
                      {recentTransactions
                        .filter((t) => t.type === "credit")
                        .map((transaction) => (
                          <div key={transaction.id}>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100">
                                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium text-sm">
                                    {transaction.description}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(transaction.date), "dd MMM yyyy")}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="font-medium text-green-600">
                                +R {transaction.amount.toFixed(2)}
                              </div>
                            </div>
                            <Separator />
                          </div>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="withdrawals" className="mt-4 space-y-2">
                      {recentTransactions
                        .filter((t) => t.type === "debit")
                        .map((transaction) => (
                          <div key={transaction.id}>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-orange-100">
                                  <ArrowDownRight className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium text-sm">
                                    {transaction.description}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(transaction.date), "dd MMM yyyy")}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="font-medium text-orange-600">
                                -R {transaction.amount.toFixed(2)}
                              </div>
                            </div>
                            <Separator />
                          </div>
                        ))}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4 text-center">
                    <Button variant="link" size="sm">
                      View All Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your bank accounts for withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">Standard Bank</div>
                        <div className="text-sm text-muted-foreground">
                          ****6789 · Savings Account
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Add New Bank Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverWallet;
