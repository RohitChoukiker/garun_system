import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Upload, 
  Camera, 
  Video, 
  FileText, 
  X, 
  Send,
  AlertTriangle,
  EyeOff,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const AnonymousComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Complaint Details (No personal info)
    title: '',
    description: '',
    category: '',
    incidentDate: '',
    incidentTime: '',
    
    // Location Details
    address: '',
    ward: '',
    zone: '',
    latitude: '',
    longitude: '',
    landmark: '',
    
    // Evidence (Required for authenticity)
    photos: [],
    videos: [],
    documents: [],
    
    // Optional Contact (for updates only)
    contactNumber: '',
    emailId: ''
  });

  const [errors, setErrors] = useState({});
  const [showContactFields, setShowContactFields] = useState(false);

  const complaintCategories = [
    'Illegal Construction',
    'Encroachment', 
    'Sanitation',
    'Water Supply',
    'Road Issues',
    'Street Lighting',
    'Garbage Collection',
    'Drainage Issues',
    'Street Vendors',
    'Traffic Violations',
    'Noise Pollution',
    'Air Pollution',
    'Street Dogs',
    'Corruption',
    'Other'
  ];

  const wards = [
    'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5',
    'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10'
  ];

  const zones = [
    'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (type === 'photos') {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...imageFiles]
      }));
    } else if (type === 'videos') {
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...videoFiles]
      }));
    } else if (type === 'documents') {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...files]
      }));
    }
  };

  const removeFile = (index, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Unable to capture location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Complaint title is required';
    if (!formData.description.trim()) newErrors.description = 'Complaint description is required';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.incidentDate) newErrors.incidentDate = 'Incident date is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.ward) newErrors.ward = 'Please select a ward';
    if (!formData.zone) newErrors.zone = 'Please select a zone';
    if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required for authenticity';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Generate anonymous complaint ID
      const complaintId = 'ANON' + Date.now().toString().slice(-6);
      
      // Here you would typically send the data to your backend
      const complaintData = {
        ...formData,
        complaintId,
        status: 'New',
        submittedAt: new Date().toISOString(),
        isAnonymous: true,
        // Remove contact info if not provided
        contactNumber: showContactFields ? formData.contactNumber : '',
        emailId: showContactFields ? formData.emailId : ''
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Anonymous complaint submitted successfully! Your complaint ID is: ${complaintId}`);
      
      // Navigate to success page or dashboard
      navigate('/dashboard');
      
    } catch (error) {
      toast.error('Failed to submit complaint. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Anonymous Complaint</h1>
            <p className="text-gray-600">Report issues without revealing your identity</p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Your Privacy is Protected</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• No personal information is collected or stored</li>
                  <li>• Your identity remains completely anonymous</li>
                  <li>• Photos and location are used only for issue resolution</li>
                  <li>• Contact information is optional and only for updates</li>
                  <li>• All data is encrypted and secure</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Basic Complaint Details */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Complaint Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Title / Subject *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief description of the issue"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Provide detailed description of the issue..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {complaintCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Incident *
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.incidentDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.incidentDate && <p className="text-red-500 text-sm mt-1">{errors.incidentDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Incident
                </label>
                <input
                  type="time"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 Location Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address of Issue Location *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Street, Area, Landmark details"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward Selection *
                  </label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.ward ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                  {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Selection *
                  </label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.zone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Zone</option>
                    {zones.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                  {errors.zone && <p className="text-red-500 text-sm mt-1">{errors.zone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark for easy identification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Geo-location Capture</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="Auto-captured or enter manually"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="Auto-captured or enter manually"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={captureLocation}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Capture Current Location</span>
                </button>
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📎 Evidence / Proof</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Upload * (At least one photo required for authenticity)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photos')}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload photos or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                  </label>
                </div>
                {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
                
                {formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'photos')}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Upload (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'videos')}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload videos or drag and drop</p>
                    <p className="text-sm text-gray-500">MP4, AVI, MOV up to 50MB each</p>
                  </label>
                </div>
                
                {formData.videos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.videos.map((video, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Video className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700">{video.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'videos')}
                          className="ml-auto text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Upload (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'documents')}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload documents or drag and drop</p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG, DOC up to 20MB each</p>
                  </label>
                </div>
                
                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'documents')}
                          className="ml-auto text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Optional Contact Information */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">📞 Optional Contact Information</h3>
                <button
                  type="button"
                  onClick={() => setShowContactFields(!showContactFields)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showContactFields ? 'Hide Contact Fields' : 'Add Contact Information'}
                </button>
              </div>
              
              <p className="text-gray-600 text-sm">
                Providing contact information is completely optional. It will only be used to send you updates about your complaint resolution.
              </p>

              {showContactFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number (Mobile)
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number (optional)"
                      maxLength="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <input
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleInputChange}
                      placeholder="Email address (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Final Notice */}
            <div className="bg-yellow-50 p-6 rounded-lg mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-2">Important Notice</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• This complaint will be submitted anonymously</li>
                    <li>• No personal information will be stored</li>
                    <li>• Photos and location are required for issue verification</li>
                    <li>• You will receive a complaint ID for tracking (if contact info provided)</li>
                    <li>• False complaints may result in legal action</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Send className="h-5 w-5" />
                <span>Submit Anonymous Complaint</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnonymousComplaint;
