import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRide } from '@/context/RideContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Ride item component
const RideItem = ({ ride }) => {
  const date = new Date(ride.pickupTime);
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{format(date, 'MMMM d, yyyy')}</CardTitle>
            <CardDescription>{format(date, 'h:mm a')}</CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            ride.status === 'completed' ? 'bg-green-500' :
            ride.status === 'cancelled' ? 'bg-red-500' :
            ride.status === 'inProgress' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`}>
            {ride.status}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-medium">{ride.pickupAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="font-medium">{ride.dropoffAddress}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Driver</p>
          <p className="font-medium">{ride.driverName || 'Not assigned'}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="font-bold">R{ride.price.toFixed(2)}</p>
        <Button variant="outline" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
};

const ParentRideHistory = () => {
  const { rides, fetchRidesByParentId } = useRide();
  const { profile } = useSupabaseAuth();
  const [filteredRides, setFilteredRides] = useState([]);
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRides = async () => {
      if (profile?.id) {
        try {
          await fetchRidesByParentId(profile.id);
        } catch (error) {
          console.error('Error fetching rides:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadRides();
  }, [profile, fetchRidesByParentId]);

  useEffect(() => {
    if (rides?.length) {
      let filtered = [...rides];
      
      if (date) {
        filtered = filtered.filter(ride => {
          const rideDate = new Date(ride.pickupTime);
          return (
            rideDate.getDate() === date.getDate() &&
            rideDate.getMonth() === date.getMonth() &&
            rideDate.getFullYear() === date.getFullYear()
          );
        });
      }
      
      if (status !== 'all') {
        filtered = filtered.filter(ride => ride.status === status);
      }
      
      setFilteredRides(filtered);
    } else {
      setFilteredRides([]);
    }
  }, [rides, date, status]);

  const exportToExcel = () => {
    const data = filteredRides.map(ride => ({
      Date: format(new Date(ride.pickupTime), 'yyyy-MM-dd'),
      Time: format(new Date(ride.pickupTime), 'h:mm a'),
      From: ride.pickupAddress,
      To: ride.dropoffAddress,
      Status: ride.status,
      Driver: ride.driverName || 'Not assigned',
      Price: `R${ride.price.toFixed(2)}`
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rides");
    
    // Generate filename with current date
    const fileName = `ride_history_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Ride History", 14, 22);
    
    // Add filter info
    doc.setFontSize(11);
    const filterText = [];
    if (date) filterText.push(`Date: ${format(date, 'yyyy-MM-dd')}`);
    if (status !== 'all') filterText.push(`Status: ${status}`);
    if (filterText.length > 0) {
      doc.text(`Filters: ${filterText.join(', ')}`, 14, 30);
    }
    
    // Add table
    const tableColumn = ["Date", "Time", "From", "To", "Status", "Price"];
    const tableRows = filteredRides.map(ride => [
      format(new Date(ride.pickupTime), 'yyyy-MM-dd'),
      format(new Date(ride.pickupTime), 'h:mm a'),
      ride.pickupAddress.substring(0, 20) + (ride.pickupAddress.length > 20 ? "..." : ""),
      ride.dropoffAddress.substring(0, 20) + (ride.dropoffAddress.length > 20 ? "..." : ""),
      ride.status,
      `R${ride.price.toFixed(2)}`,
    ]);
    
    doc.autoTable({
      startY: filterText.length > 0 ? 35 : 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [67, 97, 238] },
    });
    
    // Generate filename with current date
    const fileName = `ride_history_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ride History</h1>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="inProgress">In progress</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={filteredRides.length === 0}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF} disabled={filteredRides.length === 0}>
            Export PDF
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading ride history...</div>
      ) : filteredRides.length > 0 ? (
        <div>
          {filteredRides.map(ride => (
            <RideItem key={ride.id} ride={ride} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No rides found for the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default ParentRideHistory;
