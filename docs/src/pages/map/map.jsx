import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '90vh'
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

function MyMap() {
  const [foodBanks, setFoodBanks] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('https://data.cityofnewyork.us/resource/if26-z6xq.json')
      .then(res => res.json())
      .then(data => setFoodBanks(data))
      .catch(err => console.error('Error fetching food banks:', err));
  }, []);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
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
            />
          );
        })}

        {selected && (
          <InfoWindow
  position={{
    lat: parseFloat(selected.latitude),
    lng: parseFloat(selected.longitude)
  }}
  onCloseClick={() => setSelected(null)}
>
  <div>
    <h3>{selected.food_scrap_drop_off_site || 'Food Site'}</h3>
    <p>{selected.location}</p>
    <p>{selected.borough}</p>
    <p>{selected.operation_day_hours}</p>
  </div>
</InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default MyMap;