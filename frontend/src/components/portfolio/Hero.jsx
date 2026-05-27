import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Stylized cinematic hero — procedural humanoid silhouette.
 * Generic, anonymous. Rim-lit, faceless. No real-actor likeness.
 */
export default function Hero({ position = [0, 0, 0], rotationY = 0 }) {
  const group = useRef();
  const idle = useRef(0);

  useFrame((_, dt) => {
    idle.current += dt;
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(idle.current * 1.1) * 0.025;
    group.current.rotation.y = rotationY + Math.sin(idle.current * 0.4) * 0.03;
  });

  // shared materials
  const skin = new THREE.MeshStandardMaterial({
    color: "#1a1a1d",
    roughness: 0.7,
    metalness: 0.1,
    emissive: "#FF5A1F",
    emissiveIntensity: 0.04,
  });
  const coat = new THREE.MeshStandardMaterial({
    color: "#0d0d10",
    roughness: 0.55,
    metalness: 0.25,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: "#2a2a30",
    roughness: 0.4,
    metalness: 0.6,
  });

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      {/* Long coat / body — broad shoulders, slim waist */}
      <mesh position={[0, 1.05, 0]} material={coat} castShadow>
        <cylinderGeometry args={[0.42, 0.28, 1.5, 14, 1]} />
      </mesh>
      {/* Shoulder cap */}
      <mesh position={[0, 1.72, 0]} material={trim} castShadow>
        <sphereGeometry args={[0.46, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.86, 0]} material={skin}>
        <cylinderGeometry args={[0.1, 0.12, 0.14, 10]} />
      </mesh>

      {/* Head — featureless oval */}
      <mesh position={[0, 2.06, 0]} material={skin} castShadow>
        <sphereGeometry args={[0.22, 22, 18]} />
      </mesh>

      {/* Subtle hair cap */}
      <mesh position={[0, 2.15, -0.02]} material={coat}>
        <sphereGeometry args={[0.225, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.45, 1.55, 0]} rotation={[0, 0, 0.08]}>
        <mesh material={coat} position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.55, 6, 12]} />
        </mesh>
        <mesh material={skin} position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.1, 12, 10]} />
        </mesh>
      </group>

      {/* Right arm */}
      <group position={[0.45, 1.55, 0]} rotation={[0, 0, -0.08]}>
        <mesh material={coat} position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.55, 6, 12]} />
        </mesh>
        <mesh material={skin} position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.1, 12, 10]} />
        </mesh>
      </group>

      {/* Hips */}
      <mesh position={[0, 0.35, 0]} material={coat}>
        <boxGeometry args={[0.5, 0.2, 0.32]} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.15, 0]} material={coat} castShadow>
        <capsuleGeometry args={[0.13, 0.7, 6, 12]} />
      </mesh>
      <mesh position={[0.15, -0.15, 0]} material={coat} castShadow>
        <capsuleGeometry args={[0.13, 0.7, 6, 12]} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.15, -0.62, 0.05]} material={trim}>
        <boxGeometry args={[0.18, 0.08, 0.3]} />
      </mesh>
      <mesh position={[0.15, -0.62, 0.05]} material={trim}>
        <boxGeometry args={[0.18, 0.08, 0.3]} />
      </mesh>

      {/* Rim halo — emissive ring behind for cinematic backlight */}
      <mesh position={[0, 1.2, -0.55]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
