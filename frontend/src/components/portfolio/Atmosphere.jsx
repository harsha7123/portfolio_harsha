import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cinematic background — built with InstancedMesh for performance:
 *  - one InstancedMesh holds ALL skyline buildings
 *  - one InstancedMesh holds ALL window-dots
 *  - moon stays separate (single object)
 */
export default function Atmosphere() {
  const buildingsRef = useRef();
  const windowsRef = useRef();

  const { buildings, windows } = useMemo(() => {
    const rnd = mulberry32(7);
    const ringR = 55;
    const buildings = [];
    const windows = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.04;
      const layer = i % 2;
      const rOff = layer * 7 + rnd() * 4;
      const x = Math.cos(a) * (ringR + rOff);
      const z = Math.sin(a) * (ringR + rOff);
      const w = 2.8 + rnd() * 3.4;
      const h = 6 + rnd() * 20;
      const d = 2.2 + rnd() * 3;
      const lit = rnd() < 0.55;
      const isTall = h > 22;
      buildings.push({ x, z, w, h, d, lit, isTall, a });

      if (lit) {
        const cols = Math.max(2, Math.floor(w / 0.7));
        const rows = Math.max(3, Math.floor(h / 1.4));
        const stepX = w / (cols + 1);
        const stepY = h / (rows + 1);
        const fx = -Math.cos(a);
        const fz = -Math.sin(a);
        const rx = -fz;
        const rz = fx;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            if (rnd() > 0.4) continue;
            const offX = (cx + 1) * stepX - w / 2;
            const wy = -0.7 + (cy + 1) * stepY;
            const wx = x + rx * offX + fx * (d / 2 + 0.02);
            const wz = z + rz * offX + fz * (d / 2 + 0.02);
            const warm = rnd() < 0.7;
            windows.push({
              x: wx,
              y: wy,
              z: wz,
              warm,
              size: 0.18 + rnd() * 0.08,
              ay: Math.atan2(fx, fz),
            });
          }
        }
      }
    }
    return { buildings, windows };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Set per-instance matrices for buildings
  useLayoutEffect(() => {
    if (!buildingsRef.current) return;
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2 - 0.7, b.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      buildingsRef.current.setMatrixAt(i, dummy.matrix);
      // Per-instance colour
      const color = b.lit
        ? new THREE.Color("#13223a")
        : new THREE.Color("#070b14");
      if (buildingsRef.current.instanceColor) {
        buildingsRef.current.setColorAt(i, color);
      }
    });
    buildingsRef.current.instanceMatrix.needsUpdate = true;
    if (buildingsRef.current.instanceColor)
      buildingsRef.current.instanceColor.needsUpdate = true;
  }, [buildings, dummy]);

  // Window dots
  useLayoutEffect(() => {
    if (!windowsRef.current) return;
    windows.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z);
      dummy.rotation.set(0, w.ay, 0);
      dummy.scale.set(w.size, w.size * 1.3, 1);
      dummy.updateMatrix();
      windowsRef.current.setMatrixAt(i, dummy.matrix);
      const c = w.warm
        ? new THREE.Color("#FFE0A8")
        : new THREE.Color("#A0C0FF");
      if (windowsRef.current.instanceColor) {
        windowsRef.current.setColorAt(i, c);
      }
    });
    windowsRef.current.instanceMatrix.needsUpdate = true;
    if (windowsRef.current.instanceColor)
      windowsRef.current.instanceColor.needsUpdate = true;
  }, [windows, dummy]);

  const tallBuildings = useMemo(
    () => buildings.filter((b) => b.isTall).slice(0, 5),
    [buildings]
  );

  return (
    <group>
      {/* Moon */}
      <group position={[-42, 32, -58]}>
        <mesh>
          <sphereGeometry args={[7, 24, 24]} />
          <meshBasicMaterial color="#F4EFE0" />
        </mesh>
        <mesh>
          <sphereGeometry args={[9, 24, 24]} />
          <meshBasicMaterial color="#F4EFE0" transparent opacity={0.14} />
        </mesh>
        <pointLight color="#B8C8E8" intensity={0.45} distance={140} decay={1.0} />
      </group>

      {/* All buildings — single InstancedMesh */}
      <instancedMesh ref={buildingsRef} args={[null, null, buildings.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0c1220"
          roughness={0.9}
          metalness={0.0}
          emissive="#0a1426"
          emissiveIntensity={0.35}
          vertexColors={false}
        />
      </instancedMesh>

      {/* All window dots — single InstancedMesh */}
      <instancedMesh ref={windowsRef} args={[null, null, windows.length]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#FFE0A8" transparent opacity={0.92} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* A few aviation rooftop blinkers (cheap — just 5 spheres) */}
      {tallBuildings.map((b, i) => (
        <mesh key={`av-${i}`} position={[b.x, b.h - 0.5, b.z]}>
          <sphereGeometry args={[0.25, 6, 6]} />
          <meshBasicMaterial color="#FF3030" />
        </mesh>
      ))}

      {/* Horizon haze */}
      <mesh position={[0, 12, -82]}>
        <planeGeometry args={[280, 60]} />
        <meshBasicMaterial color="#162038" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}
