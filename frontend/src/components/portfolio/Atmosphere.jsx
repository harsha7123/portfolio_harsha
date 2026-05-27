import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Cinematic background atmosphere:
 *  - big glowing moon
 *  - distant city skyline silhouette
 *  - far-off window lights
 *  - subtle radial sky gradient
 */
export default function Atmosphere() {
  const skyline = useMemo(() => {
    // Generate ~80 randomly-shaped tall boxes on a far ring as a silhouette.
    const arr = [];
    const ringR = 60;
    for (let i = 0; i < 84; i++) {
      const a = (i / 84) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.16;
      const x = Math.cos(a + jitter) * (ringR + Math.random() * 10);
      const z = Math.sin(a + jitter) * (ringR + Math.random() * 10);
      const w = 2 + Math.random() * 3.2;
      const h = 4 + Math.random() * 14;
      const d = 2 + Math.random() * 3;
      arr.push({ x, z, w, h, d, lit: Math.random() < 0.55 });
    }
    return arr;
  }, []);

  const windows = useMemo(() => {
    // Small bright window-light points scattered on skyline boxes
    const arr = [];
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      const r = 60 + Math.random() * 8;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = 1 + Math.random() * 14;
      const warm = Math.random() < 0.65;
      arr.push({ x, y, z, c: warm ? "#FFE9C4" : "#9FBFFF" });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Big moon — flat emissive disc, slightly above horizon */}
      <group position={[-40, 30, -55]}>
        <mesh>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color="#F6F0E0" />
        </mesh>
        {/* halo glow */}
        <mesh>
          <sphereGeometry args={[7.6, 32, 32]} />
          <meshBasicMaterial color="#F6F0E0" transparent opacity={0.18} />
        </mesh>
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial color="#F6F0E0" transparent opacity={0.06} />
        </mesh>
        <pointLight color="#B8C8E8" intensity={0.45} distance={120} decay={1.0} />
      </group>

      {/* Skyline silhouette */}
      {skyline.map((b, i) => (
        <mesh key={`sk-${i}`} position={[b.x, b.h / 2 - 0.7, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color="#0a0d14"
            roughness={0.85}
            metalness={0.0}
            emissive={b.lit ? "#1a2538" : "#000000"}
            emissiveIntensity={b.lit ? 0.45 : 0}
          />
        </mesh>
      ))}

      {/* Distant window lights (small bright dots scattered on skyline) */}
      {windows.map((w, i) => (
        <mesh key={`win-${i}`} position={[w.x, w.y, w.z]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshBasicMaterial color={w.c} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Subtle haze plane behind everything to soften the horizon */}
      <mesh position={[0, 8, -80]}>
        <planeGeometry args={[260, 50]} />
        <meshBasicMaterial color="#1a2235" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 18, -85]}>
        <planeGeometry args={[260, 60]} />
        <meshBasicMaterial color="#0d1320" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
