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

function ForexBookingForm({ onSubmit, initialData = null, isEditing = false, onCancel = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBooking: '',
    agentName: '',
    bookingAgent: '', // New field added
    bookingEntity: '',
    travelerName: '',
    contactNumber: '',
    city: '',
    documents: {
      passport: false,
      visa: false,
      airlineTicket: false,
      panCard: false
    },
    invoiceNumber: '',
    creditNoteNumber: '',
    amount: '',
    refundAmount: '',
    paymentStatus: 'notReceived'
    // Removed ticketCopy field
  });

  const tabs = ['Booking Details', 'Generate Booking ID', 'Payment Information'];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        dateOfBooking: initialData.dateOfBooking ? new Date(initialData.dateOfBooking).toISOString().split('T')[0] : '',
        agentName: initialData.agentName || '',
        bookingAgent: initialData.bookingAgent || '', // New field initialization
        bookingEntity: initialData.bookingEntity || '',
        travelerName: initialData.travelerName || '',
        contactNumber: initialData.contactNumber || '',
        city: initialData.city || '',
        documents: initialData.documents || {
          passport: false,
          visa: false,
          airlineTicket: false,
          panCard: false
        },
        invoiceNumber: initialData.invoiceNumber || '',
        creditNoteNumber: initialData.creditNoteNumber || '',
        amount: initialData.amount || '',
        refundAmount: initialData.refundAmount || '',
        paymentStatus: initialData.paymentStatus || 'notReceived'
        // Removed ticketCopy initialization
      });

      // Use ticketId instead of bookingId for consistency
      if (initialData.ticketId) {
        setTicketId(initialData.ticketId);
      } else if (initialData.bookingId) {
        setTicketId(initialData.bookingId); // Fallback for old data
      }
    }
  }, [isEditing, initialData]);

  // Check if basic info is filled to enable tab 2
  const isBasicInfoFilled = () => {
    return (
      formData.dateOfBooking &&
      formData.agentName &&
      formData.bookingAgent && // Added to validation
      formData.bookingEntity &&
      formData.travelerName &&
      formData.contactNumber &&
      formData.city
    );
  };

  // Check if document info is filled to enable tab 3
  const isDocumentInfoChecked = () => {
    // At least one document should be checked
    return (
      formData.documents.passport ||
      formData.documents.visa ||
      formData.documents.airlineTicket ||
      formData.documents.panCard
    );
  };

  // Handle tab navigation with validation
  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true;
    if (tabIndex === 1) return isBasicInfoFilled();
    if (tabIndex === 2) return isBasicInfoFilled(); // Allow payment info anytime after basic info
    return false;
  };

  // Generate unique booking ID when reaching booking ID generation tab (only for new bookings)
  useEffect(() => {
    if (activeTab === 1 && !ticketId && !isEditing) {
      generateTicketId();
    }
  }, [activeTab, isEditing]);

  // Generate a unique ticket ID with FX prefix followed by numbers and letters
  const generateTicketId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FX-';
    
    // Ensure we have at least one letter and one number
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    result += '0123456789'.charAt(Math.floor(Math.random() * 10));
    
    // Add 3 more random characters
    for (let i = 0; i < 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setTicketId(result);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('doc_')) {
      // Handle document checkboxes
      const documentName = name.replace('doc_', '');
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [documentName]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission with backend integration
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create regular object for JSON submission (no file upload needed)
      const submitData = {
        ticketId: ticketId,
        bookingType: 'forex',
        dateOfBooking: formData.dateOfBooking,
        agentName: formData.agentName,
        bookingAgent: formData.bookingAgent, // New field included
        bookingEntity: formData.bookingEntity,
        travelerName: formData.travelerName,
        contactNumber: formData.contactNumber,
        city: formData.city,
        documents: formData.documents,
        invoiceNumber: formData.invoiceNumber || '',
        creditNoteNumber: formData.creditNoteNumber || '',
        amount: formData.amount || '0',
        refundAmount: formData.refundAmount || '0',
        paymentStatus: formData.paymentStatus
      };
      
      // Add timestamps
      if (isEditing) {
        submitData.submittedAt = initialData?.submittedAt || new Date().toISOString();
        submitData.lastModified = new Date().toISOString();
      } else {
        submitData.submittedAt = new Date().toISOString();
      }

      // Make API call - conditional based on editing mode
      let response;
      if (isEditing && initialData?._id) {
        // Update existing booking using PUT method and ObjectId
        response = await fetch(`${import.meta.env.VITE_API_URL}/forex-bookings/${initialData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      } else {
        // Create new booking using POST method
        response = await fetch('${import.meta.env.VITE_API_URL}/forex-bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Forex booking submitted successfully:', result);

      // Call parent onSubmit if provided with correct data format
      if (onSubmit) {
        // Ensure we pass the complete booking data for Search.jsx to handle updates
        const bookingData = {
          ...result,
          _id: result._id || initialData?._id,
          ticketId: ticketId,
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
          bookingAgent: '', // Reset new field
          bookingEntity: '',
          travelerName: '',
          contactNumber: '',
          city: '',
          documents: {
            passport: false,
            visa: false,
            airlineTicket: false,
            panCard: false
          },
          invoiceNumber: '',
          creditNoteNumber: '',
          amount: '',
          refundAmount: '',
          paymentStatus: 'notReceived'
          // Removed ticketCopy reset
        });
        setActiveTab(0);
        setTicketId('');
        
        alert('Forex booking submitted successfully!');
      } else {
        alert('Forex booking updated successfully!');
      }
      
    } catch (error) {
      console.error('Error submitting forex booking:', error);
      alert('Error submitting forex booking. Please try again.');
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
          {isEditing ? 'Edit Forex Booking' : 'Forex Booking Form'}
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
              {/* Date of Booking */}
              <div>
                <label htmlFor="dateOfBooking" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Booking
                </label>
                <input
                  type="date"
                  id="dateOfBooking"
                  name="dateOfBooking"
                  value={formData.dateOfBooking}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Agent Name */}
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* NEW: Booking Agent */}
              <div>
                <label htmlFor="bookingAgent" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Agent
                </label>
                <input
                  type="text"
                  id="bookingAgent"
                  name="bookingAgent"
                  value={formData.bookingAgent}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Booking Entity */}
              <div>
                <label htmlFor="bookingEntity" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Entity
                </label>
                <input
                  type="text"
                  id="bookingEntity"
                  name="bookingEntity"
                  value={formData.bookingEntity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Name of Traveller */}
              <div>
                <label htmlFor="travelerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Traveller
                </label>
                <input
                  type="text"
                  id="travelerName"
                  name="travelerName"
                  value={formData.travelerName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Document Verification */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Document Verification</h3>
              <p className="text-sm text-gray-600 mb-4">Please check all the documents that have been verified:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Passport */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doc_passport"
                    name="doc_passport"
                    checked={formData.documents.passport}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="doc_passport" className="ml-3 block text-sm font-medium text-gray-700">
                    Passport
                  </label>
                </div>
                
                {/* Visa */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doc_visa"
                    name="doc_visa"
                    checked={formData.documents.visa}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="doc_visa" className="ml-3 block text-sm font-medium text-gray-700">
                    Visa
                  </label>
                </div>
                
                {/* Airline Ticket */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doc_airlineTicket"
                    name="doc_airlineTicket"
                    checked={formData.documents.airlineTicket}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="doc_airlineTicket" className="ml-3 block text-sm font-medium text-gray-700">
                    Airline Ticket
                  </label>
                </div>
                
                {/* PAN Card */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doc_panCard"
                    name="doc_panCard"
                    checked={formData.documents.panCard}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="doc_panCard" className="ml-3 block text-sm font-medium text-gray-700">
                    PAN Card
                  </label>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Note: At least one document must be verified to proceed to the next step.
                </p>
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
        
        {/* Tab 2: Generate Booking ID */}
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
                  <p className="text-sm text-gray-600 mb-1">Your Forex Booking ID is:</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {ticketId}
                  </p>
                </div>
                <p className="text-sm text-green-600">
                  Please save this Booking ID for future reference. You can use it to search and edit this booking.
                </p>
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
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              {/* Invoice Number */}
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Credit Note Number */}
              <div>
                <label htmlFor="creditNoteNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Note Number
                </label>
                <input
                  type="text"
                  id="creditNoteNumber"
                  name="creditNoteNumber"
                  value={formData.creditNoteNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Refund Amount */}
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  id="refundAmount"
                  name="refundAmount"
                  value={formData.refundAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Payment Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
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
              
              {/* REMOVED: Attach Ticket Copy section */}
            </div>

            {/* Navigation and Submit Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-2 rounded-md font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting 
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

export default ForexBookingForm;