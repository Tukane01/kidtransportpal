
import React, { useState, useEffect } from 'react';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useRide } from '@/context/ride';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import RidesList from '../driver/rides/RidesList';

const ParentRideHistory = () => {
  const { rides, fetchRidesByParentId } = useRide();
  const { profile } = useSupabaseAuth();
  const [filteredRides, setFilteredRides] = useState([]);
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
                    {dateRange.from.toLocaleDateString()} -{" "}
                    {dateRange.to.toLocaleDateString()}
                  </>
                ) : (
                  dateRange.from.toLocaleDateString()
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
      
      <RidesList rides={filteredRides} isLoading={isLoading} />
    </div>
  );
};

export default ParentRideHistory;
