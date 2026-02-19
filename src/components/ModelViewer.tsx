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
  roof: "Tak",
  windows: "Fönster",
  doors: "Dörrar",
  walls: "Väggar",
  foundation: "Grund",
  terrace: "Terrass",
  interior: "Interiör",
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

interface ModelProps {
  selectedPart: string | null;
  hoveredPart: string | null;
  onClickPart: (category: string) => void;
  onHoverPart: (category: string | null) => void;
  shape: string;
  floors: number;
}

function Model({
  selectedPart,
  hoveredPart,
  onClickPart,
  onHoverPart,
  shape,
  floors,
}: ModelProps) {
  const path = `${import.meta.env.BASE_URL}models/${shape}-model-${FLOOR_SUFFIX[floors]}.glb`;
  const gltf = useLoader(GLTFLoader, path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const originalMaterials = useRef<
    Map<THREE.Mesh, THREE.Material | THREE.Material[]>
  >(new Map());

  useEffect(() => {
    originalMaterials.current.clear();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        originalMaterials.current.set(child, child.material);
      }
    });
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const category = getCategory(child.name);
        const original = originalMaterials.current.get(child);
        if (!original) return;

        if (category && category === selectedPart) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x004494,
            emissive: 0x002266,
            emissiveIntensity: 0.3,
          });
        } else if (category && category === hoveredPart) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x3a7fd4,
            emissive: 0x1a4fa0,
            emissiveIntensity: 0.15,
          });
        } else {
          child.material = original;
        }
      }
    });
  }, [selectedPart, hoveredPart, scene]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const category = getCategory(e.object.name);
      if (category) onClickPart(category);
    },
    [onClickPart],
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const category = getCategory(e.object.name);
      if (category) {
        onHoverPart(category);
        document.body.style.cursor = "pointer";
      }
    },
    [onHoverPart],
  );

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
  { id: "t-shaped", label: "T-formad" },
  { id: "l-shaped", label: "L-formad" },
  { id: "u-shaped", label: "U-formad" },
];

const FLOORS = [1, 2];

interface ModelViewerProps {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
  selectedShape: string;
  onSelectShape: (shape: string) => void;
}

export function ModelViewer({
  selectedPart,
  onSelectPart,
  selectedShape,
  onSelectShape,
}: ModelViewerProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [selectedFloors, setSelectedFloors] = useState(1);

  function SelectorButton({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) {
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
          <SelectorButton
            key={shape.id}
            active={selectedShape === shape.id}
            onClick={() => onSelectShape(shape.id)}
          >
            {shape.label}
          </SelectorButton>
        ))}
      </div>

      {/* Floor selector */}
      <div className="flex gap-2 mb-4">
        {FLOORS.map((f) => (
          <SelectorButton
            key={f}
            active={selectedFloors === f}
            onClick={() => setSelectedFloors(f)}
          >
            {f} {f === 1 ? "våning" : "våningar"}
          </SelectorButton>
        ))}
      </div>

      <div
        className="w-full h-[300px] sm:h-[500px] bg-gray-900 overflow-hidden shadow-lg"
        style={{ borderRadius: "var(--border-radius)" }}
      >
        <Canvas camera={{ position: [0, 2, -5], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />
          <Suspense fallback={null}>
            <Model
              key={`${selectedShape}-${selectedFloors}`}
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onClickPart={onSelectPart}
              onHoverPart={setHoveredPart}
              shape={selectedShape}
              floors={selectedFloors}
            />
          </Suspense>
          <Controls />
        </Canvas>
        {hoveredPart && !selectedPart && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-lg shadow text-sm font-medium text-gray-800">
            {CATEGORY_LABELS[hoveredPart] || hoveredPart}
          </div>
        )}
      </div>
    </div>
  );
}
