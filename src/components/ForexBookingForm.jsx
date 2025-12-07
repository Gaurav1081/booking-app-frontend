import { useState, useEffect } from 'react';

function TabNavigation({ activeTab, setActiveTab, tabs, canProceed }) {
  return (
    <div className="flex mb-4 border-b overflow-x-auto">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`py-2 px-4 mr-2 whitespace-nowrap ${
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
    bookingAgent: '',
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
    paymentStatus: 'notReceived',
    country: '',
    nosOfDay: '',
    departureDate: '',
    returnDate: '',
    exchangeDate: '',
    totalForexPurchased: '',
    ratePerDay: '',
    entertainment: '',
    debitTo: '',
    inrAmount: '',
    billNo: '',
    paymentDetails: '',
    company: '',
    inrRefundAmount: '',
    refundChequeNo: '',
    dateOfCheque: '',
    refundBankDate: '',
    refundSendToAccount: '',
    chequeNo: '',
    dateOfChequeSecond: '',
    bankReport: '',
    dateReceived: '',
    reportDateSendToAcc: '',
    ftmDateSend: '',
    ftmSendTo: '',
    billNoSecond: '',
    billAmount: '',
    reportDue: false,
    ftmDue: false,
    recordIncomplete: false,
    designation: '',
    remarks: '',
    denomination: '',
    exchangeDone: false,
    currencyCode: '',
    department: '',
    visaCost: '',
    // NEW FIELDS
    purchasedName: '',
    numberOfDays: '',
    billingEntity: '',
    refundChequeDate: '',
    refundBank: '',
    refundSentToAccountDate: '',
    surrenderBillNo: ''
  });

  const tabs = ['Booking Details', 'Generate Booking ID', 'Purchased', 'Surrender', 'Payment Information'];

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        dateOfBooking: initialData.dateOfBooking ? new Date(initialData.dateOfBooking).toISOString().split('T')[0] : '',
        agentName: initialData.agentName || '',
        bookingAgent: initialData.bookingAgent || '',
        bookingEntity: initialData.bookingEntity || '',
        travelerName: initialData.travelerName || '',
        contactNumber: initialData.contactNumber || '',
        city: initialData.city || '',
        documents: initialData.documents || { passport: false, visa: false, airlineTicket: false, panCard: false },
        invoiceNumber: initialData.invoiceNumber || '',
        creditNoteNumber: initialData.creditNoteNumber || '',
        amount: initialData.amount || '',
        refundAmount: initialData.refundAmount || '',
        paymentStatus: initialData.paymentStatus || 'notReceived',
        country: initialData.country || '',
        nosOfDay: initialData.nosOfDay || '',
        departureDate: initialData.departureDate ? new Date(initialData.departureDate).toISOString().split('T')[0] : '',
        returnDate: initialData.returnDate ? new Date(initialData.returnDate).toISOString().split('T')[0] : '',
        exchangeDate: initialData.exchangeDate ? new Date(initialData.exchangeDate).toISOString().split('T')[0] : '',
        totalForexPurchased: initialData.totalForexPurchased || '',
        ratePerDay: initialData.ratePerDay || '',
        entertainment: initialData.entertainment || '',
        debitTo: initialData.debitTo || '',
        inrAmount: initialData.inrAmount || '',
        billNo: initialData.billNo || '',
        paymentDetails: initialData.paymentDetails || '',
        company: initialData.company || '',
        inrRefundAmount: initialData.inrRefundAmount || '',
        refundChequeNo: initialData.refundChequeNo || '',
        dateOfCheque: initialData.dateOfCheque ? new Date(initialData.dateOfCheque).toISOString().split('T')[0] : '',
        refundBankDate: initialData.refundBankDate ? new Date(initialData.refundBankDate).toISOString().split('T')[0] : '',
        refundSendToAccount: initialData.refundSendToAccount || '',
        chequeNo: initialData.chequeNo || '',
        dateOfChequeSecond: initialData.dateOfChequeSecond ? new Date(initialData.dateOfChequeSecond).toISOString().split('T')[0] : '',
        bankReport: initialData.bankReport || '',
        dateReceived: initialData.dateReceived ? new Date(initialData.dateReceived).toISOString().split('T')[0] : '',
        reportDateSendToAcc: initialData.reportDateSendToAcc ? new Date(initialData.reportDateSendToAcc).toISOString().split('T')[0] : '',
        ftmDateSend: initialData.ftmDateSend ? new Date(initialData.ftmDateSend).toISOString().split('T')[0] : '',
        ftmSendTo: initialData.ftmSendTo || '',
        billNoSecond: initialData.billNoSecond || '',
        billAmount: initialData.billAmount || '',
        reportDue: initialData.reportDue || false,
        ftmDue: initialData.ftmDue || false,
        recordIncomplete: initialData.recordIncomplete || false,
        designation: initialData.designation || '',
        remarks: initialData.remarks || '',
        denomination: initialData.denomination || '',
        exchangeDone: initialData.exchangeDone || false,
        currencyCode: initialData.currencyCode || '',
        department: initialData.department || '',
        visaCost: initialData.visaCost || '',
        purchasedName: initialData.purchasedName || '',
        numberOfDays: initialData.numberOfDays || '',
        billingEntity: initialData.billingEntity || '',
        refundChequeDate: initialData.refundChequeDate || '',
        refundBank: initialData.refundBank || '',
        refundSentToAccountDate: initialData.refundSentToAccountDate || '',
        surrenderBillNo: initialData.surrenderBillNo || ''
      });

      if (initialData.ticketId) {
        setTicketId(initialData.ticketId);
      } else if (initialData.bookingId) {
        setTicketId(initialData.bookingId);
      }
    }
  }, [isEditing, initialData]);

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

  const canProceedToTab = (tabIndex) => {
    if (tabIndex === 0) return true;
    if (tabIndex >= 1) return isBasicInfoFilled();
    return false;
  };

  useEffect(() => {
    if (activeTab === 1 && !ticketId && !isEditing) {
      generateTicketId();
    }
  }, [activeTab, isEditing]);

  const generateTicketId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FX-';
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    result += '0123456789'.charAt(Math.floor(Math.random() * 10));
    for (let i = 0; i < 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setTicketId(result);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('doc_')) {
      const documentName = name.replace('doc_', '');
      setFormData({
        ...formData,
        documents: { ...formData.documents, [documentName]: checked }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ticketId,
        bookingType: 'forex',
        ...formData,
        amount: formData.amount || '0',
        refundAmount: formData.refundAmount || '0'
      };
      
      if (isEditing) {
        submitData.submittedAt = initialData?.submittedAt || new Date().toISOString();
        submitData.lastModified = new Date().toISOString();
      } else {
        submitData.submittedAt = new Date().toISOString();
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/forex-bookings/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_URL}/forex-bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (onSubmit) {
        onSubmit({
          ...result,
          _id: result._id || initialData?._id,
          ticketId,
          ...formData,
          submittedAt: isEditing ? (initialData?.submittedAt || new Date().toISOString()) : new Date().toISOString(),
          lastModified: isEditing ? new Date().toISOString() : undefined
        });
      }
      
      if (!isEditing) {
        setFormData({
          dateOfBooking: '', agentName: '', bookingAgent: '', bookingEntity: '', travelerName: '', contactNumber: '', city: '',
          documents: { passport: false, visa: false, airlineTicket: false, panCard: false },
          invoiceNumber: '', creditNoteNumber: '', amount: '', refundAmount: '', paymentStatus: 'notReceived',
          country: '', nosOfDay: '', departureDate: '', returnDate: '', exchangeDate: '', totalForexPurchased: '',
          ratePerDay: '', entertainment: '', debitTo: '', inrAmount: '', billNo: '', paymentDetails: '', company: '',
          inrRefundAmount: '', refundChequeNo: '', dateOfCheque: '', refundBankDate: '', refundSendToAccount: '',
          chequeNo: '', dateOfChequeSecond: '', bankReport: '', dateReceived: '', reportDateSendToAcc: '',
          ftmDateSend: '', ftmSendTo: '', billNoSecond: '', billAmount: '', reportDue: false, ftmDue: false,
          recordIncomplete: false, designation: '', remarks: '', denomination: '', exchangeDone: false,
          currencyCode: '', department: '', visaCost: '', purchasedName: '', numberOfDays: '', billingEntity: '',
          refundChequeDate: '', refundBank: '', refundSentToAccountDate: '', surrenderBillNo: ''
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

  const handleNext = () => {
    if (activeTab < tabs.length - 1 && canProceedToTab(activeTab + 1)) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Forex Booking' : 'Forex Booking Form'}
        </h2>
        {isEditing && onCancel && (
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel Edit
          </button>
        )}
      </div>
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} canProceed={canProceedToTab} />
      
      <div>
        {/* TAB 0: BOOKING DETAILS */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateOfBooking" className="block text-sm font-medium text-gray-700 mb-1">Date of Booking</label>
                <input type="date" id="dateOfBooking" name="dateOfBooking" value={formData.dateOfBooking} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input type="text" id="agentName" name="agentName" value={formData.agentName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="bookingAgent" className="block text-sm font-medium text-gray-700 mb-1">Booking Agent</label>
                <input type="text" id="bookingAgent" name="bookingAgent" value={formData.bookingAgent} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="bookingEntity" className="block text-sm font-medium text-gray-700 mb-1">Booking Entity</label>
                <input type="text" id="bookingEntity" name="bookingEntity" value={formData.bookingEntity} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="travelerName" className="block text-sm font-medium text-gray-700 mb-1">Name of Traveller</label>
                <input type="text" id="travelerName" name="travelerName" value={formData.travelerName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" id="country" name="country" value={formData.country} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" id="department" name="department" value={formData.department} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input type="text" id="company" name="company" value={formData.company} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Document Verification</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input type="checkbox" id="doc_passport" name="doc_passport" checked={formData.documents.passport} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="doc_passport" className="ml-3 block text-sm font-medium text-gray-700">Passport</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="doc_visa" name="doc_visa" checked={formData.documents.visa} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="doc_visa" className="ml-3 block text-sm font-medium text-gray-700">Visa</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="doc_airlineTicket" name="doc_airlineTicket" checked={formData.documents.airlineTicket} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="doc_airlineTicket" className="ml-3 block text-sm font-medium text-gray-700">Airline Ticket</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="doc_panCard" name="doc_panCard" checked={formData.documents.panCard} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="doc_panCard" className="ml-3 block text-sm font-medium text-gray-700">PAN Card</label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>

            <div className="flex justify-between">
              <div></div>
              <button onClick={handleNext} disabled={!canProceedToTab(1)}
                className={`px-6 py-2 rounded-md font-medium ${canProceedToTab(1) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* TAB 1: GENERATE BOOKING ID */}
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
                  <p className="text-2xl font-bold text-green-700 font-mono">{ticketId}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevious} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Previous</button>
              <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next</button>
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASED SECTION */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Purchased Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="purchasedName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="purchasedName" name="purchasedName" value={formData.purchasedName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="numberOfDays" className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
                <input type="text" id="numberOfDays" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                <input type="date" id="departureDate" name="departureDate" value={formData.departureDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                <input type="date" id="returnDate" name="returnDate" value={formData.returnDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="exchangeDate" className="block text-sm font-medium text-gray-700 mb-1">Exchange Date</label>
                <input type="date" id="exchangeDate" name="exchangeDate" value={formData.exchangeDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="totalForexPurchased" className="block text-sm font-medium text-gray-700 mb-1">Total Forex Purchased</label>
                <input type="number" id="totalForexPurchased" name="totalForexPurchased" value={formData.totalForexPurchased} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="ratePerDay" className="block text-sm font-medium text-gray-700 mb-1">Rate per Day</label>
                <input type="number" id="ratePerDay" name="ratePerDay" value={formData.ratePerDay} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="entertainment" className="block text-sm font-medium text-gray-700 mb-1">Entertainment</label>
                <input type="text" id="entertainment" name="entertainment" value={formData.entertainment} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="billingEntity" className="block text-sm font-medium text-gray-700 mb-1">Billing Entity</label>
                <input type="text" id="billingEntity" name="billingEntity" value={formData.billingEntity} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="inrAmount" className="block text-sm font-medium text-gray-700 mb-1">INR Amount</label>
                <input type="number" id="inrAmount" name="inrAmount" value={formData.inrAmount} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="billNo" className="block text-sm font-medium text-gray-700 mb-1">Bill No</label>
                <input type="text" id="billNo" name="billNo" value={formData.billNo} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                <input type="text" id="paymentDetails" name="paymentDetails" value={formData.paymentDetails} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevious} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Previous</button>
              <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next</button>
            </div>
          </div>
        )}

        {/* TAB 3: SURRENDER SECTION */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Surrender Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                <input type="number" id="refundAmount" name="refundAmount" value={formData.refundAmount} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="inrRefundAmount" className="block text-sm font-medium text-gray-700 mb-1">INR Refund Amount</label>
                <input type="number" id="inrRefundAmount" name="inrRefundAmount" value={formData.inrRefundAmount} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="refundChequeNo" className="block text-sm font-medium text-gray-700 mb-1">Refund Cheque No</label>
                <input type="text" id="refundChequeNo" name="refundChequeNo" value={formData.refundChequeNo} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="refundChequeDate" className="block text-sm font-medium text-gray-700 mb-1">Refund Cheque Date</label>
                <input type="text" id="refundChequeDate" name="refundChequeDate" value={formData.refundChequeDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="refundBank" className="block text-sm font-medium text-gray-700 mb-1">Refund Bank</label>
                <input type="text" id="refundBank" name="refundBank" value={formData.refundBank} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="refundSentToAccountDate" className="block text-sm font-medium text-gray-700 mb-1">Refund Sent to Account Date</label>
                <input type="text" id="refundSentToAccountDate" name="refundSentToAccountDate" value={formData.refundSentToAccountDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="chequeNo" className="block text-sm font-medium text-gray-700 mb-1">Cheque No</label>
                <input type="text" id="chequeNo" name="chequeNo" value={formData.chequeNo} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="surrenderBillNo" className="block text-sm font-medium text-gray-700 mb-1">Surrender Bill No</label>
                <input type="text" id="surrenderBillNo" name="surrenderBillNo" value={formData.surrenderBillNo} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="billAmount" className="block text-sm font-medium text-gray-700 mb-1">Bill Amount</label>
                <input type="number" id="billAmount" name="billAmount" value={formData.billAmount} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (Amendment / Cancellation)</label>
                <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevious} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Previous</button>
              <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next</button>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT INFORMATION */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input type="text" id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="creditNoteNumber" className="block text-sm font-medium text-gray-700 mb-1">Credit Note Number</label>
                <input type="text" id="creditNoteNumber" name="creditNoteNumber" value={formData.creditNoteNumber} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <input type="text" id="currencyCode" name="currencyCode" value={formData.currencyCode} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="denomination" className="block text-sm font-medium text-gray-700 mb-1">Denomination</label>
                <input type="text" id="denomination" name="denomination" value={formData.denomination} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="visaCost" className="block text-sm font-medium text-gray-700 mb-1">Visa Cost</label>
                <input type="number" id="visaCost" name="visaCost" value={formData.visaCost} onChange={handleChange}
                  min="0" step="0.01" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="paymentStatus" value="received" checked={formData.paymentStatus === 'received'} onChange={handleChange} className="mr-2" />
                    <span className="text-sm text-gray-700">Payment Received</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="paymentStatus" value="notReceived" checked={formData.paymentStatus === 'notReceived'} onChange={handleChange} className="mr-2" />
                    <span className="text-sm text-gray-700">Payment Not Received</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input type="checkbox" id="exchangeDone" name="exchangeDone" checked={formData.exchangeDone} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="exchangeDone" className="ml-3 block text-sm font-medium text-gray-700">Exchange Done</label>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input type="checkbox" id="recordIncomplete" name="recordIncomplete" checked={formData.recordIncomplete} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="recordIncomplete" className="ml-3 block text-sm font-medium text-gray-700">Record Incomplete</label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevious} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Previous
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className={`px-8 py-2 rounded-md font-medium ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Booking' : 'Submit Booking')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForexBookingForm;