import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Send, AlertCircle, Shield } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PropertyVerification = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    contactNumber: '',
    emailId: '',
    permanentAddress: '',
    saleDeed: null,
    propertyTaxReceipt: null,
    khataCertificate: null,
    encumbranceCertificate: null,
    mutationCertificate: null,
    rtcDocument: null,
    layoutPlan: null,
    architecturalDrawings: null,
    structuralCertificate: null,
    aadhaarCard: null,
    panCard: null,
    electricityBill: null
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const removeFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'Aadhaar number is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.emailId.trim()) newErrors.emailId = 'Email ID is required';
    if (!formData.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent address is required';
    if (!formData.saleDeed) newErrors.saleDeed = 'Sale Deed is required';
    if (!formData.propertyTaxReceipt) newErrors.propertyTaxReceipt = 'Property Tax Receipt is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('full_name', formData.fullName);
      formDataToSend.append('aadhaar_number', formData.aadhaarNumber);
      formDataToSend.append('contact_number', formData.contactNumber);
      formDataToSend.append('email_id', formData.emailId);
      formDataToSend.append('permanent_address', formData.permanentAddress);
      
      // Add files
      if (formData.saleDeed) {
        formDataToSend.append('sale_deed', formData.saleDeed);
      }
      if (formData.propertyTaxReceipt) {
        formDataToSend.append('property_tax_receipt', formData.propertyTaxReceipt);
      }
      if (formData.khataCertificate) {
        formDataToSend.append('khata_certificate', formData.khataCertificate);
      }
      if (formData.encumbranceCertificate) {
        formDataToSend.append('encumbrance_certificate', formData.encumbranceCertificate);
      }
      if (formData.mutationCertificate) {
        formDataToSend.append('mutation_certificate', formData.mutationCertificate);
      }
      if (formData.rtcDocument) {
        formDataToSend.append('rtc_document', formData.rtcDocument);
      }
      if (formData.layoutPlan) {
        formDataToSend.append('layout_plan', formData.layoutPlan);
      }
      if (formData.architecturalDrawings) {
        formDataToSend.append('architectural_drawings', formData.architecturalDrawings);
      }
      if (formData.structuralCertificate) {
        formDataToSend.append('structural_certificate', formData.structuralCertificate);
      }
      if (formData.aadhaarCard) {
        formDataToSend.append('aadhaar_card', formData.aadhaarCard);
      }
      if (formData.panCard) {
        formDataToSend.append('pan_card', formData.panCard);
      }
      if (formData.electricityBill) {
        formDataToSend.append('electricity_bill', formData.electricityBill);
      }
      
      // Send to backend
      const response = await fetch('http://localhost:8000/api/property/verify', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit verification');
      }
      
      const result = await response.json();
      
      toast.success(`Property verification submitted successfully! Your ticket number is: ${result.ticket_number}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification. Please try again.');
    }
  };

  const renderFileUpload = (field, label, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {formData[field] ? (
          <div className="space-y-2">
            <FileText className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-sm text-gray-600">{formData[field].name}</p>
            <button type="button" onClick={() => removeFile(field)} className="text-red-500 hover:text-red-700 text-sm">
              Remove
            </button>
          </div>
        ) : (
          <>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, field)} className="hidden" id={`${field}-upload`} />
            <label htmlFor={`${field}-upload`} className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
            </label>
          </>
        )}
      </div>
      {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Document Verification</h1>
            <p className="text-gray-600">Upload and verify your property documents with government officials</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Document Verification Process</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload all required property documents</li>
                  <li>• Documents will be verified by government officials</li>
                  <li>• You will receive a verification ticket number</li>
                  <li>• Track verification status using the ticket number</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Personal Information */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">👤 Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per government ID" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                  <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} placeholder="12-digit Aadhaar number" maxLength="12" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.aadhaarNumber && <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                  <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="10-digit mobile number" maxLength="10" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID *</label>
                  <input type="email" name="emailId" value={formData.emailId} onChange={handleInputChange} placeholder="Email address" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.emailId ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.emailId && <p className="text-red-500 text-sm mt-1">{errors.emailId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address *</label>
                <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows={3} placeholder="Complete permanent address with PIN code" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.permanentAddress ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.permanentAddress && <p className="text-red-500 text-sm mt-1">{errors.permanentAddress}</p>}
              </div>
            </div>

            {/* Property Documents */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Property Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFileUpload('saleDeed', 'Sale Deed / Title Deed', true)}
                {renderFileUpload('propertyTaxReceipt', 'Latest Property Tax Receipt', true)}
                {renderFileUpload('khataCertificate', 'Khata Certificate / Extract')}
                {renderFileUpload('encumbranceCertificate', 'Encumbrance Certificate (EC)')}
                {renderFileUpload('mutationCertificate', 'Mutation Certificate')}
                {renderFileUpload('rtcDocument', 'RTC Document')}
              </div>
            </div>

            {/* Building Documents */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🏗️ Building Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFileUpload('layoutPlan', 'Sanctioned Layout Plan')}
                {renderFileUpload('architecturalDrawings', 'Architectural Drawings')}
                {renderFileUpload('structuralCertificate', 'Structural Stability Certificate')}
              </div>
            </div>

            {/* Identity Documents */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🆔 Identity & Address Proof</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFileUpload('aadhaarCard', 'Aadhaar Card')}
                {renderFileUpload('panCard', 'PAN Card')}
                {renderFileUpload('electricityBill', 'Electricity Bill')}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto">
                <Send className="h-5 w-5" />
                <span>Submit for Verification</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerification;
