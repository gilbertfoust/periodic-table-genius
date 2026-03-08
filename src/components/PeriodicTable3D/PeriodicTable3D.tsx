import { Suspense, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { useSelection } from '@/state/selectionStore';
import { TABLE_POSITIONS, CAMERA_START, TABLE_CENTER } from './tableLayout';
import { ElementCube } from './ElementCube';
import { WebGLErrorBoundary } from '@/components/TutorialCanvas/WebGLErrorBoundary';

function TableScene() {
  const { selectedElements, selectElement, multiSelectMode } = useSelection();

  const handleSelect = useCallback((Z: number, shiftKey: boolean) => {
    selectElement(Z, shiftKey || multiSelectMode);
  }, [selectElement, multiSelectMode]);

  const selectedSet = useMemo(() => new Set(selectedElements), [selectedElements]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 15, 10]} intensity={0.6} />
      <directionalLight position={[-10, -5, 8]} intensity={0.3} color="#7aa7ff" />
      <pointLight position={[0, 5, 15]} intensity={0.4} color="#66f0a6" distance={40} />

      {/* Starfield background */}
      <Stars radius={80} depth={60} count={2500} factor={3} saturation={0.8} fade speed={0.5} />

      {/* Element cubes */}
      {TABLE_POSITIONS.map(({ element, x, y, z }) => (
        <ElementCube
          key={element.Z}
          element={element}
          position={[x, y, z]}
          isSelected={selectedSet.has(element.Z)}
          onSelect={handleSelect}
        />
      ))}

      {/* Orbit controls */}
      <OrbitControls
        target={TABLE_CENTER}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={50}
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

export function PeriodicTable3D() {
  return (
    <WebGLErrorBoundary>
      <div className="relative w-full rounded-2xl overflow-hidden border border-border/40 bg-background/60 backdrop-blur"
           style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        {/* Floating title overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <h1 className="text-2xl font-black tracking-tight text-foreground drop-shadow-lg">
            Periodic Table <span className="text-primary">Genius</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Orbit • Zoom • Click to explore all 118 elements
          </p>
        </div>

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          {[
            ['alkali metal', '#ff7a7a'], ['alkaline earth', '#ffd27a'], ['transition metal', '#7aa7ff'],
            ['post-transition', '#7affc9'], ['metalloid', '#b792ff'], ['nonmetal', '#66f0a6'],
            ['halogen', '#ff7ad6'], ['noble gas', '#7ad1ff'], ['lanthanide', '#ffa7f2'], ['actinide', '#ffb68a'],
          ].map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1 text-[10px] text-foreground/80 bg-background/50 backdrop-blur-sm rounded-full px-2 py-0.5 border border-border/30">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>

        {/* Keyboard hint */}
        <div className="absolute bottom-4 right-4 z-10 text-[10px] text-muted-foreground/60 pointer-events-none">
          Shift+Click to multi-select (up to 4)
        </div>

        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: CAMERA_START, fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <TableScene />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
