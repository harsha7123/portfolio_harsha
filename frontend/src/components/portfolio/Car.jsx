import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const MODEL_URL = "/models/musclecar.glb";

/**
 * Classic muscle car — GLB model retexture-painted "Mustang red" with chrome trim
 * and emissive headlights. Wheels still spin via parented sub-groups.
 * (Source: Ferrari 308-style GLB from threejs.org — stylized stand-in for Ford
 * Mustang fastback silhouette. Swap MODEL_URL with a Mustang GLB if you have one.)
 */
export default function Car({ groupRef }) {
  const { scene } = useGLTF(MODEL_URL);
  const wheelsRef = useRef([]);

  // Clone + retexture
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    wheelsRef.current = [];

    c.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = false;
      obj.frustumCulled = false;

      const n = (obj.name || "").toLowerCase();
      const m = obj.material;

      // Body / paint surfaces → deep Mustang red
      if (
        n.includes("body") ||
        n.includes("paint") ||
        n.includes("ferrari") ||
        n.includes("hood") ||
        n.includes("trunk") ||
        n.includes("roof") ||
        n.includes("door") ||
        n.includes("car_paint")
      ) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#8a0a0a"),
          metalness: 0.85,
          roughness: 0.28,
          envMapIntensity: 1.0,
        });
      }
      // Glass
      else if (n.includes("glass") || n.includes("window")) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#0a0a0e"),
          metalness: 0.9,
          roughness: 0.05,
          transparent: true,
          opacity: 0.6,
        });
      }
      // Headlights → bright emissive
      else if (n.includes("headlight") || n.includes("front_light")) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FFE9C4"),
          emissive: new THREE.Color("#FFE9C4"),
          emissiveIntensity: 2.0,
          metalness: 0.4,
          roughness: 0.2,
        });
      }
      // Tail-lights
      else if (n.includes("taillight") || n.includes("brake")) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FF1A1A"),
          emissive: new THREE.Color("#FF1A1A"),
          emissiveIntensity: 1.4,
        });
      }
      // Wheels — register for spin
      else if (n.includes("wheel")) {
        wheelsRef.current.push(obj);
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#0a0a0a"),
          metalness: 0.5,
          roughness: 0.5,
        });
      }
      // Chrome / trim
      else if (n.includes("chrome") || n.includes("trim") || n.includes("bumper") || n.includes("grille")) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#cfd4d8"),
          metalness: 1.0,
          roughness: 0.18,
        });
      }
      // Tyre
      else if (n.includes("tyre") || n.includes("tire") || n.includes("rubber")) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#080808"),
          metalness: 0.0,
          roughness: 0.95,
        });
      }
      // Default → darker chassis tone (avoid white default)
      else {
        if (m && m.color) {
          // Darken whatever was there but keep tone
          const newMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#1a1a1d"),
            metalness: 0.4,
            roughness: 0.55,
          });
          obj.material = newMat;
        }
      }
    });

    // Scale + lift to sit on ground
    c.scale.setScalar(1.2);
    c.position.set(0, -0.7, 0);
    return c;
  }, [scene]);

  useFrame((_, dt) => {
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x -= dt * 4.5;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={cloned} />

      {/* Bright headlight pool + volumetric cone (faked) */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={`hl-${i}`} position={[x, 0.4, 2.0]}>
          <pointLight color="#FFE9C4" intensity={3.2} distance={11} decay={1.6} />
          <mesh position={[0, -0.05, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1.1, 3.6, 22, 1, true]} />
            <meshBasicMaterial
              color="#FFE9C4"
              transparent
              opacity={0.07}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Exhaust glow */}
      <mesh position={[0, 0.05, -2.3]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
