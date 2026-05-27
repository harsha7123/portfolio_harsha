import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";

/**
 * Billboard with a live screenshot texture (via thum.io).
 * Falls back gracefully to colored emissive panel if texture fails.
 */

const TextureLoader = THREE.TextureLoader;

function useScreenshotTexture(url) {
  const [tex, setTex] = useState(null);
  React.useEffect(() => {
    if (!url) return;
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    const shotUrl = `https://image.thum.io/get/width/1200/crop/750/noanimate/${url}`;
    loader.load(
      shotUrl,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        setTex(t);
      },
      undefined,
      () => setTex(null)
    );
  }, [url]);
  return tex;
}

export default function Billboard({
  position,
  rotationY,
  index,
  title,
  accent = "#FF5A1F",
  active = false,
  url,
}) {
  const matRef = useRef();
  const tex = useScreenshotTexture(url);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.emissiveIntensity = active
        ? 0.8 + Math.sin(t * 3.5) * 0.1
        : 0.32 + Math.sin(t * 1.4 + index) * 0.06;
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
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[w + 0.18, h + 0.18, 0.08]} />
        <meshStandardMaterial color="#0c0c0e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* screen — uses screenshot texture when available */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={matRef}
          map={tex || undefined}
          color={tex ? "#ffffff" : "#0a0a0b"}
          emissive={tex ? "#FFFFFF" : accent}
          emissiveMap={tex || undefined}
          emissiveIntensity={tex ? 0.5 : 0.2}
          metalness={0.05}
          roughness={0.7}
          toneMapped={!tex}
        />
      </mesh>

      {/* number badge */}
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

      {/* title underneath */}
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

      <pointLight position={[0, -1.4, 0.4]} color={accent} intensity={active ? 3 : 1.2} distance={4.5} decay={2} />
    </group>
  );
}
