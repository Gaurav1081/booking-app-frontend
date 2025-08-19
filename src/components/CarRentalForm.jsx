import { useState, useEffect } from 'react';

function TabNavigation({ activeTab, setActiveTab, tabs, canProceed }) {
  return (
    <div className="flex mb-4 border-b">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`py-2 px-4 mr-2 ${
            activeTab === index
              ? 'border-b-2 border-orange-500 font-medium text-orange-600'
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

function CarRentalForm({ 
  onSubmit, 
  initialData = null, 
  isEditing = false, 
  onCancel = null 
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [bookingId, setBookingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(
    initialData ? {
      dateOfBooking: initialData.dateOfBooking || '',
      agentName: initialData.agentName || '',
      bookingEntity: initialData.bookingEntity || '',
      bookingAgent: initialData.bookingAgent || '',
      travelerName: initialData.travelerName || '',
      contactNumber: initialData.contactNumber || '',
      city: initialData.city || '',
      pickupLocation: initialData.pickupLocation || '',
      dropoffLocation: initialData.dropoffLocation || '',
      pickupTime: initialData.pickupTime || '',
      invoiceNumber: initialData.invoiceNumber || '',
      creditNoteNumber: initialData.creditNoteNumber || '',
      amount: initialData.amount || '',
      refundAmount: initialData.refundAmount || '',
      paymentStatus: initialData.paymentStatus || 'notReceived'
    } : {
      dateOfBooking: '',
      agentName: '',
      bookingEntity: '',
      bookingAgent: '',
      travelerName: '',
      contactNumber: '',
      city: '',
      pickupLocation: '',
      dropoffLocation: '',
      pickupTime: '',
      invoiceNumber: '',
      creditNoteNumber: '',
      amount: '',
      refundAmount: '',
      paymentStatus: 'notReceived'
    }
  );

  const tabs = ['Rental Details', 'Generate Booking ID', 'Payment Information'];

  // Initialize booking ID for editing mode
  useEffect(() => {
    if (isEditing && initialData?.bookingId) {
      setBookingId(initialData.bookingId);
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
      formData.city &&
      formData.pickupLocation &&
      formData.dropoffLocation &&
      formData.pickupTime
    );
  };

  // Handle tab navigation with validation
  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true; // Rental Details always accessible
    if (tabIndex === 1) return isBasicInfoFilled(); // Generate Booking ID after basic info
    if (tabIndex === 2) return isBasicInfoFilled(); // Payment can be filled anytime after booking details
    return false;
  };

  // Generate unique booking ID when reaching booking ID generation tab (only for new bookings)
  useEffect(() => {
    if (activeTab === 1 && !bookingId && !isEditing) {
      generateBookingId();
    }
  }, [activeTab, isEditing]);

  // Generate a unique booking ID with mixed letters and numbers
  const generateBookingId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CAR-';
    
    // Add a letter and a number
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

  // Handle location edit functionality
  const handleLocationEdit = (field) => {
    const fieldName = field === 'pickupLocation' ? 'Pick-up Location' : 'Drop-off Location';
    const newValue = prompt(`Edit ${fieldName}:`, formData[field]);
    if (newValue !== null) {
      setFormData({
        ...formData,
        [field]: newValue
      });
    }
  };

  // Fixed handleSubmit function with correct endpoints and removed dropoffTime
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create regular object for submission (no FormData needed)
      const submitData = {
        bookingId: bookingId,
        dateOfBooking: formData.dateOfBooking,
        agentName: formData.agentName,
        bookingEntity: formData.bookingEntity,
        bookingAgent: formData.bookingAgent,
        travelerName: formData.travelerName,
        contactNumber: formData.contactNumber,
        city: formData.city,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupTime: formData.pickupTime,
        // dropoffTime removed
        invoiceNumber: formData.invoiceNumber || '',
        creditNoteNumber: formData.creditNoteNumber || '',
        amount: formData.amount || '0',
        refundAmount: formData.refundAmount || '0',
        paymentStatus: formData.paymentStatus,
        bookingType: 'car_rental'
      };
      
      // Add timestamps
      if (isEditing) {
        submitData.submittedAt = initialData?.submittedAt || new Date().toISOString();
        submitData.lastModified = new Date().toISOString();
      } else {
        submitData.submittedAt = new Date().toISOString();
      }

      // Make API call - fixed endpoints
      let response;
      if (isEditing && initialData?._id) {
        // Update existing booking using PUT method and ObjectId
        response = await fetch(`http://localhost:3000/api/car-rentals/${initialData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      } else {
        // Create new booking using POST method
        response = await fetch('http://localhost:3000/api/car-rentals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Car rental booking submitted successfully:', result);

      // Call parent onSubmit if provided with correct data format
      if (onSubmit) {
        // Ensure we pass the complete booking data for Search.jsx to handle updates
        const bookingData = {
          ...result,
          _id: result._id || initialData?._id,
          bookingId: bookingId,
          ...formData,
          submittedAt: isEditing ? (initialData?.submittedAt || new Date().toISOString()) : new Date().toISOString(),
          lastModified: isEditing ? new Date().toISOString() : undefined
        };
        onSubmit(bookingData);
      }
      
      // Reset form after successful submission (only for new bookings)
      if (!isEditing) {
        setFormData({
          dateOfBooking: '',
          agentName: '',
          bookingEntity: '',
          bookingAgent: '',
          travelerName: '',
          contactNumber: '',
          city: '',
          pickupLocation: '',
          dropoffLocation: '',
          pickupTime: '',
          invoiceNumber: '',
          creditNoteNumber: '',
          amount: '',
          refundAmount: '',
          paymentStatus: 'notReceived'
        });
        setActiveTab(0);
        setBookingId('');
        
        alert('Car rental booking submitted successfully!');
      } else {
        alert('Car rental booking updated successfully!');
      }
      
    } catch (error) {
      console.error('Error submitting car rental booking:', error);
      alert(`Error submitting car rental booking: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
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
          {isEditing ? `Edit Car Rental - ${bookingId}` : 'Car Rental at Disposal'}
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
        {/* Tab 1: Rental Details */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Date of Booking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Booking</label>
              <input
                type="date"
                name="dateOfBooking"
                value={formData.dateOfBooking}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              {/* Booking Agent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Agent</label>
                <input
                  type="text"
                  name="bookingAgent"
                  value={formData.bookingAgent}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pick-up Time</label>
                <input
                  type="datetime-local"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>
            
            {/* Location Fields with Edit Buttons */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pick-up Location</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleLocationEdit('pickupLocation')}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleLocationEdit('dropoffLocation')}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
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
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate Booking ID
              </button>
            </div>
          </div>
        )}
        
        {/* Tab 2: Generate Booking ID */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-orange-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  {isEditing ? 'Booking ID' : 'Booking ID Generated Successfully!'}
                </h3>
                <p className="text-sm text-orange-600 mb-4">
                  {isEditing 
                    ? 'Editing existing car rental booking.' 
                    : 'Your car rental booking ID has been generated and verified.'
                  }
                </p>
                <div className="bg-white border border-orange-300 rounded-md p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {isEditing ? 'Booking ID:' : 'Your Unique Booking ID:'}
                  </p>
                  <p className="text-2xl font-bold text-orange-700 font-mono">
                    {bookingId}
                  </p>
                </div>
                <p className="text-sm text-orange-600">
                  {isEditing ? 'This ID will remain the same after update' : 'Please save this ID for future reference'}
                </p>
              </div>
            </div>
            
            {/* Rental Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rental Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">City:</span>
                  <span className="text-gray-800 font-semibold">{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Traveler Name:</span>
                  <span className="text-gray-800 font-semibold">{formData.travelerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Pick-up Location:</span>
                  <span className="text-gray-800 font-semibold">{formData.pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Drop-off Location:</span>
                  <span className="text-gray-800 font-semibold">{formData.dropoffLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Pick-up Time:</span>  
                  <span className="text-gray-800 font-semibold">
                    {formData.pickupTime ? new Date(formData.pickupTime).toLocaleString() : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Agent Name:</span>
                  <span className="text-gray-800 font-semibold">{formData.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Booking Agent:</span>
                  <span className="text-gray-800 font-semibold">{formData.bookingAgent}</span>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <span className="text-gray-600 font-medium">Booking Entity:</span>
                  <span className="text-gray-800 font-semibold">{formData.bookingEntity}</span>
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
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Add Payment Info
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-2 rounded-md font-medium ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting 
                    ? 'Submitting...' 
                    : isEditing 
                      ? 'Update Booking' 
                      : 'Submit Booking'
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note Number</label>
                <input
                  type="text"
                  name="creditNoteNumber"
                  value={formData.creditNoteNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting 
                  ? 'Submitting...' 
                  : isEditing 
                    ? 'Update Booking' 
                    : 'Submit Booking'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarRentalForm;