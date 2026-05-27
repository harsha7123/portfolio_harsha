import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

/**
 * Billboard — large emissive panel with a screenshot of the live site.
 * Uses WordPress mshots (free, no key) for reliable screenshots,
 * with a thum.io fallback if mshots fails.
 */

function screenshotUrls(url) {
  // thum.io is faster and serves cached snapshots reliably for these sites;
  // mshots is fallback (it returns a generating-placeholder on first hit).
  const enc = encodeURIComponent(url);
  return [
    `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`,
    `https://s0.wp.com/mshots/v1/${enc}?w=1280&h=800`,
  ];
}

function useScreenshotTexture(url) {
  const [tex, setTex] = useState(null);
  React.useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const urls = screenshotUrls(url);

    function tryAt(idx) {
      if (cancelled || idx >= urls.length) return;
      loader.load(
        urls[idx],
        (t) => {
          if (cancelled) return;
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          setTex(t);
        },
        undefined,
        () => tryAt(idx + 1)
      );
    }
    tryAt(0);
    return () => {
      cancelled = true;
    };
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
    if (matRef.current && !tex) {
      // Subtle pulse only when no image is loaded
      matRef.current.emissiveIntensity = active
        ? 0.55 + Math.sin(t * 3.5) * 0.1
        : 0.22 + Math.sin(t * 1.4 + index) * 0.04;
    } else if (matRef.current && tex) {
      // Keep texture readable, no pulsing
      matRef.current.emissiveIntensity = active ? 0.35 : 0.18;
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

      {/* screen — texture if loaded, accent-emissive panel otherwise */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={matRef}
          map={tex || undefined}
          color={tex ? "#ffffff" : "#0c0c10"}
          emissive={tex ? "#ffffff" : accent}
          emissiveMap={tex || undefined}
          emissiveIntensity={tex ? 0.35 : 0.45}
          metalness={0.0}
          roughness={0.75}
          toneMapped={!!tex}
        />
      </mesh>

      {/* number badge ABOVE the screen so it doesn't blanket the image */}
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

      {/* LIVE tag ABOVE */}
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
        intensity={active ? 1.6 : 0.7}
        distance={4}
        decay={2}
      />
    </group>
  );
}
