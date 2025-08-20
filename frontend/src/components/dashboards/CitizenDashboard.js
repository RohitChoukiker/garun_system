import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Upload, 
  Search, 
  MessageSquare, 
  User, 
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bell,
  Eye,
  Calendar,
  Phone,
  Mail,
  Home,
  Building,
  FileCheck,
  MessageCircle,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userComplaints, setUserComplaints] = useState([]);
  const [userPropertyVerifications, setUserPropertyVerifications] = useState([]);
  const [userBuildingApprovals, setUserBuildingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    totalPropertyVerifications: 0,
    pendingVerifications: 0,
    totalBuildingApprovals: 0,
    pendingApprovals: 0
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Fetch all user data from backend
  const fetchUserData = async () => {
    if (!user?.contactNumber) {
      console.log('No user contact number available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user complaints
      const complaintsResponse = await fetch(`http://localhost:8000/api/complaints/user/${user.contactNumber}`);
      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        const userComplaintsData = complaintsData.complaints || [];
        setUserComplaints(userComplaintsData);
        
        // Calculate complaint stats
        const totalComplaints = userComplaintsData.length;
        const resolvedComplaints = userComplaintsData.filter(c => c.status === 'Resolved').length;
        const inProgressComplaints = userComplaintsData.filter(c => c.status === 'In Progress').length;
        const pendingComplaints = userComplaintsData.filter(c => c.status === 'New' || c.status === 'Under Review').length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalComplaints,
          resolved: resolvedComplaints,
          inProgress: inProgressComplaints,
          pending: pendingComplaints
        }));
      }

      // Fetch user property verifications
      const propertyResponse = await fetch(`http://localhost:8000/api/property/user/${user.contactNumber}`);
      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        const userPropertyData = propertyData.verifications || [];
        setUserPropertyVerifications(userPropertyData);
        
        // Calculate property verification stats
        const totalPropertyVerifications = userPropertyData.length;
        const pendingVerifications = userPropertyData.filter(v => v.status === 'Pending').length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalPropertyVerifications,
          pendingVerifications
        }));
      }

      // Fetch user building approvals
      const buildingResponse = await fetch(`http://localhost:8000/api/building/user/${user.contactNumber}`);
      if (buildingResponse.ok) {
        const buildingData = await buildingResponse.json();
        const userBuildingData = buildingData.approvals || [];
        setUserBuildingApprovals(userBuildingData);
        
        // Calculate building approval stats
        const totalBuildingApprovals = userBuildingData.length;
        const pendingApprovals = userBuildingData.filter(a => a.status === 'Pending').length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalBuildingApprovals,
          pendingApprovals
        }));
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.contactNumber]);

  const complaintCategories = [
    { id: 1, name: 'Illegal Construction', icon: '🏗️', color: 'bg-red-100 text-red-800' },
    { id: 2, name: 'Encroachment', icon: '🚧', color: 'bg-orange-100 text-orange-800' },
    { id: 3, name: 'Sanitation', icon: '🧹', color: 'bg-yellow-100 text-yellow-800' },
    { id: 4, name: 'Water Supply', icon: '💧', color: 'bg-blue-100 text-blue-800' },
    { id: 5, name: 'Road Issues', icon: '🛣️', color: 'bg-gray-100 text-gray-800' },
    { id: 6, name: 'Street Lighting', icon: '💡', color: 'bg-purple-100 text-purple-800' }
  ];

  const recentComplaints = userComplaints.slice(0, 5).map(complaint => ({
    id: complaint.id,
    title: complaint.title,
    status: complaint.status,
    category: complaint.category,
    date: new Date(complaint.submitted_at || complaint.created_at).toLocaleDateString('en-IN'),
    priority: complaint.priority || 'Medium'
  }));

  const recentPropertyVerifications = userPropertyVerifications.slice(0, 3).map(verification => ({
    id: verification.id,
    documentType: verification.document_type || 'Property Documents',
    status: verification.status,
    submittedDate: new Date(verification.submitted_at || verification.created_at).toLocaleDateString('en-IN')
  }));

  const recentBuildingApprovals = userBuildingApprovals.slice(0, 3).map(approval => ({
    id: approval.id,
    projectName: approval.project_name || approval.title,
    status: approval.status,
    submittedDate: new Date(approval.submitted_at || approval.created_at).toLocaleDateString('en-IN')
  }));

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-gray-100 text-gray-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Garun System</h1>
                <p className="text-sm text-gray-600">Citizen Dashboard</p>
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
                onClick={fetchUserData}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Refresh Data"
              >
                <RefreshCw className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name || 'Citizen'}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Citizen'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your grievances, track their progress, and stay updated on all municipal services.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Functionality Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Register Complaint */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Register Your Complaint</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Report new issues with photo/video upload, location tagging, and category selection
                  </p>
                  <button 
                    onClick={() => navigate('/register-complaint')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    File New Complaint
                  </button>
                </div>
              </div>

              {/* Track Status */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-success-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Complaint Status</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Monitor progress from New → In-progress → Resolved → Closed with real-time updates
                  </p>
                  <button 
                    onClick={() => navigate('/track-complaint')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Track Status
                  </button>
                </div>
              </div>

              {/* Property Documents */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-warning-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Property Documents</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload and verify your property documents with government officials
                  </p>
                  <button 
                    onClick={() => navigate('/property-verification')}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Verify Documents
                  </button>
                </div>
              </div>

              {/* Building Approval */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply for Building Approval</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Submit building plans and get approval from municipal authorities
                  </p>
                  <button 
                    onClick={() => navigate('/building-approval')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>

              {/* Direct Communication */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Communication</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Chat directly with officials and get real-time updates on your complaints
                  </p>
                  <button 
                    onClick={() => navigate('/direct-communication')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Chat
                  </button>
                </div>
              </div>

              {/* Anonymous Complaints */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Complaints</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Submit complaints anonymously with limited tracking for sensitive issues
                  </p>
                  <button 
                    onClick={() => navigate('/anonymous-complaint')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Submit Anonymously
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Complaints */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
                  <Link to="/track-complaint" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentComplaints.length > 0 ? (
                    recentComplaints.map((complaint) => (
                      <div 
                        key={complaint.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => openComplaintDetails(complaint)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{complaint.title}</p>
                            <p className="text-sm text-gray-600">ID: {complaint.id} • {complaint.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">{complaint.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
                      <p className="text-gray-600 mb-4">Start by registering your first complaint to track municipal issues</p>
                      <button 
                        onClick={() => navigate('/register-complaint')}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Register First Complaint
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Property Verifications */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Property Verifications</h3>
                  <Link to="/property-verification" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentPropertyVerifications.length > 0 ? (
                    recentPropertyVerifications.map((verification) => (
                      <div key={verification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileCheck className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{verification.documentType}</p>
                            <p className="text-sm text-gray-600">ID: {verification.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                            {verification.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">{verification.submittedDate}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No verifications yet</h3>
                      <p className="text-gray-600 mb-4">Submit your property documents for verification</p>
                      <button 
                        onClick={() => navigate('/property-verification')}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Submit Documents
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Building Approvals Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Building Approval Requests</h3>
                <Link to="/building-approval" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentBuildingApprovals.length > 0 ? (
                  recentBuildingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{approval.projectName}</p>
                          <p className="text-sm text-gray-600">ID: {approval.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                          {approval.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{approval.submittedDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No building approvals yet</h3>
                    <p className="text-gray-600 mb-4">Submit building plans for approval</p>
                    <button 
                      onClick={() => navigate('/building-approval')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Submit Building Plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Complaint Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Complaint Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {complaintCategories.map((category) => (
                  <div key={category.id} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <p className="text-sm font-medium text-gray-700">{category.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Complaint Details Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
              <button 
                onClick={() => setShowComplaintModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Complaint ID</p>
                  <p className="text-gray-900">{selectedComplaint.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <p className="text-gray-900">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Priority</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Title</p>
                <p className="text-gray-900">{selectedComplaint.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-gray-900">{selectedComplaint.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                  <p className="text-gray-900">
                    {new Date(selectedComplaint.submitted_at || selectedComplaint.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-gray-900">{selectedComplaint.address}</p>
                </div>
              </div>
              
              {selectedComplaint.updates && selectedComplaint.updates.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Updates</p>
                  <div className="space-y-2">
                    {selectedComplaint.updates.map((update, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900">{update.status}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.date).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                        {update.officer && (
                          <p className="text-xs text-gray-500 mt-1">Officer: {update.officer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => navigate(`/track-complaint?id=${selectedComplaint.id}`)}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Track Full Status
                </button>
                <button 
                  onClick={() => setShowComplaintModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
