import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Locations
const LOCATIONS = [
  {
    id: 1,
    title: "The First Clue",
    clue: "Its right here at home, did you hear the tooth fairy last night?",
    lat: 55.00035940989179, 
    lng: -7.269740014899537,
    unlockMessage: "Willow _____",
  },
  {
    id: 2,
    title: "Spot #2",
    clue: "Is it Spring already?",
    lat: 55.00,
    lng: -7.268305,
    unlockMessage: "Buttons said she loves the spring lambs",
  },
  {
    id: 3,
    title: "Spot #3",
    clue: "Next stop... Uni time",
    lat: 55.0062, 
    lng: 7.3236,  
    unlockMessage: "Those trash walks got me worried -> Check under the seat!",
  },
  {
    id: 4,
    title: "Spot #4",
    clue: "Our favourite coffee spot? I'll drive",
    lat: 51.515,
    lng: -0.10,  
    unlockMessage: "The password is MELON",
  },
  {
    id: 5,
    title: "Spot #5",
    clue: "Our usual camping spot?",
    lat: 51.515,
    lng: -0.10,
    unlockMessage: "",
  },
  {
    id: 6,
    title: "The Last Spot",
    clue: "I know the sunrise is hard for me, how do you feel about sunset?",
    lat: 51.515,
    lng: -0.10,
    unlockMessage: "Woops I dropped it in the ocean tehe",
  }
];

const gpsIcon = L.divIcon({
  className: 'gps-puck',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map Controller
function MapController({ userPos, followMode, setFollowMode }) {
  const map = useMap();
  useMapEvents({
    dragstart: () => setFollowMode(false),
    touchstart: () => setFollowMode(false)
  });
  
  useEffect(() => {
    if (userPos && followMode) {
      map.flyTo([userPos.lat, userPos.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [userPos, followMode, map]);

  return null;
}

function App() {
  const [gameStarted, setGameStarted] = useState(() => localStorage.getItem('gameStarted') === 'true');
  const [currentStage, setCurrentStage] = useState(() => {
    const saved = localStorage.getItem('currentStage');
    return saved ? parseInt(saved) : 0;
  });

  const [userPos, setUserPos] = useState(null);
  const [heading, setHeading] = useState(0); 
  const [distance, setDistance] = useState(null);
  const [found, setFound] = useState(false);
  const [followMode, setFollowMode] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentStage', currentStage);
    localStorage.setItem('gameStarted', gameStarted);
  }, [currentStage, gameStarted]);

  // Compass and location logic
  const handleStartGame = () => {
    setGameStarted(true);

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (event) => {
    let compass = 0;
    if (event.webkitCompassHeading) {
      // iOS
      compass = event.webkitCompassHeading;
    } else if (event.alpha) {
      // Android
      compass = 360 - event.alpha;
    }
    setHeading(compass);
  };

  // Location Tracking
  useEffect(() => {
    if (!gameStarted) return;
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPos({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (err) => console.error(err),
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
      if (d < 10 && !found) setFound(true);
    }
  }, [userPos, currentStage]);

  const nextStage = () => {
    setFound(false);
    if (currentStage + 1 < LOCATIONS.length) {
      setCurrentStage(currentStage + 1);
      setFollowMode(true);
    } else {
      alert("YOU WIN!");
    }
  };

  const gpsIcon = L.divIcon({
    className: 'gps-wrapper', 
    html: `<div class="gps-puck" style="transform: rotate(${heading}deg);">
             <div class="gps-arrow"></div>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  // Menu Logic
  const jumpToStage = (index) => {
    if (window.confirm(`Skip to Clue #${index + 1}?`)) {
      setCurrentStage(index); setFound(false); setShowMenu(false); setFollowMode(true);
    }
  };
  const resetGame = () => { if (window.confirm("Reset game?")) { localStorage.clear(); window.location.reload(); }};

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; var dLat = deg2rad(lat2-lat1); var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c * 1000;
  }
  function deg2rad(deg) { return deg * (Math.PI/180) }

  if (!gameStarted) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(to bottom, #43cea2 0%, #185a9d 100%)', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ minHeight: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box' }}>
          <div className="floating-element" style={{ fontSize: '5rem', marginBottom: '20px', textShadow: '0 0 20px rgba(255,255,255,0.6)' }}>♓</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', letterSpacing: '2px', color: 'white', textAlign: 'center', lineHeight: '1.2' }}>Faye's<br/>Birthday<br/>Hunt</h1>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(5px)', padding: '25px', borderRadius: '15px', marginBottom: '40px', maxWidth: '320px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', color: '#E0F7FA' }}>Happy 30th Birthday boo!</h2>
            <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.95, lineHeight: '1.6', color: 'white' }}>I hope you enjoy this little adventure.<br/> You deserve it!</p>
          </div>
          
          <button className="glow-button" onClick={handleStartGame} style={{ padding: '20px 40px', fontSize: '1.2rem', backgroundColor: 'white', color: '#185a9d', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', marginBottom: '20px' }}>
            {currentStage > 0 ? "Resume Hunt →" : "Start Adventure →"}
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
        
        {
          
        }
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1001, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {

          }
          <button onClick={() => setShowMenu(true)} style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'white', fontSize: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 
          }}>📋</button>

          {

          }
          <button onClick={() => setFollowMode(true)} style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'white', fontSize: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0,
            color: followMode ? '#4285F4' : '#666'
          }}>➤</button>

          

        </div>

        <MapContainer center={[userPos.lat, userPos.lng]} zoom={16} style={{ height: "100%", width: "100%" }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
          <MapController userPos={userPos} followMode={followMode} setFollowMode={setFollowMode} />
          
          <Marker position={[userPos.lat, userPos.lng]} icon={gpsIcon}>
             <Popup>You</Popup>
          </Marker>

          <Circle center={[target.lat, target.lng]} radius={100} pathOptions={{ color: '#FF9A9E', fillColor: '#FF9A9E', fillOpacity: 0.2 }} />
        </MapContainer>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: "60vh", backgroundColor: "white", padding: "20px", paddingBottom: "40px", boxShadow: "0 -5px 20px rgba(0,0,0,0.15)", zIndex: 1000, textAlign: "center", borderTopLeftRadius: "25px", borderTopRightRadius: "25px", overflowY: "auto", transition: "height 0.3s ease-out" }}>
        <h2 style={{margin: "0 0 10px 0", color: "#d63384"}}>Clue #{currentStage + 1}</h2>
        <p style={{fontSize: "1.1rem", lineHeight: "1.5", marginBottom: "10px"}}>{target.clue}</p>
        <p style={{color: "#666", fontStyle: "italic", marginBottom: "15px"}}>Distance: {distance ? `${distance}m` : "Calculating..."}</p>
        {found && (
          <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#fff0f6", borderRadius: "10px", border: "1px solid #ffadd2", animation: "float 0.5s ease-out" }}>
            <p style={{ fontWeight: "bold", color: "#d63384", marginBottom: "10px", fontSize: "1.1rem" }}> YOU'RE SO CLOSE!<br/><span style={{fontWeight: "normal", color: "#333"}}>{target.unlockMessage}</span></p>
            <button onClick={nextStage} style={{ width: "100%", padding: "15px 0", backgroundColor: "#d63384", color: "white", border: "none", borderRadius: "50px", fontSize: "1.1rem", fontWeight: "bold", boxShadow: "0 4px 10px rgba(214, 51, 132, 0.3)", cursor: "pointer" }}>Next Clue →</button>
          </div>
        )}
      </div>

      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '20px', padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>My Progress</h2>
              <button onClick={() => setShowMenu(false)} style={{ border: 'none', background: 'none', fontSize: '24px' }}>✕</button>
            </div>
            {LOCATIONS.map((loc, index) => {
              const isCompleted = index < currentStage;
              const isCurrent = index === currentStage;
              const isLocked = index > currentStage;
              return (
                <div key={loc.id} onClick={() => jumpToStage(index)} style={{ padding: '15px', borderRadius: '10px', marginBottom: '10px', background: isCurrent ? '#fff0f6' : '#f8f9fa', border: isCurrent ? '2px solid #d63384' : '1px solid #eee', opacity: isLocked ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: isCompleted ? '#43cea2' : (isCurrent ? '#d63384' : '#ccc'), color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>{isCompleted ? '✓' : index + 1}</div>
                  <div><h3 style={{ margin: 0, fontSize: '1rem' }}>{loc.title}</h3><p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{isLocked ? "Locked" : (isCompleted ? "Found!" : "Current Objective")}</p></div>
                </div>
              );
            })}
            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button onClick={resetGame} style={{ width: '100%', padding: '15px', background: '#333', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>Reset Game</button>
              <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', marginTop: '10px' }}>Tap a locked level to skip (Emergency only)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;