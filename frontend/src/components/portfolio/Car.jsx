import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural stylized muscle car — black, low-slung, headlights cutting fog.
 */
export default function Car({ groupRef }) {
  const wheelsRef = useRef([]);
  useFrame((_, dt) => {
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x -= dt * 4;
    });
  });

  const body = new THREE.MeshStandardMaterial({
    color: "#08080a",
    metalness: 0.85,
    roughness: 0.25,
    envMapIntensity: 0.6,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: "#101216",
    metalness: 0.9,
    roughness: 0.05,
    transparent: true,
    opacity: 0.85,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: "#cfd4d8",
    metalness: 1,
    roughness: 0.2,
  });
  const tyre = new THREE.MeshStandardMaterial({
    color: "#0a0a0a",
    roughness: 0.95,
    metalness: 0.0,
  });

  const wheelGroup = (pos, key) => (
    <group key={key} position={pos}>
      <mesh
        ref={(el) => (wheelsRef.current[key] = el)}
        rotation={[0, 0, Math.PI / 2]}
        material={tyre}
      >
        <cylinderGeometry args={[0.32, 0.32, 0.22, 22]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={chrome}>
        <cylinderGeometry args={[0.18, 0.18, 0.24, 18]} />
      </mesh>
    </group>
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Chassis */}
      <mesh position={[0, 0.45, 0]} material={body} castShadow>
        <boxGeometry args={[2.3, 0.4, 4.4]} />
      </mesh>
      {/* Hood (front) */}
      <mesh position={[0, 0.55, 1.4]} material={body}>
        <boxGeometry args={[2.1, 0.18, 1.4]} />
      </mesh>
      {/* Trunk (rear) */}
      <mesh position={[0, 0.55, -1.5]} material={body}>
        <boxGeometry args={[2.1, 0.18, 1.2]} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.85, -0.05]} material={body}>
        <boxGeometry args={[1.9, 0.5, 1.8]} />
      </mesh>
      {/* Windshield (front-slope) */}
      <mesh position={[0, 0.85, 0.85]} rotation={[Math.PI * 0.18, 0, 0]} material={glass}>
        <boxGeometry args={[1.85, 0.55, 0.08]} />
      </mesh>
      {/* Rear glass */}
      <mesh position={[0, 0.85, -0.95]} rotation={[-Math.PI * 0.2, 0, 0]} material={glass}>
        <boxGeometry args={[1.85, 0.5, 0.08]} />
      </mesh>
      {/* Side glass L/R */}
      <mesh position={[-0.95, 0.95, -0.05]} material={glass}>
        <boxGeometry args={[0.04, 0.35, 1.6]} />
      </mesh>
      <mesh position={[0.95, 0.95, -0.05]} material={glass}>
        <boxGeometry args={[0.04, 0.35, 1.6]} />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.45, 2.15]} material={chrome}>
        <boxGeometry args={[1.85, 0.22, 0.06]} />
      </mesh>

      {/* Headlights (emissive) + cone */}
      {[-0.7, 0.7].map((x, i) => (
        <group key={`hl-${i}`} position={[x, 0.5, 2.18]}>
          <mesh>
            <sphereGeometry args={[0.11, 14, 12]} />
            <meshBasicMaterial color="#FFE9C4" />
          </mesh>
          <pointLight color="#FFE9C4" intensity={2.4} distance={9} decay={1.8} />
          {/* fake volumetric cone */}
          <mesh position={[0, -0.05, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.9, 3.2, 22, 1, true]} />
            <meshBasicMaterial
              color="#FFE9C4"
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Tail lights */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, 0.5, -2.18]}>
          <boxGeometry args={[0.4, 0.12, 0.04]} />
          <meshBasicMaterial color="#FF2A2A" />
        </mesh>
      ))}

      {/* Exhaust glow under rear */}
      <mesh position={[0, 0.2, -2.25]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.5} />
      </mesh>

      {/* Wheels */}
      {wheelGroup([-0.95, 0.32, 1.4], 0)}
      {wheelGroup([0.95, 0.32, 1.4], 1)}
      {wheelGroup([-0.95, 0.32, -1.4], 2)}
      {wheelGroup([0.95, 0.32, -1.4], 3)}
    </group>
  );
}
