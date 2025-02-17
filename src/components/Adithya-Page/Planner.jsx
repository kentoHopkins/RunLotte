// src/planner.jsx
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

if (import.meta.env.VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
} else {
  console.error('Mapbox token not found in environment variables');
}

const RoutePlanner = ({ userLocation }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetDistance, setTargetDistance] = useState(2);
  const [actualDistance, setActualDistance] = useState(0);
  const [oneWayDistance, setOneWayDistance] = useState(0);
  const [startingPoint, setStartingPoint] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [waterFountains, setWaterFountains] = useState([]);
  const [elevationPreference, setElevationPreference] = useState('low');
  const [routeElevationData, setRouteElevationData] = useState(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);

  const milesToKm = (miles) => miles * 1.60934;
  const kmToMiles = (km) => km / 1.60934;

  const cleanupMapLayers = () => {
    if (!map.current) return;

    try {
      if (map.current.getLayer('route-return')) {
        map.current.removeLayer('route-return');
      }
    } catch (e) {
      console.warn('Error removing route-return layer:', e);
    }

    try {
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
    } catch (e) {
      console.warn('Error removing route layer:', e);
    }

    try {
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
    } catch (e) {
      console.warn('Error removing route source:', e);
    }

    const markers = document.getElementsByClassName('mapboxgl-marker');
    Array.from(markers).forEach(marker => marker.remove());
  };

  const createDestinationPoint = (start, distanceMiles, angle = null) => {
    const distanceKm = milesToKm(distanceMiles);
    const bearing = angle !== null ? (angle * Math.PI / 180) : (Math.random() * 2 * Math.PI);
    const R = 6371;
    const lat1 = start[1] * Math.PI / 180;
    const lon1 = start[0] * Math.PI / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearing)
    );

    const lon2 = lon1 + Math.atan2(
      Math.sin(bearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

    return [
      (lon2 * 180 / Math.PI + 540) % 360 - 180,
      lat2 * 180 / Math.PI
    ];
  };

  const findWaterFountains = async (routeGeometry) => {
    try {
      const bounds = new mapboxgl.LngLatBounds();
      routeGeometry.coordinates.forEach(coord => {
        bounds.extend(coord);
      });

      const expandedBounds = [
        [bounds.getWest() - 0.01, bounds.getSouth() - 0.01],
        [bounds.getEast() + 0.01, bounds.getNorth() + 0.01]
      ];

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/drinking+water+fountain.json?` +
        `bbox=${expandedBounds[0][0]},${expandedBounds[0][1]},${expandedBounds[1][0]},${expandedBounds[1][1]}&` +
        `types=poi&` +
        `access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch water fountains');
      }

      const data = await response.json();
      const fountains = data.features
        .filter(feature => 
          feature.properties.category?.includes('water') ||
          feature.text.toLowerCase().includes('fountain') ||
          feature.text.toLowerCase().includes('water')
        )
        .map(fountain => ({
          id: fountain.id,
          name: fountain.text,
          coordinates: fountain.center,
          address: fountain.place_name
        }));

      setWaterFountains(fountains);

      fountains.forEach(fountain => {
        new mapboxgl.Marker({ 
          color: '#3b82f6',
          scale: 0.7
        })
          .setLngLat(fountain.coordinates)
          .setPopup(
            new mapboxgl.Popup()
              .setHTML(` 
                <div style="color: #000000;">
                  <strong>Water Fountain</strong><br>
                  ${fountain.name}<br>
                  <small>${fountain.address}</small>
                </div>
              `)
          )
          .addTo(map.current);
      });

    } catch (error) {
      console.error('Error finding water fountains:', error);
      setError('Failed to find water fountains');
    }
  };

  const findNearbyParkingLots = async () => {
    try {
      setLoading(true);
      
      const radiusInMeters = milesToKm(5) * 1000;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/parking.json?` +
        `proximity=${userLocation[0]},${userLocation[1]}&` +
        `radius=${radiusInMeters}&` +
        `types=poi&` +
        `access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch parking lots');
      }

      const data = await response.json();
      const lots = data.features
        .filter(feature => 
          feature.properties.category?.includes('parking') || 
          feature.properties.maki === 'parking'
        )
        .map(lot => ({
          id: lot.id,
          name: lot.text,
          coordinates: lot.center,
          distance: kmToMiles(lot.properties.distance / 1000)
        }))
        .sort((a, b) => a.distance - b.distance);

      setParkingLots(lots);
      
      if (lots.length > 0) {
        setSelectedParkingLot(lots[0]);
        setStartingPoint(lots[0].coordinates);
      } else {
        throw new Error('No parking lots found within 5 miles');
      }

    } catch (error) {
      console.error('Error finding parking lots:', error);
      setError(`Failed to find parking lots: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const displayRoute = async (routeData, isAlternative = false) => {
    try {
      cleanupMapLayers();

      setRouteElevationData({
        gain: routeData.elevationGain,
        elevations: routeData.elevations
      });

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: routeData.geometry
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': isAlternative ? '#3b82f6' : '#22c55e', // Blue for alternative routes
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      map.current.addLayer({
        id: 'route-return',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': isAlternative ? '#3b82f6' : '#22c55e',
          'line-width': 5,
          'line-opacity': 0.75,
          'line-dasharray': [2, 2]
        }
      });

      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat(startingPoint)
        .setPopup(
          new mapboxgl.Popup()
            .setHTML(`
              <div style="color: #000000;">
                <strong>Start/End Point</strong><br>
                ${selectedParkingLot.name}
              </div>
            `)
        )
        .addTo(map.current);

      const destination = routeData.geometry.coordinates[routeData.geometry.coordinates.length - 1];
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(destination)
        .setPopup(
          new mapboxgl.Popup()
            .setHTML('<div style="color: #000000;">Turnaround Point</div>')
        )
        .addTo(map.current);

      const bounds = new mapboxgl.LngLatBounds();
      routeData.geometry.coordinates.forEach(coord => {
        bounds.extend(coord);
      });
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 }
      });

    } catch (error) {
      console.error('Error displaying route:', error);
      setError(`Failed to display route: ${error.message}`);
    }
  };

  const generateRoute = async () => {
    try {
      if (!startingPoint) {
        throw new Error('No starting point selected');
      }

      setLoading(true);
      setError(null);

      cleanupMapLayers();

      const angles = [0, 90, 180, 270];
      const halfDistance = targetDistance / 2;
      const routes = [];

      const routePromises = angles.map(async (angle) => {
        const destination = createDestinationPoint(startingPoint, halfDistance, angle);
        const coordinates = `${startingPoint.join(',')};${destination.join(',')}`;

        try {
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?` +
            `geometries=geojson&alternatives=true&overview=full&access_token=${mapboxgl.accessToken}`
          );

          if (!response.ok) return null;

          const data = await response.json();
          if (!data.routes || !data.routes.length === 0) return null;

          const route = data.routes[0];
          const elevationEstimate = route.distance * 0.01;
          return {
            geometry: route.geometry,
            distance: route.distance,
            elevationGain: elevationEstimate,
            elevations: [elevationEstimate]
          };
        } catch (error) {
          console.warn(`Failed to generate route for angle ${angle}:`, error);
          return null;
        }
      });

      const routeResults = await Promise.all(routePromises);
      const validRoutes = routeResults.filter(route => route !== null);

      if (validRoutes.length === 0) {
        throw new Error('No valid routes found');
      }

      validRoutes.sort((a, b) => {
        if (elevationPreference === 'low') {
          return a.elevationGain - b.elevationGain;
        } else if (elevationPreference === 'high') {
          return b.elevationGain - a.elevationGain;
        } else {
          const median = validRoutes.reduce((acc, route) => acc + route.elevationGain, 0) / validRoutes.length;
          return Math.abs(a.elevationGain - median) - Math.abs(b.elevationGain - median);
        }
      });

      const selectedRoute = validRoutes[0];
      setAlternativeRoutes(validRoutes.slice(1));

      await displayRoute(selectedRoute); // Call displayRoute for the selected route
      await findWaterFountains(selectedRoute.geometry);

    } catch (error) {
      console.error('Error generating route:', error);
      setError(`Failed to generate route: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLocation) {
      setError('No user location provided');
      setLoading(false);
      return;
    }

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: userLocation,
        zoom: 14,
      });

      map.current.on('load', async () => {
        console.log('Map loaded successfully');
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        await findNearbyParkingLots();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Map failed to load correctly');
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (selectedParkingLot && map.current) {
      const generateRouteWithCleanup = async () => {
        cleanupMapLayers();
        await generateRoute();
      };
      generateRouteWithCleanup();
    }
  }, [selectedParkingLot, targetDistance, elevationPreference]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
        style={{ minHeight: '500px' }}
      />
      
      <div className="absolute top-4 left-4 bg-gray-800 p-4 rounded-lg shadow-lg z-10">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium special-label mb-2">
              Starting Point </label>
            <select
              value={selectedParkingLot?.id || ''}
              onChange={(e) => {
                const lot = parkingLots.find(l => l.id === e.target.value);
                setSelectedParkingLot(lot);
                setStartingPoint(lot.coordinates);
              }}
              className="w-full p-2 bg-gray-700 text-gray-200 rounded"
            >
              {parkingLots.map(lot => (
                <option key={lot.id} value={lot.id}>
                  {lot.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium special-label mb-2">
              Total Distance: {targetDistance} miles
            </label>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.5"
              value={targetDistance}
              onChange={(e) => setTargetDistance(parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium special-label mb-2">
              Elevation Preference </label>
            <select
              value={elevationPreference}
              onChange={(e) => setElevationPreference(e.target.value)}
              className="w-full p-2 bg-gray-700 text-gray-200 rounded"
            >
              <option value="low">Minimal Elevation Change</option>
              <option value="moderate">Moderate Hills</option>
              <option value="high">Challenging Hills</option>
            </select>
          </div>

          {routeElevationData && (
            <div className="special-label text-sm">
              <div>Total Elevation Gain: {Math.round(routeElevationData.gain)}m</div>
            </div>
          )}

          {alternativeRoutes.length > 0 && (
            <div>
              <label className="block text-sm font-medium special-label mb-2">
                Alternative Routes
              </label>
              <div className="space-y-2">
                {alternativeRoutes.map((route, index) => (
                  <button
                    key={index}
                    onClick={() => displayRoute(route, true)} // Call displayRoute for alternative routes
                    className="w-full px-2 py-1 bg-gray-700 text-gray-200 rounded text-sm hover:bg-gray-600"
                  >
                    Route {index + 2} ({Math.round(route.elevationGain)}m gain)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <div className="mt-2 text-gray-200">Generating route...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 right-4 bg-red-900 text-red-100 p-4 rounded-lg shadow-lg z-10">
          {error}
        </div>
      )}

      {!userLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-20">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-gray-200 text-center">
            <div className="text-xl font-bold mb-2">Location Required</div>
            <div>Please enable location services to use the route planner.</div>
          </div>
        </div>
      )}

      {!loading && parkingLots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-20">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-gray-200 text-center">
            <div className="text-xl font-bold mb-2">No Parking Lots Found</div>
            <div>Unable to find parking lots in your area. Try a different location.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;