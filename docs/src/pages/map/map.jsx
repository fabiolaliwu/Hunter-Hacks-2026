import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './map.css';

const FILTERS = ['all', 'food', 'health', 'community'];
const BOROUGHS = ['All Boroughs', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
const DATA_SOURCES = {
  food: 'https://data.cityofnewyork.us/resource/if26-z6xq.json?$limit=500',
  health: 'https://data.cityofnewyork.us/resource/b57a-rnmd.json?$limit=500',
  community: 'https://data.cityofnewyork.us/resource/jp9i-3b7y.json?$limit=500',
};
const containerStyle = {
  width: '100%',
  height: '90vh',
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};
const [activeFilter, setActiveFilter] = useState('food');
const [borough, setBorough] = useState('All Boroughs');
const [markers, setMarkers] = useState([]);
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#888' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#111' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#444' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#222' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#666' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#333' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#777' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#333' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#050505' }] },
];

function MyMap() {
  const [foodBanks, setFoodBanks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

useEffect(() => {
  setLoading(true);
  if (activeFilter === 'all') {
    Promise.all(
      Object.entries(DATA_SOURCES).map(([type, url]) =>
        fetch(url).then(r => r.json()).then(data =>
          data.map(item => ({ ...item, _type: type }))
        )
      )
    ).then(results => { setMarkers(results.flat()); setFoodBanks(results.flat()); setLoading(false); });
  } else {
    fetch(DATA_SOURCES[activeFilter])
      .then(r => r.json())
      .then(data => { setMarkers(data); setFoodBanks(data); setLoading(false); });
  }
  setSelected(null);
}, [activeFilter]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
const filtered = markers.filter(m =>
  borough === 'All Boroughs' ? true : (m.borough || '').toLowerCase() === borough.toLowerCase()
);
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

      {/* Map */}
      <div className="map-wrapper">
        <div className="map-filter-bar">
  {FILTERS.map(f => (
    <button key={f} className={`map-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
      {f === 'all' ? '⊕ All' : f === 'food' ? '🍎 Food' : f === 'health' ? '🏥 Health' : '🏛 Community'}
    </button>
  ))}
  <select className="map-borough-select" value={borough} onChange={e => setBorough(e.target.value)}>
    {BOROUGHS.map(b => <option key={b}>{b}</option>)}
  </select>
  <span className="map-filter-count">{filtered.length} locations</span>
</div>
        {loading && (
          <div className="map-loading-overlay">
            <p className="map-loading-text">Loading sites...</p>
          </div>
        )}
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            mapContainerClassName="map-container"
            center={center}
            zoom={11}
            options={{
              styles: mapStyles,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {foodBanks.map((bank, i) => {
              const lat = parseFloat(bank.latitude);
              const lng = parseFloat(bank.longitude);
              if (!lat || !lng) return null;
              return (
                <Marker
                  key={i}
                  position={{ lat, lng }}
                  onClick={() => setSelected(bank)}
                  icon={{
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
                  lat: parseFloat(selected.latitude),
                  lng: parseFloat(selected.longitude),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="map-info-window">
                  <p className="map-info-num">SITE INFO</p>
                  <h3 className="map-info-title">
                    {selected.food_scrap_drop_off_site || 'Food Site'}
                  </h3>
                  {selected.location && (
                    <p className="map-info-detail">{selected.location}</p>
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
          <p>Locate community food scrap drop-off sites across all five boroughs of New York City.</p>
        </div>
        <div className="map-card">
          <p className="map-card-num">02</p>
          <h3>Live Listings</h3>
          <p>Data is sourced directly from NYC Open Data and updated in real time for accuracy.</p>
        </div>
        <div className="map-card">
          <p className="map-card-num">03</p>
          <h3>Hours & Info</h3>
          <p>Each marker includes operating hours, location details, and borough information.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="map-footer">
        <span>© {new Date().getFullYear()} FOODMAP NYC</span>
        <span className="map-footer-tag">Open Data</span>
      </footer>

    </div>
  );
}

export default MyMap;