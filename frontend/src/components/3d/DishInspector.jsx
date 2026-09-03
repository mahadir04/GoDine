import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stage } from '@react-three/drei';
import useStore from '../../store/store';
import { Sparkles, Layers, RefreshCw, Compass } from 'lucide-react';

// 3D Burger Model Group
const BurgerModel = ({ explode }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Top Bun */}
      <group position={[0, 1.8 + explode * 1.6, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.6, 20]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        <Html distanceFactor={10} position={[1.8, 0, 0]}>
          <div className="glass-panel border border-amber-500/30 px-2 py-1 rounded text-[10px] font-bold text-amber-200 whitespace-nowrap">
            Baked Sesame Bun
          </div>
        </Html>
      </group>

      {/* Cheese slice */}
      <group position={[0, 1.2 + explode * 0.8, 0]}>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[2.0, 0.05, 2.0]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
        <Html distanceFactor={10} position={[-2.0, 0, 0]}>
          <div className="glass-panel border border-yellow-500/30 px-2 py-1 rounded text-[10px] font-bold text-yellow-300 whitespace-nowrap">
            Cheddar Cheese (92% Pos)
          </div>
        </Html>
      </group>

      {/* Smoked Patty */}
      <group position={[0, 0.6, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.4, 1.4, 0.45, 20]} />
          <meshStandardMaterial color="#582f0e" roughness={0.9} />
        </mesh>
        <Html distanceFactor={10} position={[1.8, 0, 0]}>
          <div className="glass-panel border border-red-500/30 px-2 py-1 rounded text-[10px] font-bold text-red-400 whitespace-nowrap">
            Juicy Smoked Patty (Taste: 96%)
          </div>
        </Html>
      </group>

      {/* Lettuce Layer */}
      <group position={[0, 0.0 - explode * 0.8, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.45, 1.45, 0.15, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
        <Html distanceFactor={10} position={[-2.0, 0, 0]}>
          <div className="glass-panel border border-green-500/30 px-2 py-1 rounded text-[10px] font-bold text-green-300 whitespace-nowrap">
            Crisp Lettuce (98% Pos)
          </div>
        </Html>
      </group>

      {/* Bottom Bun */}
      <group position={[0, -0.6 - explode * 1.6, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.4, 20]} />
          <meshStandardMaterial color="#d97706" roughness={0.7} />
        </mesh>
        <Html distanceFactor={10} position={[1.8, 0, 0]}>
          <div className="glass-panel border border-zinc-700 px-2 py-1 rounded text-[10px] text-zinc-400 whitespace-nowrap">
            Toasted Bun Base
          </div>
        </Html>
      </group>
    </group>
  );
};

// 3D Kacchi Model Group
const KacchiModel = ({ explode }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Boiled Egg */}
      <group position={[0, 1.4 + explode * 1.8, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#fafafa" roughness={0.5} />
        </mesh>
        <Html distanceFactor={10} position={[1.2, 0, 0]}>
          <div className="glass-panel border border-zinc-700 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap">
            Dhakai Egg
          </div>
        </Html>
      </group>

      {/* Potatoes (Kacchi Aloo) */}
      <group position={[0.7, 0.8 + explode * 1.0, -0.2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.6, 12, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.7} />
        </mesh>
        <Html distanceFactor={10} position={[1.2, 0.2, 0]}>
          <div className="glass-panel border border-orange-500/30 px-2 py-1 rounded text-[10px] font-bold text-orange-300 whitespace-nowrap">
            Spiced Kacchi Aloo (95% Pos)
          </div>
        </Html>
      </group>

      {/* Basmati Rice Layer */}
      <group position={[0, 0.2, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.7, 1.8, 0.5, 24]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>
        <Html distanceFactor={10} position={[-2.2, 0, 0]}>
          <div className="glass-panel border border-yellow-500/30 px-2 py-1 rounded text-[10px] font-bold text-yellow-200 whitespace-nowrap">
            Basmati Rice (Taste: 94%)
          </div>
        </Html>
      </group>

      {/* Mutton Pieces */}
      <group position={[0, -0.4 - explode * 1.0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.6, 1.5]} />
          <meshStandardMaterial color="#3b2314" roughness={0.95} />
        </mesh>
        <Html distanceFactor={10} position={[2.0, 0, 0]}>
          <div className="glass-panel border border-red-500/30 px-2 py-1 rounded text-[10px] font-bold text-red-400 whitespace-nowrap">
            Tender Mutton (Portion: 92%)
          </div>
        </Html>
      </group>

      {/* Traditional Silver Platter */}
      <group position={[0, -0.9 - explode * 1.8, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.1, 2.1, 0.1, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        <Html distanceFactor={10} position={[-2.2, 0, 0]}>
          <div className="glass-panel border border-zinc-700 px-2 py-1 rounded text-[10px] text-zinc-500 whitespace-nowrap">
            Silver Platter
          </div>
        </Html>
      </group>
    </group>
  );
};

const DishInspector = () => {
  const { activeDishId, setActiveDishId } = useStore();
  const [explode, setExplode] = useState(0.0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-zinc-950 w-full overflow-hidden">
      
      {/* 3D Viewport Column */}
      <div className="relative w-full lg:w-3/4 h-[60%] lg:h-full">
        <Canvas shadows camera={{ position: [0, 5, 8], fov: 45 }} className="h-full w-full">
          <color attach="background" args={['#060608']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          
          <Stage environment="city" intensity={0.6} contactShadow={true} shadowBias={-0.0015}>
            {activeDishId === 'kacchi' ? (
              <KacchiModel explode={explode} />
            ) : (
              <BurgerModel explode={explode} />
            )}
          </Stage>

          <OrbitControls 
            enableDamping 
            minDistance={4} 
            maxDistance={12} 
            maxPolarAngle={Math.PI / 1.9}
          />
        </Canvas>

        {/* Float Controls overlay */}
        <div className="absolute bottom-6 left-6 right-6 lg:right-auto glass-panel border border-zinc-800 p-5 rounded-2xl max-w-md pointer-events-auto">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-5 w-5 text-blue-500 animate-pulse" />
            <h3 className="text-sm font-extrabold text-white">Explode Inspector</h3>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>Separate Layers</span>
              <span className="font-bold text-blue-400 font-mono">{Math.round(explode * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={explode}
              onChange={(e) => setExplode(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
            Drag the slider to isolate specific ingredients. Hover tags display aspect sentiment scores compiled from verified diner reviews.
          </p>
        </div>
      </div>

      {/* Control Sidebar Column */}
      <div className="w-full lg:w-1/4 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-850 p-6 flex flex-col justify-between overflow-y-auto h-[40%] lg:h-full">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">3D Volumetric Library</h2>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Reviewing live dish-level recipes and chemical aspect sentiment extractions.
          </p>

          {/* Dish Selector Button group */}
          <div className="flex flex-col gap-2 mb-8">
            <button
              onClick={() => { setActiveDishId('kacchi'); setExplode(0); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                activeDishId === 'kacchi'
                  ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                  : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <span>Dhakai Mutton Kacchi Biryani</span>
              <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">RICE</span>
            </button>
            
            <button
              onClick={() => { setActiveDishId('burger'); setExplode(0); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                activeDishId === 'burger'
                  ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                  : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <span>Artisan Smokehouse Burger</span>
              <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">BBQ</span>
            </button>
          </div>

          {/* Ingredient Details checklist card */}
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Composition Info</h3>
            
            {activeDishId === 'kacchi' ? (
              <div className="flex flex-col gap-2 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span>Basmati Rice:</span>
                  <span className="text-emerald-400">94% Taste Match</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span>Spiced Aloo:</span>
                  <span className="text-emerald-400">95% Positive</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span>Mutton (Bone-in):</span>
                  <span className="text-emerald-400">92% Portion Match</span>
                </div>
                <div className="flex justify-between">
                  <span>Boiled Egg:</span>
                  <span className="text-zinc-500">Standard</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span>Smoked Beef Patty:</span>
                  <span className="text-emerald-400">96% Taste Match</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span>Cheddar Cheese:</span>
                  <span className="text-emerald-400">92% Positive</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1.5">
                  <span>Sesame Bun:</span>
                  <span className="text-zinc-500">Freshly Baked</span>
                </div>
                <div className="flex justify-between">
                  <span>Lettuce:</span>
                  <span className="text-emerald-400">98% Positive</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Reset rotation button */}
        <button
          onClick={() => setExplode(0)}
          className="mt-6 flex items-center justify-center gap-2 w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 rounded-lg py-2.5 text-xs font-bold transition-all shadow"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Composition
        </button>
      </div>

    </div>
  );
};

export default DishInspector;
