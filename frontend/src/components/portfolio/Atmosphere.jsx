import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Seeded PRNG so the skyline is deterministic across renders.
 */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cinematic background atmosphere:
 *  - big glowing moon
 *  - layered city skyline of "real" buildings (boxes with window grids drawn
 *    as InstancedMesh on their facing side)
 *  - subtle haze planes for horizon
 */
export default function Atmosphere() {
  // Build skyline data
  const data = useMemo(() => {
    const rnd = mulberry32(7);
    const ringR = 55;
    const buildings = [];
    const windowDots = []; // small instanced points on facing side
    const count = 90;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.04;
      const layer = i % 3; // 3 depth layers for parallax feel
      const rOff = layer * 6 + rnd() * 4;
      const x = Math.cos(a) * (ringR + rOff);
      const z = Math.sin(a) * (ringR + rOff);
      const w = 2.6 + rnd() * 3.2;
      const h = 6 + rnd() * 22;
      const d = 2.2 + rnd() * 3;
      const lit = rnd() < 0.6;
      buildings.push({ x, z, w, h, d, lit, angle: a });

      // Generate window grid for lit buildings facing the center
      if (lit) {
        const cols = Math.max(2, Math.floor(w / 0.55));
        const rows = Math.max(3, Math.floor(h / 1.2));
        const stepX = w / (cols + 1);
        const stepY = h / (rows + 1);
        // facing direction: from building toward origin
        const fx = -Math.cos(a);
        const fz = -Math.sin(a);
        // right vector perpendicular to facing
        const rx = -fz;
        const rz = fx;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            if (rnd() > 0.55) continue; // sparse windows
            const offX = (cx + 1) * stepX - w / 2;
            const wy = -0.7 + (cy + 1) * stepY;
            const wx = x + rx * offX + fx * (d / 2 + 0.02);
            const wz = z + rz * offX + fz * (d / 2 + 0.02);
            const warm = rnd() < 0.7;
            windowDots.push({
              x: wx,
              y: wy,
              z: wz,
              color: warm ? "#FFE0A8" : "#A0C0FF",
              size: 0.16 + rnd() * 0.1,
            });
          }
        }
      }
    }
    return { buildings, windowDots };
  }, []);

  return (
    <group>
      {/* Big moon — flat emissive disc */}
      <group position={[-42, 32, -58]}>
        <mesh>
          <sphereGeometry args={[7, 36, 36]} />
          <meshBasicMaterial color="#F4EFE0" />
        </mesh>
        <mesh>
          <sphereGeometry args={[9, 36, 36]} />
          <meshBasicMaterial color="#F4EFE0" transparent opacity={0.16} />
        </mesh>
        <mesh>
          <sphereGeometry args={[12, 36, 36]} />
          <meshBasicMaterial color="#F4EFE0" transparent opacity={0.05} />
        </mesh>
        <pointLight color="#B8C8E8" intensity={0.5} distance={140} decay={1.0} />
      </group>

      {/* Buildings — boxes with subtle blue-tinted faces */}
      {data.buildings.map((b, i) => (
        <mesh key={`b-${i}`} position={[b.x, b.h / 2 - 0.7, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color="#0c1220"
            roughness={0.9}
            metalness={0.0}
            emissive={b.lit ? "#13223a" : "#000000"}
            emissiveIntensity={b.lit ? 0.55 : 0}
          />
        </mesh>
      ))}

      {/* Window dots — tiny emissive squares on building facing surfaces */}
      {data.windowDots.map((w, i) => (
        <mesh key={`w-${i}`} position={[w.x, w.y, w.z]}>
          <planeGeometry args={[w.size, w.size * 1.3]} />
          <meshBasicMaterial color={w.color} transparent opacity={0.92} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* A few aviation rooftop blinkers — bigger red points on the tallest layer */}
      {data.buildings
        .filter((b) => b.h > 22)
        .slice(0, 6)
        .map((b, i) => (
          <mesh key={`av-${i}`} position={[b.x, b.h - 0.5, b.z]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial color="#FF3030" />
          </mesh>
        ))}

      {/* Soft haze layers to fade the horizon */}
      <mesh position={[0, 10, -80]}>
        <planeGeometry args={[280, 60]} />
        <meshBasicMaterial color="#162038" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 22, -90]}>
        <planeGeometry args={[280, 80]} />
        <meshBasicMaterial color="#0a1224" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
