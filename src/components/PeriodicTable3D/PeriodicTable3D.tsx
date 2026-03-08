import { Suspense, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSelection } from '@/state/selectionStore';
import { ELEMENTS, ELEMENT_BY_Z } from '@/data/elements';
import { ELEMENT_DETAILS } from '@/data/elementDetails';
import { ATOMIC_RADII } from '@/data/atomicRadii';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { TABLE_POSITIONS, CAMERA_START, TABLE_CENTER } from './tableLayout';
import { ElementCube } from './ElementCube';
import { WebGLErrorBoundary } from '@/components/TutorialCanvas/WebGLErrorBoundary';
import { Button } from '@/components/ui/button';
import { Layers, Circle, Zap, Combine, Search, X } from 'lucide-react';

export type TableOverlay3D = 'none' | 'radius' | 'electronegativity' | 'both';

const OVERLAY_OPTIONS: { value: TableOverlay3D; label: string; icon: typeof Layers; description: string }[] = [
  { value: 'none', label: 'Flat', icon: Layers, description: 'Uniform cubes' },
  { value: 'radius', label: 'Radius', icon: Circle, description: 'Size = atomic radius' },
  { value: 'electronegativity', label: 'EN', icon: Zap, description: 'Height = electronegativity' },
  { value: 'both', label: 'Both', icon: Combine, description: 'Size + height combined' },
];

// Pre-build lookup: Z → position
const POSITION_BY_Z = new Map(TABLE_POSITIONS.map(p => [p.element.Z, p]));

/** Smoothly animate camera + controls target to a position */
function CameraController({ targetZ, onArrived }: { targetZ: number | null; onArrived: () => void }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const flyingRef = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useEffect(() => {
    if (targetZ == null) return;
    const pos = POSITION_BY_Z.get(targetZ);
    if (!pos) return;

    // Camera goes in front of the element, slightly above and close
    targetLook.current.set(pos.x, pos.y, pos.z);
    targetPos.current.set(pos.x, pos.y + 0.5, pos.z + 5);
    flyingRef.current = true;
  }, [targetZ]);

  useFrame((_, delta) => {
    if (!flyingRef.current) return;
    const lerp = Math.min(delta * 3, 0.12);

    camera.position.lerp(targetPos.current, lerp);

    if (controlsRef.current) {
      const ct = controlsRef.current.target as THREE.Vector3;
      ct.lerp(targetLook.current, lerp);
      controlsRef.current.update();
    }

    // Check if arrived
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      flyingRef.current = false;
      onArrived();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={TABLE_CENTER}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={50}
      enablePan
      panSpeed={0.5}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}

function TableScene({ overlay, flyToZ, onFlyArrived, onHoverElement }: {
  overlay: TableOverlay3D;
  flyToZ: number | null;
  onFlyArrived: () => void;
  onHoverElement: (Z: number | null) => void;
}) {
  const { selectedElements, selectElement, multiSelectMode } = useSelection();

  const handleSelect = useCallback((Z: number, shiftKey: boolean) => {
    selectElement(Z, shiftKey || multiSelectMode);
  }, [selectElement, multiSelectMode]);

  const selectedSet = useMemo(() => new Set(selectedElements), [selectedElements]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 15, 10]} intensity={0.6} />
      <directionalLight position={[-10, -5, 8]} intensity={0.3} color="#7aa7ff" />
      <pointLight position={[0, 5, 15]} intensity={0.4} color="#66f0a6" distance={40} />

      <Stars radius={80} depth={60} count={2500} factor={3} saturation={0.8} fade speed={0.5} />

      {TABLE_POSITIONS.map(({ element, x, y, z }, i) => (
        <ElementCube
          key={element.Z}
          element={element}
          position={[x, y, z]}
          isSelected={selectedSet.has(element.Z)}
          onSelect={handleSelect}
          onHover={onHoverElement}
          overlay={overlay}
          entranceDelay={i * 0.012}
        />
      ))}

      <CameraController targetZ={flyToZ} onArrived={onFlyArrived} />
    </>
  );
}

/** Search input with autocomplete dropdown */
function FlyToSearch({ onFlyTo }: { onFlyTo: (Z: number) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return ELEMENTS.filter(el =>
      el.name.toLowerCase().startsWith(q) ||
      el.sym.toLowerCase() === q ||
      String(el.Z) === q
    ).slice(0, 8);
  }, [query]);

  const handleSelect = useCallback((Z: number) => {
    onFlyTo(Z);
    const el = ELEMENTS.find(e => e.Z === Z);
    setQuery(el ? `${el.sym} – ${el.name}` : '');
    setOpen(false);
    inputRef.current?.blur();
  }, [onFlyTo]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].Z);
    }
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }, [results, handleSelect]);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Fly to element…"
          className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg overflow-hidden z-20">
          {results.map(el => (
            <button
              key={el.Z}
              onMouseDown={() => handleSelect(el.Z)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-primary/10 transition-colors"
            >
              <span className="font-bold text-foreground w-6">{el.sym}</span>
              <span className="text-muted-foreground">{el.name}</span>
              <span className="ml-auto text-muted-foreground/50 text-[10px]">#{el.Z}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PeriodicTable3D() {
  const [overlay, setOverlay] = useState<TableOverlay3D>('none');
  const [flyToZ, setFlyToZ] = useState<number | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const [hoveredZ, setHoveredZ] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectElement } = useSelection();

  const handleFlyTo = useCallback((Z: number) => {
    setFlyToZ(Z);
    setFlyKey(k => k + 1);
    selectElement(Z, false);
  }, [selectElement]);

  const handleFlyArrived = useCallback(() => {}, []);

  const handleHoverElement = useCallback((Z: number | null) => {
    setHoveredZ(Z);
  }, []);

  // Track mouse position relative to container
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // Get hovered element data
  const hoveredElement = hoveredZ ? ELEMENT_BY_Z.get(hoveredZ) : null;
  const hoveredDetail = hoveredZ ? ELEMENT_DETAILS[hoveredZ] : null;
  const hoveredRadius = hoveredZ ? ATOMIC_RADII[hoveredZ] : null;
  const hoveredCatColor = hoveredElement ? (CATEGORY_COLORS[hoveredElement.category] ?? '#9aa6c8') : null;

  const stateLabel = hoveredDetail?.state ?? 'unknown';

  return (
    <WebGLErrorBoundary>
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-border/40 bg-background/60 backdrop-blur"
        style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}
        onMouseMove={handleMouseMove}
      >
        {/* Floating title + search */}
        <div className="absolute top-4 left-4 z-10 w-56">
          <h1 className="text-2xl font-black tracking-tight text-foreground drop-shadow-lg pointer-events-none">
            Periodic Table <span className="text-primary">Genius</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 mb-2 pointer-events-none">
            Orbit • Zoom • Click to explore all 118 elements
          </p>
          <FlyToSearch onFlyTo={handleFlyTo} />
        </div>

        {/* 3D Overlay mode toggle */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          {OVERLAY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
            <Button
              key={value}
              variant={overlay === value ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs justify-start min-w-[130px]"
              onClick={() => setOverlay(value)}
              title={description}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>

        {/* Hover Tooltip */}
        {hoveredElement && hoveredDetail && (
          <div
            className="absolute z-20 pointer-events-none animate-fade-in"
            style={{
              left: mousePos.x + 16,
              top: mousePos.y - 8,
              maxWidth: 260,
            }}
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl px-3.5 py-3 space-y-1.5">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-inner"
                  style={{ backgroundColor: hoveredCatColor ?? '#666' }}
                >
                  {hoveredElement.sym}
                </span>
                <div>
                  <div className="text-sm font-bold text-foreground leading-tight">{hoveredElement.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    #{hoveredElement.Z} · {hoveredElement.category} · {stateLabel}
                  </div>
                </div>
              </div>

              {/* Data grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                <div className="text-muted-foreground">Mass</div>
                <div className="text-foreground font-mono">{hoveredDetail.mass} u</div>

                <div className="text-muted-foreground">Electronegativity</div>
                <div className="text-foreground font-mono">{hoveredElement.en ?? '—'}</div>

                <div className="text-muted-foreground">Atomic radius</div>
                <div className="text-foreground font-mono">{hoveredRadius != null ? `${hoveredRadius} pm` : '—'}</div>

                <div className="text-muted-foreground">Group · Period</div>
                <div className="text-foreground font-mono">
                  {hoveredElement.group ?? 'f-block'} · {hoveredElement.period}
                </div>
              </div>

              {/* Electron config */}
              <div className="pt-1 border-t border-border/30">
                <div className="text-[10px] text-muted-foreground mb-0.5">Electron configuration</div>
                <div className="text-[11px] text-foreground font-mono leading-snug">{hoveredDetail.electronConfig}</div>
              </div>
            </div>
          </div>
        )}

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1.5 pointer-events-none max-w-[70%]">
          {overlay === 'none' || overlay === 'radius' ? (
            [
              ['alkali metal', '#ff7a7a'], ['alkaline earth', '#ffd27a'], ['transition metal', '#7aa7ff'],
              ['post-transition', '#7affc9'], ['metalloid', '#b792ff'], ['nonmetal', '#66f0a6'],
              ['halogen', '#ff7ad6'], ['noble gas', '#7ad1ff'], ['lanthanide', '#ffa7f2'], ['actinide', '#ffb68a'],
            ].map(([label, color]) => (
              <span key={label} className="inline-flex items-center gap-1 text-[10px] text-foreground/80 bg-background/50 backdrop-blur-sm rounded-full px-2 py-0.5 border border-border/30">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))
          ) : (
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1 border border-border/30">
              <span className="text-[10px] text-foreground/80">Low EN</span>
              <div className="w-24 h-2 rounded-full" style={{
                background: 'linear-gradient(90deg, hsl(252,85%,45%), hsl(180,85%,50%), hsl(60,85%,50%), hsl(0,85%,55%))'
              }} />
              <span className="text-[10px] text-foreground/80">High EN</span>
            </div>
          )}
          {overlay === 'radius' && (
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1 border border-border/30">
              <span className="text-[10px] text-foreground/80">Small</span>
              <div className="flex items-center gap-0.5">
                {[3, 5, 7, 9, 11].map(s => (
                  <div key={s} className="rounded-sm bg-foreground/40" style={{ width: s, height: s }} />
                ))}
              </div>
              <span className="text-[10px] text-foreground/80">Large atom</span>
            </div>
          )}
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
            <TableScene overlay={overlay} flyToZ={flyToZ} onFlyArrived={handleFlyArrived} onHoverElement={handleHoverElement} />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
