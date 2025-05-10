
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Ride } from '@/types/ride';

// Add jsPDF type extension
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToExcel = (filteredRides: Ride[]) => {
  const data = filteredRides.map(ride => ({
    Date: format(parseISO(ride.pickupTime), 'yyyy-MM-dd'),
    Time: format(parseISO(ride.pickupTime), 'h:mm a'),
    From: ride.pickupAddress,
    To: ride.dropoffAddress,
    Status: ride.status,
    Parent: ride.parentName || 'Unknown',
    Price: `R${ride.price.toFixed(2)}`
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rides");
  
  // Generate filename with current date
  const fileName = `ride_history_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToPDF = (filteredRides: Ride[], dateRange: any, selectedRide: string | null) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Ride History", 14, 22);
  
  // Add filter info
  doc.setFontSize(11);
  const filterText = [];
  if (dateRange?.from) filterText.push(`From: ${format(dateRange.from, 'yyyy-MM-dd')}`);
  if (dateRange?.to) filterText.push(`To: ${format(dateRange.to, 'yyyy-MM-dd')}`);
  if (selectedRide && selectedRide !== 'all') filterText.push(`Status: ${selectedRide}`);
  if (filterText.length > 0) {
    doc.text(`Filters: ${filterText.join(', ')}`, 14, 30);
  }
  
  // Add table
  const tableColumn = ["Date", "Time", "From", "To", "Status", "Parent", "Price"];
  const tableRows = filteredRides.map(ride => [
    format(parseISO(ride.pickupTime), 'yyyy-MM-dd'),
    format(parseISO(ride.pickupTime), 'h:mm a'),
    ride.pickupAddress.substring(0, 20) + (ride.pickupAddress.length > 20 ? "..." : ""),
    ride.dropoffAddress.substring(0, 20) + (ride.dropoffAddress.length > 20 ? "..." : ""),
    ride.status,
    ride.parentName || 'Unknown',
    `R${ride.price.toFixed(2)}`,
  ]);
  
  // Use doc.autoTable correctly
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
