import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

/**
 * Billboard — large emissive panel with project headline.
 * Faces inward toward the man at center.
 */
export default function Billboard({
  position,
  rotationY,
  index,
  title,
  accent = "#FF5A1F",
  active = false,
}) {
  const matRef = useRef();
  const frameRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.emissiveIntensity = active
        ? 0.9 + Math.sin(t * 3.5) * 0.1
        : 0.18 + Math.sin(t * 1.4 + index) * 0.06;
    }
  });

  const w = 4.2;
  const h = 2.6;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* posts */}
      <mesh position={[-w / 2 + 0.2, -1.5, 0]}>
        <boxGeometry args={[0.12, 3, 0.12]} />
        <meshStandardMaterial color="#16171b" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[w / 2 - 0.2, -1.5, 0]}>
        <boxGeometry args={[0.12, 3, 0.12]} />
        <meshStandardMaterial color="#16171b" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* frame */}
      <mesh ref={frameRef} position={[0, 0, -0.04]}>
        <boxGeometry args={[w + 0.18, h + 0.18, 0.08]} />
        <meshStandardMaterial color="#0c0c0e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* screen */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={matRef}
          color="#0a0a0b"
          emissive={accent}
          emissiveIntensity={0.2}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* number badge */}
      <Text
        position={[-w / 2 + 0.4, h / 2 - 0.35, 0.01]}
        fontSize={0.22}
        color={accent}
        anchorX="left"
        anchorY="top"
        outlineWidth={0.005}
        outlineColor="#000"
      >
        {`0${index + 1} / 04`}
      </Text>

      {/* LIVE tag */}
      <Text
        position={[w / 2 - 0.4, h / 2 - 0.35, 0.01]}
        fontSize={0.18}
        color="#FFFF69"
        anchorX="right"
        anchorY="top"
        outlineWidth={0.005}
        outlineColor="#000"
      >
        LIVE ◉
      </Text>

      {/* title */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.46}
        color="#ECECEC"
        anchorX="center"
        anchorY="middle"
        maxWidth={w - 0.6}
        textAlign="center"
        outlineWidth={0.01}
        outlineColor="#000"
      >
        {title.toUpperCase()}
      </Text>

      {/* tagline */}
      <Text
        position={[0, -h / 2 + 0.35, 0.01]}
        fontSize={0.14}
        color="#9A9A9A"
        anchorX="center"
        anchorY="bottom"
        maxWidth={w - 0.6}
      >
        tap to view live preview
      </Text>

      {/* underlight (cast on ground) */}
      <pointLight position={[0, -1.4, 0.4]} color={accent} intensity={active ? 3 : 1} distance={4} decay={2} />
    </group>
  );
}
