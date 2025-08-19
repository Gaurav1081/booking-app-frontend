import { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthenticationSystem';
import AuthenticationSystem from './components/AuthenticationSystem';
import Homepage from './components/Homepage.jsx';

// Import all your existing form components
import FlightBookingForm from './components/FlightBookingForm';
import HotelBookingForm from './components/HotelBookingForm';
import AirportTransferForm from './components/AirportTransferForm';
import CarRentalForm from './components/CarRentalForm';
import ForexBookingForm from './components/ForexBookingForm';
import VisaBookingForm from './components/VisaBookingForm';
import MiscellaneousBookingForm from './components/MiscellaneousBookingForm';
import PassportDetailsForm from './components/PassportDetailsForm';
import Search from './components/Search';
import { generateExcel } from './utils/excelExport';
import './App.css';

// Enhanced Form Wrapper Component
const FormWithExport = ({ 
  FormComponent, 
  formData, 
  onSubmit, 
  formType, 
  user, 
  hasPermission 
}) => {
  // Don't show export button for Passport Details
  if (formType === 'Passport Details') {
    return <FormComponent onSubmit={onSubmit} />;
  }

  const handleExport = async () => {
    if (!hasPermission('export_excel')) {
      alert('You do not have permission to export data');
      return;
    }

    try {
      let data = [];
      let fileName = '';

      // Fetch from backend for all forms (except passport which doesn't have export)
      if (formType === 'Flight Booking') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/flight-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Flight_Bookings.xlsx';
      } else if (formType === 'Hotel Booking') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hotel-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Hotel_Bookings.xlsx';
      } else if (formType === 'Airport Transfer') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/airport-transfer-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Airport_Transfers.xlsx';
      } else if (formType === 'Car Rental') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/car-rental-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Car_Rentals.xlsx';
      } else if (formType === 'Forex') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/forex-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Forex_Transactions.xlsx';
      } else if (formType === 'VISA') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/visa-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Visa_Applications.xlsx';
      } else if (formType === 'Miscellaneous') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/miscellaneous-bookings`);
        const apiData = await response.json();
        data = Array.isArray(apiData) ? apiData : (apiData.data || apiData.bookings || []);
        fileName = 'Miscellaneous_Services.xlsx';
      }

      if (data.length === 0) {
        alert('No data available to export');
        return;
      }

      generateExcel(data, fileName);
    } catch (error) {
      console.error('Error during export:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="form-with-export-container">
      {/* Export button - only show if user has permission */}
      {hasPermission('export_excel') && (
        <div className="export-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#495057' }}>{formType}</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
              Click export to download all saved records
            </p>
          </div>
          <button 
            onClick={handleExport}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            Export to Excel
          </button>
        </div>
      )}
      
      {/* Render the actual form */}
      <FormComponent onSubmit={onSubmit} />
    </div>
  );
};

// Main App Component (wrapped with authentication)
function BookingApp() {
  const { user, logout, hasPermission, loading } = useAuth();
  
  // State to control which main view to show
  const [currentMainView, setCurrentMainView] = useState('homepage');
  
  // State for active tab/form (for the booking system)
  const [activeForm, setActiveForm] = useState('flight');
  
  // Combined state to store all booking data
  const [allBookingData, setAllBookingData] = useState([]);
  
  // States to store form data (kept for backward compatibility and individual exports)
  const [flightData, setFlightData] = useState([]);
  const [hotelData, setHotelData] = useState([]);
  const [airportTransferData, setAirportTransferData] = useState([]);
  const [carRentalData, setCarRentalData] = useState([]);
  const [forexData, setForexData] = useState([]);
  const [visaData, setVisaData] = useState([]);
  const [passportData, setPassportData] = useState([]);
  const [miscData, setMiscData] = useState([]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication system if user is not logged in
  if (!user) {
    return <AuthenticationSystem />;
  }

  // Handle tab change
  const handleTabChange = (formType) => {
    setActiveForm(formType);
  };

  // Handle switching to booking system
  const switchToBookingSystem = (formType = 'flight') => {
    setCurrentMainView('booking-system');
    setActiveForm(formType);
  };

  // Updated: Handle exporting data to Excel (fetches from backend for all forms except passport)
  const handleExportToExcel = async () => {
    if (!hasPermission('export_excel')) {
      alert('You do not have permission to export data');
      return;
    }

    // Don't allow export for passport details
    if (activeForm === 'passport') {
      alert('Export is not available for Passport Details');
      return;
    }

    let data = [];
    let fileName = '';
    
    try {
      switch(activeForm) {
        case 'flight':
          const flightResponse = await fetch(`${import.meta.env.VITE_API_URL}/flight-bookings`);
          const flightData = await flightResponse.json();
          data = Array.isArray(flightData) ? flightData : (flightData.data || flightData.bookings || []);
          fileName = 'Flight_Bookings.xlsx';
          break;
          
        case 'hotel':
          const hotelResponse = await fetch(`${import.meta.env.VITE_API_URL}/hotel-bookings`);
          const hotelData = await hotelResponse.json();
          data = Array.isArray(hotelData) ? hotelData : (hotelData.data || hotelData.bookings || []);
          fileName = 'Hotel_Bookings.xlsx';
          break;
          
        case 'airportTransfer':
          const transferResponse = await fetch(`${import.meta.env.VITE_API_URL}/airport-transfer-bookings`);
          const transferData = await transferResponse.json();
          data = Array.isArray(transferData) ? transferData : (transferData.data || transferData.bookings || []);
          fileName = 'Airport_Transfers.xlsx';
          break;
          
        case 'carRental':
          const carResponse = await fetch(`${import.meta.env.VITE_API_URL}/car-rental-bookings`);
          const carData = await carResponse.json();
          data = Array.isArray(carData) ? carData : (carData.data || carData.bookings || []);
          fileName = 'Car_Rentals.xlsx';
          break;
          
        case 'forex':
          const forexResponse = await fetch(`${import.meta.env.VITE_API_URL}/forex-bookings`);
          const forexData = await forexResponse.json();
          data = Array.isArray(forexData) ? forexData : (forexData.data || forexData.bookings || []);
          fileName = 'Forex_Transactions.xlsx';
          break;
          
        case 'visa':
          const visaResponse = await fetch(`${import.meta.env.VITE_API_URL}/visa-bookings`);
          const visaData = await visaResponse.json();
          data = Array.isArray(visaData) ? visaData : (visaData.data || visaData.bookings || []);
          fileName = 'Visa_Applications.xlsx';
          break;
          
        case 'miscellaneous':
          const miscResponse = await fetch(`${import.meta.env.VITE_API_URL}/miscellaneous-bookings`);
          const miscData = await miscResponse.json();
          data = Array.isArray(miscData) ? miscData : (miscData.data || miscData.bookings || []);
          fileName = 'Miscellaneous_Services.xlsx';
          break;
          
        case 'search':
          // For search, fetch all data from backend (excluding passport)
          const [flightRes, hotelRes, transferRes, carRes, forexRes, miscRes, visaRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/flight-bookings`),
            fetch(`${import.meta.env.VITE_API_URL}/hotel-bookings`),
            fetch(`${import.meta.env.VITE_API_URL}/airport-transfer-bookings`),
            fetch(`${import.meta.env.VITE_API_URL}/car-rental-bookings`),
            fetch(`${import.meta.env.VITE_API_URL}/forex-bookings`),
            fetch(`${import.meta.env.VITE_API_URL}/miscellaneous-bookings`),
            fetch(`${import.meta.env.VITE_API_URL}/visa-bookings`)
          ]);
          
          const flightBookings = await flightRes.json();
          const hotelBookings = await hotelRes.json();
          const transferBookings = await transferRes.json();
          const carBookings = await carRes.json();
          const forexBookings = await forexRes.json();
          const miscBookings = await miscRes.json();
          const visaBookings = await visaRes.json();
          
          const allFlights = Array.isArray(flightBookings) ? flightBookings : (flightBookings.data || []);
          const allHotels = Array.isArray(hotelBookings) ? hotelBookings : (hotelBookings.data || []);
          const allTransfers = Array.isArray(transferBookings) ? transferBookings : (transferBookings.data || []);
          const allCars = Array.isArray(carBookings) ? carBookings : (carBookings.data || []);
          const allForex = Array.isArray(forexBookings) ? forexBookings : (forexBookings.data || []);
          const allMisc = Array.isArray(miscBookings) ? miscBookings : (miscBookings.data || []);
          const allVisa = Array.isArray(visaBookings) ? visaBookings : (visaBookings.data || []);
          
          data = [...allFlights, ...allHotels, ...allTransfers, ...allCars, ...allForex, ...allMisc, ...allVisa];
          fileName = 'All_Bookings.xlsx';
          break;
          
        default:
          data = [];
          fileName = 'Bookings.xlsx';
      }
      
      if (data.length === 0) {
        alert('No data available to export');
        return;
      }
      
      console.log(`Exporting ${data.length} ${activeForm} records:`, data);
      generateExcel(data, fileName);
      
    } catch (error) {
      console.error('Error fetching data for export:', error);
      alert('Failed to fetch data for export. Please try again.');
    }
  };

  // Helper function to add booking to both individual and combined arrays
  const addBookingData = (formData, bookingType) => {
    // Add user info to booking data
    const bookingWithMetadata = {
      ...formData,
      bookingType: bookingType,
      submittedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      submittedBy: user?.name,
      submittedByEmail: user?.email,
      submittedByRole: user?.role
    };
    
    // Add to combined array for search functionality
    setAllBookingData(prev => [...prev, bookingWithMetadata]);
    
    return bookingWithMetadata;
  };

  // Handle form submission for different forms (only if user has permission)
  const handleFlightSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'flight');
    setFlightData([...flightData, newBooking]);
  };
  
  const handleHotelSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'hotel');
    setHotelData([...hotelData, newBooking]);
  };
  
  const handleAirportTransferSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'airport_transfer');
    setAirportTransferData([...airportTransferData, newBooking]);
  };
  
  const handleCarRentalSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'car_rental');
    setCarRentalData([...carRentalData, newBooking]);
  };
  
  const handleForexSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'forex');
    setForexData([...forexData, newBooking]);
  };
  
  const handleVisaSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'visa');
    setVisaData([...visaData, newBooking]);
  };
  
  // Passport submit handler (no export functionality)
  const handlePassportSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'passport');
    setPassportData([...passportData, newBooking]);
  };
  
  const handleMiscSubmit = (formData) => {
    if (!hasPermission('create_bookings')) {
      alert('You do not have permission to create bookings');
      return;
    }
    const newBooking = addBookingData(formData, 'miscellaneous');
    setMiscData([...miscData, newBooking]);
  };

  // Handle booking update from search component (only if user has permission)
  const handleUpdateBooking = (ticketId, updatedData) => {
    if (!hasPermission('edit_bookings')) {
      alert('You do not have permission to edit bookings');
      return;
    }

    // Add modification metadata
    const dataWithModification = {
      ...updatedData,
      lastModified: new Date().toISOString(),
      lastModifiedBy: user?.name,
      lastModifiedByEmail: user?.email
    };

    // Update in combined array
    setAllBookingData(prev => 
      prev.map(booking => 
        booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
      )
    );
    
    // Update in individual arrays based on booking type
    const bookingType = updatedData.bookingType || 
      allBookingData.find(b => b.ticketId === ticketId)?.bookingType;
    
    switch(bookingType) {
      case 'flight':
        setFlightData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'hotel':
        setHotelData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'airport_transfer':
        setAirportTransferData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'car_rental':
        setCarRentalData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'forex':
        setForexData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'visa':
        setVisaData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'passport':
        setPassportData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
      case 'miscellaneous':
        setMiscData(prev => 
          prev.map(booking => 
            booking.ticketId === ticketId ? { ...booking, ...dataWithModification } : booking
          )
        );
        break;
    }
  };

  // Create enhanced form components with export functionality
  const enhancedFormComponents = {
    'Flight Booking': (props) => (
      <FormWithExport
        FormComponent={FlightBookingForm}
        formData={flightData}
        formType="Flight Booking"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    'Hotel Booking': (props) => (
      <FormWithExport
        FormComponent={HotelBookingForm}
        formData={hotelData}
        formType="Hotel Booking"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    'Airport Transfer': (props) => (
      <FormWithExport
        FormComponent={AirportTransferForm}
        formData={airportTransferData}
        formType="Airport Transfer"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    'Car Rental': (props) => (
      <FormWithExport
        FormComponent={CarRentalForm}
        formData={carRentalData}
        formType="Car Rental"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    'Forex': (props) => (
      <FormWithExport
        FormComponent={ForexBookingForm}
        formData={forexData}
        formType="Forex"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    'VISA': (props) => (
      <FormWithExport
        FormComponent={VisaBookingForm}
        formData={visaData}
        formType="VISA"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    // Passport Details form component (without export functionality)
    'Passport Details': (props) => (
      <FormWithExport
        FormComponent={PassportDetailsForm}
        formData={passportData}
        formType="Passport Details"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    ),
    'Miscellaneous': (props) => (
      <FormWithExport
        FormComponent={MiscellaneousBookingForm}
        formData={miscData}
        formType="Miscellaneous"
        user={user}
        hasPermission={hasPermission}
        {...props}
      />
    )
  };

  // Render the main application
  if (currentMainView === 'homepage') {
    return (
      <Homepage 
        formComponents={enhancedFormComponents}
        searchComponent={Search}
        formHandlers={{
          'Flight Booking': handleFlightSubmit,
          'Hotel Booking': handleHotelSubmit,
          'Airport Transfer': handleAirportTransferSubmit,
          'Car Rental': handleCarRentalSubmit,
          'Forex': handleForexSubmit,
          'VISA': handleVisaSubmit,
          'Passport Details': handlePassportSubmit,
          'Miscellaneous': handleMiscSubmit
        }}
        searchProps={{
          bookingData: allBookingData,
          onUpdateBooking: handleUpdateBooking
        }}
        onSwitchToBookingSystem={switchToBookingSystem}
        user={user}
        hasPermission={hasPermission}
        logout={logout}
      />
    );
  }

  // Render the original booking system
  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Corporate Booking System</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* User info display */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '8px 15px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <span>Welcome, {user?.name}</span>
              <span style={{ 
                backgroundColor: user?.role === 'ADMIN' ? '#3b82f6' : '#8b5cf6',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {user?.role}
              </span>
            </div>
            <button 
              onClick={() => setCurrentMainView('homepage')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Homepage
            </button>
            <button 
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeForm === 'flight' ? 'active' : ''}`}
          onClick={() => handleTabChange('flight')}
        >
          Flight Booking
        </button>
        <button 
          className={`tab-button ${activeForm === 'hotel' ? 'active' : ''}`}
          onClick={() => handleTabChange('hotel')}
        >
          Hotel Booking
        </button>
        <button 
          className={`tab-button ${activeForm === 'airportTransfer' ? 'active' : ''}`}
          onClick={() => handleTabChange('airportTransfer')}
        >
          Airport Transfer
        </button>
        <button 
          className={`tab-button ${activeForm === 'carRental' ? 'active' : ''}`}
          onClick={() => handleTabChange('carRental')}
        >
          Car Rental
        </button>
        <button 
          className={`tab-button ${activeForm === 'forex' ? 'active' : ''}`}
          onClick={() => handleTabChange('forex')}
        >
          Forex
        </button>
        <button 
          className={`tab-button ${activeForm === 'visa' ? 'active' : ''}`}
          onClick={() => handleTabChange('visa')}
        >
          Visa
        </button>
        <button 
          className={`tab-button ${activeForm === 'passport' ? 'active' : ''}`}
          onClick={() => handleTabChange('passport')}
        >
          Passport Details
        </button>
        <button 
          className={`tab-button ${activeForm === 'miscellaneous' ? 'active' : ''}`}
          onClick={() => handleTabChange('miscellaneous')}
        >
          Miscellaneous
        </button>
        <button 
          className={`tab-button ${activeForm === 'search' ? 'active' : ''}`}
          onClick={() => handleTabChange('search')}
        >
          Search & Edit
        </button>
      </div>
      
      {/* Export Button - Only show if user has permission AND not on passport details */}
      {hasPermission('export_excel') && activeForm !== 'passport' && (
        <div className="export-container">
          <button className="export-button" onClick={handleExportToExcel}>
            {activeForm === 'search' ? 'Export All Bookings' : 'Export to Excel'}
          </button>
          {activeForm === 'search' && (
            <div className="export-info">
              <small>Total Bookings: {allBookingData.filter(booking => booking.bookingType !== 'passport').length}</small>
            </div>
          )}
        </div>
      )}
      
      {/* Forms based on active tab */}
      <div className="form-container">
        {activeForm === 'flight' && (
          <FlightBookingForm onSubmit={handleFlightSubmit} />
        )}
        {activeForm === 'hotel' && (
          <HotelBookingForm onSubmit={handleHotelSubmit} />
        )}
        {activeForm === 'airportTransfer' && (
          <AirportTransferForm onSubmit={handleAirportTransferSubmit} />
        )}
        {activeForm === 'carRental' && (
          <CarRentalForm onSubmit={handleCarRentalSubmit} />
        )}
        {activeForm === 'forex' && (
          <ForexBookingForm onSubmit={handleForexSubmit} />
        )}
        {activeForm === 'visa' && (
          <VisaBookingForm onSubmit={handleVisaSubmit} />
        )}
        {activeForm === 'passport' && (
          <PassportDetailsForm onSubmit={handlePassportSubmit} />
        )}
        {activeForm === 'miscellaneous' && (
          <MiscellaneousBookingForm onSubmit={handleMiscSubmit} />
        )}
        {activeForm === 'search' && (
          <Search 
            bookingData={allBookingData} 
            onUpdateBooking={handleUpdateBooking}
          />
        )}
      </div>
    </div>
  );
}

// Root App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <BookingApp />
    </AuthProvider>
  );
}

export default App;