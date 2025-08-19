// First, you need to install the xlsx library
// Run: npm install xlsx

import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel file from provided data
 * @param {Array} data - Array of objects to be exported
 * @param {String} fileName - Name of the file to be downloaded
 */
export const generateExcel = (data, fileName) => {
  // Check if data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export');
    return;
  }

  try {
    // Convert file attachments to strings (if any)
    const processedData = data.map(item => {
      const newItem = { ...item };
      
      // Handle file attachments - just save the file name
      if (newItem.ticketCopy && newItem.ticketCopy instanceof File) {
        newItem.ticketCopy = newItem.ticketCopy.name;
      }
      
      return newItem;
    });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, fileName);
    
    console.log(`Successfully exported ${data.length} records to ${fileName}`);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    alert('Failed to export data. Please try again.');
  }
};