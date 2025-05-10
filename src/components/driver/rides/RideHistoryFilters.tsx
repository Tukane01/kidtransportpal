
import React from 'react';
import { format } from 'date-fns';
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
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface RideHistoryFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedRide: string | null;
  setSelectedRide: (status: string | null) => void;
  exportFormat: "pdf" | "csv";
  setExportFormat: (format: "pdf" | "csv") => void;
  handleExport: () => void;
  hasRides: boolean;
}

const RideHistoryFilters: React.FC<RideHistoryFiltersProps> = ({
  dateRange,
  setDateRange,
  selectedRide,
  setSelectedRide,
  exportFormat,
  setExportFormat,
  handleExport,
  hasRides
}) => {
  return (
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
          disabled={!hasRides}
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default RideHistoryFilters;
