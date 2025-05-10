
import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useRide } from '@/context/ride';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import RideHistoryFilters from './rides/RideHistoryFilters';
import RidesList from './rides/RidesList';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

const DriverRideHistory = () => {
  const { rides, fetchRidesByDriverId } = useRide();
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
          await fetchRidesByDriverId(profile.id);
        } catch (error) {
          console.error('Error fetching rides:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadRides();
  }, [profile, fetchRidesByDriverId]);

  useEffect(() => {
    if (rides?.length) {
      let filtered = [...rides];
      
      if (dateRange?.from) {
        filtered = filtered.filter(ride => {
          const rideDate = new Date(ride.pickupTime);
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
      
      <RideHistoryFilters 
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedRide={selectedRide}
        setSelectedRide={setSelectedRide}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        handleExport={handleExport}
        hasRides={filteredRides.length > 0}
      />
      
      <RidesList rides={filteredRides} isLoading={isLoading} />
    </div>
  );
};

export default DriverRideHistory;
