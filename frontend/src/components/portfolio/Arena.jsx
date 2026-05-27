import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import Hero from "./Hero";
import Car from "./Car";
import Billboard from "./Billboard";
import Embers from "./Embers";
import { usePortfolio } from "../../store/usePortfolio";
import { PROJECTS_FALLBACK } from "../../content/portfolio";

const RING_RADIUS = 6.5;

export default function Arena({ heroRotationY }) {
  const carRef = useRef();
  const guidedAngle = useRef(0);
  const targetAngle = useRef(0);
  const {
    activeSection,
    carRingIndex,
    panelOpen,
    reducedMotion,
    freeDrive,
    carAngle,
    setCarAngle,
    carVelocity,
    setCarVelocity,
    setRingIndex,
  } = usePortfolio();

  useEffect(() => {
    targetAngle.current = (carRingIndex / 4) * Math.PI * 2;
  }, [carRingIndex]);

  // Keyboard control for free-drive (WASD / Arrows)
  useEffect(() => {
    if (!freeDrive || activeSection !== "work") return;
    const keys = { a: false, d: false, w: false, s: false };
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") keys.a = true;
      if (k === "d" || k === "arrowright") keys.d = true;
      if (k === "w" || k === "arrowup") keys.w = true;
      if (k === "s" || k === "arrowdown") keys.s = true;
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") keys.a = false;
      if (k === "d" || k === "arrowright") keys.d = false;
      if (k === "w" || k === "arrowup") keys.w = false;
      if (k === "s" || k === "arrowdown") keys.s = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let raf;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let v = usePortfolio.getState().carVelocity;
      // accel/brake
      if (keys.w) v += 1.6 * dt;
      else if (keys.s) v -= 1.6 * dt;
      else v *= 0.94; // friction
      // steering (changes angle directly proportional to velocity)
      let steer = 0;
      if (keys.a) steer = -1;
      else if (keys.d) steer = 1;
      v = Math.max(-1.6, Math.min(1.6, v));
      setCarVelocity(v);
      const a = usePortfolio.getState().carAngle + (v + steer * 0.4) * dt;
      setCarAngle(a);
      // sync nearest station for HUD
      const norm = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const nearest = Math.round((norm / (Math.PI * 2)) * 4) % 4;
      if (usePortfolio.getState().carRingIndex !== nearest) setRingIndex(nearest);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      cancelAnimationFrame(raf);
    };
  }, [freeDrive, activeSection, setCarAngle, setCarVelocity, setRingIndex]);

  useFrame((state, dt) => {
    if (!carRef.current) return;
    const t = state.clock.elapsedTime;

    let a;
    if (freeDrive && activeSection === "work") {
      a = carAngle;
    } else if (activeSection === "home" && !reducedMotion) {
      guidedAngle.current += dt * 0.55;  // faster orbit per user request
      a = guidedAngle.current;
    } else if (activeSection === "work") {
      if (!panelOpen) {
        const diff = targetAngle.current - guidedAngle.current;
        guidedAngle.current += diff * Math.min(1, dt * (reducedMotion ? 8 : 1.8));
      } else {
        const diff = targetAngle.current - guidedAngle.current;
        guidedAngle.current += diff * Math.min(1, dt * (reducedMotion ? 8 : 3));
      }
      a = guidedAngle.current;
    } else {
      const diff = Math.PI - guidedAngle.current;
      guidedAngle.current += diff * Math.min(1, dt * (reducedMotion ? 8 : 1.2));
      a = guidedAngle.current;
    }

    const x = Math.cos(a) * RING_RADIUS;
    const z = Math.sin(a) * RING_RADIUS;
    carRef.current.position.set(x, 0, z);
    // Face the hero in the centre (turn the car's front toward origin).
    // The car model's "forward" is +Z, and we want it pointing toward -direction-from-origin.
    carRef.current.rotation.y = Math.atan2(-x, -z);
    carRef.current.position.y = reducedMotion ? 0 : Math.sin(t * 4) * 0.01;
  });

  const billboardPositions = useMemo(() => {
    return PROJECTS_FALLBACK.map((p, i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const r = 15.5;  // billboards stay outside on a wider ring
      return {
        ...p,
        position: [Math.cos(a) * r, 2.2, Math.sin(a) * r],
        rotationY: -a + Math.PI / 2 + Math.PI,
      };
    });
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#0a0a0b" metalness={0.55} roughness={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]}>
        <ringGeometry args={[RING_RADIUS - 1.4, RING_RADIUS + 1.4, 96]} />
        <meshStandardMaterial color="#111114" metalness={0.8} roughness={0.25} emissive="#0a0a0b" />
      </mesh>

      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2;
        const x = Math.cos(a) * RING_RADIUS;
        const z = Math.sin(a) * RING_RADIUS;
        return (
          <mesh key={i} position={[x, -0.66, z]} rotation={[-Math.PI / 2, 0, -a]}>
            <planeGeometry args={[0.5, 0.08]} />
            <meshBasicMaterial color="#FFE9C4" transparent opacity={0.35} />
          </mesh>
        );
      })}

      <ContactShadows position={[0, -0.69, 0]} opacity={0.65} scale={6} blur={2.4} far={4} color="#000" />

      <Hero position={[0, 0, 0]} rotationY={heroRotationY} />

      {/* Scene-wide low fill light only (Hero owns its dedicated key/fill/rim) */}
      <pointLight position={[0, 6, 0]} color="#3a4658" intensity={0.6} distance={30} decay={1.4} />

      <Car groupRef={carRef} />

      {billboardPositions.map((p, i) => (
        <Billboard
          key={p.id}
          position={p.position}
          rotationY={p.rotationY}
          index={i}
          title={p.title}
          accent={p.accent}
          url={p.url}
          active={activeSection === "work" && carRingIndex === i}
        />
      ))}

      <Embers count={70} radius={14} />

      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 38 + (i % 3) * 4;
        return (
          <mesh key={`bo-${i}`} position={[Math.cos(a) * r, 1 + (i % 4) * 1.5, Math.sin(a) * r]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color={i % 2 ? "#FF8A3D" : "#FFE9C4"} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
