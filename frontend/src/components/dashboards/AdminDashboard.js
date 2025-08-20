import React, { useState, useContext, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  User,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  BarChart3,
  MapPin,
  Eye,
  CheckSquare,
  XSquare,
  Building2,
  DocumentText,
  MessageCircle,
  Search,
  Camera,
  Plane,
  Database,
  Globe,
  Wifi,
  Satellite,
  Zap,
  ShieldCheck,
  AlertOctagon,
  TrendingDown,
  Users2,
  Building,
  FileSpreadsheet,
  BarChart2,
  PieChart,
  LineChart,
  Plus,
  RefreshCw
} from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showFieldSurveyModal, setShowFieldSurveyModal] = useState(false);
  const [showDroneFleetModal, setShowDroneFleetModal] = useState(false);
  const [showDataOverviewModal, setShowDataOverviewModal] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [propertyVerifications, setPropertyVerifications] = useState([]);
  const [buildingApprovals, setBuildingApprovals] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [illegalConstructions, setIllegalConstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    message: '',
    officer: '',
    priority: '',
    assignedTo: '',
    estimatedResolution: ''
  });
  const [statistics, setStatistics] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalPropertyVerifications: 0,
    pendingVerifications: 0,
    totalBuildingApprovals: 0,
    pendingApprovals: 0
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Fetch data from backend
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComplaints(data.data.complaints || []);
          setPropertyVerifications(data.data.property_verifications || []);
          setBuildingApprovals(data.data.building_approvals || []);
          setSurveys(data.data.surveys || []);
          setIllegalConstructions(data.data.illegal_constructions || []);
          
          // Update statistics with proper data handling
          const totalComplaints = data.data.complaints?.length || 0;
          const pendingComplaints = data.data.complaints?.filter(c => c.status === 'New' || c.status === 'Under Review')?.length || 0;
          const inProgressComplaints = data.data.complaints?.filter(c => c.status === 'In Progress')?.length || 0;
          const resolvedComplaints = data.data.complaints?.filter(c => c.status === 'Resolved')?.length || 0;
          
          const totalPropertyVerifications = data.data.property_verifications?.length || 0;
          const pendingVerifications = data.data.property_verifications?.filter(v => v.status === 'Pending')?.length || 0;
          
          const totalBuildingApprovals = data.data.building_approvals?.length || 0;
          const pendingApprovals = data.data.building_approvals?.filter(a => a.status === 'Pending')?.length || 0;
          
          setStatistics({
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            totalPropertyVerifications,
            pendingVerifications,
            totalBuildingApprovals,
            pendingApprovals
          });
        }
      } else {
        console.error('Failed to fetch admin data');
        toast.error('Failed to fetch admin dashboard data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error fetching admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Calculate average resolution time with proper error handling
  const calculateAverageResolutionTime = () => {
    try {
      const resolvedComplaints = complaints.filter(c => 
        c.status === 'Resolved' && 
        c.resolved_at && 
        c.submitted_at
      );
      
      if (resolvedComplaints.length === 0) return 'N/A';
      
      const totalDays = resolvedComplaints.reduce((total, complaint) => {
        try {
          const submitted = new Date(complaint.submitted_at);
          const resolved = new Date(complaint.resolved_at);
          const diffTime = Math.abs(resolved - submitted);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return total + diffDays;
        } catch (error) {
          console.error('Error calculating resolution time for complaint:', complaint.id, error);
          return total;
        }
      }, 0);
      
      const avgDays = Math.round(totalDays / resolvedComplaints.length);
      return `${avgDays} days`;
    } catch (error) {
      console.error('Error calculating average resolution time:', error);
      return 'N/A';
    }
  };

  const systemStats = {
    totalComplaints: statistics.totalComplaints || 0,
    pending: statistics.pendingComplaints || 0,
    inProgress: statistics.inProgressComplaints || 0,
    resolved: statistics.resolvedComplaints || 0,
    totalUsers: (complaints.length + propertyVerifications.length + buildingApprovals.length) || 0,
    activeOfficers: complaints.filter(c => c.assigned_to).length || 0,
    departments: new Set(complaints.map(c => c.category).filter(Boolean)).size || 0,
    avgResolutionTime: calculateAverageResolutionTime()
  };

  // Dynamic recent complaints from backend data with proper error handling
  const recentComplaints = useMemo(() => {
    try {
      return complaints
        .filter(c => c.submitted_at || c.created_at)
        .sort((a, b) => {
          const dateA = new Date(a.submitted_at || a.created_at);
          const dateB = new Date(b.submitted_at || b.created_at);
          return dateB - dateA;
        })
        .slice(0, 4)
        .map(complaint => ({
          id: complaint.id || 'N/A',
          title: complaint.title || complaint.description || 'No Title',
          priority: complaint.priority || 'Medium',
          status: complaint.status || 'New',
          department: complaint.category || 'General',
          date: new Date(complaint.submitted_at || complaint.created_at).toLocaleDateString('en-IN')
        }));
    } catch (error) {
      console.error('Error processing recent complaints:', error);
      return [];
    }
  }, [complaints]);

  const calculateDepartmentAvgTime = (department) => {
    try {
      const deptComplaints = complaints.filter(c => 
        c.category === department && 
        c.status === 'Resolved' && 
        c.resolved_at && 
        c.submitted_at
      );
      
      if (deptComplaints.length === 0) return 'N/A';
      
      const totalDays = deptComplaints.reduce((total, complaint) => {
        try {
          const submitted = new Date(complaint.submitted_at);
          const resolved = new Date(complaint.resolved_at);
          const diffTime = Math.abs(resolved - submitted);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return total + diffDays;
        } catch (error) {
          console.error('Error calculating department resolution time:', error);
          return total;
        }
      }, 0);
      
      const avgDays = Math.round(totalDays / deptComplaints.length);
      return `${avgDays} days`;
    } catch (error) {
      console.error('Error calculating department average time:', error);
      return 'N/A';
    }
  };





  // Dynamic grievance responses from backend data with proper error handling
  const grievanceResponses = useMemo(() => {
    try {
      return complaints
        .filter(c => c.status !== 'New')
        .slice(0, 3)
        .map(complaint => ({
          id: complaint.id || 'N/A',
          citizen: complaint.complainant?.full_name || complaint.full_name || 'Anonymous',
          complaint: complaint.title || complaint.description || 'No Title',
          response: complaint.updates?.[complaint.updates.length - 1]?.message || 'Status updated',
          status: complaint.status || 'New',
          date: new Date(complaint.updates?.[complaint.updates.length - 1]?.date || complaint.submitted_at || complaint.created_at).toLocaleDateString('en-IN')
        }));
    } catch (error) {
      console.error('Error processing grievance responses:', error);
      return [];
    }
  }, [complaints]);

  // Dynamic document verification requests from backend data with proper error handling
  const documentVerificationRequests = useMemo(() => {
    try {
      return propertyVerifications
        .slice(0, 3)
        .map(verification => ({
          id: verification.id || 'N/A',
          citizen: verification.full_name || verification.applicant_name || 'Unknown',
          documentType: verification.document_type || 'Property Documents',
          ward: verification.ward || verification.ward_name || 'Unknown',
          status: verification.status || 'Pending',
          submittedDate: new Date(verification.submitted_at || verification.created_at).toLocaleDateString('en-IN'),
          priority: verification.priority || 'Medium'
        }));
    } catch (error) {
      console.error('Error processing document verification requests:', error);
      return [];
    }
  }, [propertyVerifications]);

  // Dynamic building permission requests from backend data with proper error handling
  const buildingPermissionRequests = useMemo(() => {
    try {
      return buildingApprovals
        .slice(0, 3)
        .map(approval => ({
          id: approval.id || 'N/A',
          applicant: approval.applicant_name || approval.full_name || 'Unknown',
          project: approval.project_name || approval.title || 'Building Project',
          ward: approval.ward || approval.ward_name || 'Unknown',
          status: approval.status || 'Pending',
          submittedDate: new Date(approval.submitted_at || approval.created_at).toLocaleDateString('en-IN'),
          estimatedCost: approval.estimated_cost || '₹N/A'
        }));
    } catch (error) {
      console.error('Error processing building permission requests:', error);
      return [];
    }
  }, [buildingApprovals]);

  // Dynamic illegal construction reports from backend data with proper error handling
  const illegalConstructionReports = useMemo(() => {
    try {
      return illegalConstructions
        .slice(0, 3)
        .map(construction => ({
          id: construction.id || 'N/A',
          location: `${construction.ward_no || construction.ward_name || 'Unknown'}, ${construction.location || 'Unknown'}`,
          reporter: construction.reported_by || 'Anonymous',
          severity: construction.severity || 'Medium',
          status: construction.status || 'New Report',
          date: new Date(construction.detected_at || construction.created_at).toLocaleDateString('en-IN'),
          coordinates: construction.coordinates ? 
            `${construction.coordinates.latitude?.toFixed(4) || 'N/A'}, ${construction.coordinates.longitude?.toFixed(4) || 'N/A'}` : 
            'N/A'
        }));
    } catch (error) {
      console.error('Error processing illegal construction reports:', error);
      return [];
    }
  }, [illegalConstructions]);

  const fieldSurveys = [
    { id: 'FS001', incharge: 'Rajesh Kumar', location: 'Ward 5, Sector A', type: 'Drone Survey', status: 'Completed', date: '2024-01-15', droneModel: 'DJI Mavic 3', dataCollected: 'Images, Lidar, GPS', coordinates: '28.7041°N, 77.1025°E' },
    { id: 'FS002', incharge: 'Priya Sharma', location: 'Ward 3, Sector B', type: 'Manual Survey', status: 'In Progress', date: '2024-01-15', droneModel: 'N/A', dataCollected: 'Photos, Measurements', coordinates: '28.7041°N, 77.1025°E' },
    { id: 'FS003', incharge: 'Amit Patel', location: 'Ward 7, Sector C', type: 'Drone Survey', status: 'Scheduled', date: '2024-01-16', droneModel: 'DJI Mavic 3', dataCollected: 'Pending', coordinates: '28.7041°N, 77.1025°E' }
  ];

  const droneFleet = [
    { id: 'DRONE001', model: 'DJI Mavic 3 Enterprise', status: 'Active', operator: 'Rajesh Kumar', lastMission: '2024-01-15', batteryLevel: 85, sensors: ['GPS', 'Lidar', 'Camera', 'ADS-B'], location: 'Ward 5', missionType: 'Survey' },
    { id: 'DRONE002', model: 'DJI Mavic 3 Enterprise', status: 'Maintenance', operator: 'Priya Sharma', lastMission: '2024-01-14', batteryLevel: 45, sensors: ['GPS', 'Camera'], location: 'Hangar', missionType: 'Inspection' },
    { id: 'DRONE003', model: 'Custom Quadcopter', status: 'Active', operator: 'Amit Patel', lastMission: '2024-01-15', batteryLevel: 92, sensors: ['GPS', 'Thermal', 'Multispectral'], location: 'Ward 7', missionType: 'Agriculture' }
  ];

  const dataCollectionOverview = [
    { sheet: 'Ward 5 Survey Data', records: 1247, lastUpdated: '2024-01-15 14:30', incharge: 'Rajesh Kumar', status: 'Complete', dataTypes: ['GPS', 'Images', 'Measurements'] },
    { sheet: 'Ward 3 Construction Data', records: 892, lastUpdated: '2024-01-15 16:45', incharge: 'Priya Sharma', status: 'In Progress', dataTypes: ['Photos', 'Documents', 'Coordinates'] },
    { sheet: 'Ward 7 Infrastructure Data', records: 1567, lastUpdated: '2024-01-15 12:15', incharge: 'Amit Patel', status: 'Pending Review', dataTypes: ['Lidar', 'Thermal', 'Satellite'] }
  ];







  const handleStatusChange = (type, id, newStatus) => {
    toast.success(`${type} status updated to ${newStatus}`);
    // In real app, this would update the backend
  };

  const handleResponseSubmit = (id, response) => {
    toast.success('Response submitted successfully');
    // In real app, this would update the backend
  };

  const handleSurveyApproval = (surveyId, action) => {
    toast.success(`Field survey ${action} successfully`);
    // In real app, this would update the backend
  };

  const handleDroneDeployment = (droneId, action) => {
    toast.success(`Drone ${action} successfully`);
    // In real app, this would update the backend
  };

  const handleDataApproval = (dataId, action) => {
    toast.success(`Data ${action} successfully`);
    // In real app, this would update the backend
  };

  // Handle complaint status update
  const handleComplaintUpdate = async (complaintId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          status: updateForm.status,
          message: updateForm.message,
          officer: updateForm.officer,
          priority: updateForm.priority || '',
          assigned_to: updateForm.assignedTo || '',
          estimated_resolution: updateForm.estimatedResolution || ''
        })
      });

      if (response.ok) {
        toast.success('Complaint status updated successfully');
        setShowComplaintModal(false);
        // Refresh data
        window.location.reload();
      } else {
        toast.error('Failed to update complaint status');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast.error('Failed to update complaint status');
    }
  };

  // Handle property verification update
  const handleVerificationUpdate = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/property/verifications/${ticketId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          status: updateForm.status,
          notes: updateForm.message || '',
          verified_by: updateForm.officer
        })
      });

      if (response.ok) {
        toast.success('Property verification updated successfully');
        setShowVerificationModal(false);
        // Refresh data
        window.location.reload();
      } else {
        toast.error('Failed to update verification status');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  // Handle building approval update
  const handleApprovalUpdate = async (ticketId) => {
    try {
      const action = updateForm.status === 'Approved' ? 'approve' : 'reject';
      const response = await fetch(`http://localhost:8000/api/building/approvals/${ticketId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: action,
          notes: updateForm.message || '',
          approved_by: updateForm.officer,
          rejection_reason: action === 'reject' ? updateForm.message : ''
        })
      });

      if (response.ok) {
        toast.success(`Building application ${action}d successfully`);
        setShowApprovalModal(false);
        // Refresh data
        window.location.reload();
      } else {
        toast.error(`Failed to ${action} building application`);
      }
    } catch (error) {
      console.error('Error updating building approval:', error);
      toast.error('Failed to update building approval status');
    }
  };



  // Survey Analysis Section
  const surveyAnalysis = () => {
    // Implement survey analysis logic
    console.log('Survey analysis logic');
  };

  // Handle violation actions
  const handleViolationAction = async (violationId, action) => {
    try {
      let newStatus = '';
      let message = '';
      
      switch (action) {
        case 'investigate':
          newStatus = 'under_investigation';
          message = 'Violation marked for investigation';
          break;
        case 'resolve':
          newStatus = 'resolved';
          message = 'Violation marked as resolved';
          break;
        case 'escalate':
          newStatus = 'escalated';
          message = 'Violation escalated to higher authorities';
          break;
        default:
          return;
      }
      
      // Update violation status in backend
      const response = await fetch(`http://localhost:8000/api/illegal-constructions/${violationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          status: newStatus,
          message: message,
          officer: user?.email || 'Admin',
          action_taken: action
        })
      });
      
      if (response.ok) {
        toast.success(message);
        // Refresh data
        window.location.reload();
      } else {
        throw new Error('Failed to update violation status');
      }
    } catch (error) {
      console.error('Error updating violation:', error);
      toast.error('Failed to update violation status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Garun System</h1>
                <p className="text-sm text-gray-600">Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => setShowChat(!showChat)}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-3 w-3 bg-blue-500 rounded-full"></span>
              </button>
              <button 
                onClick={fetchAdminData}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Refresh Data"
              >
                <RefreshCw className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name || 'Administrator'}</span>
              </div>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading Admin Dashboard...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name || 'Administrator'}! 🛡️
            </h2>
            <p className="text-gray-600">
              Monitor system performance, manage departments, and ensure efficient grievance resolution.
            </p>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalComplaints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.resolved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Officials</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.activeOfficers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.avgResolutionTime}</p>
                </div>
              </div>
            </div>
          </div>





          {/* Field Survey Monitoring */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Field Survey Monitoring</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Track all surveys from Incharge Dashboard</span>
                <button 
                  onClick={() => setShowFieldSurveyModal(true)}
                  className="btn-primary text-xs px-3 py-1"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  View All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fieldSurveys.map((survey) => (
                <div key={survey.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{survey.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      survey.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      survey.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {survey.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Incharge:</span> {survey.incharge}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {survey.location}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {survey.type}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Drone:</span> {survey.droneModel}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Data:</span> {survey.dataCollected}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Coordinates:</span> {survey.coordinates}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSurveyApproval(survey.id, 'approved')}
                      className="btn-success text-xs px-3 py-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleSurveyApproval(survey.id, 'rejected')}
                      className="btn-danger text-xs px-3 py-1"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setSelectedRequest(survey)}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Surveys and Illegal Constructions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">📊 Surveys & Illegal Constructions</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Monitor field surveys and violations</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surveys Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Surveys
                </h4>
                {surveys && surveys.length > 0 ? (
                  <div className="space-y-3">
                    {surveys.slice(0, 3).map((survey) => (
                      <div key={survey.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{survey.id}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Ward {survey.ward_no}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Date:</span> {survey.survey_date}</p>
                          <p><span className="font-medium">Drone:</span> {survey.drone_id}</p>
                          <p><span className="font-medium">Violations:</span> {survey.total_violations}</p>
                          <p><span className="font-medium">Compliance:</span> {survey.compliance_score || 'N/A'}%</p>
                          <p><span className="font-medium">Area:</span> {survey.total_area_sq_meters || 'N/A'} sq m</p>
                        </div>
                        {survey.severity_summary && (
                          <div className="mt-2 flex space-x-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              H: {survey.severity_summary.high || 0}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              M: {survey.severity_summary.medium || 0}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              L: {survey.severity_summary.low || 0}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {surveys.length > 3 && (
                      <div className="text-center pt-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View All Surveys ({surveys.length})
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No surveys available</p>
                  </div>
                )}
              </div>

              {/* Illegal Constructions Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Illegal Constructions
                </h4>
                {illegalConstructions && illegalConstructions.length > 0 ? (
                  <div className="space-y-3">
                    {illegalConstructions.slice(0, 3).map((violation) => (
                      <div key={violation.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{violation.violation_type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            violation.severity === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : violation.severity === 'medium'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {violation.severity}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Ward:</span> {violation.ward_name || `Ward ${violation.ward_no}`}</p>
                          <p><span className="font-medium">Status:</span> {violation.status}</p>
                          <p><span className="font-medium">Detected:</span> {new Date(violation.detected_at).toLocaleDateString()}</p>
                          {violation.description && (
                            <p><span className="font-medium">Issue:</span> {violation.description}</p>
                          )}
                          {violation.priority && (
                            <p><span className="font-medium">Priority:</span> 
                              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                violation.priority === 'high' ? 'bg-red-100 text-red-800' :
                                violation.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {violation.priority}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {illegalConstructions.length > 3 && (
                      <div className="text-center pt-2">
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          View All Violations ({illegalConstructions.length})
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No violations detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Survey Analytics Dashboard */}
          {surveys && surveys.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📈 Survey Analytics & Compliance Metrics</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">Real-time compliance monitoring</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Total Surveys */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Camera className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Surveys</p>
                      <p className="text-2xl font-bold text-blue-900">{surveys.length}</p>
                    </div>
                  </div>
                </div>

                {/* Total Violations */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Total Violations</p>
                      <p className="text-2xl font-bold text-red-900">
                        {surveys.reduce((total, survey) => total + (survey.total_violations || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Average Compliance Score */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Avg Compliance</p>
                      <p className="text-2xl font-bold text-green-900">
                        {Math.round(surveys.reduce((total, survey) => total + (survey.compliance_score || 100), 0) / surveys.length)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Area Covered */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Area Covered</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {Math.round(surveys.reduce((total, survey) => total + (survey.total_area_sq_meters || 0), 0) / 1000)}K sq m
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ward-wise Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🏘️ Ward-wise Violation Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(
                      surveys.reduce((acc, survey) => {
                        const ward = survey.ward_no;
                        acc[ward] = (acc[ward] || 0) + (survey.total_violations || 0);
                        return acc;
                      }, {})
                    )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([ward, violations]) => (
                      <div key={ward} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Ward {ward}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${(violations / Math.max(...Object.values(surveys.reduce((acc, s) => { acc[s.ward_no] = (acc[s.ward_no] || 0) + (s.total_violations || 0); return acc; }, {})))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{violations}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">�� Severity Breakdown</h4>
                  <div className="space-y-3">
                    {(() => {
                      const severityCounts = surveys.reduce((acc, survey) => {
                        if (survey.severity_summary) {
                          acc.high += survey.severity_summary.high || 0;
                          acc.medium += survey.severity_summary.medium || 0;
                          acc.low += survey.severity_summary.low || 0;
                        }
                        return acc;
                      }, { high: 0, medium: 0, low: 0 });

                      return [
                        { label: 'High Priority', count: severityCounts.high, color: 'bg-red-500', textColor: 'text-red-800' },
                        { label: 'Medium Priority', count: severityCounts.medium, color: 'bg-orange-500', textColor: 'text-orange-800' },
                        { label: 'Low Priority', count: severityCounts.low, color: 'bg-yellow-500', textColor: 'text-yellow-800' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${item.color} h-2 rounded-full`}
                                style={{ width: `${(item.count / Math.max(severityCounts.high, severityCounts.medium, severityCounts.low)) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium w-8 text-right ${item.textColor}`}>{item.count}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grievance Platform Responses */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Grievance Platform Responses</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search responses..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button className="btn-secondary">
                  Filter
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grievanceResponses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{response.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.citizen}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{response.complaint}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{response.response}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          response.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          response.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {response.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRequest(response)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange('Grievance Response', response.id, 'Approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange('Grievance Response', response.id, 'Rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drone Fleet Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Drone Fleet Management</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Monitor all drone operations and sensor data</span>
                <button 
                  onClick={() => setShowDroneFleetModal(true)}
                  className="btn-primary text-xs px-3 py-1"
                >
                  <Plane className="h-3 w-3 mr-1" />
                  Manage Fleet
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {droneFleet.map((drone) => (
                <div key={drone.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{drone.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      drone.status === 'Active' ? 'bg-green-100 text-green-800' :
                      drone.status === 'Maintenance' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {drone.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Model:</span> {drone.model}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Operator:</span> {drone.operator}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {drone.location}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Mission:</span> {drone.missionType}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Battery:</span> {drone.batteryLevel}%</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Sensors:</span> {drone.sensors.join(', ')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDroneDeployment(drone.id, 'deployed')}
                      className="btn-success text-xs px-3 py-1"
                    >
                      Deploy
                    </button>
                    <button
                      onClick={() => handleDroneDeployment(drone.id, 'recalled')}
                      className="btn-danger text-xs px-3 py-1"
                    >
                      Recall
                    </button>
                    <button
                      onClick={() => setSelectedRequest(drone)}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Verification Requests */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Document Verification Requests</h3>
              <span className="text-sm text-gray-500">Ward-wise verification</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentVerificationRequests.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{doc.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.priority === 'High' ? 'bg-red-100 text-red-800' :
                      doc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {doc.priority}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Citizen:</span> {doc.citizen}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Document:</span> {doc.documentType}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Ward:</span> {doc.ward}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> {doc.status}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Submitted:</span> {doc.submittedDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange('Document', doc.id, 'Verified')}
                      className="btn-success text-xs px-3 py-1"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleStatusChange('Document', doc.id, 'Rejected')}
                      className="btn-danger text-xs px-3 py-1"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setSelectedRequest(doc)}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Collection Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Data Collection Overview</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Monitor all Excel data and changes from Incharge Dashboard</span>
                <button 
                  onClick={() => setShowDataOverviewModal(true)}
                  className="btn-primary text-xs px-3 py-1"
                >
                  <Database className="h-3 w-3 mr-1" />
                  View All Data
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataCollectionOverview.map((data, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{data.sheet}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      data.status === 'Complete' ? 'bg-green-100 text-green-800' :
                      data.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Records:</span> {data.records.toLocaleString()}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Incharge:</span> {data.incharge}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Last Updated:</span> {data.lastUpdated}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Data Types:</span> {data.dataTypes.join(', ')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDataApproval(data.sheet, 'approved')}
                      className="btn-success text-xs px-3 py-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDataApproval(data.sheet, 'review')}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => setSelectedRequest(data)}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Building Permission Requests */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Building Construction Permission Requests</h3>
              <span className="text-sm text-gray-500">Large scale projects</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buildingPermissionRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.applicant}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.ward}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.estimatedCost}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'Pending Approval' ? 'bg-red-100 text-red-800' :
                          request.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStatusChange('Building Permission', request.id, 'Approved')}
                            className="btn-success text-xs px-3 py-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange('Building Permission', request.id, 'Rejected')}
                            className="btn-danger text-xs px-3 py-1"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>



          {/* Illegal Construction Reports */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Illegal Construction Reports</h3>
              <span className="text-sm text-gray-500">Ward-wise monitoring</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {illegalConstructionReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{report.id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.severity === 'High' ? 'bg-red-100 text-red-800' :
                      report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {report.location}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Reporter:</span> {report.reporter}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Coordinates:</span> {report.coordinates}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> {report.status}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {report.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange('Illegal Construction', report.id, 'Under Investigation')}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => handleStatusChange('Illegal Construction', report.id, 'Resolved')}
                      className="btn-success text-xs px-3 py-1"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => setSelectedRequest(report)}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>





          {/* Recent Complaints */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{complaint.title}</p>
                      <p className="text-sm text-gray-600">ID: {complaint.id} • {complaint.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaint.priority === 'High' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{complaint.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Manage Users</h3>
              <p className="text-xs text-gray-600">Add, edit, or remove system users</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-xs text-gray-600">View detailed system analytics</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">System Settings</h3>
              <p className="text-xs text-gray-600">Configure system parameters</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Broadcast</h3>
              <p className="text-xs text-gray-600">Send system-wide notifications</p>
            </div>
          </div>

          {/* Additional Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Survey Monitor</h3>
              <p className="text-xs text-gray-600">Monitor all field surveys</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Plane className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Drone Control</h3>
              <p className="text-xs text-gray-600">Manage drone fleet operations</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Data Monitor</h3>
              <p className="text-xs text-gray-600">Track all data collection</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Audit Log</h3>
              <p className="text-xs text-gray-600">View system audit trail</p>
            </div>
          </div>

          {/* Survey Analysis Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">📊 Survey Analysis & Violations</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/surveys')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All Surveys
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Survey Statistics */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Survey Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Surveys</p>
                    <p className="text-xl font-bold text-blue-600">{surveys.length}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">
                      {surveys.filter(s => s.status === 'completed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Violations</p>
                    <p className="text-xl font-bold text-red-600">
                      {surveys.reduce((total, s) => total + (s.violations?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Compliance Rate</p>
                    <p className="text-xl font-bold text-purple-600">
                      {surveys.length > 0 ? 
                        Math.round(((surveys.length - surveys.reduce((total, s) => total + (s.violations?.length || 0), 0)) / surveys.length) * 100) : 100
                      }%
                    </p>
                  </div>
                </div>
              </div>

              {/* Violation Severity Breakdown */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Violation Severity</h4>
                <div className="space-y-3">
                  {(() => {
                    const highSeverity = surveys.reduce((total, s) => 
                      total + (s.violations?.filter(v => v.severity === 'high').length || 0), 0);
                    const mediumSeverity = surveys.reduce((total, s) => 
                      total + (s.violations?.filter(v => v.severity === 'medium').length || 0), 0);
                    const lowSeverity = surveys.reduce((total, s) => 
                      total + (s.violations?.filter(v => v.severity === 'low').length || 0), 0);
                    
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">High Severity</span>
                          <span className="text-lg font-bold text-red-600">{highSeverity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: `${(highSeverity / Math.max(highSeverity + mediumSeverity + lowSeverity, 1)) * 100}%`}}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Medium Severity</span>
                          <span className="text-lg font-bold text-yellow-600">{mediumSeverity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(mediumSeverity / Math.max(highSeverity + mediumSeverity + lowSeverity, 1)) * 100}%`}}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Low Severity</span>
                          <span className="text-lg font-bold text-green-600">{lowSeverity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: `${(lowSeverity / Math.max(highSeverity + mediumSeverity + lowSeverity, 1)) * 100}%`}}></div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Surveys with Violations */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🔍 Recent Surveys & Violations</h3>
              <button 
                onClick={() => navigate('/surveys')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {surveys.slice(0, 5).map((survey) => (
                <div key={survey.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">Survey {survey.id}</span>
                        <span className="text-sm text-gray-500">Ward {survey.ward_no}</span>
                        <span className="text-sm text-gray-500">Drone: {survey.drone_id}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span> {survey.survey_date}
                        </div>
                        <div>
                          <span className="font-medium">Violations:</span> {survey.total_violations || 0}
                        </div>
                        <div>
                          <span className="font-medium">Buildings:</span> {survey.total_buildings || 0}
                        </div>
                        <div>
                          <span className="font-medium">Compliance:</span> {survey.compliance_score || 100}%
                        </div>
                      </div>
                      
                      {survey.coordinates && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Coordinates:</span> {survey.coordinates?.latitude?.toFixed(4)}, {survey.coordinates?.longitude?.toFixed(4)}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          survey.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {survey.status}
                        </span>
                        <span className="text-sm text-gray-500">• {survey.survey_type}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/survey-results`, { state: { surveyId: survey.id, survey: survey } })}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => navigate('/survey-form')}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                        title="New Survey"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Violations Summary */}
                  {survey.violations && survey.violations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Detected Violations:</h5>
                      <div className="space-y-2">
                        {survey.violations.slice(0, 3).map((violation, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{violation.type}</p>
                              <p className="text-xs text-gray-600">
                                Current: {violation.current} | Allowed: {violation.allowed}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              violation.severity === 'high' ? 'bg-red-100 text-red-800' :
                              violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {violation.severity}
                            </span>
                          </div>
                        ))}
                        {survey.violations.length > 3 && (
                          <div className="text-center">
                            <span className="text-sm text-gray-500">
                              +{survey.violations.length - 3} more violations
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {surveys.length === 0 && (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Surveys Yet</h3>
                  <p className="text-gray-600 mb-4">Incharge officers will conduct field surveys and data will appear here</p>
                </div>
              )}
              
              {surveys.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => navigate('/surveys')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All Surveys ({surveys.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Illegal Construction Management */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🚨 Illegal Construction Management</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/surveys')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All Violations
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {illegalConstructions.slice(0, 5).map((construction) => (
                <div key={construction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">Violation {construction.id}</span>
                        <span className="text-sm text-gray-500">Survey: {construction.survey_id}</span>
                        <span className="text-sm text-gray-500">Ward: {construction.ward_name}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Type:</span> {construction.violation_type}
                        </div>
                        <div>
                          <span className="font-medium">Current:</span> {construction.current_value}
                        </div>
                        <div>
                          <span className="font-medium">Allowed:</span> {construction.allowed_value}
                        </div>
                        <div>
                          <span className="font-medium">Priority:</span> {construction.priority}
                        </div>
                      </div>
                      
                      {construction.coordinates && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Location:</span> {construction.coordinates?.latitude?.toFixed(4)}, {construction.coordinates?.longitude?.toFixed(4)}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          construction.severity === 'high' ? 'bg-red-100 text-red-800' :
                          construction.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {construction.severity} Severity
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          construction.status === 'detected' ? 'bg-blue-100 text-blue-800' :
                          construction.status === 'under_investigation' ? 'bg-yellow-100 text-yellow-800' :
                          construction.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {construction.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Detected: {new Date(construction.detected_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      
                      {construction.estimated_resolution_days && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Estimated Resolution: {construction.estimated_resolution_days} days
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViolationAction(construction.id, 'investigate')}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="Investigate"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleViolationAction(construction.id, 'resolve')}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                        title="Mark Resolved"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleViolationAction(construction.id, 'escalate')}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        title="Escalate"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {illegalConstructions.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Violations Detected</h3>
                  <p className="text-gray-600 mb-4">All surveys show compliance with building regulations</p>
                </div>
              )}
              
              {illegalConstructions.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => navigate('/surveys')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All Violations ({illegalConstructions.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ward-wise Analysis */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🗺️ Ward-wise Analysis</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/surveys')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Detailed Reports
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ward Performance Overview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Ward Performance Overview</h4>
                <div className="space-y-3">
                  {(() => {
                    // Group surveys by ward
                    const wardData = surveys.reduce((acc, survey) => {
                      const wardNo = survey.ward_no;
                      if (!acc[wardNo]) {
                        acc[wardNo] = {
                          wardNo,
                          surveys: 0,
                          violations: 0,
                          compliance: 100,
                          lastSurvey: null
                        };
                      }
                      acc[wardNo].surveys++;
                      acc[wardNo].violations += survey.violations?.length || 0;
                      if (survey.created_at) {
                        acc[wardNo].lastSurvey = survey.created_at;
                      }
                      return acc;
                    }, {});
                    
                    // Calculate compliance rate for each ward
                    Object.values(wardData).forEach(ward => {
                      ward.compliance = ward.surveys > 0 ? 
                        Math.round(((ward.surveys - ward.violations) / ward.surveys) * 100) : 100;
                    });
                    
                    // Sort by compliance rate (ascending - worst first)
                    const sortedWards = Object.values(wardData).sort((a, b) => a.compliance - b.compliance);
                    
                    return sortedWards.slice(0, 5).map((ward) => (
                      <div key={ward.wardNo} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Ward {ward.wardNo}</span>
                          <span className={`text-sm font-medium ${
                            ward.compliance >= 80 ? 'text-green-600' :
                            ward.compliance >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {ward.compliance}% Compliance
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>Surveys: {ward.surveys}</div>
                          <div>Violations: {ward.violations}</div>
                          <div>Last: {ward.lastSurvey ? new Date(ward.lastSurvey).toLocaleDateString('en-IN') : 'N/A'}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full ${
                            ward.compliance >= 80 ? 'bg-green-500' :
                            ward.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{width: `${ward.compliance}%`}}></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Survey Type Distribution */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Survey Type Distribution</h4>
                <div className="space-y-3">
                  {(() => {
                    const surveyTypes = surveys.reduce((acc, survey) => {
                      const type = survey.survey_type || 'Unknown';
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {});
                    
                    const totalSurveys = surveys.length;
                    
                    return Object.entries(surveyTypes).map(([type, count]) => {
                      const percentage = totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0;
                      return (
                        <div key={type} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{type}</span>
                            <span className="text-sm text-gray-600">{count} surveys</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-sm text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            
            {/* Compliance Trend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Compliance Trend</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {surveys.length > 0 ? 
                      Math.round(((surveys.length - surveys.reduce((total, s) => total + (s.violations?.length || 0), 0)) / surveys.length) * 100) : 100
                    }%
                  </div>
                  <div className="text-sm text-green-600">Overall Compliance</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{surveys.length}</div>
                  <div className="text-sm text-blue-600">Total Surveys</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {surveys.reduce((total, s) => total + (s.violations?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-red-600">Total Violations</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {surveys.length > 0 ? Math.round(surveys.reduce((total, s) => total + (s.compliance_score || 100), 0) / surveys.length) : 100}%
                  </div>
                  <div className="text-sm text-purple-600">Avg Compliance Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Communication Chat Panel */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Direct Communication</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-gray-900">Hello, I have a question about the new building permission process.</p>
                    <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-primary-600 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Hello! I'd be happy to help you with the building permission process. What specific question do you have?</p>
                    <p className="text-xs text-primary-100 mt-1">2:32 PM</p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 input-field"
                />
                <button className="btn-primary px-4">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(selectedRequest).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex space-x-3">
                <button className="btn-success">Approve</button>
                <button className="btn-danger">Reject</button>
                <button className="btn-secondary">Request More Info</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Survey Modal */}
      {showFieldSurveyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Field Survey Monitoring</h3>
              <button
                onClick={() => setShowFieldSurveyModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">All Field Surveys</h4>
                <p className="text-gray-600">Monitor and manage all field surveys conducted by Incharge users</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fieldSurveys.map((survey) => (
                      <tr key={survey.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{survey.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{survey.incharge}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{survey.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{survey.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            survey.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            survey.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {survey.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{survey.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSurveyApproval(survey.id, 'approved')}
                              className="btn-success text-xs px-3 py-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleSurveyApproval(survey.id, 'rejected')}
                              className="btn-danger text-xs px-3 py-1"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setSelectedRequest(survey)}
                              className="btn-secondary text-xs px-3 py-1"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drone Fleet Modal */}
      {showDroneFleetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Drone Fleet Management</h3>
              <button
                onClick={() => setShowDroneFleetModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Drone Fleet Overview</h4>
                <p className="text-gray-600">Monitor and control all drone operations, sensor data, and fleet status</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {droneFleet.map((drone) => (
                  <div key={drone.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">{drone.id}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        drone.status === 'Active' ? 'bg-green-100 text-green-800' :
                        drone.status === 'Maintenance' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {drone.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600"><span className="font-medium">Model:</span> {drone.model}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Operator:</span> {drone.operator}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {drone.location}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Mission:</span> {drone.missionType}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Battery:</span> {drone.batteryLevel}%</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Sensors:</span> {drone.sensors.join(', ')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDroneDeployment(drone.id, 'deployed')}
                        className="btn-success text-xs px-3 py-1"
                      >
                        Deploy
                      </button>
                      <button
                        onClick={() => handleDroneDeployment(drone.id, 'recalled')}
                        className="btn-danger text-xs px-3 py-1"
                      >
                        Recall
                      </button>
                      <button
                        onClick={() => setSelectedRequest(drone)}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Overview Modal */}
      {showDataOverviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Data Collection Overview</h3>
              <button
                onClick={() => setShowDataOverviewModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">All Data Collections</h4>
                <p className="text-gray-600">Monitor all Excel data, changes, and data collection activities from Incharge Dashboard</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sheet Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Types</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataCollectionOverview.map((data, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.sheet}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.records.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.incharge}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.lastUpdated}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            data.status === 'Complete' ? 'bg-green-100 text-green-800' :
                            data.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {data.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{data.dataTypes.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDataApproval(data.sheet, 'approved')}
                              className="btn-success text-xs px-3 py-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDataApproval(data.sheet, 'review')}
                              className="btn-secondary text-xs px-3 py-1"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => setSelectedRequest(data)}
                              className="btn-primary text-xs px-3 py-1"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}




        
    </div>
  );
};

export default AdminDashboard;
