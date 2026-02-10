import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- CONFIGURATION: YOUR REAL LOCATIONS GO HERE ---
const LOCATIONS = [
  {
    id: 1,
    title: "The First Clue",
    clue: "Its right here at home, did you hear the tooth fairy last night?",
    lat: 55.00050595510212, 
    lng: -7.2697537600171245,
    unlockMessage: "Let the pillow talk it's way out of this one",
  },
  {
    id: 2,
    title: "Spot #2",
    clue: "Go to the place where Buttons watches Spring Lambs",
    lat: 54.999657, // UPDATE THIS
    lng: -7.268305,
    unlockMessage: "Next to the big tree, woof woof!",
  },
  {
    id: 3,
    title: "Spot #3",
    clue: "Find the bench where we watch the sunset.",
    lat: 51.515, // <--- REPLACE WITH YOUR LATITUDE
    lng: -0.10,  // <--- REPLACE WITH YOUR LONGITUDE
    unlockMessage: "Check under the seat!",
  },
  {
    id: 4,
    title: "Spot #4",
    clue: "Find the bench where we watch the sunset.",
    lat: 51.515, // <--- REPLACE WITH YOUR LATITUDE
    lng: -0.10,  // <--- REPLACE WITH YOUR LONGITUDE
    unlockMessage: "Check under the seat!",
  },
  {
    id: 5,
    title: "Spot #5",
    clue: "Find the bench where we watch the sunset.",
    lat: 51.515, // <--- REPLACE WITH YOUR LATITUDE
    lng: -0.10,  // <--- REPLACE WITH YOUR LONGITUDE
    unlockMessage: "Check under the seat!",
  },
  {
    id: 6,
    title: "The Last Spot",
    clue: "Find the bench where we watch the sunset.",
    lat: 51.515, // <--- REPLACE WITH YOUR LATITUDE
    lng: -0.10,  // <--- REPLACE WITH YOUR LONGITUDE
    unlockMessage: "Check under the seat!",
  }
];

// 1. Define the Custom GPS Icon
const gpsIcon = L.divIcon({
  className: 'gps-puck',
  iconSize: [20, 20],
  iconAnchor: [10, 10] // Center the icon
});

// 2. Component to handle "Fly To" animation
function MapController({ userPos, followMode }) {
  const map = useMap();

  // Listen for user dragging the map
  useMapEvents({
    dragstart: () => {
      setFollowMode(false); // Stop following immediately
    },
    touchstart: () => {
      // Optional: Stop following as soon as they touch the screen
      setFollowMode(false); 
    }
  });
  
  useEffect(() => {
    if (userPos && followMode) {
      map.flyTo([userPos.lat, userPos.lng], 16, {
        animate: true,
        duration: 1.5 // Smooth animation duration
      });
    }
  }, [userPos, followMode, map]);

  return null;
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [userPos, setUserPos] = useState(null);
  const [distance, setDistance] = useState(null);
  const [found, setFound] = useState(false);
  const [followMode, setFollowMode] = useState(true); // Toggle auto-following

  // Location Tracking
  useEffect(() => {
    if (!gameStarted) return;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos({ lat: latitude, lng: longitude });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gameStarted]);

  // Distance Check
  useEffect(() => {
    if (userPos && currentStage < LOCATIONS.length) {
      const target = LOCATIONS[currentStage];
      const d = getDistanceFromLatLonInMeters(userPos.lat, userPos.lng, target.lat, target.lng);
      setDistance(Math.floor(d));

      if (d < 15 && !found) { 
        setFound(true);
      }
    }
  }, [userPos, currentStage]);

  const nextStage = () => {
    setFound(false);
    if (currentStage + 1 < LOCATIONS.length) {
      setCurrentStage(currentStage + 1);
    } else {
      alert("YOU WIN! Come find me for your real gift!");
    }
  };

  // Helper Math
  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; 
    var dLat = deg2rad(lat2-lat1);  
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; 
    return d * 1000;
  }
  function deg2rad(deg) { return deg * (Math.PI/180) }

  // --- TITLE SCREEN: PISCES THEME (SCROLL SAFE) ---
  if (!gameStarted) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0, // Locks to all 4 corners
        background: 'linear-gradient(to bottom, #43cea2 0%, #185a9d 100%)',
        zIndex: 9999,
        overflowY: 'auto', // <--- ENABLES SCROLLING
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Scrollable Content Wrapper */}
        <div style={{
          minHeight: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Centers vertically if screen is big
          alignItems: 'center',
          padding: '40px 20px', // Safe zone padding
          boxSizing: 'border-box'
        }}>

          {/* Pisces Symbol */}
          <div className="floating-element" style={{
            fontSize: '5rem',
            marginBottom: '20px',
            textShadow: '0 0 20px rgba(255,255,255,0.6)'
          }}>
            ♓
          </div>

          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '2px',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            Faye's<br/>Birthday<br/>Hunt
          </h1>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(5px)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '40px',
            maxWidth: '320px', // Slightly wider for your new text
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '1.4rem', 
              margin: '0 0 10px 0',
              color: '#E0F7FA'
            }}>
              Happy 30th Birthday boo!
            </h2>
            <p style={{ 
              fontSize: '1.1rem', // Slightly larger font for readability
              margin: 0, 
              opacity: 0.95, 
              lineHeight: '1.6',
              color: 'white'
            }}>
              I hope you enjoy this little adventure.<br/> You deserve it!
            </p>
          </div>

          <button 
            className="glow-button"
            onClick={() => setGameStarted(true)}
            style={{
              padding: '20px 40px', // Bigger touch target
              fontSize: '1.2rem', 
              backgroundColor: 'white', 
              color: '#185a9d', 
              border: 'none', 
              borderRadius: '50px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              marginBottom: '20px' // Extra space at bottom
            }}
          >
            Press start to begin
          </button>
          
        </div>
      </div>
    );
  }

  if (!userPos) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>📍 Locating...</h2></div>;

  const target = LOCATIONS[currentStage];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Recenter Button */}
        <button 
          className="recenter-btn" 
          onClick={() => setFollowMode(true)}
          style={{ color: followMode ? '#4285F4' : '#666' }}
        >
          ➤
        </button>

        <MapContainer 
          center={[userPos.lat, userPos.lng]} 
          zoom={16} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false} 
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <MapController userPos={userPos} followMode={followMode} setFollowMode={setFollowMode} />

          <Marker position={[userPos.lat, userPos.lng]} icon={gpsIcon}>
             <Popup>You are here</Popup>
          </Marker>

          <Circle 
            center={[target.lat, target.lng]} 
            radius={100} 
            pathOptions={{ color: '#FF9A9E', fillColor: '#FF9A9E', fillOpacity: 0.2 }} 
          />
        </MapContainer>
      </div>

      {/* CLUE CARD */}
      <div style={{ 
        position: "absolute", bottom: 0, left: 0, right: 0,
        maxHeight: "60vh", backgroundColor: "white", padding: "20px", paddingBottom: "40px",
        boxShadow: "0 -5px 20px rgba(0,0,0,0.15)", zIndex: 1000, textAlign: "center",
        borderTopLeftRadius: "25px", borderTopRightRadius: "25px",
        overflowY: "auto", transition: "height 0.3s ease-out" 
      }}>
        <h2 style={{margin: "0 0 10px 0", color: "#d63384"}}>
          Clue #{currentStage + 1}
        </h2>
        
        <p style={{fontSize: "1.1rem", lineHeight: "1.5", marginBottom: "10px"}}>
          {target.clue}
        </p>
        
        <p style={{color: "#666", fontStyle: "italic", marginBottom: "15px"}}>
          Distance: {distance ? `${distance}m` : "Calculating..."}
        </p>

        {found && (
          <div style={{
            marginTop: "15px", padding: "15px", backgroundColor: "#fff0f6", 
            borderRadius: "10px", border: "1px solid #ffadd2", animation: "float 0.5s ease-out"
          }}>
            <p style={{ fontWeight: "bold", color: "#d63384", marginBottom: "10px", fontSize: "1.1rem" }}>
              🎉 FOUND IT!<br/>
              <span style={{fontWeight: "normal", color: "#333"}}>{target.unlockMessage}</span>
            </p>
            
            <button 
              onClick={nextStage}
              style={{
                width: "100%", padding: "15px 0", backgroundColor: "#d63384",
                color: "white", border: "none", borderRadius: "50px", fontSize: "1.1rem",
                fontWeight: "bold", boxShadow: "0 4px 10px rgba(214, 51, 132, 0.3)", cursor: "pointer"
              }}
            >
              Next Clue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;