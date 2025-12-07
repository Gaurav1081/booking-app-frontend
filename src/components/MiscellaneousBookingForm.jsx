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

function MiscellaneousBookingForm({ onSubmit, initialData = null, isEditing = false, onCancel = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [ticketId, setTicketId] = useState('');
  const [serviceDetails, setServiceDetails] = useState([{ description: '', notes: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bookingDate: '',
    agentName: '',
    bookingAgent: '',
    bookingEntity: '',
    travelerName: '',
    contactNumber: '',
    serviceType: '',
    invoiceNumber: '',
    creditNoteNumber: '',
    amount: '',
    refundAmount: '',
    paymentStatus: 'notReceived',
    remarks: ''
  });

  const tabs = ['Booking Details', 'Generate Ticket ID', 'Payment Information'];

  // Initialize form with existing data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        bookingDate: initialData.bookingDate || '',
        agentName: initialData.agentName || '',
        bookingAgent: initialData.bookingAgent || '',
        bookingEntity: initialData.bookingEntity || '',
        travelerName: initialData.travelerName || '',
        contactNumber: initialData.contactNumber || '',
        serviceType: initialData.serviceType || '',
        invoiceNumber: initialData.invoiceNumber || '',
        creditNoteNumber: initialData.creditNoteNumber || '',
        amount: initialData.amount || '',
        refundAmount: initialData.refundAmount || '',
        paymentStatus: initialData.paymentStatus || 'notReceived',
        remarks: initialData.remarks || ''
      });
      
      if (initialData.serviceDetails && Array.isArray(initialData.serviceDetails)) {
        setServiceDetails(initialData.serviceDetails);
      }
      
      if (initialData.ticketId) {
        setTicketId(initialData.ticketId);
      }
    }
  }, [isEditing, initialData]);

  // Add new service detail entry
  const addServiceDetail = () => {
    setServiceDetails([...serviceDetails, { description: '', notes: '' }]);
  };

  // Remove service detail entry
  const removeServiceDetail = (index) => {
    if (serviceDetails.length > 1) {
      const newDetails = serviceDetails.filter((_, i) => i !== index);
      setServiceDetails(newDetails);
    }
  };

  // Handle service detail changes
  const handleServiceDetailChange = (index, field, value) => {
    const newDetails = [...serviceDetails];
    newDetails[index][field] = value;
    setServiceDetails(newDetails);
  };

  // Check if basic info is filled to enable tab 2
  const isBasicInfoFilled = () => {
    const hasValidServiceDetails = serviceDetails.every(detail => 
      detail.description.trim()
    );
    
    return (
      hasValidServiceDetails &&
      formData.bookingDate &&
      formData.agentName &&
      formData.bookingAgent &&
      formData.bookingEntity &&
      formData.travelerName &&
      formData.contactNumber &&
      formData.serviceType
    );
  };

  // Handle tab navigation with validation
  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true; // Booking Details always accessible
    if (tabIndex === 1) return isBasicInfoFilled(); // Generate Ticket ID after basic info
    if (tabIndex === 2) return isBasicInfoFilled(); // Payment can be filled anytime after booking details
    return false;
  };

  // Generate unique ticket ID when reaching ticket generation tab
  useEffect(() => {
    if (activeTab === 1 && !ticketId && !isEditing) {
      generateTicketId();
    }
  }, [activeTab, isEditing]);

  // Generate a unique ticket ID of length 5 with mixed letters and numbers
  const generateTicketId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'MISC-';
    
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

  // Handle form submission with backend integration
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create JSON payload with all fields for proper export
      const submitData = {
        bookingDate: formData.bookingDate,
        agentName: formData.agentName,
        bookingAgent: formData.bookingAgent,
        bookingEntity: formData.bookingEntity,
        travelerName: formData.travelerName,
        contactNumber: formData.contactNumber,
        serviceType: formData.serviceType,
        invoiceNumber: formData.invoiceNumber,
        creditNoteNumber: formData.creditNoteNumber,
        amount: formData.amount,
        refundAmount: formData.refundAmount,
        paymentStatus: formData.paymentStatus,
        remarks: formData.remarks,
        ticketId: ticketId,
        bookingType: 'miscellaneous',
        serviceDetails: serviceDetails.map(detail => ({
          description: detail.description || '',
          notes: detail.notes || ''
        }))
      };
      
      // Add timestamps and metadata for proper tracking and export
      if (isEditing) {
        submitData.submittedAt = initialData?.submittedAt || new Date().toISOString();
        submitData.lastModified = new Date().toISOString();
        submitData.submittedBy = initialData?.submittedBy || '';
        submitData.submittedByRole = initialData?.submittedByRole || '';
        if (initialData?._id) {
          submitData._id = initialData._id;
        }
      } else {
        submitData.submittedAt = new Date().toISOString();
        submitData.lastModified = new Date().toISOString();
        // Add current user info if available (you might need to get this from your auth context)
        submitData.submittedBy = 'Current User'; // Replace with actual user
        submitData.submittedByRole = 'PARENT'; // Replace with actual role
      }

      // Make API call
      const url = isEditing && initialData?._id 
        ? `${import.meta.env.VITE_API_URL}/miscellaneous-bookings/${initialData._id}`
        : `${import.meta.env.VITE_API_URL}/miscellaneous-bookings`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
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
      
      // Reset form after successful submission only if not editing
      if (!isEditing) {
        setFormData({
          bookingDate: '',
          agentName: '',
          bookingAgent: '',
          bookingEntity: '',
          travelerName: '',
          contactNumber: '',
          serviceType: '',
          invoiceNumber: '',
          creditNoteNumber: '',
          amount: '',
          refundAmount: '',
          paymentStatus: 'notReceived',
          remarks: ''
        });
        setServiceDetails([{ description: '', notes: '' }]);
        setActiveTab(0);
        setTicketId('');
      }
      
      alert(isEditing 
        ? 'Miscellaneous booking updated successfully!' 
        : 'Miscellaneous booking submitted successfully!'
      );
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert(`Error ${isEditing ? 'updating' : 'submitting'} booking: ${error.message}`);
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
          {isEditing ? `Edit Miscellaneous Booking - ${ticketId}` : 'Miscellaneous Booking Form'}
        </h2>
        {isEditing && onCancel && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
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
            {/* Date of Booking */}
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Booking:
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>
            
            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name:
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="bookingAgent" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Agent:
                </label>
                <input
                  type="text"
                  id="bookingAgent"
                  name="bookingAgent"
                  value={formData.bookingAgent}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="bookingEntity" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Entity:
                </label>
                <input
                  type="text"
                  id="bookingEntity"
                  name="bookingEntity"
                  value={formData.bookingEntity}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="travelerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Traveller:
                </label>
                <input
                  type="text"
                  id="travelerName"
                  name="travelerName"
                  value={formData.travelerName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number:
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Type of Service */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Service:
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Service Type</option>
                <option value="visa">Visa Services</option>
                <option value="insurance">Travel Insurance</option>
                <option value="forex">Foreign Exchange</option>
                <option value="transportation">Local Transportation</option>
                <option value="accommodation">Accommodation Booking</option>
                <option value="tour-package">Tour Package</option>
                <option value="documentation">Documentation Services</option>
                <option value="consultation">Travel Consultation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Details of Service */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-medium text-gray-700">Details of Service</label>
                <button
                  type="button"
                  onClick={addServiceDetail}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  disabled={isSubmitting}
                >
                  <span className="text-lg mr-1">+</span>
                  Add Detail
                </button>
              </div>
              
              {serviceDetails.map((detail, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Service Detail {index + 1}</span>
                    {serviceDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceDetail(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Visa processing for US tourist visa"
                        value={detail.description}
                        onChange={(e) => handleServiceDetailChange(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                      <textarea
                        rows="2"
                        placeholder="Any additional details or special requirements"
                        value={detail.notes}
                        onChange={(e) => handleServiceDetailChange(index, 'notes', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tab 2: Generate Ticket ID */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div style={{
              backgroundColor: "#e8f5e9",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3 style={{ color: "#2e7d32", marginBottom: "10px", fontSize: "20px" }}>
                {isEditing ? 'Existing Ticket ID' : 'Ticket ID Generated Successfully'}
              </h3>
              <p style={{ color: "#388e3c", fontSize: "16px" }}>
                {isEditing ? 'This is the existing ticket ID for this booking.' : 'Your miscellaneous booking ticket ID has been generated and verified.'}
              </p>
              
              <div style={{
                marginTop: "20px",
                padding: "20px",
                backgroundColor: "white",
                border: "2px solid #c8e6c9",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <p style={{ fontSize: "16px", color: "#555", marginBottom: "8px" }}>
                  {isEditing ? 'Ticket ID:' : 'Your Unique Ticket ID:'}
                </p>
                <p style={{ fontSize: "28px", fontWeight: "bold", color: "#4a90e2", margin: "12px 0" }}>{ticketId}</p>
                <p style={{ fontSize: "14px", color: "#777" }}>Please save this ID for future reference</p>
              </div>
            </div>
            
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#333", marginBottom: "20px" }}>Booking Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px 20px", fontSize: "15px" }}>
                <div style={{ color: "#666", fontWeight: "500" }}>Booking Date:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.bookingDate}</div>
                
                <div style={{ color: "#666", fontWeight: "500" }}>Traveler Name:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.travelerName}</div>
                
                <div style={{ color: "#666", fontWeight: "500" }}>Contact Number:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.contactNumber}</div>
                
                <div style={{ color: "#666", fontWeight: "500" }}>Agent Name:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.agentName}</div>
                
                <div style={{ color: "#666", fontWeight: "500" }}>Booking Agent:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.bookingAgent}</div>
                
                <div style={{ color: "#666", fontWeight: "500" }}>Booking Entity:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.bookingEntity}</div>
                
                <div style={{ color: "#666", fontWeight: "500" }}>Service Type:</div>
                <div style={{ fontWeight: "600", color: "#333" }}>{formData.serviceType}</div>
              </div>
              
              <div style={{ marginTop: "20px" }}>
                <div style={{ color: "#666", fontWeight: "500", marginBottom: "12px" }}>Service Details:</div>
                <div style={{ paddingLeft: "12px" }}>
                  {serviceDetails.map((detail, index) => (
                    <div key={index} style={{ marginBottom: "12px" }}>
                      <div style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}>
                        {index + 1}. {detail.description}
                      </div>
                      {detail.notes && (
                        <div style={{ color: "#666", fontSize: "14px", paddingLeft: "12px" }}>
                          Notes: {detail.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab 3: Payment Information */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number:
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="creditNoteNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Note Number:
                </label>
                <input
                  type="text"
                  id="creditNoteNumber"
                  name="creditNoteNumber"
                  value={formData.creditNoteNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount:
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount:
                </label>
                <input
                  type="number"
                  id="refundAmount"
                  name="refundAmount"
                  value={formData.refundAmount}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Details:
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="received"
                    checked={formData.paymentStatus === 'received'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2">Received</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="notReceived"
                    checked={formData.paymentStatus === 'notReceived'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2">Not Received</span>
                </label>
              </div>
            </div>
            
            {/* Remarks Field */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Amendment / Cancellation):
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                placeholder="Enter any remarks regarding amendments or cancellations..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="mt-8">
          {/* Tab 0: Booking Details - Only Next button */}
          {activeTab === 0 && (
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isBasicInfoFilled() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
              onClick={handleNext}
              disabled={!isBasicInfoFilled() || isSubmitting}
            >
              {isEditing ? 'Next: Review Ticket ID' : 'Generate Ticket ID'}
            </button>
          )}
          
          {/* Tab 1: Generate Ticket ID - Previous, Add Payment Info, and Submit buttons */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Previous
                </button>
                
                <button
                  type="button"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Add Payment Info
                </button>
              </div>
              
              <button
                type="button"
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Submitting...') 
                  : (isEditing ? 'Update Booking' : 'Submit Booking')
                }
              </button>
            </div>
          )}
          
          {/* Tab 2: Payment Information - Previous and Submit buttons */}
          {activeTab === 2 && (
            <div className="flex gap-4">
              <button
                type="button"
               className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </button>
              
              <button
                type="button"
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Submitting...') 
                  : (isEditing ? 'Update Booking' : 'Submit Booking')
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiscellaneousBookingForm;