import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Arena from "./Arena";
import CameraRig from "./CameraRig";
import Effects from "./Effects";

export default function Scene() {
  const dragRef = useRef({ active: false, x: 0, last: 0 });
  const [rot, setRot] = useState(0);
  const inertia = useRef(0);
  const idleAngle = useRef(0);

  useEffect(() => {
    let raf;
    let lastT = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (Math.abs(inertia.current) > 0.0005) {
        setRot((r) => r + inertia.current);
        inertia.current *= 0.92;
      } else if (!dragRef.current.active) {
        idleAngle.current += dt * 0.12;
        setRot((r) => r + dt * 0.12);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = (e) => {
    dragRef.current.active = true;
    dragRef.current.x = e.clientX;
    dragRef.current.last = e.clientX;
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.last;
    dragRef.current.last = e.clientX;
    setRot((r) => r + dx * 0.008);
    inertia.current = dx * 0.008;
  };
  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 2.4, 7.5], fov: 38, near: 0.1, far: 200 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      data-testid="portfolio-canvas"
    >
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 8, 60]} />

      {/* base ambient (very dark) */}
      <ambientLight intensity={0.18} color="#1a1f2c" />
      {/* moon backlight */}
      <directionalLight position={[-8, 12, -10]} intensity={0.35} color="#7aa0ff" />

      <Suspense fallback={null}>
        <Arena heroRotationY={rot} />
        <Effects />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
