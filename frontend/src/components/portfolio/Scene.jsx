import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Arena from "./Arena";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import { usePortfolio } from "../../store/usePortfolio";

export default function Scene() {
  const dragRef = useRef({ active: false, x: 0, last: 0 });
  const [rot, setRot] = useState(0);
  const inertia = useRef(0);
  const { reducedMotion, quality } = usePortfolio();

  useEffect(() => {
    if (reducedMotion) return; // no auto-rotate, no inertia loop
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
        setRot((r) => r + dt * 0.12);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

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

  // Quality tier → DPR cap (1.5 max on high for performance — was 2.0)
  const dpr = quality === "low" ? [1, 1.1] : quality === "mid" ? [1, 1.35] : [1, 1.5];

  return (
    <Canvas
      shadows={quality !== "low"}
      dpr={dpr}
      gl={{ antialias: quality !== "low", alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.4, 7.5], fov: 38, near: 0.1, far: 200 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      data-testid="portfolio-canvas"
    >
      <color attach="background" args={["#070912"]} />
      <fog attach="fog" args={["#0c1224", 16, 90]} />

      <ambientLight intensity={0.32} color="#2a3550" />
      <directionalLight position={[-12, 18, -14]} intensity={0.55} color="#A8C0FF" />

      <Suspense fallback={null}>
        <Arena heroRotationY={rot} />
        {quality !== "low" && <Effects quality={quality} />}
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
