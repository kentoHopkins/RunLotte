import { useState, useEffect } from 'react';
import RoutePlanner from './Planner';
import './Map.css';

function Map() {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Verify Mapbox token on component mount
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    console.log('Checking Mapbox token:', token ? 'Token exists' : 'Token missing');
    
    if (!token) {
      setError('Mapbox token is missing. Please check your environment variables.');
      setDebugInfo('Error: VITE_MAPBOX_TOKEN not found in environment variables');
      return;
    }
    
    // Validate token format
    if (!token.startsWith('pk.')) {
      setError('Invalid Mapbox token format. Token should start with "pk."');
      setDebugInfo('Error: Invalid token format');
      return;
    }

    setMapboxToken(token);
  }, []);

  // Function to validate coordinates
  const validateCoordinates = (lng, lat) => {
    const isValid = lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    console.log('Validating coordinates:', { lng, lat, isValid });
    return isValid;
  };

  // Function to geocode location string to coordinates using Mapbox Geocoding API
  const geocodeLocation = async (locationString) => {
    console.log('Geocoding location:', locationString);
    
    if (!mapboxToken) {
      throw new Error('Mapbox token is not available');
    }
    
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationString)}.json?access_token=${mapboxToken}`;
      console.log('Geocoding URL:', url);

      const response = await fetch(url);
      console.log('Geocoding response status:', response.status);

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (!data.features || data.features.length === 0) {
        throw new Error('Location not found');
      }

      const [lng, lat] = data.features[0].center;
      console.log('Extracted coordinates:', { lng, lat });
      
      if (!validateCoordinates(lng, lat)) {
        throw new Error('Invalid coordinates returned from geocoding');
      }

      return [lng, lat];
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  // Function to parse manual coordinate input
  const parseCoordinates = (input) => {
    console.log('Parsing coordinates:', input);
    
    const parts = input.split(',').map(part => part.trim());
    
    if (parts.length !== 2) {
      throw new Error('Please enter coordinates in format: longitude,latitude');
    }

    const [lng, lat] = parts.map(part => {
      const num = parseFloat(part);
      if (isNaN(num)) {
        throw new Error('Coordinates must be numbers');
      }
      return num;
    });

    console.log('Parsed coordinates:', { lng, lat });

    if (!validateCoordinates(lng, lat)) {
      throw new Error('Coordinates out of valid range');
    }

    return [lng, lat];
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setDebugInfo('Processing location submission...');
    
    try {
      if (!location.trim()) {
        throw new Error('Please enter a location or coordinates');
      }

      let coords;
      if (location.includes(',')) {
        try {
          coords = parseCoordinates(location);
          setDebugInfo('Successfully parsed coordinates');
        } catch (e) {
          setDebugInfo('Coordinate parsing failed, trying geocoding...');
          coords = await geocodeLocation(location);
        }
      } else {
        setDebugInfo('Attempting to geocode location...');
        coords = await geocodeLocation(location);
      }

      console.log('Final coordinates:', coords);
      setDebugInfo(`Successfully set coordinates: ${coords.join(', ')}`);
      setCoordinates(coords);
      
    } catch (error) {
      console.error('Location submission error:', error);
      setError(error.message || 'An error occurred while processing your request');
      setDebugInfo(`Error: ${error.message}`);
      setCoordinates(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6 custom-title font-normal" style={{ fontFamily: '"New Amsterdam", sans-serif' }}>Route Planner</h1>        
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search RunLotte Maps"
                className="w-full p-2 border search-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a city name or coordinates in longitude,latitude format
              </p>
            </div>
            <button
              type="submit"
              className={`w-full p-2 rounded-md transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Finding Location...' : 'Find Route'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Debug information panel */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-sm font-mono">
              {debugInfo}
            </div>
          )}
        </div>

        {coordinates && (
          <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border map-container">
            <RoutePlanner 
              userLocation={coordinates} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;