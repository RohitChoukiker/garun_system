import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Camera, Video, FileText, X, Send, AlertCircle } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', incidentDate: '', incidentTime: '',
    address: '', ward: '', zone: '', latitude: '', longitude: '', landmark: '',
    photos: [], videos: [], documents: [],
    fullName: '', fatherName: '', motherName: '', dateOfBirth: '', gender: '',
    contactNumber: '', residentialAddress: '', permanentAddress: '',
    idProofType: '', idProofNumber: '', idProofDocument: null, selfie: null
  });

  const [errors, setErrors] = useState({});

  const complaintCategories = [
    'Illegal Construction', 'Encroachment', 'Sanitation', 'Water Supply', 'Road Issues',
    'Street Lighting', 'Garbage Collection', 'Drainage Issues', 'Street Vendors',
    'Traffic Violations', 'Noise Pollution', 'Air Pollution', 'Street Dogs', 'Other'
  ];

  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10'];
  const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  const idProofTypes = ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport', 'Driving License', 'Ration Card'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'photos') {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...imageFiles] }));
    } else if (type === 'videos') {
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...videoFiles] }));
    } else if (type === 'documents') {
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
    }
  };

  const removeFile = (index, type) => {
    setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
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
        (error) => toast.error('Unable to capture location. Please enter manually.')
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Complaint title is required';
      if (!formData.description.trim()) newErrors.description = 'Complaint description is required';
      if (!formData.category) newErrors.category = 'Please select a category';
      if (!formData.incidentDate) newErrors.incidentDate = 'Incident date is required';
    }
    if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.ward) newErrors.ward = 'Please select a ward';
      if (!formData.zone) newErrors.zone = 'Please select a zone';
    }
    if (currentStep === 3) {
      if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required';
    }
    if (currentStep === 4) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
      if (!formData.idProofType) newErrors.idProofType = 'Please select ID proof type';
      if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID proof number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('incident_date', formData.incidentDate);
      formDataToSend.append('incident_time', formData.incidentTime || '');
      formDataToSend.append('address', formData.address);
      formDataToSend.append('ward', formData.ward);
      formDataToSend.append('zone', formData.zone);
      formDataToSend.append('latitude', formData.latitude || '');
      formDataToSend.append('longitude', formData.longitude || '');
      formDataToSend.append('landmark', formData.landmark || '');
      formDataToSend.append('full_name', formData.fullName);
      formDataToSend.append('father_name', formData.fatherName || '');
      formDataToSend.append('mother_name', formData.motherName || '');
      formDataToSend.append('date_of_birth', formData.dateOfBirth || '');
      formDataToSend.append('gender', formData.gender || '');
      formDataToSend.append('contact_number', formData.contactNumber);
      formDataToSend.append('residential_address', formData.residentialAddress || '');
      formDataToSend.append('permanent_address', formData.permanentAddress || '');
      formDataToSend.append('id_proof_type', formData.idProofType);
      formDataToSend.append('id_proof_number', formData.idProofNumber);
      
      // Add files
      formData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo);
      });
      
      formData.videos.forEach((video, index) => {
        formDataToSend.append('videos', video);
      });
      
      formData.documents.forEach((doc, index) => {
        formDataToSend.append('documents', doc);
      });
      
      if (formData.idProofDocument) {
        formDataToSend.append('id_proof_document', formData.idProofDocument);
      }
      
      if (formData.selfie) {
        formDataToSend.append('selfie', formData.selfie);
      }
      
      // Send to backend
      const response = await fetch('http://localhost:8000/api/complaints/register', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to submit complaint');
      }
      
      const result = await response.json();
      console.log('Complaint submission result:', result);
      
      if (result.success && result.complaint_id) {
        toast.success(`Complaint submitted successfully! Your complaint ID is: ${result.complaint_id}`);
        navigate('/track-complaint', { state: { complaintId: result.complaint_id, status: 'New' } });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(`Failed to submit complaint: ${error.message}`);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Complaint Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Title / Subject *</label>
        <input type="text" name="title" value={formData.title} onChange={handleInputChange}
               placeholder="Brief description of the issue" 
               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                 errors.title ? 'border-red-500' : 'border-gray-300'}`} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Description *</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4}
                  placeholder="Provide detailed description of the issue..." 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'}`} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Category / Type *</label>
        <select name="category" value={formData.category} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'}`}>
          <option value="">Select a category</option>
          {complaintCategories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Incident *</label>
          <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleInputChange}
                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                   errors.incidentDate ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.incidentDate && <p className="text-red-500 text-sm mt-1">{errors.incidentDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time of Incident</label>
          <input type="time" name="incidentTime" value={formData.incidentTime} onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 Location Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address of Complaint Location *</label>
        <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3}
                  placeholder="House/Street/Ward/City details" 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'}`} />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ward Selection *</label>
          <select name="ward" value={formData.ward} onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.ward ? 'border-red-500' : 'border-gray-300'}`}>
            <option value="">Select Ward</option>
            {wards.map(ward => <option key={ward} value={ward}>{ward}</option>)}
          </select>
          {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zone Selection *</label>
          <select name="zone" value={formData.zone} onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.zone ? 'border-red-500' : 'border-gray-300'}`}>
            <option value="">Select Zone</option>
            {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
          </select>
          {errors.zone && <p className="text-red-500 text-sm mt-1">{errors.zone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
        <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange}
               placeholder="Nearby landmark for easy identification"
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3 mb-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Geo-location Capture</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Latitude</label>
            <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange}
                   placeholder="Auto-captured or enter manually"
                   className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Longitude</label>
            <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange}
                   placeholder="Auto-captured or enter manually"
                   className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <button type="button" onClick={captureLocation}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>Capture Current Location</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📎 Evidence / Proof</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo Upload * (At least one photo required)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'photos')}
                 className="hidden" id="photo-upload" />
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
                <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`}
                     className="w-full h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => removeFile(index, 'photos')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video Upload (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" multiple accept="video/*" onChange={(e) => handleFileUpload(e, 'videos')}
                 className="hidden" id="video-upload" />
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
                <button type="button" onClick={() => removeFile(index, 'videos')}
                        className="ml-auto text-red-500 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Document Upload (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                 onChange={(e) => handleFileUpload(e, 'documents')}
                 className="hidden" id="document-upload" />
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
                <button type="button" onClick={() => removeFile(index, 'documents')}
                        className="ml-auto text-red-500 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">👤 Complainant Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
               placeholder="As per government ID" 
               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                 errors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                 placeholder="Father's full name"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
          <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange}
                 placeholder="Mother's full name"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number (Mobile) *</label>
        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange}
               placeholder="10-digit mobile number" 
               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                 errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`} />
        {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address</label>
        <textarea name="residentialAddress" value={formData.residentialAddress} onChange={handleInputChange} rows={3}
                  placeholder="House No., Street, City, State, PIN Code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address (if different)</label>
        <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows={3}
                  placeholder="Permanent address if different from residential"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Type *</label>
          <select name="idProofType" value={formData.idProofType} onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.idProofType ? 'border-red-500' : 'border-gray-300'}`}>
            <option value="">Select ID Proof Type</option>
            {idProofTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {errors.idProofType && <p className="text-red-500 text-sm mt-1">{errors.idProofType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Number *</label>
          <input type="text" name="idProofNumber" value={formData.idProofNumber} onChange={handleInputChange}
                 placeholder="As per selected ID proof" 
                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                   errors.idProofNumber ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.idProofNumber && <p className="text-red-500 text-sm mt-1">{errors.idProofNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Document Upload</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" 
                 onChange={(e) => setFormData(prev => ({ ...prev, idProofDocument: e.target.files[0] }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selfie / Photo (Optional)</label>
          <input type="file" accept="image/*" 
                 onChange={(e) => setFormData(prev => ({ ...prev, selfie: e.target.files[0] }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> For government services, we may request access to your DigiLocker for document verification.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= stepNumber 
                ? 'bg-primary-600 border-primary-600 text-white' 
                : 'bg-gray-200 border-gray-300 text-gray-500'
            }`}>
              {step > stepNumber ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 4 && (
              <div className={`w-20 h-1 ${step > stepNumber ? 'bg-primary-600' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Basic Details</span>
        <span>Location</span>
        <span>Evidence</span>
        <span>Personal Info</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Complaint</h1>
            <p className="text-gray-600">Help us serve you better by providing complete information</p>
          </div>

          {renderStepIndicator()}

          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button type="button" onClick={prevStep}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {step < 4 ? (
                  <button type="button" onClick={nextStep}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Submit Complaint</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
