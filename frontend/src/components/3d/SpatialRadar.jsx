import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import useStore from '../../store/store';
import axios from 'axios';
import { MapPin, Compass, Info } from 'lucide-react';

// Glowing Beacon Cylinder component
const Beacon = ({ venue, position, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animate pulse heights and rotations
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time * 2.5) * 0.15;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const isPromo = venue.average_rating > 4.5 || Math.random() > 0.5; // Simulate discount promo glow
  const beaconColor = isPromo ? '#10b981' : '#3b82f6'; // Emerald glow for promo, blue for normal

  return (
    <group position={position}>
      {/* Light cylinder representing beacon */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.3, 2.5, 12]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : beaconColor}
          emissive={hovered ? '#d97706' : beaconColor}
          emissiveIntensity={hovered ? 2.5 : 1.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Floating Ring indicator */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 24]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.4} side={2} />
      </mesh>

      {/* HTML label showing name & rating */}
      <Html distanceFactor={15} position={[0, 1.8, 0]} center>
        <div 
          onClick={onClick}
          className={`glass-panel border px-3 py-1.5 rounded-lg shadow-xl cursor-pointer text-center select-none min-w-[120px] transition-all hover:scale-105 ${
            isPromo ? 'border-emerald-500/50 hover:bg-emerald-950/20' : 'border-blue-500/50 hover:bg-blue-950/20'
          }`}
        >
          <p className="text-[10px] font-extrabold text-white truncate max-w-[100px]">{venue.name}</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">{venue.category}</span>
            <span className="text-[9px] font-bold text-amber-400 font-mono">★ {venue.average_rating}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// Procedural building mesh representation
const Building = ({ position, args, color }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.8} 
        metalness={0.2}
      />
    </mesh>
  );
};

// Main Scene setup
const RadarScene = ({ venues, coordinates }) => {
  const [buildings, setBuildings] = useState([]);
  const { setActiveVenueId } = useStore();

  useEffect(() => {
    // Generate static procedural buildings around Dhaka center
    const list = [];
    // Ground Grid size
    const count = 70;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 45;
      
      // Prevent buildings on center streets
      if (Math.abs(x) < 2 || Math.abs(z) < 2) continue;
      
      const width = Math.random() * 1.5 + 0.8;
      const height = Math.random() * 6 + 1.5;
      const depth = Math.random() * 1.5 + 0.8;
      
      const colors = ['#1e1e24', '#27272a', '#18181b', '#09090b'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      list.push({
        id: i,
        position: [x, height / 2 - 1.25, z],
        args: [width, height, depth],
        color: color
      });
    }
    setBuildings(list);
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.0} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Grid ground */}
      <gridHelper args={[60, 60, '#3f3f46', '#18181b']} position={[0, -1.25, 0]} />

      {/* Renders procedural buildings */}
      {buildings.map((b) => (
        <Building key={b.id} position={b.position} args={b.args} color={b.color} />
      ))}

      {/* Render Beacons based on relative lat/lon offsets */}
      {venues.map((venue) => {
        // Compute position offsets scaled relative to Coordinates center
        const latOffset = (venue.latitude - coordinates.latitude) * 4000;
        const lonOffset = (venue.longitude - coordinates.longitude) * 4000;
        const x = lonOffset;
        const z = -latOffset; // Mapping lat to z direction
        
        return (
          <Beacon
            key={venue.id}
            venue={venue}
            position={[x, 0, z]}
            onClick={() => setActiveVenueId(venue.id)}
          />
        );
      })}
    </>
  );
};

const SpatialRadar = () => {
  const { coordinates, token } = useStore();
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/venues/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVenues(response.data);
      } catch (err) {
        console.error("Error loading venues: ", err);
        setError("Offline mode active. Rendering mock spatial beacons.");
        // Mock venues near Dhaka center
        setVenues([
          { id: "v1", name: "Artisan Smokehouse & Bistro", category: "RESTAURANT", latitude: 23.776000, longitude: 90.398000, average_rating: 4.8 },
          { id: "v2", name: "Dhakai Kacchi Ghar", category: "RESTAURANT", latitude: 23.778500, longitude: 90.400500, average_rating: 4.5 },
          { id: "v3", name: "Espresso Lounge & Café", category: "CAFE", latitude: 23.779000, longitude: 90.395000, average_rating: 4.0 },
          { id: "v4", name: "Bakers Delight & Sweetery", category: "BAKERY", latitude: 23.775000, longitude: 90.402000, average_rating: 4.2 }
        ]);
      }
    };
    fetchVenues();
  }, [token]);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full bg-zinc-950 overflow-hidden">
      
      {/* 3D Canvas Viewport */}
      <Canvas shadows camera={{ position: [0, 15, 20], fov: 60 }} className="h-full w-full">
        <color attach="background" args={['#040406']} />
        <fog attach="fog" args={['#040406', 15, 45]} />
        
        <RadarScene venues={venues} coordinates={coordinates} />
        
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          maxPolarAngle={Math.PI / 2.1} // Avoid orbiting under floor
          minDistance={5}
          maxDistance={35}
        />
      </Canvas>

      {/* Floating Radar UI Controller */}
      <div className="absolute bottom-6 left-6 glass-panel border border-zinc-800 p-4 rounded-2xl max-w-sm pointer-events-auto">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-5 w-5 text-blue-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-white">3D Digital Twin Radar</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
          Procedurally rendering nearby buildings. Glowing cylinders represent venues. 
          Emerald signifies active promotional codes.
        </p>
        <div className="flex flex-col gap-1.5 font-mono text-[10px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500/80 border border-blue-400"></span>
            <span>Standard Verified Merchant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 border border-emerald-400 glowing-beacon-green"></span>
            <span>Active Promotion (Discount Live)</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3 text-zinc-600" />
            <span>Use Left Click to drag and orbit; Right Click to pan</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SpatialRadar;
