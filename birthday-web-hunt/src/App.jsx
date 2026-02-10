import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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
    unlockMessage: "Zzzzzzzzzzzzzz",
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

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [userPos, setUserPos] = useState(null);
  const [distance, setDistance] = useState(null);
  const [found, setFound] = useState(false);

  // 1. Get Location (Only starts after she clicks "Start")
  useEffect(() => {
    if (!gameStarted) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
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

  // 2. Check Distance
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

  // Haversine Distance Formula
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

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  // --- SCREEN 1: THE TITLE PAGE ---
  if (!gameStarted) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', // Birthday Gradient
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          marginBottom: '10px'
        }}>
          Birthday<br/>Hunt
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          marginBottom: '40px',
          opacity: 0.9
        }}>
          Are you ready for your adventure?
        </p>

        <button 
          onClick={() => setGameStarted(true)}
          style={{
            padding: '15px 50px',
            fontSize: '1.5rem',
            backgroundColor: 'white',
            color: '#af5880',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          Start Now →
        </button>
      </div>
    );
  }

  // --- SCREEN 2: THE GAME ---
  if (!userPos) return (
    <div style={{
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f0f0'
    }}>
        <h2>📍 Locating you...</h2>
        <p>Please allow GPS access!</p>
    </div>
  );

  const target = LOCATIONS[currentStage];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* MAP */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[userPos.lat, userPos.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker position={[userPos.lat, userPos.lng]}>
             <Popup>You are here</Popup>
          </Marker>
          <Circle 
            center={[target.lat, target.lng]} 
            radius={100} 
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} 
          />
        </MapContainer>
      </div>

      {/* CARD */}
      <div style={{ 
        height: "30%", 
        backgroundColor: "white", 
        padding: "20px", 
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
        textAlign: "center",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px"
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
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#d63384",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "1rem"
            }}
          >
            Next Clue →
          </button>
        )}
      </div>
    </div>
  );
}

export default App;