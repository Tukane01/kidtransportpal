import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
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
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Ride } from '@/types/ride';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

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
    </Card>
  );
};

const ParentRideHistory = () => {
  const { rides, fetchRidesByParentId } = useRide();
  const { profile } = useSupabaseAuth();
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
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
      
      if (dateRange?.from) {
        filtered = filtered.filter(ride => {
          const rideDate = parseISO(ride.pickupTime);
          return rideDate >= dateRange.from && 
                 (!dateRange.to || rideDate <= dateRange.to);
        });
      }
      
      if (selectedRide && selectedRide !== 'all') {
        filtered = filtered.filter(ride => ride.status === selectedRide);
      }
      
      setFilteredRides(filtered);
    } else {
      setFilteredRides([]);
    }
  }, [rides, dateRange, selectedRide]);

  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportToPDF(filteredRides, dateRange, selectedRide);
    } else {
      exportToExcel(filteredRides);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ride History</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
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
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        <Select 
          value={selectedRide || 'all'} 
          onValueChange={setSelectedRide}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rides</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={exportFormat} 
            onValueChange={(value) => setExportFormat(value as "pdf" | "csv")}
          >
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={filteredRides.length === 0}
          >
            Export
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
