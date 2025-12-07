import { useState, useEffect, useRef } from 'react';
import FlightBookingForm from './FlightBookingForm';
import HotelBookingForm from './HotelBookingForm';
import AirportTransferForm from './AirportTransferForm';
import CarRentalForm from './CarRentalForm';
import ForexBookingForm from './ForexBookingForm';
import VisaBookingForm from './VisaBookingForm';
import MiscellaneousBookingForm from './MiscellaneousBookingForm';
import { generateWordDocument } from '../utils/wordExport';

const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL 
  : `${import.meta.env.VITE_API_URL}`;


function Search({ bookingData, onUpdateBooking }) {
  const [searchType, setSearchType] = useState('ticketId');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [useBackend, setUseBackend] = useState(true); // Toggle between backend and props
  const bookingDetailsRef = useRef(null); // Ref for booking details section

  // API call helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const config = { ...defaultOptions, ...options };

      if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  };

  // Backend search functions for different booking types
  const searchBookingsByType = async (searchValue, bookingType) => {
    try {
      const endpoint = `/${bookingType}-bookings`;
      
      if (searchType === 'ticketId') {
        try {
          // Try search endpoint first
          const response = await apiCall(`${endpoint}/search/${encodeURIComponent(searchValue)}`);
          return response.success ? [response.data] : [];
        } catch (searchError) {
          console.warn(`Search endpoint not available for ${bookingType}, trying fallback`);
          // Fallback: get all bookings and filter client-side
          const response = await apiCall(endpoint);
          if (response.success) {
            const filtered = filterBookingsBySearchType(response.data, searchValue, 'ticketId');
            return filtered;
          }
          return [];
        }
      } else {
        // For non-ticket ID searches, get all bookings and filter
        const response = await apiCall(endpoint);
        if (response.success) {
          return filterBookingsBySearchType(response.data, searchValue, searchType);
        }
        return [];
      }
    } catch (error) {
      console.error(`Error searching ${bookingType} bookings:`, error);
      return [];
    }
  };

  // Filter bookings based on search type (for client-side filtering)
  const filterBookingsBySearchType = (bookings, searchValue, searchType) => {
    if (!searchValue || !searchValue.trim()) return [];

    const searchTerm = searchValue.toLowerCase().trim();
    
    return bookings.filter(booking => {
      switch (searchType) {
        case 'ticketId':
          return booking.ticketId?.toLowerCase().includes(searchTerm) ||
                 booking.bookingId?.toLowerCase().includes(searchTerm);
          
        case 'name':
          return (
            booking.travelerName?.toLowerCase().includes(searchTerm) ||
            booking.agentName?.toLowerCase().includes(searchTerm) ||
            booking.bookingEntity?.toLowerCase().includes(searchTerm)
          );
          
        case 'hotel':
          return (
            booking.hotelName?.toLowerCase().includes(searchTerm) ||
            booking.city?.toLowerCase().includes(searchTerm) ||
            booking.checkInLocation?.toLowerCase().includes(searchTerm) ||
            booking.checkOutLocation?.toLowerCase().includes(searchTerm)
          );
          
        case 'date':
          const dateStr = searchValue;
          return (
            booking.submittedAt?.includes(dateStr) ||
            booking.dateOfBooking?.includes(dateStr) ||
            booking.checkInDate?.includes(dateStr) ||
            booking.checkOutDate?.includes(dateStr) ||
            booking.departureDate?.includes(dateStr) ||
            booking.returnDate?.includes(dateStr) ||
            (booking.journeyDetails && booking.journeyDetails.some(journey => 
              journey.date?.includes(dateStr)
            ))
          );
          
        case 'journey':
          return (
            booking.from?.toLowerCase().includes(searchTerm) ||
            booking.to?.toLowerCase().includes(searchTerm) ||
            booking.destination?.toLowerCase().includes(searchTerm) ||
            booking.city?.toLowerCase().includes(searchTerm) ||
            booking.pickupLocation?.toLowerCase().includes(searchTerm) ||
            booking.dropoffLocation?.toLowerCase().includes(searchTerm) ||
            (booking.journeyDetails && booking.journeyDetails.some(journey => 
              journey.from?.toLowerCase().includes(searchTerm) ||
              journey.to?.toLowerCase().includes(searchTerm)
            ))
          );
          
        case 'contact':
          return (
            booking.contactNumber?.includes(searchTerm) ||
            booking.email?.toLowerCase().includes(searchTerm)
          );
          
        case 'passport':
          return booking.passportNumber?.toLowerCase().includes(searchTerm);
          
        case 'invoice':
          return booking.invoiceNumber?.toLowerCase().includes(searchTerm) ||
                 booking.creditNoteNumber?.toLowerCase().includes(searchTerm);
          
        case 'all':
          const bookingStr = JSON.stringify(booking).toLowerCase();
          return bookingStr.includes(searchTerm);
          
        default:
          return booking.ticketId?.toLowerCase().includes(searchTerm) ||
                 booking.bookingId?.toLowerCase().includes(searchTerm);
      }
    });
  };

  // Fallback to props-based search
  const performPropsSearch = (searchVal, searchType) => {
    if (!searchVal || !searchVal.trim() || !bookingData) return [];
    return filterBookingsBySearchType(bookingData, searchVal, searchType);
  };

  // Main search function with backend integration
  const performBackendSearch = async (searchValue, searchType) => {
    const bookingTypes = ['flight', 'hotel', 'airport-transfer', 'car-rental', 'forex', 'visa', 'miscellaneous'];
    
    try {
      // Search across all booking types
      const searchPromises = bookingTypes.map(type => searchBookingsByType(searchValue, type));
      const searchResults = await Promise.all(searchPromises);
      
      // Flatten and combine results
      const allResults = searchResults.flat().filter(Boolean);
      
      // Add bookingType if not present
      return allResults.map(booking => ({
        ...booking,
        bookingType: booking.bookingType || 'flight' // default fallback
      }));
      
    } catch (error) {
      console.error('Backend search failed:', error);
      throw error;
    }
  };

  // Form component mapping based on booking type
  const getFormComponent = (bookingType, formData) => {
    const formProps = {
      key: `edit-${selectedResult?.ticketId || selectedResult?._id}`,
      initialData: formData,
      isEditing: true,
      onSubmit: handleUpdateSubmit,
      onCancel: handleCancelEdit
    };

    switch (bookingType?.toLowerCase()) {
      case 'flight':
        return <FlightBookingForm {...formProps} />;
      case 'hotel':
        return <HotelBookingForm {...formProps} />;
      case 'airport_transfer':
      case 'airport-transfer':
        return <AirportTransferForm {...formProps} />;
      case 'car_rental':
      case 'car-rental':
        return <CarRentalForm {...formProps} />;
      case 'forex':
        return <ForexBookingForm {...formProps} />;
      case 'visa':
        return <VisaBookingForm {...formProps} />;
      case 'miscellaneous':
        return <MiscellaneousBookingForm {...formProps} />;
      default:
        return <div className="text-red-500">Unknown booking type: {bookingType}</div>;
    }
  };

  // Handle search with backend integration
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setSearchError('');
    setSearchResults([]);
    setSelectedResult(null);

    try {
      let results = [];
      
      if (useBackend) {
        try {
          // Try backend search first
          results = await performBackendSearch(searchValue, searchType);
        } catch (backendError) {
          console.warn('Backend search failed, falling back to props:', backendError);
          // Fall back to props if backend fails
          results = performPropsSearch(searchValue, searchType);
          setUseBackend(false); // Disable backend for this session
        }
      } else {
        // Use props-based search
        results = performPropsSearch(searchValue, searchType);
      }

      if (results.length > 0) {
        setSearchResults(results);
        // If only one result, auto-select it
        if (results.length === 1) {
          setSelectedResult(results[0]);
          // Auto-scroll for single result
          setTimeout(() => {
            if (bookingDetailsRef.current) {
              bookingDetailsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }, 100);
        }
      } else {
        setSearchError(`No bookings found for "${searchValue}" in ${getSearchTypeLabel(searchType)}`);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update booking via backend API
  const updateBookingViaAPI = async (bookingId, bookingType, updateData) => {
    try {
      const endpoint = `/${bookingType}-bookings/${bookingId}`;
      const response = await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('API update failed:', error);
      throw error;
    }
  };

  // Handle update submission with backend integration
  const handleUpdateSubmit = async (updatedData) => {
    try {
      setIsLoading(true);
      
      let updatedBooking;
      
      if (useBackend && selectedResult._id) {
        try {
          // Try backend update first
          updatedBooking = await updateBookingViaAPI(
            selectedResult._id, 
            selectedResult.bookingType || 'flight',
            {
              ...updatedData,
              lastModified: new Date().toISOString()
            }
          );
        } catch (backendError) {
          console.warn('Backend update failed, using props fallback:', backendError);
          // Fall back to props update
          if (onUpdateBooking) {
            onUpdateBooking(selectedResult.ticketId || selectedResult._id, {
              ...updatedData,
              lastModified: new Date().toISOString()
            });
          }
          updatedBooking = {
            ...updatedData,
            lastModified: new Date().toISOString()
          };
        }
      } else {
        // Use props-based update
        if (onUpdateBooking) {
          onUpdateBooking(selectedResult.ticketId || selectedResult._id, {
            ...updatedData,
            lastModified: new Date().toISOString()
          });
        }
        updatedBooking = {
          ...updatedData,
          lastModified: new Date().toISOString()
        };
      }
      
      // Update local state
      setSelectedResult(updatedBooking);
      
      // Update search results array
      setSearchResults(prevResults => 
        prevResults.map(result => 
          (result.ticketId === selectedResult.ticketId || result._id === selectedResult._id)
            ? updatedBooking
            : result
        )
      );
      
      setIsEditing(false);
      setEditingForm(null);
      
      alert('Booking updated successfully!');
      
    } catch (error) {
      console.error('Update failed:', error);
      alert(`Failed to update booking: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get search type label for display
  const getSearchTypeLabel = (type) => {
    const labels = {
      ticketId: 'Ticket ID',
      name: 'Names',
      hotel: 'Hotel Details',
      date: 'Dates',
      journey: 'Journey Details',
      contact: 'Contact Info',
      passport: 'Passport Number',
      invoice: 'Invoice Number',
      all: 'All Fields'
    };
    return labels[type] || 'Ticket ID';
  };

  // Handle result selection
  const handleSelectResult = (booking) => {
    setSelectedResult(booking);
    
    // Scroll to booking details after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (bookingDetailsRef.current) {
        bookingDetailsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
    setEditingForm(getFormComponent(selectedResult.bookingType, selectedResult));
  };

  // Handle Word export
  const handleExportToWord = async () => {
    if (!selectedResult) {
      alert('No booking selected for export');
      return;
    }

    setIsExporting(true);
    
    try {
      await generateWordDocument(selectedResult);
      alert('Booking exported to Word document successfully!');
    } catch (error) {
      console.error('Export to Word failed:', error);
      alert(`Failed to export booking to Word document. 
      
Error: ${error.message}
Booking ID: ${selectedResult?.ticketId || selectedResult?._id}

Please check the console for more details and try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingForm(null);
  };

  // Handle new search
  const handleNewSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    setSelectedResult(null);
    setSearchError('');
    setIsEditing(false);
    setEditingForm(null);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format booking type for display
  const formatBookingType = (type) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Render journey details
  const renderJourneyDetails = (journeyDetails) => {
    if (!journeyDetails || !Array.isArray(journeyDetails)) return 'N/A';
    
    return journeyDetails.map((journey, index) => (
      <div key={index} className="text-sm">
        {index + 1}. {journey.from || 'N/A'} → {journey.to || 'N/A'} 
        {journey.date && ` (${journey.date})`}
      </div>
    ));
  };

  // Get placeholder text based on search type
  const getPlaceholder = () => {
    const placeholders = {
      ticketId: 'e.g. FLT-A1B2C, HTL-X3Y4Z',
      name: 'e.g. John Doe, Agent Name, Company',
      hotel: 'e.g. Hotel Taj, Mumbai, Delhi',
      date: 'e.g. 2024-01-15, 15/01/2024',
      journey: 'e.g. Mumbai, Delhi, Airport',
      contact: 'e.g. 9876543210, email@domain.com',
      passport: 'e.g. A1234567',
      invoice: 'e.g. INV-001',
      all: 'Search across all booking details'
    };
    return placeholders[searchType] || 'Enter search term';
  };

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackendConnectivity = async () => {
      try {
        // Test with a simple flight bookings request
        await apiCall('/flight-bookings');
        setUseBackend(true);
      } catch (error) {
        console.warn('Backend not available, using props fallback:', error);
        setUseBackend(false);
      }
    };

    checkBackendConnectivity();
  }, []);

  if (isEditing && editingForm) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-blue-800 mb-2">
            Editing Booking: {selectedResult?.ticketId || selectedResult?._id}
          </h2>
          <p className="text-blue-600 text-sm">
            Make your changes below and click submit to update the booking.
          </p>
        </div>
        {editingForm}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Search & Edit Bookings</h2>
        
        {/* Backend Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${useBackend ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="text-sm text-gray-600">
            {useBackend ? 'Backend Connected' : 'Using Local Data'}
          </span>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        {/* Search Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search By:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { value: 'ticketId', label: 'Ticket ID' },
              { value: 'name', label: 'Name' },
              { value: 'hotel', label: 'Hotel' },
              { value: 'date', label: 'Date' },
              { value: 'journey', label: 'Journey' },
              { value: 'contact', label: 'Contact' },
              { value: 'passport', label: 'Passport' },
              { value: 'invoice', label: 'Invoice' },
              { value: 'all', label: 'All Fields' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  value={option.value}
                  checked={searchType === option.value}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <label htmlFor="searchValue" className="block text-sm font-medium text-gray-700 mb-2">
            Search for bookings:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              id="searchValue"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchValue.trim()}
              className={`px-6 py-2 rounded-md font-medium ${
                isLoading || !searchValue.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {searchError}
            </div>
          </div>
        )}

        {/* Search Tips */}
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">Search Tips:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Select the appropriate search type above for better results</li>
            <li>Use partial matches - "John" will find "John Doe"</li>
            <li>Date searches work with various formats (YYYY-MM-DD, DD/MM/YYYY)</li>
            <li>Journey searches look in departure/destination locations</li>
            <li>Use "All Fields" to search across everything</li>
            {!useBackend && <li className="text-yellow-600">Currently using local data only - refresh page to retry backend connection</li>}
          </ul>
        </div>
      </div>

      {/* Search Results List */}
      {searchResults.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 rounded-t-lg">
            <h3 className="text-lg font-semibold text-blue-800">
              Found {searchResults.length} bookings
            </h3>
            <p className="text-blue-600 text-sm">Click on any booking to view details</p>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((booking, index) => (
              <div 
                key={booking.ticketId || booking._id || index}
                onClick={() => handleSelectResult(booking)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.ticketId || booking.bookingId || booking._id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatBookingType(booking.bookingType)} | 
                      {booking.travelerName || booking.agentName || 'No name'} |
                      {booking.contactNumber || 'No contact'}
                    </div>
                    {booking.journeyDetails && booking.journeyDetails[0] && (
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.journeyDetails[0].from} → {booking.journeyDetails[0].to}
                      </div>
                    )}
                    {booking.hotelName && (
                      <div className="text-xs text-gray-500 mt-1">
                        Hotel: {booking.hotelName}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(booking.submittedAt || booking.dateOfBooking)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Booking Details */}
      {selectedResult && (
        <div ref={bookingDetailsRef} className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header */}
          <div className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Booking Details
                </h3>
                <p className="text-green-600 text-sm">
                  Ticket ID: <span className="font-mono font-bold">
                    {selectedResult.ticketId || selectedResult.bookingId || selectedResult._id}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportToWord}
                  disabled={isExporting}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    isExporting 
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" />
                      </svg>
                      Export to Word
                    </>
                  )}
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Booking
                </button>
                <button
                  onClick={handleNewSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  New Search
                </button>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Type:</span>
                    <span className="font-medium">{formatBookingType(selectedResult.bookingType)}</span>
                  </div>
                  
                  {selectedResult.agentName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent Name:</span>
                      <span className="font-medium">{selectedResult.agentName}</span>
                    </div>
                  )}
                  
                  {selectedResult.bookingEntity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Entity:</span>
                      <span className="font-medium">{selectedResult.bookingEntity}</span>
                    </div>
                  )}
                  
                  {selectedResult.travelerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Traveler Name:</span>
                      <span className="font-medium">{selectedResult.travelerName}</span>
                    </div>
                  )}
                  
                  {selectedResult.contactNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{selectedResult.contactNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Journey/Service Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Service Details</h4>
                
                <div className="space-y-2 text-sm">
                  {selectedResult.journeyDetails && (
                    <div>
                      <span className="text-gray-600 block mb-1">Journey Details:</span>
                      <div className="pl-2 border-l-2 border-blue-200">
                        {renderJourneyDetails(selectedResult.journeyDetails)}
                      </div>
                    </div>
                  )}
                  
                  {selectedResult.passportNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passport Number:</span>
                      <span className="font-medium">{selectedResult.passportNumber}</span>
                    </div>
                  )}

                  {selectedResult.hotelName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hotel Name:</span>
                      <span className="font-medium">{selectedResult.hotelName}</span>
                    </div>
                  )}

                  {selectedResult.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{selectedResult.city}</span>
                    </div>
                  )}

                  {selectedResult.checkInDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Date:</span>
                      <span className="font-medium">{selectedResult.checkInDate}</span>
                    </div>
                  )}

                  {selectedResult.checkOutDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out Date:</span>
                      <span className="font-medium">{selectedResult.checkOutDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {(selectedResult.amount || selectedResult.paymentStatus || selectedResult.invoiceNumber || selectedResult.creditNoteNumber) && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Payment Information</h4>
                  
                  <div className="space-y-2 text-sm">
                    {selectedResult.amount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">₹{selectedResult.amount}</span>
                      </div>
                    )}
                    
                    {selectedResult.refundAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Amount:</span>
                        <span className="font-medium">₹{selectedResult.refundAmount}</span>
                      </div>
                    )}
                    
                    {selectedResult.paymentStatus && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`font-medium ${
                          selectedResult.paymentStatus === 'received' 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {selectedResult.paymentStatus === 'received' ? 'Received' : 'Not Received'}
                        </span>
                      </div>
                    )}
                    
                    {selectedResult.invoiceNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Number:</span>
                        <span className="font-medium">{selectedResult.invoiceNumber}</span>
                      </div>
                    )}

                    {selectedResult.creditNoteNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credit Note Number:</span>
                        <span className="font-medium">{selectedResult.creditNoteNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Timestamps</h4>
                
                <div className="space-y-2 text-sm">
                  {(selectedResult.submittedAt || selectedResult.dateOfBooking) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium">
                        {formatDate(selectedResult.submittedAt || selectedResult.dateOfBooking)}
                      </span>
                    </div>
                  )}
                  
                  {selectedResult.lastModified && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Modified:</span>
                      <span className="font-medium">{formatDate(selectedResult.lastModified)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {selectedResult.ticketCopy && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Attachments</h4>
                <a 
                  href={selectedResult.ticketCopy} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  View Ticket Copy
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleNewSearch}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Search Another
              </button>
              <button
                onClick={handleExportToWord}
                disabled={isExporting}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  isExporting 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" />
                    </svg>
                    Export to Word
                  </>
                )}
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit This Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Search Performed Yet */}
      {searchResults.length === 0 && !searchError && !isLoading && !selectedResult && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Booking Search</h3>
          <p className="text-gray-500">
            Select a search type above and enter your search term to find bookings.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {useBackend ? 'Searching across all booking types in database' : 'Searching in local data only'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Search;