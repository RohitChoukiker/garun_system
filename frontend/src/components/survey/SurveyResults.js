import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Share2, 
  Download, 
  MapPin, 
  Building, 
  Calendar,
  TrendingUp,
  FileText,
  Plane
} from 'lucide-react';
import toast from 'react-hot-toast';

const SurveyResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(location.state?.survey || null);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Survey data received:', survey);
    console.log('Survey coordinates:', survey?.coordinates);
    console.log('Coordinates type:', typeof survey?.coordinates);
  }, [survey]);

  useEffect(() => {
    if (!survey) {
      navigate('/dashboard');
      return;
    }
    
    // Validate survey data structure
    try {
      if (!survey.id || !survey.ward_no) {
        setError('Invalid survey data structure');
        return;
      }
    } catch (err) {
      setError('Error processing survey data');
      console.error('Survey data error:', err);
    }
  }, [survey, navigate]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getViolationTypeLabel = (type) => {
    const labels = {
      'height_violation': 'Height Violation',
      'floor_violation': 'Floor Violation',
      'far_violation': 'FAR Violation',
      'road_width_violation': 'Road Width Violation',
      'green_area_violation': 'Green Area Violation'
    };
    return labels[type] || type;
  };

  const handleShareReport = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would send the report to admin
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Report shared successfully with admin!');
      setShowShareModal(false);
      
      // Navigate back to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      toast.error('Failed to share report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Create a simple text report
    const report = `
SURVEY REPORT - ${survey?.id}
Generated on: ${new Date().toLocaleDateString()}

SURVEY DETAILS:
- Ward Number: ${survey?.ward_no}
- Survey Date: ${survey?.survey_date}
- Drone ID: ${survey?.drone_id}
- Coordinates: ${survey?.coordinates?.latitude}, ${survey?.coordinates?.longitude}

VIOLATIONS DETECTED: ${survey?.total_violations}

${survey?.violations?.map(v => `
${getViolationTypeLabel(v.type)}:
- Severity: ${v.severity}
- Current Value: ${v.current}
- Allowed Value: ${v.allowed}
- Building/Road ID: ${v.building_id || v.road_id || 'N/A'}
`).join('')}

SEVERITY BREAKDOWN:
- High: ${survey?.severity_summary?.high || 0}
- Medium: ${survey?.severity_summary?.medium || 0}
- Low: ${survey?.severity_summary?.low || 0}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-report-${survey?.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Survey</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Survey Results</h1>
              <p className="text-gray-600">Analysis completed for {survey.ward_no ? `Ward ${survey.ward_no}` : 'the surveyed area'}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share with Admin</span>
              </button>
            </div>
          </div>

          {/* Survey Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Survey Date</p>
                  <p className="text-lg font-semibold text-blue-900">{survey.survey_date}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plane className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Drone ID</p>
                  <p className="text-lg font-semibold text-green-900">{survey.drone_id}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Coordinates</p>
                  <p className="text-lg font-semibold text-purple-900">
                    {(() => {
                      // Handle different coordinate formats
                      if (typeof survey.coordinates === 'string') {
                        return survey.coordinates;
                      } else if (survey.coordinates && typeof survey.coordinates === 'object') {
                        const lat = survey.coordinates.latitude;
                        const lng = survey.coordinates.longitude;
                        if (typeof lat === 'number' && typeof lng === 'number') {
                          return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        } else if (lat && lng) {
                          return `${lat}, ${lng}`;
                        }
                      }
                      return 'Coordinates not available';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Violations</p>
                  <p className="text-lg font-semibold text-red-900">{survey.total_violations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Violations Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚨 Violations Detected</h2>
          
          {survey.violations && survey.violations.length > 0 ? (
            <div className="space-y-6">
              {/* Severity Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{survey.severity_summary?.high || 0}</div>
                  <div className="text-sm text-red-600">High Severity</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{survey.severity_summary?.medium || 0}</div>
                  <div className="text-sm text-orange-600">Medium Severity</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{survey.severity_summary?.low || 0}</div>
                  <div className="text-sm text-yellow-600">Low Severity</div>
                </div>
              </div>

              {/* Individual Violations */}
              <div className="space-y-4">
                {survey.violations.map((violation, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(violation.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(violation.severity)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getViolationTypeLabel(violation.type)}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            <p><strong>Current Value:</strong> {violation.current}</p>
                            <p><strong>Allowed Value:</strong> {violation.allowed}</p>
                            {violation.building_id && <p><strong>Building ID:</strong> {violation.building_id}</p>}
                            {violation.road_id && <p><strong>Road ID:</strong> {violation.road_id}</p>}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(violation.severity)}`}>
                        {violation.severity} Priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Violations Detected!</h3>
              <p className="text-gray-600">Great news! The surveyed area complies with all building regulations.</p>
            </div>
          )}
        </div>

        {/* Survey Data Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Survey Data Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Roads Data */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Roads Surveyed
              </h3>
              <div className="space-y-3">
                {survey.survey_data?.roads?.map((road, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{road.road_id}</span>
                      <span className="text-sm text-gray-500 capitalize">{road.surface_type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span>Length: {road.length_meters}m</span>
                      <span>Width: {road.width_meters}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buildings Data */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Buildings Surveyed
              </h3>
              <div className="space-y-3">
                {survey.survey_data?.buildings?.map((building, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{building.building_id}</span>
                      <span className="text-sm text-gray-500 capitalize">{building.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span>Height: {building.height_meters}m</span>
                      <span>Floors: {building.floors}</span>
                      <span>Area: {building.area_sq_meters} sq.m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Land Usage */}
          {survey.survey_data?.land_usage && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Land Usage Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {survey.survey_data.land_usage.residential_area_sq_meters || 0}
                  </div>
                  <div className="text-sm text-blue-600">Residential (sq.m)</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {survey.survey_data.land_usage.commercial_area_sq_meters || 0}
                  </div>
                  <div className="text-sm text-green-600">Commercial (sq.m)</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {survey.survey_data.land_usage.green_area_sq_meters || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Green Area (sq.m)</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {survey.survey_data.land_usage.industrial_area_sq_meters || 0}
                  </div>
                  <div className="text-sm text-purple-600">Industrial (sq.m)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-4"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/survey-form')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Survey
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Share Report with Admin</h3>
            <p className="text-gray-600 mb-6">
              This report will be shared with the admin dashboard for review and action.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareReport}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Sharing...' : 'Share Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyResults;
