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

const RING_RADIUS = 11;

export default function Arena({ heroRotationY }) {
  const carRef = useRef();
  const carAngle = useRef(0);
  const targetAngle = useRef(0);
  const { activeSection, carRingIndex, panelOpen } = usePortfolio();

  // Compute target angle from ring index
  useEffect(() => {
    targetAngle.current = (carRingIndex / 4) * Math.PI * 2;
  }, [carRingIndex]);

  useFrame((state, dt) => {
    if (!carRef.current) return;
    const t = state.clock.elapsedTime;

    if (activeSection === "home") {
      // Slow ambient orbit on home
      carAngle.current += dt * 0.18;
    } else if (activeSection === "work") {
      // Ease to target angle (snap to billboard)
      if (!panelOpen) {
        // small idle drift toward target
        const diff = targetAngle.current - carAngle.current;
        carAngle.current += diff * Math.min(1, dt * 1.8);
      } else {
        const diff = targetAngle.current - carAngle.current;
        carAngle.current += diff * Math.min(1, dt * 3);
      }
    } else {
      // Contact — car drifts to back
      const diff = Math.PI - carAngle.current;
      carAngle.current += diff * Math.min(1, dt * 1.2);
    }

    const a = carAngle.current;
    const x = Math.cos(a) * RING_RADIUS;
    const z = Math.sin(a) * RING_RADIUS;
    carRef.current.position.set(x, 0, z);
    // face tangent (forward along ring)
    carRef.current.rotation.y = -a + Math.PI / 2;

    // subtle bobbing
    carRef.current.position.y = Math.sin(t * 4) * 0.01;
  });

  // billboards placed every 90°, offset by 45° so they don't overlap car start
  const billboardPositions = useMemo(() => {
    return PROJECTS_FALLBACK.map((p, i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const r = RING_RADIUS + 4.5;
      return {
        ...p,
        position: [Math.cos(a) * r, 2.2, Math.sin(a) * r],
        rotationY: -a + Math.PI / 2 + Math.PI, // face inward
      };
    });
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial
          color="#0a0a0b"
          metalness={0.55}
          roughness={0.6}
        />
      </mesh>

      {/* wet asphalt ring road (visual cue) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]}>
        <ringGeometry args={[RING_RADIUS - 1.4, RING_RADIUS + 1.4, 96]} />
        <meshStandardMaterial
          color="#111114"
          metalness={0.8}
          roughness={0.25}
          emissive="#0a0a0b"
        />
      </mesh>

      {/* dashed road markings */}
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

      {/* contact soft shadow under hero */}
      <ContactShadows
        position={[0, -0.69, 0]}
        opacity={0.65}
        scale={6}
        blur={2.4}
        far={4}
        color="#000"
      />

      {/* HERO */}
      <Hero position={[0, 0, 0]} rotationY={heroRotationY} />

      {/* key light on hero */}
      <spotLight
        position={[3, 6, 3]}
        angle={0.45}
        penumbra={0.6}
        intensity={3}
        color="#FFD9A8"
        castShadow
        target-position={[0, 1, 0]}
      />
      {/* cool rim light from behind */}
      <spotLight
        position={[-2, 4, -5]}
        angle={0.5}
        penumbra={0.7}
        intensity={2.2}
        color="#5C7FFF"
        target-position={[0, 1, 0]}
      />
      {/* ember underlight */}
      <pointLight position={[0, 0.4, 1.6]} color="#FF5A1F" intensity={1.4} distance={6} decay={2} />

      {/* CAR */}
      <Car groupRef={carRef} />

      {/* BILLBOARDS */}
      {billboardPositions.map((p, i) => (
        <Billboard
          key={p.id}
          position={p.position}
          rotationY={p.rotationY}
          index={i}
          title={p.title}
          accent={p.accent}
          active={activeSection === "work" && carRingIndex === i}
        />
      ))}

      {/* Embers */}
      <Embers count={70} radius={14} />

      {/* faint city bokeh — large dim point lights at far distance */}
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
