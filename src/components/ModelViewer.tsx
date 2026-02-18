import { Canvas, useLoader } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Suspense, useState, useCallback } from "react";
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
}

function Model({
  selectedPart,
  hoveredPart,
  onClickPart,
  onHoverPart,
  shape,
}: ModelProps) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/${shape}-model.glb`);
  const originalMaterials = useRef<
    Map<THREE.Mesh, THREE.Material | THREE.Material[]>
  >(new Map());

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        originalMaterials.current.set(child, child.material);
        console.log(
          "Mesh:",
          child.name,
          "→ category:",
          getCategory(child.name),
        );
      }
    });
  }, [gltf]);

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const category = getCategory(child.name);
        const original = originalMaterials.current.get(child);
        if (!original) return;

        if (category && category === selectedPart) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            emissive: 0x1e40af,
            emissiveIntensity: 0.3,
          });
        } else if (category && category === hoveredPart) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            emissive: 0x2563eb,
            emissiveIntensity: 0.15,
          });
        } else {
          child.material = original;
        }
      }
    });
  }, [selectedPart, hoveredPart, gltf]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const name = e.object.name;
      const category = getCategory(name);
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
      object={gltf.scene}
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
  { id: "final-l-shaped", label: "L-formad" },
  { id: "u-shaped", label: "U-formad" },
];

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

  return (
    <div className="relative">
      <div className="flex gap-2 mb-4">
        {SHAPES.map((shape) => (
          <button
            key={shape.id}
            onClick={() => onSelectShape(shape.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedShape === shape.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {shape.label}
          </button>
        ))}
      </div>
      <div className="w-full h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
        <Canvas camera={{ position: [0, 2, -5], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />
          <Suspense fallback={null}>
            <Model
              key={selectedShape}
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onClickPart={onSelectPart}
              onHoverPart={setHoveredPart}
              shape={selectedShape}
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
