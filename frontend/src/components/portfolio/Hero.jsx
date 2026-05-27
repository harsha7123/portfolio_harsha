import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolio } from "../../store/usePortfolio";

const MODEL_URL = "/models/soldier.glb";

/**
 * Cinematic stylized hero — rigged GLB with idle animation.
 * Materials overridden to deep neo-noir matte black coat.
 */
export default function Hero({ position = [0, 0, 0], rotationY = 0 }) {
  const group = useRef();
  const sceneRef = useRef();
  const { reducedMotion } = usePortfolio();
  const { scene, animations } = useGLTF(MODEL_URL);

  // Apply material override + setup once
  useEffect(() => {
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        obj.castShadow = true;
        obj.frustumCulled = false;
        // Replace material with deep matte neo-noir
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#08080a"),
          metalness: 0.25,
          roughness: 0.6,
          emissive: new THREE.Color("#000000"),
          emissiveIntensity: 0,
        });
        obj.material = mat;
      }
    });
    // Scale + offset
    scene.scale.setScalar(1.55);
    scene.position.set(0, -0.7, 0);
    scene.rotation.y = Math.PI; // face camera (model defaults to facing +Z)
  }, [scene]);

  const { actions, names } = useAnimations(animations, sceneRef);

  useEffect(() => {
    if (!actions || !names || names.length === 0) return;
    const idleName = names.find((n) => /idle/i.test(n)) || names[0];
    const idle = actions[idleName];
    if (idle) {
      idle.reset();
      idle.timeScale = reducedMotion ? 0 : 0.9;
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

      {/* Subtle cinematic rim halo behind hero */}
      <mesh position={[0, 1.2, -0.65]}>
        <ringGeometry args={[0.95, 1.02, 64]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
