import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Shield, User, MapPin, Phone, Calendar, Globe, Languages, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthContext from '../../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    alternateContact: '',
    permanentAddress: {
      house: '',
      street: '',
      ward: '',
      city: '',
      pin: ''
    },
    currentAddress: '',
    autoGeolocation: false,
    userType: 'Citizen',
    preferredLanguage: 'English',
    specialAssistance: '',
    consentInfo: false,
    consentPrivacy: false,
    consentNotifications: false
  });
  
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.mobileNumber || !formData.permanentAddress.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.consentInfo || !formData.consentPrivacy) {
      toast.error('Please accept the required consent terms');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        email: formData.email || 'user@gmail.com',
        role: 'citizen',
        name: formData.fullName,
        profile: formData
      };

      login(userData);
      toast.success('Registration successful! Welcome to Garun System.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Garun System
          </h2>
          <p className="text-gray-600 text-lg">
            Citizen Registration Portal
          </p>
        </div>

        {/* Signup Form */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Create Your Account
            </h3>
            <p className="text-gray-600">
              Join our grievance management platform to report and track issues
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="mobileNumber" className="form-label">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email ID
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label htmlFor="alternateContact" className="form-label">
                    Alternate Contact Number
                  </label>
                  <input
                    type="tel"
                    id="alternateContact"
                    name="alternateContact"
                    value={formData.alternateContact}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter alternate contact"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Address Information
              </h4>
              
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Permanent Address *</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="house" className="form-label">House/Flat Number</label>
                    <input
                      type="text"
                      id="house"
                      name="permanentAddress.house"
                      value={formData.permanentAddress.house}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="House/Flat number"
                    />
                  </div>
                  <div>
                    <label htmlFor="street" className="form-label">Street/Area</label>
                    <input
                      type="text"
                      id="street"
                      name="permanentAddress.street"
                      value={formData.permanentAddress.street}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Street name and area"
                    />
                  </div>
                  <div>
                    <label htmlFor="ward" className="form-label">Ward Number</label>
                    <input
                      type="text"
                      id="ward"
                      name="permanentAddress.ward"
                      value={formData.permanentAddress.ward}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Ward number"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="form-label">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="permanentAddress.city"
                      value={formData.permanentAddress.city}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="City name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pin" className="form-label">PIN Code</label>
                    <input
                      type="text"
                      id="pin"
                      name="permanentAddress.pin"
                      value={formData.permanentAddress.pin}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="6-digit PIN code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currentAddress" className="form-label">
                    Current Address (if different from permanent)
                  </label>
                  <textarea
                    id="currentAddress"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="3"
                    placeholder="Enter current address if different from permanent address"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Preferences & Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="userType" className="form-label">
                    User Type
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Citizen">Citizen</option>
                    <option value="NGO">NGO</option>
                    <option value="Govt Official">Government Official</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredLanguage" className="form-label">
                    Preferred Language
                  </label>
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Regional">Regional Language</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="specialAssistance" className="form-label">
                    Special Assistance Needs
                  </label>
                  <textarea
                    id="specialAssistance"
                    name="specialAssistance"
                    value={formData.specialAssistance}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="2"
                    placeholder="Any special assistance requirements"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoGeolocation"
                  name="autoGeolocation"
                  checked={formData.autoGeolocation}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="autoGeolocation" className="text-sm text-gray-700">
                  Allow auto-geolocation for better service
                </label>
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Consent & Agreements
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentInfo"
                    name="consentInfo"
                    checked={formData.consentInfo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    required
                  />
                  <label htmlFor="consentInfo" className="text-sm text-gray-700">
                    I confirm that all information provided is true and correct to the best of my knowledge
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentPrivacy"
                    name="consentPrivacy"
                    checked={formData.consentPrivacy}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    required
                  />
                  <label htmlFor="consentPrivacy" className="text-sm text-gray-700">
                    I agree to the Privacy Policy and Terms of Service
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentNotifications"
                    name="consentNotifications"
                    checked={formData.consentNotifications}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="consentNotifications" className="text-sm text-gray-700">
                    I agree to receive notifications via SMS and Email for updates on my complaints
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>&copy; 2024 Garun System. Government of India.</p>
          <p className="mt-1">Secure • Reliable • Transparent</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
