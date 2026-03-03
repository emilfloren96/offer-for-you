import { Canvas, useLoader } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Suspense, useState, useCallback, useMemo } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Map mesh names to categories
function getCategory(name: string): string | null {
  if (name.startsWith("Roof")) return "roof";
  if (name.startsWith("Window")) return "windows";
  if (name.startsWith("Door")) return "doors";
  if (name.includes("Wall")) return "walls";
  if (name.startsWith("Foundation")) return "foundation";
  if (name.startsWith("Terrace")) return "terrace";
  if (name.includes("Floor") || name.includes("Ceiling")) return "interior";
  return null;
}

const CATEGORY_LABELS: Record<string, string> = {
  roof:       "Tak",
  windows:    "Fönster",
  doors:      "Dörrar",
  walls:      "Väggar",
  foundation: "Grund",
  terrace:    "Terrass",
  interior:   "Interiör",
};

const FLOOR_SUFFIX: Record<number, string> = {
  1: "one-floor",
  2: "two-floor",
};

function Controls() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
    };
    animate();
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
}

// Navigation guide HUD
function NavHud() {
  const items = [
    { icon: "🖱️", label: "Rotera", hint: "Vänsterklick + dra" },
    { icon: "⇧",  label: "Panorera", hint: "Shift + dra" },
    { icon: "⊕",  label: "Zooma", hint: "Scroll" },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 12, right: 12,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
      borderRadius: 6, padding: "8px 12px",
      display: "flex", flexDirection: "column", gap: 4,
      pointerEvents: "none", userSelect: "none",
    }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, opacity: 0.7, width: 16, textAlign: "center" }}>{item.icon}</span>
          <span style={{ fontSize: 10, color: "#fff", opacity: 0.55, width: 52 }}>{item.label}:</span>
          <span style={{ fontSize: 10, color: "#fff", opacity: 0.9 }}>{item.hint}</span>
        </div>
      ))}
    </div>
  );
}

interface ModelProps {
  selectedPart: string | null;
  hoveredPart: string | null;
  onClickPart: (category: string) => void;
  onHoverPart: (category: string | null) => void;
  shape: string;
  floors: number;
  categoryColours: Record<string, number>;
  onAreasCalculated: (areas: Record<string, number>) => void;
}

function Model({
  selectedPart,
  hoveredPart,
  onClickPart,
  onHoverPart,
  shape,
  floors,
  categoryColours,
  onAreasCalculated,
}: ModelProps) {
  const path = `${import.meta.env.BASE_URL}models/${shape}-model-${FLOOR_SUFFIX[floors]}.glb`;
  const gltf = useLoader(GLTFLoader, path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  // Cache original materials
  useEffect(() => {
    originalMaterials.current.clear();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        originalMaterials.current.set(child, child.material);
      }
    });
  }, [scene]);

  // Calculate real mesh surface area from GLTF geometry
  useEffect(() => {
    scene.updateMatrixWorld(true);
    const SCALE_SQ = 1 / (0.1 * 0.1); // compensate for display scale 0.1
    const areas: Record<string, number> = {};
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    const tri = new THREE.Triangle();

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const cat = getCategory(child.name);
      if (!cat) return;
      const pos = child.geometry.attributes.position;
      if (!pos) return;

      const idx = child.geometry.index;
      const indices: number[] = idx
        ? Array.from(idx.array as ArrayLike<number>)
        : Array.from({ length: pos.count }, (_, i) => i);

      let meshArea = 0;
      for (let i = 0; i < indices.length; i += 3) {
        vA.fromBufferAttribute(pos, indices[i]).applyMatrix4(child.matrixWorld);
        vB.fromBufferAttribute(pos, indices[i + 1]).applyMatrix4(child.matrixWorld);
        vC.fromBufferAttribute(pos, indices[i + 2]).applyMatrix4(child.matrixWorld);
        tri.set(vA, vB, vC);
        meshArea += tri.getArea();
      }
      areas[cat] = (areas[cat] ?? 0) + meshArea * SCALE_SQ;
    });

    onAreasCalculated(areas);
  }, [scene, onAreasCalculated]);

  // Apply highlight / material colours
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const category = getCategory(child.name);
      const original = originalMaterials.current.get(child);
      if (!original) return;

      if (category && category === selectedPart) {
        // Interaction highlight — blue
        child.material = new THREE.MeshStandardMaterial({
          color: 0x004494,
          emissive: 0x002266,
          emissiveIntensity: 0.3,
        });
      } else if (category && categoryColours[category] !== undefined) {
        // Selected material colour
        child.material = new THREE.MeshStandardMaterial({
          color: categoryColours[category],
        });
      } else if (category && category === hoveredPart) {
        // Hover highlight
        child.material = new THREE.MeshStandardMaterial({
          color: 0x3a7fd4,
          emissive: 0x1a4fa0,
          emissiveIntensity: 0.15,
        });
      } else {
        child.material = original;
      }
    });
  }, [selectedPart, hoveredPart, categoryColours, scene]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const category = getCategory(e.object.name);
    if (category) onClickPart(category);
  }, [onClickPart]);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const category = getCategory(e.object.name);
    if (category) {
      onHoverPart(category);
      document.body.style.cursor = "pointer";
    }
  }, [onHoverPart]);

  const handlePointerOut = useCallback(() => {
    onHoverPart(null);
    document.body.style.cursor = "default";
  }, [onHoverPart]);

  return (
    <primitive
      object={scene}
      scale={0.1}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

const SHAPES = [
  { id: "rectangular", label: "Rektangulär" },
  { id: "t-shaped",    label: "T-formad" },
  { id: "l-shaped",    label: "L-formad" },
  { id: "u-shaped",    label: "U-formad" },
];

const FLOORS = [1, 2];

interface ModelViewerProps {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
  selectedShape: string;
  onSelectShape: (shape: string) => void;
  selectedFloors: number;
  onSelectFloors: (floors: number) => void;
  categoryColours: Record<string, number>;
  onAreasCalculated: (areas: Record<string, number>) => void;
}

export function ModelViewer({
  selectedPart,
  onSelectPart,
  selectedShape,
  onSelectShape,
  selectedFloors,
  onSelectFloors,
  categoryColours,
  onAreasCalculated,
}: ModelViewerProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  function SelectorButton({
    active, onClick, children,
  }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button
        onClick={onClick}
        className="px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition"
        style={{
          borderRadius: "var(--border-radius)",
          backgroundColor: active ? "var(--primary-blue)" : "var(--bg-white)",
          color: active ? "#fff" : "var(--text-main)",
          border: active ? "none" : "1px solid #d1d5db",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Shape selector */}
      <div className="grid grid-cols-2 sm:flex gap-2 mb-3">
        {SHAPES.map((shape) => (
          <SelectorButton key={shape.id} active={selectedShape === shape.id} onClick={() => onSelectShape(shape.id)}>
            {shape.label}
          </SelectorButton>
        ))}
      </div>

      {/* Floor selector */}
      <div className="flex gap-2 mb-3">
        {FLOORS.map((f) => (
          <SelectorButton key={f} active={selectedFloors === f} onClick={() => onSelectFloors(f)}>
            {f} {f === 1 ? "våning" : "våningar"}
          </SelectorButton>
        ))}
      </div>

      <div
        className="w-full h-[300px] sm:h-[500px] overflow-hidden shadow-lg"
        style={{ borderRadius: "var(--border-radius)", background: "#1a2030", position: "relative" }}
      >
        <Canvas camera={{ position: [0, 2, -5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.4} />
          <directionalLight position={[-4, 4, -4]} intensity={0.5} />
          <hemisphereLight args={[0xddeeff, 0x334455, 0.6]} />
          <Suspense fallback={null}>
            <Model
              key={`${selectedShape}-${selectedFloors}`}
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onClickPart={onSelectPart}
              onHoverPart={setHoveredPart}
              shape={selectedShape}
              floors={selectedFloors}
              categoryColours={categoryColours}
              onAreasCalculated={onAreasCalculated}
            />
          </Suspense>
          <Controls />
        </Canvas>

        {hoveredPart && !selectedPart && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1.5 rounded shadow text-sm font-medium text-gray-800">
            {CATEGORY_LABELS[hoveredPart] || hoveredPart}
          </div>
        )}

        <NavHud />
      </div>
    </div>
  );
}
