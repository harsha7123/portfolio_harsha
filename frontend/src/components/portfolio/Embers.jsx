import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/** Instanced ember particles drifting upward. */
export default function Embers({ count = 80, radius = 12 }) {
  const mesh = useRef();
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * radius * 2,
        y: Math.random() * 6,
        z: (Math.random() - 0.5) * radius * 2,
        speed: 0.2 + Math.random() * 0.6,
        sway: Math.random() * Math.PI * 2,
        scale: 0.03 + Math.random() * 0.05,
      });
    }
    return arr;
  }, [count, radius]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((p, i) => {
      p.y += p.speed * 0.02;
      if (p.y > 6) {
        p.y = 0;
        p.x = (Math.random() - 0.5) * radius * 2;
        p.z = (Math.random() - 0.5) * radius * 2;
      }
      dummy.position.set(
        p.x + Math.sin(t * 0.6 + p.sway) * 0.4,
        p.y,
        p.z + Math.cos(t * 0.4 + p.sway) * 0.4
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#FF8A3D" transparent opacity={0.85} />
    </instancedMesh>
  );
}
