
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Download, Clock, UserCheck, MapPin, Car } from "lucide-react";
import { useRide } from "@/context/RideContext";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { cn } from "@/lib/utils";
import Map from "@/components/common/Map";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ParentRideHistory: React.FC = () => {
  const { rides, fetchRidesByParentId } = useRide();
  const { profile } = useSupabaseAuth();
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [childFilter, setChildFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [childrenOptions, setChildrenOptions] = useState<{id: string, name: string}[]>([]);
  
  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalRides: 0,
    completedRides: 0,
    totalSpent: 0,
    childrenRides: [] as {child: string, count: number, spent: number}[]
  });
  
  useEffect(() => {
    if (profile?.id) {
      fetchRidesByParentId(profile.id)
        .then(() => setLoading(false))
        .catch((error) => {
          console.error("Error fetching rides:", error);
          setLoading(false);
        });
    }
  }, [profile?.id, fetchRidesByParentId]);
  
  useEffect(() => {
    if (!loading) {
      // Extract unique children from rides
      const uniqueChildren = new Map<string, string>();
      rides.forEach(ride => {
        if (ride.childId && ride.childName) {
          uniqueChildren.set(ride.childId, ride.childName);
        }
      });
      
      const options = Array.from(uniqueChildren.entries()).map(([id, name]) => ({
        id,
        name
      }));
      
      setChildrenOptions(options);
      
      // Filter rides
      const filtered = rides.filter(ride => {
        const rideDate = new Date(ride.pickupTime);
        const matchesDateRange = rideDate >= dateRange.from && rideDate <= dateRange.to;
        const matchesChild = childFilter === "all" ? true : ride.childId === childFilter;
        const matchesStatus = statusFilter === "all" ? true : ride.status === statusFilter;
        return matchesDateRange && matchesChild && matchesStatus;
      });
      
      setFilteredRides(filtered);
      
      // Calculate summary statistics
      const completed = filtered.filter(ride => ride.status === "completed");
      const totalSpent = completed.reduce((sum, ride) => sum + ride.price, 0);
      
      // Group by child
      const childrenSummary = new Map<string, {count: number, spent: number}>();
      filtered.forEach(ride => {
        const childName = ride.childName || "Unknown";
        const current = childrenSummary.get(childName) || {count: 0, spent: 0};
        
        current.count += 1;
        if (ride.status === "completed") {
          current.spent += ride.price;
        }
        
        childrenSummary.set(childName, current);
      });
      
      const childrenRides = Array.from(childrenSummary.entries()).map(([child, data]) => ({
        child,
        count: data.count,
        spent: data.spent
      }));
      
      setSummaryData({
        totalRides: filtered.length,
        completedRides: completed.length,
        totalSpent,
        childrenRides
      });
    }
  }, [rides, loading, dateRange, childFilter, statusFilter]);
  
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
      "Child": ride.childName || "N/A",
      "Pickup": ride.pickupAddress,
      "Dropoff": ride.dropoffAddress,
      "Driver": ride.driverName || "Not assigned",
      "Price": `R ${ride.price.toFixed(2)}`,
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rides");
    
    // Generate file name with current date
    const fileName = `ride_history_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
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
    doc.text(`Child Filter: ${childFilter === "all" ? "All Children" : childrenOptions.find(c => c.id === childFilter)?.name || "Unknown"}`, 14, 46);
    
    // Add summary
    doc.text(`Total Rides: ${summaryData.totalRides}`, 14, 54);
    doc.text(`Completed Rides: ${summaryData.completedRides}`, 14, 62);
    doc.text(`Total Spent: R ${summaryData.totalSpent.toFixed(2)}`, 14, 70);
    
    // Add table
    const tableColumn = ["Date", "Time", "Child", "Status", "Pickup", "Dropoff", "Price"];
    const tableRows = filteredRides.map(ride => [
      format(new Date(ride.pickupTime), 'yyyy-MM-dd'),
      format(new Date(ride.pickupTime), 'HH:mm'),
      ride.childName || "N/A",
      ride.status,
      ride.pickupAddress.substring(0, 15) + "...",
      ride.dropoffAddress.substring(0, 15) + "...",
      `R ${ride.price.toFixed(2)}`,
    ]);
    
    (doc as any).autoTable({
      startY: 78,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [67, 97, 238] },
    });
    
    // Generate file name with current date
    const fileName = `ride_history_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Ride History & Reports</h1>
      
      <Tabs defaultValue="rides">
        <TabsList className="mb-4">
          <TabsTrigger value="rides">Ride History</TabsTrigger>
          <TabsTrigger value="summary">Family Summary</TabsTrigger>
          <TabsTrigger value="children">Children Reports</TabsTrigger>
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
                    value={childFilter} 
                    onValueChange={setChildFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Child" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Children</SelectItem>
                      {childrenOptions.map(child => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
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
                        <TableHead>Child</TableHead>
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
                          <TableCell>{ride.childName || "Not specified"}</TableCell>
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
                            <h4 className="font-medium text-muted-foreground mb-2">Driver Information</h4>
                            <div className="flex items-start">
                              <UserCheck className="h-5 w-5 mr-2 mt-0.5" />
                              <div className="font-medium">
                                {rides.find(r => r.id === selectedRide)?.driverName || "Not assigned"}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2">Vehicle Details</h4>
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
              <CardTitle className="text-lg">Family Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Total Rides</div>
                  <div className="text-2xl font-bold">{summaryData.totalRides}</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Completed Rides</div>
                  <div className="text-2xl font-bold">{summaryData.completedRides}</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                  <div className="text-2xl font-bold">R {summaryData.totalSpent.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Rides by Child</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Child</TableHead>
                      <TableHead>Number of Rides</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryData.childrenRides.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.child}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>R {item.spent.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
        
        <TabsContent value="children">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Children Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {childrenOptions.length > 0 ? (
                <div className="space-y-6">
                  {childrenOptions.map((child) => {
                    const childRides = rides.filter(ride => ride.childId === child.id);
                    const completedRides = childRides.filter(ride => ride.status === "completed");
                    
                    return (
                      <div key={child.id} className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">{child.name}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="border rounded-lg p-3 bg-white">
                            <div className="text-sm text-muted-foreground">Total Rides</div>
                            <div className="text-xl font-bold">{childRides.length}</div>
                          </div>
                          
                          <div className="border rounded-lg p-3 bg-white">
                            <div className="text-sm text-muted-foreground">School Trips</div>
                            <div className="text-xl font-bold">{completedRides.length}</div>
                          </div>
                          
                          <div className="border rounded-lg p-3 bg-white">
                            <div className="text-sm text-muted-foreground">Most Recent Ride</div>
                            <div className="text-xl font-bold">
                              {childRides.length > 0 
                                ? format(new Date(childRides[0].pickupTime), "MMM d, yyyy")
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setChildFilter(child.id);
                              const tabTrigger = document.querySelector('[data-value="rides"]') as HTMLButtonElement;
                              if (tabTrigger) tabTrigger.click();
                            }}
                          >
                            View {child.name}'s Rides
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No children found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentRideHistory;
