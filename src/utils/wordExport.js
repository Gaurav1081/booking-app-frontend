// Updated wordExport.js - includes new Booking Agent field
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

/**
 * Generates and downloads a Word document for a specific booking
 * @param {Object} bookingData - The booking object to be exported
 * @param {String} fileName - Name of the file to be downloaded (optional)
 */
export const generateWordDocument = async (bookingData, fileName = null) => {
  console.log('Starting Word export for booking:', bookingData?.ticketId);
  console.log('Full booking data:', JSON.stringify(bookingData, null, 2));
  
  // Check if booking data exists
  if (!bookingData) {
    const error = new Error('No booking data available to export');
    console.error('Export error:', error);
    throw error;
  }

  try {
    // Helper function to safely format dates
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        // Handle various date formats
        let date;
        if (typeof dateString === 'string') {
          // Handle formats like "2025-08-13T00:00:00.000Z"
          date = new Date(dateString);
        } else if (dateString instanceof Date) {
          date = dateString;
        } else {
          return String(dateString);
        }
        
        if (isNaN(date.getTime())) {
          return String(dateString);
        }
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.warn('Date formatting error:', error, 'for date:', dateString);
        return String(dateString || 'N/A');
      }
    };

    // Helper function to format booking type
    const formatBookingType = (type) => {
      if (!type) return 'Unknown';
      return String(type).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Helper function to safely convert to string and handle undefined/null
    const safeString = (value) => {
      if (value === null || value === undefined || value === '') return 'N/A';
      return String(value);
    };

    // Helper function to safely get nested properties
    const safeGet = (obj, path, defaultValue = 'N/A') => {
      try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
          if (result === null || result === undefined) {
            return defaultValue;
          }
          result = result[key];
        }
        return result === null || result === undefined ? defaultValue : result;
      } catch (error) {
        console.warn('Error accessing path:', path, 'in object:', obj, 'Error:', error);
        return defaultValue;
      }
    };

    // Helper function to create a table row with better error handling
    const createTableRow = (label, value) => {
      try {
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: safeString(label), bold: true })],
              })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: safeString(value) })],
              })],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        });
      } catch (error) {
        console.error('Error creating table row:', error, 'Label:', label, 'Value:', value);
        // Return a safe fallback row
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: String(label || 'Unknown'), bold: true })],
              })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Error loading data' })],
              })],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        });
      }
    };

    console.log('Creating document structure...');

    // Safely extract booking data with fallbacks
    const ticketId = safeGet(bookingData, 'ticketId', 'Unknown');
    const bookingType = safeGet(bookingData, 'bookingType', 'Unknown');
    const agentName = safeGet(bookingData, 'agentName', 'N/A');
    const bookingAgent = safeGet(bookingData, 'bookingAgent', 'N/A'); // NEW FIELD
    const bookingEntity = safeGet(bookingData, 'bookingEntity', 'N/A');
    const travelerName = safeGet(bookingData, 'travelerName', 'N/A');
    const contact = safeGet(bookingData, 'contact', safeGet(bookingData, 'contactNumber', 'N/A'));
    const email = safeGet(bookingData, 'email', 'N/A');
    const passportNumber = safeGet(bookingData, 'passportNumber', 'N/A');

    // Create basic information rows - always include key fields
    const basicInfoRows = [
      createTableRow("Booking Type", formatBookingType(bookingType)),
      ...(bookingAgent !== 'N/A' ? [createTableRow("Booking Agent", bookingAgent)] : []), // NEW FIELD - Priority position
      ...(agentName !== 'N/A' ? [createTableRow("Agent Name", agentName)] : []),
      createTableRow("Booking Entity", bookingEntity),
      createTableRow("Traveler Name", travelerName),
      createTableRow("Contact Number", contact),
      // Only include optional fields if they have actual values
      ...(email !== 'N/A' ? [createTableRow("Email", email)] : []),
      ...(passportNumber !== 'N/A' ? [createTableRow("Passport Number", passportNumber)] : []),
    ];

    // Create the document with better error handling
    const doc = new Document({
      sections: [{
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: "BOOKING DETAILS",
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Ticket ID
          new Paragraph({
            children: [
              new TextRun({
                text: `Ticket ID: ${ticketId}`,
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Booking Agent Highlight (if available) - NEW SECTION
          ...(bookingAgent !== 'N/A' ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Booking Agent: ${bookingAgent}`,
                  bold: true,
                  size: 20,
                  color: "2E7D32", // Green color for emphasis
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          ] : []),

          // Basic Information Section
          new Paragraph({
            children: [
              new TextRun({
                text: "BASIC INFORMATION",
                bold: true,
                size: 20,
                underline: {},
              }),
            ],
            spacing: { before: 300, after: 200 },
          }),

          // Basic Information Table - Always show this section
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: basicInfoRows,
          }),

          // Service Details Section (if available)
          ...(safeGet(bookingData, 'journeyDetails') !== 'N/A' || 
              safeGet(bookingData, 'hotelName') !== 'N/A' || 
              safeGet(bookingData, 'from') !== 'N/A' ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "SERVICE DETAILS",
                  bold: true,
                  size: 20,
                  underline: {},
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),
          ] : []),

          // Journey Details (if available)
          ...(Array.isArray(bookingData.journeyDetails) ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Journey Details:",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            ...bookingData.journeyDetails.map((journey, index) => {
              try {
                const from = safeGet(journey, 'from', 'Unknown');
                const to = safeGet(journey, 'to', 'Unknown');
                const date = safeGet(journey, 'date', '');
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${from} → ${to}${date ? ` (${date})` : ''}`,
                    }),
                  ],
                  spacing: { after: 50 },
                });
              } catch (error) {
                console.error('Error processing journey detail:', error, journey);
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. Journey information unavailable`,
                    }),
                  ],
                  spacing: { after: 50 },
                });
              }
            }),
          ] : []),

          // Service-specific details table
          ...(safeGet(bookingData, 'from') !== 'N/A' || safeGet(bookingData, 'to') !== 'N/A' ? [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                ...(safeGet(bookingData, 'from') !== 'N/A' ? [createTableRow("From", safeGet(bookingData, 'from'))] : []),
                ...(safeGet(bookingData, 'to') !== 'N/A' ? [createTableRow("To", safeGet(bookingData, 'to'))] : []),
                ...(safeGet(bookingData, 'departureDate') !== 'N/A' ? [createTableRow("Departure Date", safeGet(bookingData, 'departureDate'))] : []),
                ...(safeGet(bookingData, 'returnDate') !== 'N/A' ? [createTableRow("Return Date", safeGet(bookingData, 'returnDate'))] : []),
                ...(safeGet(bookingData, 'hotelName') !== 'N/A' ? [createTableRow("Hotel Name", safeGet(bookingData, 'hotelName'))] : []),
                ...(safeGet(bookingData, 'checkInDate') !== 'N/A' ? [createTableRow("Check-in Date", formatDate(safeGet(bookingData, 'checkInDate')))] : []),
                ...(safeGet(bookingData, 'checkOutDate') !== 'N/A' ? [createTableRow("Check-out Date", formatDate(safeGet(bookingData, 'checkOutDate')))] : []),
                ...(safeGet(bookingData, 'numberOfRooms') !== 'N/A' ? [createTableRow("Number of Rooms", safeGet(bookingData, 'numberOfRooms'))] : []),
                ...(safeGet(bookingData, 'guests') !== 'N/A' ? [createTableRow("Number of Guests", safeGet(bookingData, 'guests'))] : []),
              ].filter(row => row),
            }),
          ] : []),

          // Payment Information Section
          new Paragraph({
            children: [
              new TextRun({
                text: "PAYMENT INFORMATION",
                bold: true,
                size: 20,
                underline: {},
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              ...(safeGet(bookingData, 'amount') !== 'N/A' ? [createTableRow("Amount", `₹${safeGet(bookingData, 'amount')}`)] : []),
              createTableRow("Payment Status", safeGet(bookingData, 'paymentStatus') === 'received' ? 'Received' : 'Not Received'),
              ...(safeGet(bookingData, 'invoiceNumber') !== 'N/A' ? [createTableRow("Invoice Number", safeGet(bookingData, 'invoiceNumber'))] : []),
              ...(safeGet(bookingData, 'paymentMethod') !== 'N/A' ? [createTableRow("Payment Method", safeGet(bookingData, 'paymentMethod'))] : []),
            ].filter(row => row),
          }),

          // Booking Management Section - NEW SECTION
          ...(bookingAgent !== 'N/A' || agentName !== 'N/A' ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "BOOKING MANAGEMENT",
                  bold: true,
                  size: 20,
                  underline: {},
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                ...(bookingAgent !== 'N/A' ? [createTableRow("Booking Agent", bookingAgent)] : []),
                ...(agentName !== 'N/A' ? [createTableRow("Agent Name", agentName)] : []),
                ...(safeGet(bookingData, 'bookingReference') !== 'N/A' ? [createTableRow("Booking Reference", safeGet(bookingData, 'bookingReference'))] : []),
                ...(safeGet(bookingData, 'bookingStatus') !== 'N/A' ? [createTableRow("Booking Status", safeGet(bookingData, 'bookingStatus'))] : []),
              ].filter(row => row),
            }),
          ] : []),

          // Timestamps Section
          new Paragraph({
            children: [
              new TextRun({
                text: "BOOKING TIMESTAMPS",
                bold: true,
                size: 20,
                underline: {},
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow("Submitted At", formatDate(safeGet(bookingData, 'submittedAt'))),
              createTableRow("Last Modified", formatDate(safeGet(bookingData, 'lastModified'))),
              ...(safeGet(bookingData, 'createdAt') !== 'N/A' ? [createTableRow("Created At", formatDate(safeGet(bookingData, 'createdAt')))] : []),
            ],
          }),

          // Additional Notes Section (if available)
          ...(safeGet(bookingData, 'notes') !== 'N/A' || safeGet(bookingData, 'specialRequests') !== 'N/A' ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "ADDITIONAL INFORMATION",
                  bold: true,
                  size: 20,
                  underline: {},
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                ...(safeGet(bookingData, 'notes') !== 'N/A' ? [createTableRow("Notes", safeGet(bookingData, 'notes'))] : []),
                ...(safeGet(bookingData, 'specialRequests') !== 'N/A' ? [createTableRow("Special Requests", safeGet(bookingData, 'specialRequests'))] : []),
                ...(safeGet(bookingData, 'remarks') !== 'N/A' ? [createTableRow("Remarks", safeGet(bookingData, 'remarks'))] : []),
              ].filter(row => row),
            }),
          ] : []),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on ${new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`,
                italics: true,
                size: 18,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          }),

          // Booking Agent Footer (if available) - NEW
          ...(bookingAgent !== 'N/A' ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Processed by: ${bookingAgent}`,
                  italics: true,
                  size: 16,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200 },
            }),
          ] : []),
        ].filter(element => element), // Remove any undefined elements
      }],
    });

    console.log('Document structure created, generating blob...');

    // Generate blob using the browser-compatible method
    const blob = await Packer.toBlob(doc);
    
    console.log('Blob generated successfully, size:', blob.size);

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set filename with safe characters - include booking agent in filename if available
    const safeTicketId = String(ticketId).replace(/[^a-zA-Z0-9\-_]/g, '_');
    const safeBookingAgent = bookingAgent !== 'N/A' ? String(bookingAgent).replace(/[^a-zA-Z0-9\-_]/g, '_') : '';
    const agentSuffix = safeBookingAgent ? `_${safeBookingAgent}` : '';
    const defaultFileName = `booking_${safeTicketId}${agentSuffix}_${new Date().toISOString().split('T')[0]}.docx`;
    link.href = url;
    link.download = fileName || defaultFileName;
    
    console.log('Initiating download with filename:', link.download);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    console.log(`Successfully exported booking ${ticketId} to Word document`);
    return true;
    
  } catch (error) {
    console.error('Detailed error generating Word document:', {
      error: error.message,
      stack: error.stack,
      bookingId: bookingData?.ticketId,
      name: error.name,
      bookingData: bookingData
    });
    
    // Provide more specific error information
    if (error.message.includes('Cannot read properties of undefined')) {
      throw new Error('Data structure issue detected. Some booking properties are missing or undefined. Please check the booking data and try again.');
    } else if (error.message.includes('nodebuffer') || error.message.includes('buffer')) {
      throw new Error('Browser compatibility issue detected. Please ensure you are using the latest version of the docx library and try refreshing the page.');
    } else if (error.message.includes('Packer')) {
      throw new Error('Document generation failed. Please check your booking data and try again.');
    } else {
      throw new Error(`Export failed: ${error.message}`);
    }
  }
};