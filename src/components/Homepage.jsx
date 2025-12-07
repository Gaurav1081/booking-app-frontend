import React, { useState } from 'react';
import { Home, Search, FileText, Plane, Car, Hotel, CreditCard, Building2, Globe, User, UserCheck } from 'lucide-react';
import LogoutButton from './LogoutButton'; // Import the LogoutButton component
import portImage from './images/Port2.jpg'; // Import port image
import jmbaxiImage from './images/Jmbaxi.png'; // Import JM Baxi image

const Homepage = ({ 
  formComponents = {}, 
  searchComponent, 
  formHandlers = {}, 
  searchProps = {},
  // Authentication props from your existing system
  user = null, // User object with name, email, etc.
  hasPermission = () => false, // Permission checking function
  logout = () => {}, // Function to handle logout
  onSwitchToBookingSystem = () => {} // Function to switch views
}) => {
  const [currentView, setCurrentView] = useState('home');

  const FormsPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Booking Forms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Flight Booking', icon: Plane, color: 'bg-blue-500' },
            { name: 'Hotel Booking', icon: Building2, color: 'bg-green-500' },
            { name: 'Airport Transfer', icon: Plane, color: 'bg-purple-500' },
            { name: 'Car Rental', icon: Car, color: 'bg-red-500' },
            { name: 'Forex', icon: Globe, color: 'bg-indigo-500' },
            { name: 'VISA', icon: FileText, color: 'bg-yellow-500' },
            { name: 'Passport Details', icon: UserCheck, color: 'bg-orange-500' },
            { name: 'Miscellaneous', icon: CreditCard, color: 'bg-gray-500' }
          ].map((form, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className={`${form.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <form.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{form.name}</h3>
              <p className="text-gray-600 mb-4">
                {form.name === 'Flight Booking' && 'Book domestic and international flights'}
                {form.name === 'Hotel Booking' && 'Find and book hotels worldwide'}
                {form.name === 'Airport Transfer' && 'Airport pickup and drop-off services'}
                {form.name === 'Car Rental' && 'Rent cars for your travel needs'}
                {form.name === 'Forex' && 'Foreign currency exchange services'}
                {form.name === 'VISA' && 'Visa application and processing'}
                {form.name === 'Passport Details' && 'Manage and store passport information'}
                {form.name === 'Miscellaneous' && 'Other travel-related bookings'}
              </p>
              <button 
                onClick={() => setCurrentView(form.name)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Form
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SearchPage = () => {
    const SearchComponent = searchComponent;
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {SearchComponent && <SearchComponent {...searchProps} />}
        </div>
      </div>
    );
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section with Port Background */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 100, 235, 0.47), rgba(31, 19, 160, 0.8)), url(${portImage})`,
          width:'100%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',

          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-2">Welcome to BookEasy</h1>
          <p className="text-lg mb-6 opacity-90 font-medium ">BY <b>JMBAXI</b></p>
          <p className="text-xl mb-8 opacity-90">Your one-stop solution for all travel bookings</p>
          {user && (
            <p className="text-lg mb-6 opacity-80">Hello, {user.name || user.email}!</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentView('forms')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Start Booking
            </button>
            <button 
              onClick={() => setCurrentView('search')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Track Booking
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Plane, title: 'Flight Booking', desc: 'Book domestic and international flights' },
              { icon: Building2, title: 'Hotel Booking', desc: 'Find and book hotels worldwide' },
              { icon: Plane, title: 'Airport Transfer', desc: 'Airport pickup and drop-off services' },
              { icon: Car, title: 'Car Rental', desc: 'Rent cars for your travel needs' },
              { icon: Globe, title: 'Forex', desc: 'Foreign currency exchange services' },
              { icon: FileText, title: 'VISA', desc: 'Visa application and processing' },
              { icon: UserCheck, title: 'Passport Details', desc: 'Manage and store passport information' },
              { icon: CreditCard, title: 'Miscellaneous', desc: 'Other travel-related bookings' }
            ].map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setCurrentView(service.title)}
              >
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">ABOUT US</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                JM Baxi Group, established in 1916, is one of India's leading providers of shipping, logistics, and maritime services. With over a century of experience, the company has built a strong presence across port operations, supply chain management, and shipping solutions.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Committed to innovation and reliability, JM Baxi continues to play a vital role in strengthening India's trade and logistics infrastructure.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                  Established 1916
                </div>
                <div className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">
                  100+ Years Experience
                </div>
              </div>
            </div>
            
            {/* Image - FIXED STYLING */}
            <div className="bg-gray-100 rounded-lg h-80 relative overflow-hidden">
              <img 
                src={jmbaxiImage} 
                alt="JM Baxi Group" 
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 items-center justify-center text-center text-white-500 bg-white-100 rounded-lg">
                <div>
                  <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">JM Baxi Group Image</p>
                  <p className="text-sm">Image not found: Check import path</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render specific form component
  const renderFormComponent = (formName) => {
    const FormComponent = formComponents[formName];
    const formHandler = formHandlers[formName];
    
    if (FormComponent) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <FormComponent onSubmit={formHandler} />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="bg-blue-600 p-2 rounded-lg">
                <Plane className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-800">BookEasy</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setCurrentView('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'home' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('search')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'search' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Search size={20} />
                <span>Search</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('forms')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'forms' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <FileText size={20} />
                <span>Forms</span>
              </button>

              {/* Authentication Section */}
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* User Avatar/Info */}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User size={20} />
                    <span className="text-sm font-medium">
                      {user?.name || user?.email || 'User'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                  
                  {/* Logout Button */}
                  <LogoutButton 
                    user={user}
                    logout={logout}
                    variant="header"
                    showConfirmation={true}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Please contact administrator for access
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === 'home' && <HomePage />}
      {currentView === 'search' && <SearchPage />}
      {currentView === 'forms' && <FormsPage />}
      {Object.keys(formComponents).includes(currentView) && renderFormComponent(currentView)}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Plane className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">BookEasy</span>
              </div>
              <p className="text-gray-300">Your trusted travel booking partner for all your journey needs.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentView('forms')} className="hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => setCurrentView('search')} className="hover:text-white transition-colors">Search</button></li>
                
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setCurrentView('Flight Booking')} className="hover:text-white transition-colors">Flight Booking</button></li>
                <li><button onClick={() => setCurrentView('Hotel Booking')} className="hover:text-white transition-colors">Hotel Booking</button></li>
                <li><button onClick={() => setCurrentView('Airport Transfer')} className="hover:text-white transition-colors">Airport Transfer</button></li>
                <li><button onClick={() => setCurrentView('Car Rental')} className="hover:text-white transition-colors">Car Rental</button></li>
                <li><button onClick={() => setCurrentView('Forex')} className="hover:text-white transition-colors">Forex</button></li>
                <li><button onClick={() => setCurrentView('VISA')} className="hover:text-white transition-colors">VISA</button></li>
                <li><button onClick={() => setCurrentView('Passport Details')} className="hover:text-white transition-colors">Passport Details</button></li>
                <li><button onClick={() => setCurrentView('Miscellaneous')} className="hover:text-white transition-colors">Miscellaneous</button></li>
              </ul>
            </div>
            
            
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 BROGRAMMERS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;