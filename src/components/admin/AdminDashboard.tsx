
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Download, Users, Car, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRide } from "@/context/RideContext";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  
  // Mock data for demonstration
  const mockUsers = [
    { id: "1", name: "John Smith", role: "parent", joinDate: "2024-04-01", status: "active", children: 2, rides: 12, totalSpent: 1200 },
    { id: "2", name: "Mary Johnson", role: "parent", joinDate: "2024-04-05", status: "active", children: 1, rides: 8, totalSpent: 800 },
    { id: "3", name: "David Wilson", role: "driver", joinDate: "2024-03-15", status: "active", ridesCompleted: 25, earnings: 3000, rating: 4.8 },
    { id: "4", name: "Sarah Lee", role: "driver", joinDate: "2024-03-20", status: "active", ridesCompleted: 18, earnings: 2200, rating: 4.7 },
    { id: "5", name: "Robert Brown", role: "parent", joinDate: "2024-04-10", status: "inactive", children: 3, rides: 4, totalSpent: 400 },
  ];
  
  const mockRides = [
    { id: "1", date: "2024-05-01", parentName: "John Smith", childName: "Emily Smith", driverName: "David Wilson", status: "completed", price: 120 },
    { id: "2", date: "2024-05-02", parentName: "Mary Johnson", childName: "Tom Johnson", driverName: "Sarah Lee", status: "completed", price: 150 },
    { id: "3", date: "2024-05-03", parentName: "John Smith", childName: "Emily Smith", driverName: "David Wilson", status: "completed", price: 120 },
    { id: "4", date: "2024-05-04", parentName: "Robert Brown", childName: "Jack Brown", driverName: "David Wilson", status: "cancelled", price: 135 },
    { id: "5", date: "2024-05-05", parentName: "Mary Johnson", childName: "Tom Johnson", driverName: "Sarah Lee", status: "completed", price: 150 },
  ];
  
  // Filter users based on type
  const filteredUsers = mockUsers.filter(user => {
    if (userTypeFilter === "all") return true;
    return user.role === userTypeFilter;
  });
  
  // Filter rides based on status
  const filteredRides = mockRides.filter(ride => {
    const rideDate = new Date(ride.date);
    const matchesDateRange = rideDate >= dateRange.from && rideDate <= dateRange.to;
    const matchesStatus = statusFilter === "all" ? true : ride.status === statusFilter;
    return matchesDateRange && matchesStatus;
  });
  
  // Calculate summary statistics
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(user => user.status === "active").length;
  const totalParents = mockUsers.filter(user => user.role === "parent").length;
  const totalDrivers = mockUsers.filter(user => user.role === "driver").length;
  const totalRides = mockRides.filter(ride => ride.status === "completed").length;
  const totalRevenue = mockRides
    .filter(ride => ride.status === "completed")
    .reduce((sum, ride) => sum + ride.price, 0);
  
  const handleExportUsers = () => {
    if (exportFormat === "csv") {
      exportUsersToExcel();
    } else {
      exportUsersToPdf();
    }
  };
  
  const handleExportRides = () => {
    if (exportFormat === "csv") {
      exportRidesToExcel();
    } else {
      exportRidesToPdf();
    }
  };
  
  const exportUsersToExcel = () => {
    const data = filteredUsers.map(user => ({
      "Name": user.name,
      "Role": user.role,
      "Join Date": user.joinDate,
      "Status": user.status,
      ...(user.role === "parent" 
        ? { 
            "Children": user.children,
            "Total Rides": user.rides,
            "Total Spent": `R ${user.totalSpent}`,
          }
        : {
            "Rides Completed": user.ridesCompleted,
            "Total Earnings": `R ${user.earnings}`,
            "Rating": user.rating,
          }
      )
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    
    // Generate file name with current date
    const fileName = `users_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  const exportUsersToPdf = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Users Report", 14, 22);
    
    // Add filter info
    doc.setFontSize(11);
    doc.text(`User Type: ${userTypeFilter === "all" ? "All Users" : userTypeFilter}`, 14, 32);
    
    // Add summary
    doc.text(`Total Users: ${totalUsers}`, 14, 40);
    doc.text(`Active Users: ${activeUsers}`, 14, 48);
    doc.text(`Parents: ${totalParents}`, 14, 56);
    doc.text(`Drivers: ${totalDrivers}`, 14, 64);
    
    // Add table
    const tableColumn = ["Name", "Role", "Join Date", "Status", "Details"];
    const tableRows = filteredUsers.map(user => [
      user.name,
      user.role,
      user.joinDate,
      user.status,
      user.role === "parent" 
        ? `Children: ${user.children}, Rides: ${user.rides}`
        : `Rides: ${user.ridesCompleted}, Rating: ${user.rating}`
    ]);
    
    (doc as any).autoTable({
      startY: 72,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [67, 97, 238] },
    });
    
    // Generate file name with current date
    const fileName = `users_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };
  
  const exportRidesToExcel = () => {
    const data = filteredRides.map(ride => ({
      "Date": ride.date,
      "Parent": ride.parentName,
      "Child": ride.childName,
      "Driver": ride.driverName,
      "Status": ride.status,
      "Price": `R ${ride.price}`,
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rides");
    
    // Generate file name with current date
    const fileName = `rides_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  const exportRidesToPdf = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Rides Report", 14, 22);
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Period: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`, 14, 32);
    
    // Add filter info
    doc.text(`Status Filter: ${statusFilter === "all" ? "All Statuses" : statusFilter}`, 14, 40);
    
    // Add summary
    doc.text(`Total Rides: ${totalRides}`, 14, 48);
    doc.text(`Total Revenue: R ${totalRevenue}`, 14, 56);
    
    // Add table
    const tableColumn = ["Date", "Parent", "Child", "Driver", "Status", "Price"];
    const tableRows = filteredRides.map(ride => [
      ride.date,
      ride.parentName,
      ride.childName,
      ride.driverName,
      ride.status,
      `R ${ride.price}`,
    ]);
    
    (doc as any).autoTable({
      startY: 64,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [67, 97, 238] },
    });
    
    // Generate file name with current date
    const fileName = `rides_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-3xl font-bold">{totalUsers}</h3>
            </div>
            <Users className="h-12 w-12 text-schoolride-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Rides</p>
              <h3 className="text-3xl font-bold">{totalRides}</h3>
            </div>
            <Car className="h-12 w-12 text-schoolride-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <h3 className="text-3xl font-bold">{activeUsers}</h3>
            </div>
            <TrendingUp className="h-12 w-12 text-schoolride-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-3xl font-bold">R {totalRevenue}</h3>
            </div>
            <DollarSign className="h-12 w-12 text-schoolride-primary opacity-80" />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="rides">Rides Management</TabsTrigger>
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>User Management</CardTitle>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="parent">Parents</SelectItem>
                      <SelectItem value="driver">Drivers</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Select defaultValue="pdf" onValueChange={(value) => setExportFormat(value as "pdf" | "csv")}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Export" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleExportUsers}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Badge className={user.role === "parent" ? "bg-blue-500" : "bg-green-500"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === "parent" ? (
                          <>Children: {user.children}, Rides: {user.rides}</>
                        ) : (
                          <>Rides: {user.ridesCompleted}, Rating: {user.rating}</>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rides">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Rides Management</CardTitle>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal w-[240px]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange as any}
                          onSelect={(range) => 
                            setDateRange(range as { from: Date; to: Date })
                          }
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inProgress">In Progress</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Select defaultValue="pdf" onValueChange={(value) => setExportFormat(value as "pdf" | "csv")}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Export" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleExportRides}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRides.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell>{ride.date}</TableCell>
                      <TableCell>{ride.parentName}</TableCell>
                      <TableCell>{ride.childName}</TableCell>
                      <TableCell>{ride.driverName}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          ride.status === "completed" ? "bg-green-500" : 
                          ride.status === "inProgress" ? "bg-blue-500" :
                          ride.status === "accepted" ? "bg-yellow-500" :
                          ride.status === "cancelled" ? "bg-red-500" :
                          "bg-gray-500"
                        )}>
                          {ride.status}
                        </Badge>
                      </TableCell>
                      <TableCell>R {ride.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">User Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-xl font-semibold">{totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-xl font-semibold">{activeUsers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Parents</p>
                      <p className="text-xl font-semibold">{totalParents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Drivers</p>
                      <p className="text-xl font-semibold">{totalDrivers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Revenue Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rides</p>
                      <p className="text-xl font-semibold">{totalRides}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-semibold">R {totalRevenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Ride Price</p>
                      <p className="text-xl font-semibold">
                        R {totalRides > 0 ? (totalRevenue / totalRides).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Monthly Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month's Rides</p>
                      <p className="text-xl font-semibold">{totalRides}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Month's Revenue</p>
                      <p className="text-xl font-semibold">R {totalRevenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Month's Rides</p>
                      <p className="text-xl font-semibold">{Math.round(totalRides * 0.8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Month's Revenue</p>
                      <p className="text-xl font-semibold">R {Math.round(totalRevenue * 0.8)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="bg-schoolride-primary hover:bg-schoolride-secondary" onClick={handleExportRides}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Summary Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
