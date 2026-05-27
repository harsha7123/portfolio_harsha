import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolio } from "../../store/usePortfolio";

const MODEL_URL = "/models/soldier.glb";

/**
 * Cinematic stylized hero — Mixamo X-Bot mannequin (no military gear).
 * Repainted to dark coat + light skin so it reads as a clean leading-man
 * silhouette under cinematic lighting (OG-teaser cutout vibe).
 */
export default function Hero({ position = [0, 0, 0], rotationY = 0 }) {
  const group = useRef();
  const sceneRef = useRef();
  const { reducedMotion } = usePortfolio();
  const { scene, animations } = useGLTF(MODEL_URL);

  useEffect(() => {
    if (!scene) return;

    // Self-lit cinematic coat — slight emissive on the body itself so the
    // hero is readable on ANY device regardless of scene lighting falloff
    // (small phone viewports were rendering him near-black).
    scene.traverse((obj) => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        obj.castShadow = true;
        obj.receiveShadow = false;
        obj.frustumCulled = false;
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#544147"),
          metalness: 0.25,
          roughness: 0.55,
          emissive: new THREE.Color("#3a201c"),
          emissiveIntensity: 0.55,
        });
      }
    });

    scene.scale.setScalar(1.55);
    scene.position.set(0, -0.7, 0);
    scene.rotation.y = Math.PI;
  }, [scene]);

  const { actions, names } = useAnimations(animations, sceneRef);

  useEffect(() => {
    if (!actions || !names || names.length === 0) return;
    const idleName = names.find((n) => /idle/i.test(n)) || names[0];
    const idle = actions[idleName];
    if (idle) {
      idle.reset();
      idle.timeScale = reducedMotion ? 0 : 0.85;
      idle.fadeIn(0.4).play();
    }
    return () => {
      if (idle) idle.fadeOut(0.2).stop();
    };
  }, [actions, names, reducedMotion]);

  const t0 = useRef(0);
  useFrame((_, dt) => {
    t0.current += dt;
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.y = rotationY;
    } else {
      group.current.rotation.y = rotationY + Math.sin(t0.current * 0.35) * 0.02;
    }
  });

  return (
    <group ref={group} position={position} dispose={null}>
      <primitive ref={sceneRef} object={scene} />

      {/* Soft cinematic key from upper right */}
      <spotLight
        position={[2.2, 4.5, 3.5]}
        target-position={[0, 1.2, 0]}
        angle={0.6}
        penumbra={0.6}
        intensity={9}
        color="#FFD9A8"
        distance={20}
        decay={1.4}
      />
      {/* Gentle warm fill from front */}
      <spotLight
        position={[0, 3.2, 5.5]}
        target-position={[0, 1.4, 0]}
        angle={0.65}
        penumbra={0.7}
        intensity={6}
        color="#FFE9C4"
        distance={18}
        decay={1.5}
      />
      {/* Cool back-rim */}
      <spotLight
        position={[-3, 5, -3]}
        target-position={[0, 1.4, 0]}
        angle={0.55}
        penumbra={0.7}
        intensity={5}
        color="#8FB8FF"
        distance={18}
        decay={1.4}
      />
      {/* Soft ember underlight */}
      <pointLight position={[0, 0.4, 1.6]} color="#FF5A1F" intensity={1.4} distance={6} decay={2} />

      {/* Subtle cinematic rim halo — smaller, behind hero */}
      <mesh position={[0, 1.2, -0.85]}>
        <ringGeometry args={[1.05, 1.1, 64]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
