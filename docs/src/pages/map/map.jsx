import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './map.css';

const BOROUGH_CONFIG = {
  'Manhattan': { lat: 40.7831, lng: -73.9712, zoom: 13 },
  'Brooklyn': { lat: 40.6782, lng: -73.9442, zoom: 12 },
  'Queens': { lat: 40.7282, lng: -73.7949, zoom: 12 },
  'Bronx': { lat: 40.8448, lng: -73.8648, zoom: 13 },
  'Staten Island': { lat: 40.5795, lng: -74.1502, zoom: 12 },
  'All Boroughs': { lat: 40.7128, lng: -74.0060, zoom: 11 }
};

const FILTERS = ['all', 'food', 'transit'];
const BOROUGHS = ['All Boroughs', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
const DATA_SOURCES = {
   food: 'https://data.cityofnewyork.us/resource/if26-z6xq.json?$limit=500',
  transit: 'https://data.ny.gov/resource/39hk-dx4f.json',

};
const containerStyle = {
  width: '100%',
  height: '90vh',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};



const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'transit.station', elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#4285F4' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];



function MyMap() {
  const [zoom, setZoom] = useState(11);
  const [foodBanks, setFoodBanks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('food');
  const [borough, setBorough] = useState('All Boroughs');
  const [markers, setMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If successful, update the mapCenter with real-time coordinates.
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(pos);
          setUserLocation(pos);
          setZoom(15);
        },
        () => {
          console.log("Geolocation permission denied or error. Using default center.");
        }
      );
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (activeFilter === 'all') {
      Promise.all(
        Object.entries(DATA_SOURCES).map(([type, url]) =>
          fetch(url).then(r => r.json()).then(data =>
            data.map(item => ({ ...item, _type: type }))
          )
        )
      ).then(results => {
        setMarkers(results.flat());
        setFoodBanks(results.flat());
        setLoading(false);
      });
    } else {
      fetch(DATA_SOURCES[activeFilter])
        .then(r => r.json())
        .then(data => {
          setMarkers(data);
          setFoodBanks(data);
          setLoading(false);
        });
    }
    setSelected(null);
  }, [activeFilter]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

const filtered = markers.filter(m => {
  if (borough === 'All Boroughs') return true;
  const BOROUGH_CODES = {
    'Manhattan': 'M',
    'Brooklyn': 'K', 
    'Queens': 'Q',
    'Bronx': 'X',
    'Staten Island': 'S'
  };
  const b = (m.borough || '');
  return b.toLowerCase() === borough.toLowerCase() || b === BOROUGH_CODES[borough];
});

  const handleBoroughChange = (b) => {
    const config = BOROUGH_CONFIG[b];
    setBorough(b);
    setMapCenter({ lat: config.lat, lng: config.lng });
    setZoom(config.zoom);
  };

const FILTER_LABELS = {
  all: 'All',
  food: 'Food',
  transit: 'Transit',
};
  return (
    <div className="map-page">

      {/* Header */}
      <header className="map-header">
        <a href="/" className="map-logo">HUNTERHACKS2026</a>
        <div className="map-header-right">
          <span className="map-header-tag">{foodBanks.length} Sites</span>
        </div>
      </header>

      {/* Hero */}
      <div className="map-hero">
        <div>
          <p className="map-hero-label">COMMUNITY RESOURCE LOCATOR</p>
          <h1>
            Find <em>food</em><br />
            near you.
          </h1>
        </div>
        <div className="map-hero-side">
          <div className="map-live-strip">
            <span className="map-live-dot"></span>
            <span>LIVE DATA</span>
          </div>
          <div className="map-live-time">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Description Row */}
      <div className="map-desc-row">
        <span className="map-desc-num">01</span>
        <p className="map-desc">
          Browse NYC's active food scrap drop-off and community food sites. Click any marker to view location details, operating hours, and borough information.
        </p>
      </div>

      {/* Filter Section */}
      <div className="map-filter-section">
        <p className="map-filter-label">02 — Filter Resources</p>

        {/* Type Filter — segmented bar */}
        <div className="map-filter-row">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`map-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              <span className="map-filter-dot" />
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Borough Filter — pill chips */}
        <div className="map-borough-row">
          <span className="map-borough-label">Borough —</span>
          {BOROUGHS.map(b => (
            <button
              key={b}
              className={`map-borough-chip ${borough === b ? 'active' : ''}`}
              onClick={() => handleBoroughChange(b)}
            >
              {b === 'All Boroughs' ? 'All' : b}
            </button>
          ))}
        </div>

        {/* Meta row — count + live indicator */}
        <div className="map-filter-meta">
          <div>
            <span className="map-filter-count-num">{filtered.length}</span>
            <span className="map-filter-count-label">Locations</span>
          </div>
          <div className="map-live-strip">
            <span className="map-live-dot" />
            <span>NYC Open Data</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        {loading && (
          <div className="map-loading-overlay">
            <p className="map-loading-text">Loading sites...</p>
          </div>
        )}
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            mapContainerClassName="map-container"
            center={mapCenter}
            zoom={zoom}
            options={{
              styles: mapStyles,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: 'M 0,-1 A 1,1 0 1,1 0,1 A 1,1 0 1,1 0,-1',
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 8, 
                }}
                zIndex={1000} 
              />
            )}

            {filtered.map((bank, i) => {
              const lat = parseFloat(bank.latitude || bank.gtfs_latitude);
              const lng = parseFloat(bank.longitude || bank.gtfs_longitude);
              if (!lat || !lng) return null;
              const isFoodSite = bank._type === 'food' || activeFilter === 'food';
              return (
                <Marker
                  key={i}
                  position={{ lat, lng }}
                  onClick={() => setSelected(bank)}
                  icon={isFoodSite ? {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <text y="16" font-size="16">📍</text>
                      </svg>
                    `),
                    scaledSize:{ width: 20, height: 20 },
                  } : {
                    path: 'M 0,-1 A 1,1 0 1,1 0,1 A 1,1 0 1,1 0,-1',
                    fillColor: '#ffffff',
                    fillOpacity: 0.9,
                    strokeColor: '#444',
                    strokeWeight: 1,
                    scale: 6,
                  }}
                />
              );
            })}
            
            {selected && (
              <InfoWindow
                position={{
  lat: parseFloat(selected.latitude || selected.gtfs_latitude),
  lng: parseFloat(selected.longitude || selected.gtfs_longitude),
}}
                onCloseClick={() => setSelected(null)}
              >
                <div className="map-info-window">
                  <p className="map-info-num">SITE INFO</p>
                  <h3 className="map-info-title">
                    {selected.food_scrap_drop_off_site || selected.stop_name || 'Location'}
                  </h3>
                 
                  {(selected.location || selected.daytime_routes) && (
  <p className="map-info-detail">{selected.location || selected.daytime_routes}</p>
)}
                  {selected.borough && (
                    <span className="map-info-badge">{selected.borough}</span>
                  )}
                  {selected.operation_day_hours && (
                    <p className="map-info-hours">{selected.operation_day_hours}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Cards */}
      <div className="map-cards">
        <div className="map-card">
          <p className="map-card-num">01</p>
          <h3>Food Drop-Off</h3>
          <p>Locate community food drop-off sites across all the five boroughs of New York City.</p>
        </div>
        <div className="map-card">
          <p className="map-card-num">02</p>
          <h3>Live Listings</h3>
          <p>Data is sourced directly from NYC Open Data and updated in real time.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="map-footer">
        <span>© {new Date().getFullYear()} For the Culture NYC</span>
        <span className="map-footer-tag">Open Data</span>
      </footer>

    </div>
  );
}

export default MyMap;