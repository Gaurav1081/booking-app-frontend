import { useState, useEffect } from 'react';

// API configuration
const API_BASE_URL = '${import.meta.env.VITE_API_URL}';

// API service functions
const apiService = {
  // Create new flight booking
  createFlightBooking: async (bookingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/flight-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating flight booking:', error);
      throw error;
    }
  },

  // Update existing flight booking
  updateFlightBooking: async (bookingId, bookingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/flight-bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating flight booking:', error);
      throw error;
    }
  },

  // Get flight booking by ID
  getFlightBookingById: async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/flight-bookings/${bookingId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching flight booking:', error);
      throw error;
    }
  },

  // Search flight booking by ticket ID
  searchFlightBookingByTicketId: async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/flight-bookings/search/${ticketId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching flight booking:', error);
      throw error;
    }
  }
};

function TabNavigation({ activeTab, setActiveTab, tabs, canProceed }) {
  return (
    <div className="flex mb-4 border-b">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`py-2 px-4 mr-2 ${
            activeTab === index
              ? 'border-b-2 border-blue-500 font-medium text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          } ${!canProceed(index) ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => canProceed(index) && setActiveTab(index)}
          disabled={!canProceed(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function FlightBookingForm({ onSubmit, initialData = null, isEditing = false, onCancel = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [ticketId, setTicketId] = useState('');
  const [journeyEntries, setJourneyEntries] = useState([{ from: '', to: '', date: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    agentName: '',
    bookingAgent: '',
    bookingEntity: '',
    travelerName: '',
    contactNumber: '',
    passportNumber: '',
    invoiceNumber: '',
    creditNoteNumber: '',
    amount: '',
    refundAmount: '',
    paymentStatus: 'notReceived'
  });

  const tabs = ['Booking Details', 'Generate Ticket ID', 'Payment Information'];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        agentName: initialData.agentName || '',
        bookingAgent: initialData.bookingAgent || '',
        bookingEntity: initialData.bookingEntity || '',
        travelerName: initialData.travelerName || '',
        contactNumber: initialData.contactNumber || '',
        passportNumber: initialData.passportNumber || '',
        invoiceNumber: initialData.invoiceNumber || '',
        creditNoteNumber: initialData.creditNoteNumber || '',
        amount: initialData.amount || '',
        refundAmount: initialData.refundAmount || '',
        paymentStatus: initialData.paymentStatus || 'notReceived'
      });

      if (initialData.journeyDetails && Array.isArray(initialData.journeyDetails)) {
        // Convert date strings back to YYYY-MM-DD format for input fields
        const formattedJourneys = initialData.journeyDetails.map(journey => ({
          ...journey,
          date: journey.date ? new Date(journey.date).toISOString().split('T')[0] : ''
        }));
        setJourneyEntries(formattedJourneys);
      }

      if (initialData.ticketId) {
        setTicketId(initialData.ticketId);
      }
    }
  }, [isEditing, initialData]);

  // Add new journey entry
  const addJourneyEntry = () => {
    setJourneyEntries([...journeyEntries, { from: '', to: '', date: '' }]);
  };

  // Remove journey entry
  const removeJourneyEntry = (index) => {
    if (journeyEntries.length > 1) {
      const newEntries = journeyEntries.filter((_, i) => i !== index);
      setJourneyEntries(newEntries);
    }
  };

  // Handle journey entry changes
  const handleJourneyChange = (index, field, value) => {
    const newEntries = [...journeyEntries];
    newEntries[index][field] = value;
    setJourneyEntries(newEntries);
  };

  // Check if basic info is filled to enable tab 2
  const isBasicInfoFilled = () => {
    const hasValidJourneys = journeyEntries.every(entry => 
      entry.from.trim() && entry.to.trim() && entry.date
    );
    
    return (
      hasValidJourneys &&
      formData.agentName &&
      formData.bookingAgent &&
      formData.bookingEntity &&
      formData.travelerName &&
      formData.contactNumber
    );
  };

  // Handle tab navigation with validation
  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true; // Booking Details always accessible
    if (tabIndex === 1) return isBasicInfoFilled(); // Generate Ticket ID after basic info
    if (tabIndex === 2) return isBasicInfoFilled(); // Payment can be filled anytime after booking details
    return false;
  };

  // Generate unique ticket ID when reaching ticket generation tab (only for new bookings)
  useEffect(() => {
    if (activeTab === 1 && !ticketId && !isEditing) {
      generateTicketId();
    }
  }, [activeTab, isEditing]);

  // Generate a unique ticket ID of length 5 with mixed letters and numbers
  const generateTicketId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FLT-';
    
    // Ensure we have at least one letter and one number
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    result += '0123456789'.charAt(Math.floor(Math.random() * 10));
    
    // Fill the remaining positions randomly
    for (let i = 0; i < 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setTicketId(result);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const finalData = {
        ...formData,
        journeyDetails: journeyEntries,
        ticketId: ticketId,
        bookingType: 'flight',
        submittedAt: initialData?.submittedAt || new Date().toISOString(),
        lastModified: isEditing ? new Date().toISOString() : undefined
      };

      let response;
      
      if (isEditing && initialData._id) {
        // Update existing booking
        response = await apiService.updateFlightBooking(initialData._id, finalData);
        alert('Flight booking updated successfully!');
      } else {
        // Create new booking
        response = await apiService.createFlightBooking(finalData);
        alert('Flight booking submitted successfully!');
        
        // Reset form after successful creation
        setFormData({
          agentName: '',
          bookingAgent: '',
          bookingEntity: '',
          travelerName: '',
          contactNumber: '',
          passportNumber: '',
          invoiceNumber: '',
          creditNoteNumber: '',
          amount: '',
          refundAmount: '',
          paymentStatus: 'notReceived'
        });
        setJourneyEntries([{ from: '', to: '', date: '' }]);
        setActiveTab(0);
        setTicketId('');
      }

      // Call the parent component's onSubmit if provided
      if (onSubmit) {
        onSubmit(response.data);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`Failed to ${isEditing ? 'update' : 'submit'} booking. Please try again.`);
      alert(`Error: Failed to ${isEditing ? 'update' : 'submit'} booking. Please check your connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle next tab
  const handleNext = () => {
    if (activeTab < tabs.length - 1 && canProceedToTab(activeTab + 1)) {
      setActiveTab(activeTab + 1);
    }
  };

  // Handle previous tab
  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Flight Booking' : 'Flight Booking Form'}
        </h2>
        {isEditing && onCancel && (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <p className="text-gray-600">
                {isEditing ? 'Updating booking...' : 'Submitting booking...'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <TabNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={tabs} 
        canProceed={canProceedToTab}
      />
      
      <div>
        {/* Tab 1: Booking Details */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Journey Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-medium text-gray-700">Journey Details</label>
                <button
                  type="button"
                  onClick={addJourneyEntry}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  disabled={isLoading}
                >
                  <span className="text-lg mr-1">+</span>
                  Add Journey
                </button>
              </div>
              
              {journeyEntries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Journey {index + 1}</span>
                    {journeyEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJourneyEntry(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={entry.from}
                        onChange={(e) => handleJourneyChange(index, 'from', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi"
                        value={entry.to}
                        onChange={(e) => handleJourneyChange(index, 'to', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Booking</label>
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => handleJourneyChange(index, 'date', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Agent</label>
                <input
                  type="text"
                  name="bookingAgent"
                  value={formData.bookingAgent}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Entity</label>
                <input
                  type="text"
                  name="bookingEntity"
                  value={formData.bookingEntity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Traveller</label>
                <input
                  type="text"
                  name="travelerName"
                  value={formData.travelerName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <div></div>
              <button
                onClick={handleNext}
                disabled={!canProceedToTab(1) || isLoading}
                className={`px-6 py-2 rounded-md font-medium ${
                  canProceedToTab(1) && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Generate Ticket ID */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-green-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Ticket ID Generated Successfully!
                </h3>
                <div className="bg-white border border-green-300 rounded-md p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Ticket ID is:</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {ticketId}
                  </p>
                </div>
                <p className="text-sm text-green-600">
                  Please save this Ticket ID for future reference. You can use it to search and edit this booking.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Payment Information */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note Number</label>
                <input
                  type="text"
                  name="creditNoteNumber"
                  value={formData.creditNoteNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  name="refundAmount"
                  value={formData.refundAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentStatus"
                      value="received"
                      checked={formData.paymentStatus === 'received'}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">Payment Received</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentStatus"
                      value="notReceived"
                      checked={formData.paymentStatus === 'notReceived'}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">Payment Not Received</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Navigation and Submit Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-8 py-2 rounded-md font-medium ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading 
                  ? (isEditing ? 'Updating...' : 'Submitting...') 
                  : (isEditing ? 'Update Booking' : 'Submit Booking')
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { apiService };
export default FlightBookingForm;