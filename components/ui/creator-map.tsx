"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import Link from 'next/link';
import type { Map } from 'leaflet';

// Import components dynamically to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="text-green-400 p-4">Loading map...</div>
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Initialize icon only on client side
let icon: L.Icon | null = null;

if (typeof window !== 'undefined') {
  try {
    icon = new L.Icon({
      iconUrl: "/placeholder-logo.png",
      iconSize: [25, 25],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  } catch (err) {
    console.warn('Failed to initialize map icon:', err);
  }
}

interface Creator {
  id: string;
  name: string;
  role: string;
  genre: string;
  location: string;
  latitude: number;
  longitude: number;
  profile_image: string;
  services: string[];
}

interface CreatorMapProps {
  creators: Creator[];
  onMarkerClick?: (creator: Creator) => void;
  loading?: boolean;
  error?: string | null;
}

declare global {
  interface Window {
    L: typeof L;
  }
}

const CreatorMap = ({ 
  creators = [], 
  onMarkerClick,
  loading = false,
  error: propError 
}: CreatorMapProps) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Create icon on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !icon) {
      try {
        icon = new L.Icon({
          iconUrl: "/placeholder-logo.png",
          iconSize: [25, 25],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        });
      } catch (err) {
        console.error('[MAP] Failed to create icon:', err);
      }
    }
  }, []);
  
  useEffect(() => {
    setIsClient(true);
    
    // Set a small delay to ensure Leaflet is fully loaded
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle marker click with useCallback
  const handleMarkerClick = useCallback((creator: Creator) => {
    if (typeof onMarkerClick === 'function') {
      onMarkerClick(creator);
    }
  }, [onMarkerClick]);

  // Handle map error with useCallback
  const handleMapError = useCallback((error: Error) => {
    console.error('Map error:', error);
    setMapError('Failed to load map. Please try refreshing the page.');
  }, []);

  // Map configuration
  const mapCenter = useMemo(() => [42.4072, -71.3824] as [number, number], []); // Center of Massachusetts

  // Filter and validate creators
  const validCreators = useMemo(() => {
    return creators.filter((c): c is Creator & { 
      latitude: number; 
      longitude: number 
    } => {
      return (
        c && 
        c.latitude != null && 
        c.longitude != null &&
        !isNaN(Number(c.latitude)) && 
        !isNaN(Number(c.longitude)) &&
        c.latitude >= -90 && 
        c.latitude <= 90 &&
        c.longitude >= -180 && 
        c.longitude <= 180
      );
    });
  }, [creators]);

  // Handle loading state
  if (loading) {
    return (
      <div className="w-full h-[600px] bg-black border-2 border-green-400/50 rounded-lg flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
        </div>
        <div className="mt-4 text-green-400 font-mono text-lg">LOADING_MAP_DATA...</div>
      </div>
    );
  }

  // Handle error state
  const error = propError || mapError;
  if (error) {
    return (
      <div className="w-full h-[600px] bg-black/90 border-2 border-red-400/50 rounded-lg flex flex-col items-center justify-center p-6 text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 className="text-red-400 font-mono text-xl font-bold mb-2">MAP_LOAD_ERROR</h3>
        <p className="text-green-300 font-mono text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-400 text-black font-mono font-bold rounded hover:bg-red-300 transition-colors"
        >
          RELOAD_PAGE
        </button>
      </div>
    );
  }

  // Handle no creators case
  if (validCreators.length === 0) {
    return (
      <div className="w-full h-[600px] bg-black/80 border-2 border-green-400/30 rounded-lg flex flex-col items-center justify-center">
        <div className="text-green-400 text-4xl mb-4">🔍</div>
        <h3 className="text-green-400 font-mono text-xl font-bold mb-2">NO_LOCATIONS_FOUND</h3>
        <p className="text-green-300 font-mono text-sm">No valid locations to display on the map.</p>
      </div>
    );
  }

  if (!isClient || !mapReady) {
    return (
      <div className="w-full h-[600px] bg-black border-2 border-green-400 rounded-lg flex items-center justify-center">
        <div className="text-green-400 font-mono text-lg animate-pulse">INITIALIZING_MAP...</div>
      </div>
    );
  }

  // Map reference for resize handling and initialization
  const mapRef = useRef<Map | null>(null);
  
  // Handle map container ref
  const handleMapContainer = useCallback((map: Map) => {
    mapRef.current = map;
  }, []);
  
  // Handle map ready
  const handleMapReady = useCallback(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    try {
      // Add zoom control
      const zoomControl = L.control.zoom({
        position: 'topright',
        zoomInTitle: 'Zoom in',
        zoomOutTitle: 'Zoom out'
      });
      
      // Add attribution
      const attributionControl = L.control.attribution({
        position: 'bottomright',
        prefix: false
      }).addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
      
      // Add controls to map
      zoomControl.addTo(map);
      attributionControl.addTo(map);
      
      // Force a resize to ensure the map tiles load correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      // Cleanup function
      return () => {
        zoomControl.remove();
        attributionControl.remove();
      };
    } catch (err) {
      console.error('Error initializing map controls:', err);
      setMapError('Failed to initialize map controls');
    }
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add a check for browser environment
  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-[600px] bg-black border-2 border-green-400 rounded-lg flex items-center justify-center">
        <div className="text-green-400 font-mono">LOADING_MAP...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black border-2 border-green-400 rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent pointer-events-none"></div>
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black border-b-2 border-green-400 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-red-400 shadow-md"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-yellow-200 shadow-md"></span>
          <span className="w-3 h-3 rounded-full bg-green-400 shadow-green-400 shadow-md"></span>
        </div>
        <span className="font-mono text-green-400 text-sm tracking-widest">
          MASSACHUSETTS_STUDIO_MAP.exe
        </span>
        <span className="text-xs text-green-400/40">
          {validCreators.length} STUDIOS_LOADED
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[calc(100%-40px)] bg-black">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        {mapError ? (
          <div className="flex flex-col items-center justify-center h-full w-full bg-black/90 p-8 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-400 font-mono text-xl font-bold mb-2">MAP_LOAD_ERROR</h3>
            <p className="text-green-300 font-mono text-sm max-w-md">{mapError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-green-400 text-black font-mono font-bold rounded hover:bg-green-300 transition-colors"
            >
              RETRY_CONNECTION
            </button>
          </div>
        ) : validCreators.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full w-full bg-black/90 p-8 text-center">
            <div className="text-green-400 text-4xl mb-4">🔍</div>
            <h3 className="text-green-400 font-mono text-xl font-bold mb-2">NO_CREATORS_FOUND</h3>
            <p className="text-green-300 font-mono text-sm max-w-md">
              No studios or creators with valid location data are currently available.
            </p>
          </div>
        ) : (
          <div className="h-full w-full">
            <MapContainer
              center={mapCenter}
              zoom={8}
              minZoom={7}
              maxZoom={18}
              zoomControl={false}
              attributionControl={false}
              style={{ height: '100%', width: '100%', backgroundColor: 'black' }}
              className="z-0"
              ref={handleMapContainer}
              whenReady={handleMapReady}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {validCreators.map((creator) => {
                // Skip marker if icon not initialized
                if (!icon) return null;
                
                return (
                <Marker
                  key={creator.id}
                  position={[creator.latitude, creator.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleMarkerClick(creator),
                  }}
                >
                  <Popup>
                    <div className="text-black">
                      <strong>{creator.name}</strong>
                      <br />
                      {creator.role}
                      <br />
                      <Link 
                        href={`/creator/${creator.id}`} 
                        className="text-green-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Profile
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
              })}
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-black/90 backdrop-blur-sm border-2 border-green-400/50 rounded-lg p-4 text-xs font-mono text-green-300 shadow-xl">
              <div className="font-bold mb-3 text-green-400 text-sm border-b border-green-400/30 pb-2">STUDIO_RATINGS</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-3 shadow-glow-green"></span><span>Perfect (5.0)</span></div>
                <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-lime-400 mr-3 shadow-glow-lime"></span><span>Excellent (4.8+)</span></div>
                <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-yellow-300 mr-3 shadow-glow-yellow"></span><span>Very Good (4.5+)</span></div>
                <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-orange-400 mr-3 shadow-glow-orange"></span><span>Good (4.0+)</span></div>
                <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-3 shadow-glow-red"></span><span>Fair (&lt;4.0)</span></div>
                <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-3"></span><span>Unrated</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black border-t-2 border-green-400 rounded-b-lg text-xs font-mono text-green-400">
        <span>STATUS: <span className="text-green-400">ONLINE</span></span>
        <span>REGION: <span className="text-green-400">MASSACHUSETTS</span></span>
        <span>PROTOCOL: <span className="text-green-400">OSM_V1</span></span>
        <span className="animate-pulse">LIVE_DATA</span>
      </div>
    </div>
  );
};

export default CreatorMap;
