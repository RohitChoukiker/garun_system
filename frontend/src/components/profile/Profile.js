import React, { useState, useContext } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Shield,
  Building2,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.profile?.fullName || user?.name || 'Citizen User',
    mobileNumber: user?.profile?.mobileNumber || '',
    email: user?.profile?.email || user?.email || '',
    gender: user?.profile?.gender || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
    alternateContact: user?.profile?.alternateContact || '',
    permanentAddress: {
      house: user?.profile?.permanentAddress?.house || '',
      street: user?.profile?.permanentAddress?.street || '',
      ward: user?.profile?.permanentAddress?.ward || '',
      city: user?.profile?.permanentAddress?.city || '',
      pin: user?.profile?.permanentAddress?.pin || ''
    },
    currentAddress: user?.profile?.currentAddress || '',
    userType: user?.profile?.userType || 'Citizen',
    preferredLanguage: user?.profile?.preferredLanguage || 'English',
    specialAssistance: user?.profile?.specialAssistance || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context with new profile data
      // In a real app, you'd update the user context here
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData({
      fullName: user?.profile?.fullName || user?.name || 'Citizen User',
      mobileNumber: user?.profile?.mobileNumber || '',
      email: user?.profile?.email || user?.email || '',
      gender: user?.profile?.gender || '',
      dateOfBirth: user?.profile?.dateOfBirth || '',
      alternateContact: user?.profile?.alternateContact || '',
      permanentAddress: {
        house: user?.profile?.permanentAddress?.house || '',
        street: user?.profile?.permanentAddress?.street || '',
        ward: user?.profile?.permanentAddress?.ward || '',
        city: user?.profile?.permanentAddress?.city || '',
        pin: user?.profile?.permanentAddress?.pin || ''
      },
      currentAddress: user?.profile?.currentAddress || '',
      userType: user?.profile?.userType || 'Citizen',
      preferredLanguage: user?.profile?.preferredLanguage || 'English',
      specialAssistance: user?.profile?.specialAssistance || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getRoleDisplay = () => {
    if (user?.email === 'admin@gmail.com') return 'System Administrator';
    if (user?.email === 'incharge@gmail.com') return 'Department Incharge';
    return 'Citizen';
  };

  const getRoleIcon = () => {
    if (user?.email === 'admin@gmail.com') return <Shield className="h-5 w-5 text-red-600" />;
    if (user?.email === 'incharge@gmail.com') return <Building2 className="h-5 w-5 text-orange-600" />;
    return <User className="h-5 w-5 text-blue-600" />;
  };

  const getRoleColor = () => {
    if (user?.email === 'admin@gmail.com') return 'bg-red-100 text-red-800';
    if (user?.email === 'incharge@gmail.com') return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="p-2 text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {editData.fullName}
                  </h2>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}>
                      {getRoleIcon()}
                      <span className="ml-2">{getRoleDisplay()}</span>
                    </span>
                    <span className="text-sm text-gray-500">Member since 2024</span>
                  </div>
                  <p className="text-gray-600">
                    {user?.email || 'No email provided'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="btn-success"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn-danger"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={editData.fullName}
                onChange={handleInputChange}
                name="fullName"
                className="input-field"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="form-label">Gender</label>
              <select
                value={editData.gender}
                onChange={handleInputChange}
                name="gender"
                className="input-field"
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                value={editData.dateOfBirth}
                onChange={handleInputChange}
                name="dateOfBirth"
                className="input-field"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                value={editData.mobileNumber}
                onChange={handleInputChange}
                name="mobileNumber"
                className="input-field"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="form-label">Email ID</label>
              <input
                type="email"
                value={editData.email}
                onChange={handleInputChange}
                name="email"
                className="input-field"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="form-label">Alternate Contact</label>
              <input
                type="tel"
                value={editData.alternateContact}
                onChange={handleInputChange}
                name="alternateContact"
                className="input-field"
                disabled={!isEditing}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            Address Information
          </h3>

          <div className="space-y-6 mb-8">
            <div>
              <h4 className="font-medium text-gray-700 mb-4">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">House/Flat Number</label>
                  <input
                    type="text"
                    value={editData.permanentAddress.house}
                    onChange={handleInputChange}
                    name="permanentAddress.house"
                    className="input-field"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="form-label">Street/Area</label>
                  <input
                    type="text"
                    value={editData.permanentAddress.street}
                    onChange={handleInputChange}
                    name="permanentAddress.street"
                    className="input-field"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="form-label">Ward Number</label>
                  <input
                    type="text"
                    value={editData.permanentAddress.ward}
                    onChange={handleInputChange}
                    name="permanentAddress.ward"
                    className="input-field"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={editData.permanentAddress.city}
                    onChange={handleInputChange}
                    name="permanentAddress.city"
                    className="input-field"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    value={editData.permanentAddress.pin}
                    onChange={handleInputChange}
                    name="permanentAddress.pin"
                    className="input-field"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Current Address (if different)</label>
              <textarea
                value={editData.currentAddress}
                onChange={handleInputChange}
                name="currentAddress"
                className="input-field"
                rows="3"
                disabled={!isEditing}
                placeholder="Enter current address if different from permanent address"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            Preferences & Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="form-label">User Type</label>
              <select
                value={editData.userType}
                onChange={handleInputChange}
                name="userType"
                className="input-field"
                disabled={!isEditing}
              >
                <option value="Citizen">Citizen</option>
                <option value="NGO">NGO</option>
                <option value="Govt Official">Government Official</option>
              </select>
            </div>

            <div>
              <label className="form-label">Preferred Language</label>
              <select
                value={editData.preferredLanguage}
                onChange={handleInputChange}
                name="preferredLanguage"
                className="input-field"
                disabled={!isEditing}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Regional">Regional Language</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Special Assistance Needs</label>
              <textarea
                value={editData.specialAssistance}
                onChange={handleInputChange}
                name="specialAssistance"
                className="input-field"
                rows="3"
                disabled={!isEditing}
                placeholder="Any special assistance requirements"
              />
            </div>
          </div>

          {/* Account Security */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <button className="btn-secondary">
                  Change Password
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <button className="btn-secondary">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Email Preferences</p>
            </button>
            
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Notification Settings</p>
            </button>
            
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Privacy Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
