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

// Locations (I added a 'hint' field to each one for you to fill out!)
const LOCATIONS = [
  {
    id: 1,
    title: "The First Clue",
    clue: "A nice name for a baby?",
    hint: "Willow _____",
    lat: 55.0003425, 
    lng: -7.2697031,
    unlockMessage: "Hooray, you got your first one!!",
  },
  {
    id: 2,
    title: "Spot #2",
    clue: "Is it Spring already?",
    hint: "In the ground, near the left pole",
    lat: 55.00,
    lng: -7.268305,
    unlockMessage: "Buttons said she loves the spring lambs",
  },
  {
    id: 3,
    title: "Spot #3",
    clue: "When life gets you down, do you wanna know what you've got to do?",
    hint: "It's in the ground near a tree.. You're better parking in the spaces directly in front when you arrive.",
    lat: 55.0312530, 
    lng: -7.2181815, 
    unlockMessage: "Just keep swimming!",
  },
  {
    id: 4,
    title: "Spot #4",
    clue: "Red cat, yellow cat, blue cat, _____ ___",
    hint: "A little walk across the street, and we'll stop by a little bush. It should be there!",
    lat: 55.0269644,
    lng: -7.1748675,  
    unlockMessage: "Meow x",
  },
  {
    id: 5,
    title: "Spot #5",
    clue: "A classic Geocaching spot",
    hint: "From the bike stand, turn left then right towards the tree. It's at the bottom of that tree.",
    lat: 55.0112697,
    lng: -7.2844844,  
    unlockMessage: "I considered the bike thing, but apparently I like trees more",
  },
  {
    id: 6,
    title: "Spot #6",
    clue: "An hour break at work? It's so good cause you can just...",
    hint: "When you enter the the little area with cannons.. to your right, you'll find a hole in the bottom of the wall",
    lat: 54.9940611,
    lng: -7.3210054,
    unlockMessage: "Too old to be drinking here now...",
  },
  {
    id: 7,
    title: "The Last Spot",
    clue: "Happy Hour instead?",
    hint: "Say drinky winky in Sandys",
    lat: 54.996206203370136,
    lng:  -7.317501430430367,
    unlockMessage: "A wee sneaky birthday one? Don't worry I'll drive lol",
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
  
  // NEW STATES for hints and range detection
  const [showHint, setShowHint] = useState(false);
  const [inRange, setInRange] = useState(false);

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
      compass = event.webkitCompassHeading;
    } else if (event.alpha) {
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

  // Distance Check (UPDATED LOGIC)
  useEffect(() => {
    if (userPos && currentStage < LOCATIONS.length) {
      const target = LOCATIONS[currentStage];
      const d = getDistanceFromLatLonInMeters(userPos.lat, userPos.lng, target.lat, target.lng);
      setDistance(Math.floor(d));
      
      // If she is within 5 meters, activate the "Found It" button zone
      if (d <= 5) {
        setInRange(true);
      } else {
        setInRange(false);
      }
    }
  }, [userPos, currentStage]);

  const nextStage = () => {
    setFound(false);
    setShowHint(false); // Reset hint for next stage
    setInRange(false);  // Reset range for next stage
    
    if (currentStage + 1 < LOCATIONS.length) {
      setCurrentStage(currentStage + 1);
      setFollowMode(true);
    } else {
      alert("YOU WIN! Happy Birthday! I love you so much my beautiful fiancé <3");
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
      setCurrentStage(index); setFound(false); setShowHint(false); setShowMenu(false); setFollowMode(true);
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
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1001, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setShowMenu(true)} style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'white', fontSize: '30px', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, paddingBottom: '4px' 
          }}>☰</button>
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

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: "65vh", backgroundColor: "white", padding: "20px", paddingBottom: "40px", boxShadow: "0 -5px 20px rgba(0,0,0,0.15)", zIndex: 1000, textAlign: "center", borderTopLeftRadius: "25px", borderTopRightRadius: "25px", overflowY: "auto", transition: "height 0.3s ease-out" }}>
        
        {/* ONLY SHOW THIS IF SHE HASN'T FOUND IT YET */}
        {!found && (
          <>
            <h2 style={{margin: "0 0 10px 0", color: "#d63384"}}>Clue #{currentStage + 1}</h2>
            <p style={{fontSize: "1.1rem", lineHeight: "1.5", marginBottom: "15px"}}>{target.clue}</p>
            
            {/* Distance Indicator */}
            <p style={{color: inRange ? "#43cea2" : "#666", fontStyle: "italic", fontWeight: inRange ? "bold" : "normal", marginBottom: "15px"}}>
              {inRange ? "📍 You are in the Search Zone!" : `Distance: ${distance ? distance + 'm' : "Calculating..."}`}
            </p>

            {/* Hint Section */}
            <div style={{ marginBottom: "20px" }}>
              {!showHint ? (
                <button onClick={() => setShowHint(true)} style={{ background: "none", border: "1px solid #d63384", color: "#d63384", padding: "8px 15px", borderRadius: "20px", fontSize: "0.9rem", cursor: "pointer" }}>
                  💡 Need a hint?
                </button>
              ) : (
                <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "10px", border: "1px dashed #ccc" }}>
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "#555" }}><strong>Hint:</strong> {target.hint}</p>
                </div>
              )}
            </div>

            {/* "I FOUND IT" Button - Only appears when within 5 meters */}
            {inRange && (
              <button onClick={() => setFound(true)} style={{ width: "100%", padding: "15px 0", backgroundColor: "#43cea2", color: "white", border: "none", borderRadius: "50px", fontSize: "1.1rem", fontWeight: "bold", boxShadow: "0 4px 10px rgba(67, 206, 162, 0.4)", cursor: "pointer", animation: "pulse 2s infinite" }}>
                I Found the Capsule! 
              </button>
            )}
          </>
        )}

        {/* SHOW THIS AFTER SHE CLICKS "I FOUND IT" */}
        {found && (
          <div style={{ marginTop: "5px", padding: "15px", backgroundColor: "#fff0f6", borderRadius: "10px", border: "1px solid #ffadd2", animation: "float 0.5s ease-out" }}>
            <p style={{ fontWeight: "bold", color: "#d63384", marginBottom: "10px", fontSize: "1.2rem" }}>
              🎉 CAPSULE UNLOCKED!<br/>
              <span style={{fontWeight: "normal", color: "#333", fontSize: "1.1rem", display: "block", marginTop: "10px"}}>
                "{target.unlockMessage}"
              </span>
            </p>
            <button onClick={nextStage} style={{ width: "100%", padding: "15px 0", backgroundColor: "#d63384", color: "white", border: "none", borderRadius: "50px", fontSize: "1.1rem", fontWeight: "bold", boxShadow: "0 4px 10px rgba(214, 51, 132, 0.3)", cursor: "pointer", marginTop: "10px" }}>
              Next Clue →
            </button>
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