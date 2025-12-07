import { useState, useEffect } from 'react';

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

function VisaBookingForm({ onSubmit, initialData = null, isEditing = false, onCancel = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [bookingId, setBookingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data with either initialData (for editing) or default values
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        dateOfBooking: initialData.dateOfBooking || '',
        agentName: initialData.agentName || '',
        bookingAgent: initialData.bookingAgent || '',
        bookingEntity: initialData.bookingEntity || '',
        travelerName: initialData.travelerName || '',
        contactNumber: initialData.contactNumber || '',
        city: initialData.city || '',
        passport: initialData.passport || '',
        airlineTicket: initialData.airlineTicket || '',
        hotelBookingConfirmation: initialData.hotelBookingConfirmation || '',
        panCard: initialData.panCard || '',
        invoiceNumber: initialData.invoiceNumber || '',
        creditNoteNumber: initialData.creditNoteNumber || '',
        amount: initialData.amount || '',
        refundAmount: initialData.refundAmount || '',
        paymentStatus: initialData.paymentStatus || 'notReceived',
        remarks: initialData.remarks || ''
      };
    }
    return {
      dateOfBooking: '',
      agentName: '',
      bookingAgent: '',
      bookingEntity: '',
      travelerName: '',
      contactNumber: '',
      city: '',
      passport: '',
      airlineTicket: '',
      hotelBookingConfirmation: '',
      panCard: '',
      invoiceNumber: '',
      creditNoteNumber: '',
      amount: '',
      refundAmount: '',
      paymentStatus: 'notReceived',
      remarks: ''
    };
  });

  // Set booking ID if editing
  useEffect(() => {
    if (isEditing && initialData?.ticketId) {
      setBookingId(initialData.ticketId);
    }
  }, [isEditing, initialData]);

  const tabs = ['Booking Details', 'Generate Ticket ID', 'Payment Information'];

  // Check if basic info is filled to enable tab 2
  const isBasicInfoFilled = () => {
    return (
      formData.dateOfBooking &&
      formData.agentName &&
      formData.bookingAgent &&
      formData.bookingEntity &&
      formData.travelerName &&
      formData.contactNumber &&
      formData.city
    );
  };

  // Check if payment info is filled (optional for submission)
  const isPaymentInfoFilled = () => {
    return formData.invoiceNumber && formData.amount;
  };

  // Handle tab navigation with validation
  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true; // Booking Details always accessible
    if (tabIndex === 1) return isBasicInfoFilled(); // Confirm Booking after basic info
    if (tabIndex === 2) return isBasicInfoFilled(); // Payment can be filled anytime after booking details
    return false;
  };

  // Generate unique booking ID when reaching confirmation tab
  useEffect(() => {
    if (activeTab === 1 && !bookingId && !isEditing) {
      generateBookingId();
    }
  }, [activeTab, isEditing]);

  // Generate a unique booking ID of length 6 with mixed letters and numbers
  const generateBookingId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // Ensure we have at least one letter and one number
    result += 'VISA-';
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    result += '0123456789'.charAt(Math.floor(Math.random() * 10));
    
    // Fill the remaining positions randomly
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setBookingId(result);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission with backend integration
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const dataToSend = {
        ...formData,
        ticketId: bookingId,
        bookingType: 'visa'
      };
      
      // Determine API endpoint and method
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/visa-bookings/${initialData._id}`
        : `${import.meta.env.VITE_API_URL}/visa-bookings`;
      
      const method = isEditing ? 'PUT' : 'POST';

      // Send to backend
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit booking');
      }

      const result = await response.json();
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit(result);
      }
      
      // Only reset form if not editing
      if (!isEditing) {
        setFormData({
          dateOfBooking: '',
          agentName: '',
          bookingAgent: '',
          bookingEntity: '',
          travelerName: '',
          contactNumber: '',
          city: '',
          passport: '',
          airlineTicket: '',
          hotelBookingConfirmation: '',
          panCard: '',
          invoiceNumber: '',
          creditNoteNumber: '',
          amount: '',
          refundAmount: '',
          paymentStatus: 'notReceived',
          remarks: ''
        });
        setActiveTab(0);
        setBookingId('');
        
        alert('VISA booking submitted successfully!');
      } else {
        alert('VISA booking updated successfully!');
      }
      
    } catch (error) {
      console.error('Error submitting visa booking:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel (for editing mode)
  const handleCancel = () => {
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
          {isEditing ? 'Edit VISA Booking' : 'VISA Booking Form'}
        </h2>
        {isEditing && onCancel && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel Edit
          </button>
        )}
      </div>
      
      {/* Show booking ID if editing */}
      {isEditing && bookingId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700 font-semibold">
            Editing Booking ID: <span className="font-mono text-lg">{bookingId}</span>
          </p>
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Booking</label>
                <input
                  type="date"
                  name="dateOfBooking"
                  value={formData.dateOfBooking}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Document Information Section (Text inputs instead of file uploads) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Document Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number/Details</label>
                  <input
                    type="text"
                    name="passport"
                    value={formData.passport}
                    onChange={handleChange}
                    placeholder="Enter passport number or details"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Airline Ticket Details</label>
                  <input
                    type="text"
                    name="airlineTicket"
                    value={formData.airlineTicket}
                    onChange={handleChange}
                    placeholder="Enter ticket number or details"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Booking Confirmation</label>
                  <input
                    type="text"
                    name="hotelBookingConfirmation"
                    value={formData.hotelBookingConfirmation}
                    onChange={handleChange}
                    placeholder="Enter booking confirmation number"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pan Card Number</label>
                  <input
                    type="text"
                    name="panCard"
                    value={formData.panCard}
                    onChange={handleChange}
                    placeholder="Enter PAN card number"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Amendment / Cancellation)</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any remarks about amendments or cancellations..."
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <div></div>
              <button
                onClick={handleNext}
                disabled={!canProceedToTab(1)}
                className={`px-6 py-2 rounded-md font-medium ${
                  canProceedToTab(1)
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
                  {isEditing ? 'Booking Confirmation' : 'Ticket ID Generated Successfully!'}
                </h3>
                <div className="bg-white border border-green-300 rounded-md p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Ticket ID is:</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {bookingId}
                  </p>
                </div>
                <p className="text-sm text-green-600">
                  {isEditing ? 'Your VISA booking details are confirmed.' : 'Please save this Ticket ID for future reference. You can use it to search and edit this booking.'}
                </p>
              </div>
            </div>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Booking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Destination City:</span>
                  <span className="font-medium text-gray-900">{formData.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Traveller Name:</span>
                  <span className="font-medium text-gray-900">{formData.travelerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium text-gray-900">{formData.dateOfBooking}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Contact Number:</span>
                  <span className="font-medium text-gray-900">{formData.contactNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Agent Name:</span>
                  <span className="font-medium text-gray-900">{formData.agentName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Booking Agent:</span>
                  <span className="font-medium text-gray-900">{formData.bookingAgent}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Booking Entity:</span>
                  <span className="font-medium text-gray-900">{formData.bookingEntity}</span>
                </div>
              </div>

              {/* Document Status */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-base font-medium text-gray-800 mb-3">Document Information:</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passport:</span>
                    <span className={`font-medium ${formData.passport ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.passport || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Airline Ticket:</span>
                    <span className={`font-medium ${formData.airlineTicket ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.airlineTicket || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hotel Confirmation:</span>
                    <span className={`font-medium ${formData.hotelBookingConfirmation ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.hotelBookingConfirmation || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pan Card:</span>
                    <span className={`font-medium ${formData.panCard ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.panCard || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Payment Info
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-2 rounded-md font-medium ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting 
                    ? 'Submitting...' 
                    : (isEditing ? 'Update VISA Booking' : 'Submit VISA Booking')
                  }
                </button>
              </div>
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
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-2 rounded-md font-medium ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting 
                  ? 'Submitting...' 
                  : (isEditing ? 'Update VISA Booking' : 'Submit VISA Booking')
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisaBookingForm;