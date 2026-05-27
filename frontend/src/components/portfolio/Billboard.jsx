import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";

/**
 * Billboard — large emissive panel with a screenshot of the live site.
 * Uses pre-baked local screenshots shipped from /public/billboards/{id}.jpg.
 */
export default function Billboard({
  position,
  rotationY,
  index,
  title,
  accent = "#FF5A1F",
  active = false,
  screenshot,
}) {
  const matRef = useRef();

  // Always load — `useLoader` suspends until the texture is ready.
  const tex = useLoader(THREE.TextureLoader, screenshot || "/billboards/mla.jpg");

  React.useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
  }, [tex]);

  useFrame((state) => {
    // intentionally no-op: meshBasicMaterial has no emissive; brightness is constant.
    // Kept for future hook-points.
    void state;
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
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[w + 0.18, h + 0.18, 0.08]} />
        <meshStandardMaterial color="#0c0c0e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* screen — the texture is shown unlit so the actual website pixels
          render at full brightness instead of being darkened by scene lighting. */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          ref={matRef}
          map={tex}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>

      {/* number badge ABOVE */}
      <Text
        position={[-w / 2 + 0.35, h / 2 + 0.2, 0]}
        fontSize={0.22}
        color={accent}
        anchorX="left"
        anchorY="bottom"
        outlineWidth={0.008}
        outlineColor="#000"
      >
        {`0${index + 1} / 04`}
      </Text>

      {/* LIVE tag */}
      <Text
        position={[w / 2 - 0.35, h / 2 + 0.2, 0]}
        fontSize={0.18}
        color="#FFFF69"
        anchorX="right"
        anchorY="bottom"
        outlineWidth={0.008}
        outlineColor="#000"
      >
        ● LIVE
      </Text>

      {/* title BELOW */}
      <Text
        position={[0, -h / 2 - 0.25, 0]}
        fontSize={0.22}
        color="#ECECEC"
        anchorX="center"
        anchorY="top"
        maxWidth={w - 0.4}
        outlineWidth={0.008}
        outlineColor="#000"
      >
        {title.toUpperCase()}
      </Text>

      <pointLight
        position={[0, -1.4, 0.4]}
        color={accent}
        intensity={active ? 1.4 : 0.5}
        distance={4}
        decay={2}
      />
    </group>
  );
}
