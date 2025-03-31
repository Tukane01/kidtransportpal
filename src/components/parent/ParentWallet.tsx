
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRide } from "@/context/RideContext";
import { format } from "date-fns";

const ParentWallet: React.FC = () => {
  const { currentUser } = useAuth();
  const { rides } = useRide();
  
  // Mock transactions
  const transactions = [
    {
      id: "txn-1",
      type: "deposit",
      amount: 200,
      date: new Date(2023, 5, 15),
      description: "Wallet Top-up"
    },
    {
      id: "txn-2",
      type: "ride",
      amount: -35,
      date: new Date(2023, 5, 18),
      description: "Ride to Springfield Elementary"
    },
    {
      id: "txn-3",
      type: "deposit",
      amount: 300,
      date: new Date(2023, 5, 20),
      description: "Wallet Top-up"
    },
    {
      id: "txn-4",
      type: "ride",
      amount: -35,
      date: new Date(2023, 5, 20),
      description: "Ride to Springfield Elementary"
    }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Wallet</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Balance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-schoolride-primary to-schoolride-secondary rounded-lg text-white p-6">
                <div className="text-sm opacity-80">Available Balance</div>
                <div className="text-3xl font-bold mt-1">R {currentUser?.walletBalance || 0}.00</div>
                <div className="flex justify-between mt-8 pt-4 border-t border-white/20">
                  <div className="text-xs opacity-80">SchoolRide Wallet</div>
                  <div className="text-xs">Last updated: {format(new Date(), "dd MMM yyyy")}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <Button className="bg-schoolride-primary hover:bg-schoolride-secondary">
                  <Plus className="mr-2 h-4 w-4" /> Add Funds
                </Button>
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" /> Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Monthly Spending</div>
                <div className="text-2xl font-bold mt-1">R 105.00</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Rides This Month</div>
                <div className="text-2xl font-bold mt-1">3</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Saved</div>
                <div className="text-2xl font-bold mt-1 text-green-600">R 75.00</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="rides">Rides</TabsTrigger>
              <TabsTrigger value="topups">Top-ups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-6">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === "deposit" ? "bg-green-100" : "bg-schoolride-primary/10"
                      }`}>
                        {transaction.type === "deposit" ? (
                          <ArrowDownLeft className={`h-5 w-5 text-green-600`} />
                        ) : (
                          <ArrowUpRight className={`h-5 w-5 text-schoolride-primary`} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(transaction.date, "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.amount > 0 ? "text-green-600" : ""
                    }`}>
                      {transaction.amount > 0 ? "+" : ""}
                      R {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rides" className="pt-6">
              <div className="space-y-4">
                {transactions.filter(t => t.type === "ride").map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-schoolride-primary/10 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-schoolride-primary" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(transaction.date, "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">
                      R {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="topups" className="pt-6">
              <div className="space-y-4">
                {transactions.filter(t => t.type === "deposit").map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(transaction.date, "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-green-600">
                      +R {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentWallet;
