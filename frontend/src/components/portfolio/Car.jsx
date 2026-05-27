import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const MODEL_URL = "/models/musclecar.glb";

/**
 * 1969 Ford Mustang Mach-1 428 Cobra Jet (user-provided GLB).
 * Mostly preserves the original materials but ensures wheels spin and
 * headlights/tail-lights are emissive for cinematic dark scenes.
 */
export default function Car({ groupRef }) {
  const { scene } = useGLTF(MODEL_URL);
  const wheelsRef = useRef([]);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    wheelsRef.current = [];

    c.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = false;
      obj.frustumCulled = false;

      const n = (obj.name || "").toLowerCase();
      const parentName = (obj.parent?.name || "").toLowerCase();

      // Register wheels for spin
      if (
        n.includes("wheel") ||
        n.includes("tire") ||
        n.includes("tyre") ||
        n.includes("rim") ||
        parentName.includes("wheel")
      ) {
        wheelsRef.current.push(obj);
      }

      // Brighten headlights
      if (n.includes("headlight") || n.includes("front_light") || n.includes("light_front")) {
        if (obj.material) {
          obj.material = obj.material.clone();
          if (obj.material.emissive) {
            obj.material.emissive = new THREE.Color("#FFE9C4");
            obj.material.emissiveIntensity = 2.2;
          }
        }
      }

      // Tail lights
      if (n.includes("taillight") || n.includes("brake") || n.includes("rear_light")) {
        if (obj.material) {
          obj.material = obj.material.clone();
          if (obj.material.emissive) {
            obj.material.emissive = new THREE.Color("#FF1A1A");
            obj.material.emissiveIntensity = 1.4;
          }
        }
      }

      // Subtle env intensity boost on body paints for that wet-asphalt reflection
      if (obj.material && obj.material.metalness !== undefined && obj.material.metalness > 0.3) {
        obj.material.envMapIntensity = 1.2;
      }
    });

    // Scale + lift. The Mustang model from Sketchfab may be in any unit —
    // we measure its bounding box and normalise to a target length of ~4.5m.
    const bbox = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const targetLen = 4.6;
    const maxDim = Math.max(size.x, size.y, size.z);
    const k = maxDim > 0 ? targetLen / maxDim : 1.0;
    c.scale.setScalar(k);

    // Re-measure and lift so wheels touch the ground (y = -0.7)
    const bbox2 = new THREE.Box3().setFromObject(c);
    c.position.set(0, -0.7 - bbox2.min.y, 0);
    return c;
  }, [scene]);

  useFrame((_, dt) => {
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x -= dt * 4.2;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={cloned} />

      {/* Headlight pool + volumetric cone */}
      {[-0.65, 0.65].map((x, i) => (
        <group key={`hl-${i}`} position={[x, 0.45, 2.2]}>
          <pointLight color="#FFE9C4" intensity={3.6} distance={12} decay={1.6} />
          <mesh position={[0, -0.05, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1.2, 3.8, 22, 1, true]} />
            <meshBasicMaterial
              color="#FFE9C4"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Exhaust glow */}
      <mesh position={[0, 0.05, -2.5]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
