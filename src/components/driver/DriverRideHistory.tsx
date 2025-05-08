import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Download, Clock, User, MapPin, Car } from "lucide-react";
import { useRide } from "@/context/RideContext";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { cn } from "@/lib/utils";
import Map from "@/components/common/Map";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const DriverRideHistory: React.FC = () => {
  const { rides, fetchRidesByDriverId } = useRide();
  const { profile } = useSupabaseAuth();
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  
  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalRides: 0,
    completedRides: 0,
    totalEarnings: 0,
    averageRating: 0,
    ridesByDay: [] as {date: string, count: number}[]
  });
  
  useEffect(() => {
    if (profile?.id) {
      fetchRidesByDriverId(profile.id)
        .then(() => setLoading(false))
        .catch((error) => {
          console.error("Error fetching rides:", error);
          setLoading(false);
        });
    }
  }, [profile?.id, fetchRidesByDriverId]);
  
  useEffect(() => {
    if (!loading) {
      const filtered = rides.filter(ride => {
        const rideDate = new Date(ride.pickupTime);
        const matchesDateRange = rideDate >= dateRange.from && rideDate <= dateRange.to;
        const matchesStatus = statusFilter === "all" ? true : ride.status === statusFilter;
        return matchesDateRange && matchesStatus;
      });
      
      setFilteredRides(filtered);
      
      // Calculate summary statistics
      const completed = filtered.filter(ride => ride.status === "completed");
      const totalEarnings = completed.reduce((sum, ride) => sum + ride.price, 0);
      
      // Group rides by date for the chart
      const ridesByDayMap = new Map<string, number>();
      filtered.forEach(ride => {
        const dateStr = format(new Date(ride.pickupTime), 'yyyy-MM-dd');
        ridesByDayMap.set(dateStr, (ridesByDayMap.get(dateStr) || 0) + 1);
      });
      
      const ridesByDay = Array.from(ridesByDayMap.entries()).map(([date, count]) => ({
        date,
        count
      }));
      
      setSummaryData({
        totalRides: filtered.length,
        completedRides: completed.length,
        totalEarnings,
        averageRating: 4.5, // Placeholder for now
        ridesByDay
      });
    }
  }, [rides, loading, dateRange, statusFilter]);
  
  const handleExport = () => {
    if (filteredRides.length === 0) return;
    
    if (exportFormat === "csv") {
      exportToExcel();
    } else {
      exportToPdf();
    }
  };
  
  const exportToExcel = () => {
    const data = filteredRides.map(ride => ({
      "Date": format(new Date(ride.pickupTime), 'yyyy-MM-dd'),
      "Time": format(new Date(ride.pickupTime), 'HH:mm'),
      "Status": ride.status,
      "Pickup": ride.pickupAddress,
      "Dropoff": ride.dropoffAddress,
      "Child Name": ride.childName || "N/A",
      "Price": `R ${ride.price.toFixed(2)}`,
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rides");
    
    // Generate file name with current date
    const fileName = `rides_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  const exportToPdf = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Ride History Report", 14, 22);
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Period: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`, 14, 30);
    
    // Add filter info
    doc.text(`Status Filter: ${statusFilter === "all" ? "All Statuses" : statusFilter}`, 14, 38);
    
    // Add summary
    doc.text(`Total Rides: ${summaryData.totalRides}`, 14, 46);
    doc.text(`Completed Rides: ${summaryData.completedRides}`, 14, 54);
    doc.text(`Total Earnings: R ${summaryData.totalEarnings.toFixed(2)}`, 14, 62);
    
    // Add table
    const tableColumn = ["Date", "Time", "Status", "Pickup", "Dropoff", "Price"];
    const tableRows = filteredRides.map(ride => [
      format(new Date(ride.pickupTime), 'yyyy-MM-dd'),
      format(new Date(ride.pickupTime), 'HH:mm'),
      ride.status,
      ride.pickupAddress.substring(0, 20) + "...",
      ride.dropoffAddress.substring(0, 20) + "...",
      `R ${ride.price.toFixed(2)}`,
    ]);
    
    // Fix: Use doc.autoTable directly without casting
    doc.autoTable({
      startY: 70,
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Ride History & Reports</h1>
      
      <Tabs defaultValue="rides">
        <TabsList className="mb-4">
          <TabsTrigger value="rides">Ride History</TabsTrigger>
          <TabsTrigger value="summary">Management Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rides">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-lg">Ride History</CardTitle>
                
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
                      onClick={handleExport}
                      disabled={filteredRides.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading ride history...</div>
              ) : filteredRides.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pickup</TableHead>
                        <TableHead>Dropoff</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRides.map((ride) => (
                        <TableRow key={ride.id} className={cn(
                          "cursor-pointer",
                          selectedRide === ride.id ? "bg-muted" : ""
                        )}>
                          <TableCell>
                            {format(new Date(ride.pickupTime), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(ride.pickupTime), "HH:mm")}
                          </TableCell>
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
                          <TableCell className="max-w-[150px] truncate">
                            {ride.pickupAddress}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {ride.dropoffAddress}
                          </TableCell>
                          <TableCell>R {ride.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRide(selectedRide === ride.id ? null : ride.id)}
                            >
                              {selectedRide === ride.id ? "Hide" : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {selectedRide && (
                    <div className="mt-6 border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-4">Ride Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Pickup Details</h4>
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 mr-2 text-schoolride-primary mt-0.5" />
                              <div>
                                <div className="font-medium">
                                  {rides.find(r => r.id === selectedRide)?.pickupAddress}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {format(new Date(rides.find(r => r.id === selectedRide)?.pickupTime || ""), "PPP")} at {format(new Date(rides.find(r => r.id === selectedRide)?.pickupTime || ""), "p")}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Dropoff Details</h4>
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 mr-2 text-schoolride-accent mt-0.5" />
                              <div>
                                <div className="font-medium">
                                  {rides.find(r => r.id === selectedRide)?.dropoffAddress}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Child Information</h4>
                            <div className="flex items-start">
                              <User className="h-5 w-5 mr-2 mt-0.5" />
                              <div className="font-medium">
                                {rides.find(r => r.id === selectedRide)?.childName || "Not specified"}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Vehicle Used</h4>
                            <div className="flex items-start">
                              <Car className="h-5 w-5 mr-2 mt-0.5" />
                              <div className="font-medium">
                                {rides.find(r => r.id === selectedRide)?.carDetails || "Not specified"}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Map 
                          startLocation={{ lat: 0, lng: 0 }}
                          endLocation={{ lat: 1, lng: 1 }}
                          className="h-[250px]" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No rides found for the selected filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Management Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Total Rides</div>
                  <div className="text-2xl font-bold">{summaryData.totalRides}</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Completed Rides</div>
                  <div className="text-2xl font-bold">{summaryData.completedRides}</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                  <div className="text-2xl font-bold">R {summaryData.totalEarnings.toFixed(2)}</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                  <div className="text-2xl font-bold">{summaryData.averageRating.toFixed(1)}</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Performance by Date</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-muted-foreground">
                    {summaryData.ridesByDay.length > 0 ? (
                      "Bar chart would display here showing rides per day"
                    ) : (
                      "No data available for the selected date range"
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="bg-schoolride-primary hover:bg-schoolride-secondary" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export {exportFormat.toUpperCase()}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverRideHistory;
