// components/PassportDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import { passportService } from '../services/passportService'; // Import your service
import './PassportDetailsForm.css'; // You'll need to create this CSS file

const PassportDetailsForm = () => {
  const [formData, setFormData] = useState({
    passportNumber: '',
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    dateOfIssue: '',
    dateOfExpiry: '',
    placeOfIssue: '',
    gender: '',
    travelInsuranceInfo: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResults, setShowResults] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await passportService.createPassport(formData);
      
      setMessage({
        type: 'success',
        text: 'Passport details saved successfully!'
      });
      handleReset();
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error saving passport details'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      passportNumber: '',
      fullName: '',
      dateOfBirth: '',
      placeOfBirth: '',
      nationality: '',
      dateOfIssue: '',
      dateOfExpiry: '',
      placeOfIssue: '',
      gender: '',
      travelInsuranceInfo: ''
    });
    setMessage({ type: '', text: '' });
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a search query'
      });
      return;
    }

    setSearchLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await passportService.searchPassports(searchQuery);
      
      setSearchResults(response.data || response);
      setShowResults(true);
      setMessage({
        type: 'success',
        text: `Found ${(response.data || response).length} result(s)`
      });
    } catch (error) {
      console.error('Search error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error searching passport details'
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Clear search results
  const clearResults = () => {
    setShowResults(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="passport-details-container">
      <div className="passport-form-section">
        <h2 className="section-title">Passport Details Form</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="passport-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passportNumber">Passport Number *</label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter passport number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name (as on Passport) *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="placeOfBirth">Place of Birth *</label>
              <input
                type="text"
                id="placeOfBirth"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter place of birth"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nationality">Nationality/Citizenship *</label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter nationality"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfIssue">Date of Issue *</label>
              <input
                type="date"
                id="dateOfIssue"
                name="dateOfIssue"
                value={formData.dateOfIssue}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfExpiry">Date of Expiry *</label>
              <input
                type="date"
                id="dateOfExpiry"
                name="dateOfExpiry"
                value={formData.dateOfExpiry}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="placeOfIssue">Place of Issue/Issuing Authority *</label>
              <input
                type="text"
                id="placeOfIssue"
                name="placeOfIssue"
                value={formData.placeOfIssue}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter issuing authority"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="travelInsuranceInfo">Travel Insurance Info</label>
              <textarea
                id="travelInsuranceInfo"
                name="travelInsuranceInfo"
                value={formData.travelInsuranceInfo}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter travel insurance information (optional)"
                rows="3"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Submit'}
            </button>
            <button 
              type="button" 
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Search Section */}
      <div className="passport-search-section">
        <h2 className="section-title">Search Passport Details</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              placeholder="Search by passport number, name, nationality..."
            />
            <button 
              type="submit" 
              className="btn btn-search"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
            {showResults && (
              <button 
                type="button" 
                onClick={clearResults}
                className="btn btn-clear"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        {showResults && (
          <div className="search-results">
            <h3>Search Results ({searchResults.length})</h3>
            {searchResults.length > 0 ? (
              <div className="results-container">
                {searchResults.map((passport) => (
                  <div key={passport._id} className="passport-card">
                    <div className="card-header">
                      <h4>{passport.fullName}</h4>
                      <span className="passport-number">{passport.passportNumber}</span>
                    </div>
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="label">Nationality:</span>
                        <span className="value">{passport.nationality}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Date of Birth:</span>
                        <span className="value">{formatDate(passport.dateOfBirth)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Place of Birth:</span>
                        <span className="value">{passport.placeOfBirth}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Gender:</span>
                        <span className="value">{passport.gender}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Issue Date:</span>
                        <span className="value">{formatDate(passport.dateOfIssue)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Expiry Date:</span>
                        <span className="value">{formatDate(passport.dateOfExpiry)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Issuing Authority:</span>
                        <span className="value">{passport.placeOfIssue}</span>
                      </div>
                      {passport.travelInsuranceInfo && (
                        <div className="detail-row">
                          <span className="label">Insurance Info:</span>
                          <span className="value">{passport.travelInsuranceInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No passport details found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportDetailsForm;