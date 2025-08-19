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

function HotelBookingForm({ onSubmit, initialData = null, isEditing = false, onCancel = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [bookingId, setBookingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBooking: '',
    agentName: '',
    bookingEntity: '',
    bookingAgent: '',
    travelerName: '',
    contactNumber: '',
    checkInDate: '',
    checkOutDate: '',
    city: '',
    hotelName: '',
    invoiceNumber: '',
    creditNoteNumber: '',
    amount: '',
    refundAmount: '',
    paymentStatus: 'notReceived'
  });

  const tabs = ['Booking Details', 'Generate Ticket ID', 'Payment Information'];

  // Initialize form with initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        dateOfBooking: initialData.dateOfBooking || '',
        agentName: initialData.agentName || '',
        bookingEntity: initialData.bookingEntity || '',
        bookingAgent: initialData.bookingAgent || '',
        travelerName: initialData.travelerName || '',
        contactNumber: initialData.contactNumber || '',
        checkInDate: initialData.checkInDate || '',
        checkOutDate: initialData.checkOutDate || '',
        city: initialData.city || '',
        hotelName: initialData.hotelName || '',
        invoiceNumber: initialData.invoiceNumber || '',
        creditNoteNumber: initialData.creditNoteNumber || '',
        amount: initialData.amount || '',
        refundAmount: initialData.refundAmount || '',
        paymentStatus: initialData.paymentStatus || 'notReceived'
      });
      setBookingId(initialData.ticketId || initialData.bookingId || '');
    }
  }, [isEditing, initialData]);

  // Check if basic info is filled to enable tab 2
  const isBasicInfoFilled = () => {
    return (
      formData.dateOfBooking &&
      formData.agentName &&
      formData.bookingEntity &&
      formData.bookingAgent &&
      formData.travelerName &&
      formData.contactNumber &&
      formData.checkInDate &&
      formData.checkOutDate &&
      formData.city &&
      formData.hotelName
    );
  };

  // Handle tab navigation with validation
  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true; // Booking Details always accessible
    if (tabIndex === 1) return isBasicInfoFilled(); // Generate Ticket ID after basic info
    if (tabIndex === 2) return isBasicInfoFilled(); // Payment can be filled anytime after booking details
    return false;
  };

  // Generate unique booking ID when reaching confirmation tab (only for new bookings)
  useEffect(() => {
    if (activeTab === 1 && !bookingId && !isEditing) {
      generateBookingId();
    }
  }, [activeTab, isEditing]);

  // Generate a unique booking ID of length 6 with mixed letters and numbers
  const generateBookingId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'HTL-';
    
    // Ensure we have at least one letter and one number
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    result += '0123456789'.charAt(Math.floor(Math.random() * 10));
    
    // Fill the remaining positions randomly
    for (let i = 0; i < 3; i++) {
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

  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create data object for submission
      const submitData = {
        dateOfBooking: formData.dateOfBooking,
        agentName: formData.agentName,
        bookingEntity: formData.bookingEntity,
        bookingAgent: formData.bookingAgent,
        travelerName: formData.travelerName,
        contactNumber: formData.contactNumber,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        city: formData.city,
        hotelName: formData.hotelName,
        ticketId: bookingId,
        bookingId: bookingId,
        invoiceNumber: formData.invoiceNumber || '',
        creditNoteNumber: formData.creditNoteNumber || '',
        amount: formData.amount || '',
        refundAmount: formData.refundAmount || '',
        paymentStatus: formData.paymentStatus,
        submittedAt: initialData?.submittedAt || new Date().toISOString()
      };
      
      if (isEditing) {
        submitData.lastModified = new Date().toISOString();
      }

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/hotel-bookings/${initialData._id}`
        : '${import.meta.env.VITE_API_URL}/hotel-bookings';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok) {
        // Success
        if (onSubmit) {
          onSubmit(result.data);
        }
        
        // Reset form after submission only if not editing
        if (!isEditing) {
          setFormData({
            dateOfBooking: '',
            agentName: '',
            bookingEntity: '',
            bookingAgent: '',
            travelerName: '',
            contactNumber: '',
            checkInDate: '',
            checkOutDate: '',
            city: '',
            hotelName: '',
            invoiceNumber: '',
            creditNoteNumber: '',
            amount: '',
            refundAmount: '',
            paymentStatus: 'notReceived'
          });
          setActiveTab(0);
          setBookingId('');
        }
        
        alert(isEditing ? 'Hotel booking updated successfully!' : 'Hotel booking submitted successfully!');
      } else {
        // Error
        console.error('API Error:', result);
        alert(result.message || 'An error occurred while submitting the booking');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
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
          {isEditing ? 'Edit Hotel Booking' : 'Hotel Booking Form'}
        </h2>
        {isEditing && onCancel && (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel Edit
          </button>
        )}
      </div>
      
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Agent</label>
                <input
                  type="text"
                  name="bookingAgent"
                  value={formData.bookingAgent}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                <input
                  type="text"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleChange}
                  placeholder="e.g. Taj Hotel"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
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
                  placeholder="e.g. Mumbai"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
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
                  {isEditing ? 'Booking ID' : 'Booking ID Generated Successfully!'}
                </h3>
                <div className="bg-white border border-green-300 rounded-md p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Booking ID is:</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {bookingId}
                  </p>
                </div>
                <p className="text-sm text-green-600">
                  {isEditing 
                    ? 'This is the existing booking ID for this hotel reservation.'
                    : 'Please save this Booking ID for future reference. You can use it to search and edit this booking.'
                  }
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel Name:</span>
                  <span className="font-medium text-gray-800">{formData.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel City:</span>
                  <span className="font-medium text-gray-800">{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name:</span>
                  <span className="font-medium text-gray-800">{formData.travelerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in Date:</span>
                  <span className="font-medium text-gray-800">{formData.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out Date:</span>
                  <span className="font-medium text-gray-800">{formData.checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent Name:</span>
                  <span className="font-medium text-gray-800">{formData.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Agent:</span>
                  <span className="font-medium text-gray-800">{formData.bookingAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Entity:</span>
                  <span className="font-medium text-gray-800">{formData.bookingEntity}</span>
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
              <div className="space-x-3">
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
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {isSubmitting 
                    ? 'Submitting...' 
                    : (isEditing ? 'Update Booking' : 'Submit Booking')
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
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                >
                {isSubmitting 
                  ? 'Submitting...' 
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

export default HotelBookingForm;