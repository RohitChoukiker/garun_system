import React, { useState, useContext } from 'react';
import { Search, Clock, CheckCircle, XCircle, AlertCircle, FileText, MapPin, Camera } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ComplaintTracking = () => {
  const { user } = useContext(AuthContext);
  const [complaintId, setComplaintId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock complaint data - in real app this would come from API
  const mockComplaints = {
    'GRV001': {
      id: 'GRV001',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues and vehicle damage',
      category: 'Road Issues',
      status: 'In Progress',
      priority: 'High',
      submittedAt: '2024-01-15T10:30:00Z',
      estimatedResolution: '2024-01-25',
      location: {
        address: 'Main Street, Ward 3, Central Zone',
        coordinates: { lat: 23.2599, lng: 77.4126 }
      },
      updates: [
        {
          date: '2024-01-15T10:30:00Z',
          status: 'New',
          message: 'Complaint registered successfully',
          officer: 'System'
        },
        {
          date: '2024-01-16T09:15:00Z',
          status: 'Under Review',
          message: 'Complaint assigned to Road Maintenance Department',
          officer: 'Mr. Sharma'
        },
        {
          date: '2024-01-17T14:20:00Z',
          status: 'In Progress',
          message: 'Work order issued to contractor. Work to begin within 48 hours.',
          officer: 'Mrs. Patel'
        }
      ],
      assignedTo: 'Road Maintenance Department',
      officer: 'Mrs. Patel',
      contact: '+91-98765-43210'
    },
    'GRV002': {
      id: 'GRV002',
      title: 'Garbage not collected',
      description: 'Garbage collection missed for 3 consecutive days',
      category: 'Sanitation',
      status: 'Resolved',
      priority: 'Medium',
      submittedAt: '2024-01-10T08:00:00Z',
      resolvedAt: '2024-01-12T16:45:00Z',
      location: {
        address: 'Park Street, Ward 5, North Zone',
        coordinates: { lat: 23.2599, lng: 77.4126 }
      },
      updates: [
        {
          date: '2024-01-10T08:00:00Z',
          status: 'New',
          message: 'Complaint registered successfully',
          officer: 'System'
        },
        {
          date: '2024-01-11T10:30:00Z',
          status: 'Under Review',
          message: 'Complaint forwarded to Sanitation Department',
          officer: 'Mr. Kumar'
        },
        {
          date: '2024-01-12T14:00:00Z',
          status: 'In Progress',
          message: 'Garbage collection scheduled for today',
          officer: 'Mrs. Singh'
        },
        {
          date: '2024-01-12T16:45:00Z',
          status: 'Resolved',
          message: 'Garbage collected successfully. Area cleaned.',
          officer: 'Mrs. Singh'
        }
      ],
      assignedTo: 'Sanitation Department',
      officer: 'Mrs. Singh',
      contact: '+91-98765-43211'
    }
  };

  const handleTrackComplaint = async () => {
    if (!complaintId.trim()) {
      toast.error('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/complaints/track/${complaintId.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setTrackedComplaint(null);
          toast.error('Complaint not found. Please check the ID and try again.');
        } else {
          throw new Error('Failed to fetch complaint');
        }
      } else {
        const result = await response.json();
        console.log('Complaint data received:', result.complaint);
        setTrackedComplaint(result.complaint);
        toast.success('Complaint found!');
      }
    } catch (error) {
      console.error('Error tracking complaint:', error);
      toast.error('Failed to track complaint. Please try again.');
      setTrackedComplaint(null);
    }
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Complaint Status</h1>
          <p className="text-gray-600">Monitor the progress of your registered complaints</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Complaint ID
                </label>
                <input
                  type="text"
                  id="complaintId"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder="e.g., GRV001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleTrackComplaint}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span>{loading ? 'Searching...' : 'Track Complaint'}</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 <strong>Tip:</strong> You can find your complaint ID in the confirmation email/SMS or in your dashboard.</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for your complaint...</p>
          </div>
        )}

        {/* Complaint Details */}
        {!loading && trackedComplaint && trackedComplaint.id && (
          <div className="space-y-6">
            {/* Complaint Summary Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{trackedComplaint.title || 'Untitled Complaint'}</h2>
                  <p className="text-gray-600 mb-4">{trackedComplaint.description || 'No description available'}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(trackedComplaint.status || 'New')}`}>
                    {trackedComplaint.status || 'New'}
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(trackedComplaint.priority || 'Medium')}`}>
                    {trackedComplaint.priority || 'Medium'} Priority
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{trackedComplaint.category || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Submitted On</p>
                    <p className="font-medium text-gray-900">{formatDate(trackedComplaint.submitted_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{trackedComplaint.address}</p>
                  </div>
                </div>
              </div>

              {trackedComplaint.estimated_resolution && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Estimated Resolution Date: {trackedComplaint.estimated_resolution}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Timeline</h3>
              <div className="space-y-6">
                {trackedComplaint.updates && trackedComplaint.updates.length > 0 ? (
                  trackedComplaint.updates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      update.status === 'Resolved' ? 'bg-green-500' :
                      update.status === 'In Progress' ? 'bg-orange-500' :
                      update.status === 'Under Review' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {update.status === 'Resolved' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : update.status === 'In Progress' ? (
                        <Clock className="h-5 w-5 text-white" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                          {update.status}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(update.date)}</span>
                      </div>
                      <p className="text-gray-900 mb-1">{update.message}</p>
                      <p className="text-sm text-gray-600">Updated by: {update.officer}</p>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No status updates available yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Department Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Department & Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Assigned Department</h4>
                  <p className="text-gray-600">{trackedComplaint.assigned_to || 'Not assigned yet'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Responsible Officer</h4>
                  <p className="text-gray-600">{trackedComplaint.officer || 'Not assigned yet'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Number</h4>
                  <p className="text-gray-600">{trackedComplaint.contact || 'Not available'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Complaint ID</h4>
                  <p className="text-gray-600 font-mono">{trackedComplaint.id}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Contact Officer
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Request Update
                </button>
                <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Download Report
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  File New Complaint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Complaint Found Message */}
        {!loading && complaintId && !trackedComplaint && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <XCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Complaint Not Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find a complaint with ID "{complaintId}". Please check the ID and try again.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Make sure you've entered the correct complaint ID</p>
              <p>• Check for any extra spaces or characters</p>
              <p>• If you're still having trouble, contact our support team</p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Track Your Complaint</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Enter Complaint ID</h4>
              <p className="text-sm text-gray-600">Use the complaint ID you received when you filed the complaint</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Click Track</h4>
              <p className="text-sm text-gray-600">Click the track button to search for your complaint</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">View Status</h4>
              <p className="text-sm text-gray-600">See real-time updates and current status of your complaint</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTracking;
