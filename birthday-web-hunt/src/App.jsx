import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// // Fix for default marker icon in Leaflet
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//     iconUrl: icon,
//     shadowUrl: iconShadow,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

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
        alert(`🎉 FOUND IT! \n\n${target.unlockMessage}`);
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

  // --- TITLE SCREEN: PISCES THEME ---
  if (!gameStarted) {
    return (
      <div style={{
        minHeight: '100dvh', 
        width: '100vw', 
        position: 'fixed', 
        top: 0, 
        left: 0,
        // Pisces Gradient: Teal -> Deep Ocean Blue -> Purple
        background: 'linear-gradient(to bottom, #43cea2 0%, #185a9d 100%)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-evenly', 
        alignItems: 'center',
        textAlign: 'center', 
        fontFamily: 'Arial, sans-serif', 
        zIndex: 9999,
        padding: '20px',
        overflowY: 'auto',
        color: 'white'
      }}>
        
        {/* Pisces Symbol (Floating Animation) */}
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
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          letterSpacing: '2px'
        }}>
          Faye's<br/>Birthday<br/>Hunt
        </h1>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism effect
          backdropFilter: 'blur(5px)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '40px',
          maxWidth: '300px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ 
            fontSize: '1.4rem', 
            margin: '0 0 10px 0',
            color: '#E0F7FA' // Light Cyan
          }}>
            Happy 30th Birthday boo!
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            margin: 0, 
            opacity: 0.9, 
            lineHeight: '1.5' 
          }}>
            I hope you enjoy this little adventure.<br/> You deserve it!
          </p>
        </div>

        <button 
          className="glow-button"
          onClick={() => setGameStarted(true)}
          style={{
            padding: '18px 40px', 
            fontSize: '1.2rem', 
            backgroundColor: 'white', 
            color: '#185a9d', // Matches the deep blue background
            border: 'none', 
            borderRadius: '50px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Press start to begin
        </button>
      </div>
    );
  }

  // --- GAME SCREEN ---
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
          zoomControl={false} // Hides the +/- buttons
          // When she drags the map, stop following her
          onDragstart={() => setFollowMode(false)}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <MapController userPos={userPos} followMode={followMode} />

          {/* Replaced standard marker with GPS Icon */}
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
        height: "30%", backgroundColor: "white", padding: "20px", 
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)", zIndex: 1000, textAlign: "center",
        borderTopLeftRadius: "20px", borderTopRightRadius: "20px"
      }}>
        <h2 style={{margin: "0 0 10px 0", color: "#d63384"}}>Clue #{currentStage + 1}</h2>
        <p style={{fontSize: "1.1rem"}}>{target.clue}</p>
        <p style={{color: "#666", fontStyle: "italic"}}>
          Distance: {distance ? `${distance}m` : "Calculating..."}
        </p>

        {found && (
          <button 
            onClick={nextStage}
            style={{
              marginTop: "10px", padding: "10px 20px", backgroundColor: "#d63384",
              color: "white", border: "none", borderRadius: "5px", fontSize: "1rem"
            }}
          >Next Clue →</button>
        )}
      </div>
    </div>
  );
}

export default App;