import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const MODEL_URL = "/models/musclecar.glb";

const DEEP_RED = new THREE.Color("#7a0a0a");

/**
 * 1969 Ford Mustang Mach-1 428 Cobra Jet — repainted deep red and lit
 * cinematically. Body parts are detected by analysing mesh materials at
 * load: anything with a saturated red/orange base colour is treated as
 * paint and overridden to DEEP_RED; glossy chrome/glass are left alone.
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

      // Wheels
      if (
        n.includes("wheel") ||
        n.includes("tire") ||
        n.includes("tyre") ||
        n.includes("rim") ||
        parentName.includes("wheel")
      ) {
        wheelsRef.current.push(obj);
      }

      const mat = obj.material;
      if (!mat) return;

      // Detect body-paint surfaces by their original colour (anything mostly
      // red / orange / dark warm body colour gets repainted DEEP_RED)
      if (mat.color) {
        const c1 = mat.color;
        const isPaint =
          (c1.r > 0.25 && c1.r > c1.g + 0.05 && c1.r > c1.b + 0.05) || // warm reds
          (c1.r < 0.1 && c1.g < 0.1 && c1.b < 0.1 && mat.metalness > 0.4); // dark glossy body
        if (isPaint) {
          obj.material = mat.clone();
          obj.material.color = DEEP_RED.clone();
          obj.material.metalness = 0.85;
          obj.material.roughness = 0.22;
          obj.material.envMapIntensity = 1.3;
          return;
        }
      }

      // Headlights — moderate emissive only (avoid blown-out spheres)
      if (n.includes("headlight") || n.includes("front_light") || n.includes("light_front") || n.includes("head_light")) {
        obj.material = mat.clone();
        if (obj.material.emissive) {
          obj.material.emissive = new THREE.Color("#FFE9C4");
          obj.material.emissiveIntensity = 1.6;
          obj.material.color = new THREE.Color("#fff2d8");
        }
        return;
      }
      // Tail-lights — subtle
      if (n.includes("taillight") || n.includes("brake") || n.includes("rear_light") || n.includes("tail_light")) {
        obj.material = mat.clone();
        if (obj.material.emissive) {
          obj.material.emissive = new THREE.Color("#FF1A1A");
          obj.material.emissiveIntensity = 0.8;
        }
        return;
      }

      // Wet-asphalt reflection boost on remaining metallic parts
      if (mat.metalness !== undefined && mat.metalness > 0.3) {
        mat.envMapIntensity = 1.2;
      }
    });

    // Auto-scale to a target length of ~4.4m, lift wheels to ground
    const bbox = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const targetLen = 4.4;
    const maxDim = Math.max(size.x, size.y, size.z);
    const k = maxDim > 0 ? targetLen / maxDim : 1.0;
    c.scale.setScalar(k);

    const bbox2 = new THREE.Box3().setFromObject(c);
    c.position.set(0, -0.7 - bbox2.min.y, 0);
    return c;
  }, [scene]);

  useFrame((_, dt) => {
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x -= dt * 5.2;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={cloned} />

      {/* Soft cinematic headlight pools — no volumetric cones (those were ugly) */}
      {[-0.7, 0.7].map((x, i) => (
        <pointLight
          key={`hl-${i}`}
          position={[x, 0.5, 2.2]}
          color="#FFE9C4"
          intensity={1.2}
          distance={9}
          decay={1.8}
        />
      ))}

      {/* Exhaust glow */}
      <mesh position={[0, 0.05, -2.5]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
