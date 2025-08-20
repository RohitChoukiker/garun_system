import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, MapPin, Building, AlertTriangle, Send, Navigation, Globe, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const SurveyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [surveyData, setSurveyData] = useState({
    ward_no: '',
    survey_date: '',
    drone_id: '',
    locality_name: '',
    area_name: '',
    coordinates: {
      latitude: '',
      longitude: ''
    },
    roads: [
      {
        road_id: '',
        length_meters: '',
        width_meters: '',
        surface_type: 'asphalt'
      }
    ],
    buildings: [
      {
        building_id: '',
        height_meters: '',
        floors: '',
        area_sq_meters: '',
        type: 'residential',
        status: 'legal'
      }
    ],
    land_usage: {
      residential_area_sq_meters: '',
      commercial_area_sq_meters: '',
      green_area_sq_meters: '',
      industrial_area_sq_meters: ''
    },
    violations: {
      illegal_buildings_detected: 0,
      encroachment_on_roads: false
    }
  });
  const [droneDataFile, setDroneDataFile] = useState(null);
  const [locationDetecting, setLocationDetecting] = useState(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSurveyData(prev => ({
      ...prev,
      survey_date: today
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSurveyData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSurveyData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setSurveyData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value
      }
    }));
  };

  const handleViolationChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setSurveyData(prev => ({
      ...prev,
      violations: {
        ...prev.violations,
        [name]: finalValue
      }
    }));
  };

  // Auto-detect location coordinates
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSurveyData(prev => ({
          ...prev,
          coordinates: {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }
        }));
        toast.success('Location detected successfully!');
        setLocationDetecting(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to detect location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
        setLocationDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Get locality name from coordinates (reverse geocoding)
  const getLocalityFromCoordinates = async () => {
    if (!surveyData.coordinates.latitude || !surveyData.coordinates.longitude) {
      toast.error('Please enter coordinates first');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${surveyData.coordinates.latitude}&lon=${surveyData.coordinates.longitude}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          const locality = data.address.suburb || data.address.neighbourhood || data.address.city_district || 'Unknown';
          const area = data.address.city || data.address.town || data.address.village || 'Unknown';
          
          setSurveyData(prev => ({
            ...prev,
            locality_name: locality,
            area_name: area
          }));
          
          toast.success(`Location: ${locality}, ${area}`);
        }
      }
    } catch (error) {
      console.error('Error getting locality:', error);
      toast.error('Failed to get locality information');
    }
  };

  const addRoad = () => {
    setSurveyData(prev => ({
      ...prev,
      roads: [...prev.roads, {
        road_id: '',
        length_meters: '',
        width_meters: '',
        surface_type: 'asphalt'
      }]
    }));
  };

  const removeRoad = (index) => {
    setSurveyData(prev => ({
      ...prev,
      roads: prev.roads.filter((_, i) => i !== index)
    }));
  };

  const handleRoadChange = (index, field, value) => {
    setSurveyData(prev => ({
      ...prev,
      roads: prev.roads.map((road, i) => 
        i === index ? { ...road, [field]: value } : road
      )
    }));
  };

  const addBuilding = () => {
    setSurveyData(prev => ({
      ...prev,
      buildings: [...prev.buildings, {
        building_id: '',
        height_meters: '',
        floors: '',
        area_sq_meters: '',
        type: 'residential',
        status: 'legal'
      }]
    }));
  };

  const removeBuilding = (index) => {
    setSurveyData(prev => ({
      ...prev,
      buildings: prev.buildings.filter((_, i) => i !== index)
    }));
  };

  const handleBuildingChange = (index, field, value) => {
    setSurveyData(prev => ({
      ...prev,
      buildings: prev.buildings.map((building, i) => 
        i === index ? { ...building, [field]: value } : building
      )
    }));
  };

  const handleLandUsageChange = (e) => {
    const { name, value } = e.target;
    setSurveyData(prev => ({
      ...prev,
      land_usage: {
        ...prev.land_usage,
        [name]: value
      }
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDroneDataFile(file);
    }
  };

  const loadSampleData = () => {
    const sampleData = {
      ward_no: 12,
      survey_date: new Date().toISOString().split('T')[0],
      drone_id: "DRN_001",
      locality_name: "Vijay Nagar",
      area_name: "Indore, Madhya Pradesh",
      coordinates: {
        latitude: 22.7196,
        longitude: 75.8577
      },
      roads: [
        {
          road_id: "R001",
          length_meters: 520.5,
          width_meters: 8.2,
          surface_type: "asphalt"
        }
      ],
      buildings: [
        {
          building_id: "B001",
          height_meters: 25.0,
          floors: 7,
          area_sq_meters: 320.0,
          type: "residential",
          status: "legal"
        }
      ],
      land_usage: {
        residential_area_sq_meters: 12000,
        commercial_area_sq_meters: 5000,
        green_area_sq_meters: 2500,
        industrial_area_sq_meters: 800
      },
      violations: {
        illegal_buildings_detected: 1,
        encroachment_on_roads: false
      }
    };
    
    setSurveyData(sampleData);
    toast.success('Sample data loaded successfully!');
  };

  const handleJSONImport = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            // If it's an array, take the first item
            setSurveyData(jsonData[0]);
            toast.success('JSON data imported successfully!');
          } else if (typeof jsonData === 'object') {
            setSurveyData(jsonData);
            toast.success('JSON data imported successfully!');
          } else {
            toast.error('Invalid JSON format');
          }
        } catch (error) {
          toast.error('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  const validateForm = () => {
    if (!surveyData.ward_no || !surveyData.survey_date || !surveyData.drone_id) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!surveyData.coordinates.latitude || !surveyData.coordinates.longitude) {
      toast.error('Please provide coordinates');
      return false;
    }
    if (!surveyData.locality_name || !surveyData.area_name) {
      toast.error('Please provide locality and area information');
      return false;
    }
    
    // Validate that at least one road and one building is provided
    if (surveyData.roads.length === 0) {
      toast.error('Please add at least one road');
      return false;
    }
    if (surveyData.buildings.length === 0) {
      toast.error('Please add at least one building');
      return false;
    }
    
    // Validate road data
    for (let i = 0; i < surveyData.roads.length; i++) {
      const road = surveyData.roads[i];
      if (!road.road_id || !road.length_meters || !road.width_meters) {
        toast.error(`Please fill in all fields for Road ${i + 1}`);
        return false;
      }
    }
    
    // Validate building data
    for (let i = 0; i < surveyData.buildings.length; i++) {
      const building = surveyData.buildings[i];
      if (!building.building_id || !building.height_meters || !building.floors || !building.area_sq_meters) {
        toast.error(`Please fill in all fields for Building ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Add current timestamp and incharge info
      const enrichedSurveyData = {
        ...surveyData,
        incharge_id: "INC001", // This should come from user context in real app
        zone_type: surveyData.buildings[0]?.type || "residential", // Determine zone type from first building
        timestamp: new Date().toISOString()
      };
      
      const formData = new FormData();
      formData.append('survey_data', JSON.stringify(enrichedSurveyData));
      
      if (droneDataFile) {
        formData.append('drone_data_file', droneDataFile);
      }

      const response = await fetch('http://localhost:8000/api/surveys/start', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start survey');
      }

      const result = await response.json();
      
      // Show comprehensive success message
      const summary = `
Survey ID: ${result.survey_id}
Violations Detected: ${result.violations_detected}
Compliance Score: ${result.compliance_score}%
Buildings Analyzed: ${result.total_buildings_analyzed}
Roads Analyzed: ${result.total_roads_analyzed}
Area Covered: ${result.total_area_covered} sq m
      `;
      
      toast.success(`Survey completed successfully! ${result.violations_detected} violations detected.`, { duration: 4000 });
      
      // Navigate to survey results
      navigate('/survey-results', { 
        state: { 
          surveyId: result.survey_id,
          survey: result.survey 
        } 
      });
      
    } catch (error) {
      console.error('Error starting survey:', error);
      toast.error(error.message || 'Failed to start survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Start New Survey</h1>
            <p className="text-gray-600">Upload drone data and analyze for illegal constructions</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Basic Survey Information */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Survey Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ward Number *</label>
                  <input
                    type="number"
                    name="ward_no"
                    value={surveyData.ward_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Survey Date *</label>
                  <input
                    type="date"
                    name="survey_date"
                    value={surveyData.survey_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drone ID *</label>
                  <input
                    type="text"
                    name="drone_id"
                    value={surveyData.drone_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., DRN_001"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Locality Name *</label>
                  <input
                    type="text"
                    name="locality_name"
                    value={surveyData.locality_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Vijay Nagar, Rajendra Nagar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Name *</label>
                  <input
                    type="text"
                    name="area_name"
                    value={surveyData.area_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Indore, Madhya Pradesh"
                  />
                </div>
              </div>

              {/* Coordinates with Auto-detection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Coordinates *</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locationDetecting}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                    >
                      <Navigation className="h-3 w-3" />
                      <span>{locationDetecting ? 'Detecting...' : 'Auto-detect'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={getLocalityFromCoordinates}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Globe className="h-3 w-3" />
                      <span>Get Locality</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={surveyData.coordinates.latitude}
                      onChange={handleCoordinateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 22.7196"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={surveyData.coordinates.longitude}
                      onChange={handleCoordinateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 75.8577"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Roads Section */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">🛣️ Roads Data</h3>
                <button
                  type="button"
                  onClick={addRoad}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Add Road</span>
                </button>
              </div>
              
              {surveyData.roads.map((road, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Road {index + 1}</h4>
                    {surveyData.roads.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoad(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Road ID</label>
                      <input
                        type="text"
                        value={road.road_id}
                        onChange={(e) => handleRoadChange(index, 'road_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., R001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Length (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={road.length_meters}
                        onChange={(e) => handleRoadChange(index, 'length_meters', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 520.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={road.width_meters}
                        onChange={(e) => handleRoadChange(index, 'width_meters', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 8.2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Surface Type</label>
                      <select
                        value={road.surface_type}
                        onChange={(e) => handleRoadChange(index, 'surface_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="asphalt">Asphalt</option>
                        <option value="concrete">Concrete</option>
                        <option value="gravel">Gravel</option>
                        <option value="dirt">Dirt</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buildings Section */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">🏗️ Buildings Data</h3>
                <button
                  type="button"
                  onClick={addBuilding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Building className="h-4 w-4" />
                  <span>Add Building</span>
                </button>
              </div>
              
              {surveyData.buildings.map((building, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Building {index + 1}</h4>
                    {surveyData.buildings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBuilding(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Building ID</label>
                      <input
                        type="text"
                        value={building.building_id}
                        onChange={(e) => handleBuildingChange(index, 'building_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., B001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={building.height_meters}
                        onChange={(e) => handleBuildingChange(index, 'height_meters', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 25.0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Floors</label>
                      <input
                        type="number"
                        value={building.floors}
                        onChange={(e) => handleBuildingChange(index, 'floors', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Area (sq m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={building.area_sq_meters}
                        onChange={(e) => handleBuildingChange(index, 'area_sq_meters', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 320.0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={building.type}
                        onChange={(e) => handleBuildingChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="mixed">Mixed Use</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Status</label>
                      <select
                        value={building.status}
                        onChange={(e) => handleBuildingChange(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="legal">Legal</option>
                        <option value="illegal">Illegal</option>
                        <option value="pending">Pending Review</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Land Usage Section */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🌍 Land Usage Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Residential Area (sq m)</label>
                  <input
                    type="number"
                    name="residential_area_sq_meters"
                    value={surveyData.land_usage.residential_area_sq_meters}
                    onChange={handleLandUsageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 12000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Area (sq m)</label>
                  <input
                    type="number"
                    name="commercial_area_sq_meters"
                    value={surveyData.land_usage.commercial_area_sq_meters}
                    onChange={handleLandUsageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Green Area (sq m)</label>
                  <input
                    type="number"
                    name="green_area_sq_meters"
                    value={surveyData.land_usage.green_area_sq_meters}
                    onChange={handleLandUsageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industrial Area (sq m)</label>
                  <input
                    type="number"
                    name="industrial_area_sq_meters"
                    value={surveyData.land_usage.industrial_area_sq_meters}
                    onChange={handleLandUsageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 800"
                  />
                </div>
              </div>
            </div>

            {/* Violations Section */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚨 Violations Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Illegal Buildings Detected</label>
                  <input
                    type="number"
                    name="illegal_buildings_detected"
                    value={surveyData.violations.illegal_buildings_detected}
                    onChange={handleViolationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="encroachment_on_roads"
                    checked={surveyData.violations.encroachment_on_roads}
                    onChange={handleViolationChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="block text-sm font-medium text-gray-700">
                    Encroachment on Roads
                  </label>
                </div>
              </div>
            </div>

            {/* Data Import Section */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📥 Data Import & Sample Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Load Sample Data */}
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                  <button
                    type="button"
                    onClick={loadSampleData}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Load Sample Data</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Load predefined sample data</p>
                </div>

                {/* Import JSON */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJSONImport}
                    className="hidden"
                    id="json-import"
                  />
                  <label htmlFor="json-import" className="cursor-pointer w-full">
                    <div className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Import JSON</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Import your JSON data file</p>
                </div>

                {/* Download Sample JSON */}
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center">
                  <a
                    href="/sample-survey-data.json"
                    download
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Sample</span>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">Download sample JSON template</p>
                </div>
              </div>

              {/* Drone Data File Upload */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">📁 Drone Data File (Optional)</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {droneDataFile ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-8 w-8 text-green-600" />
                    <p className="text-sm text-gray-600">{droneDataFile.name}</p>
                    <button
                      type="button"
                      onClick={() => setDroneDataFile(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".json,.csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="drone-data-upload"
                    />
                    <label htmlFor="drone-data-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload drone data file</p>
                      <p className="text-xs text-gray-500">JSON, CSV, Excel files supported</p>
                    </label>
                  </>
                )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 mx-auto"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span>{loading ? 'Processing Survey...' : 'Start Survey & Analyze'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
