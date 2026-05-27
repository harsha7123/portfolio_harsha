import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolio } from "../../store/usePortfolio";

const MODEL_URL = "/models/soldier.glb";

/**
 * Cinematic stylized hero — rigged GLB with idle animation.
 * Materials overridden to a charcoal coat that catches scene light
 * (similar feel to OG cutout — visible but cinematic, not pure black).
 */
export default function Hero({ position = [0, 0, 0], rotationY = 0 }) {
  const group = useRef();
  const sceneRef = useRef();
  const { reducedMotion } = usePortfolio();
  const { scene, animations } = useGLTF(MODEL_URL);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        obj.castShadow = true;
        obj.receiveShadow = false;
        obj.frustumCulled = false;
        const n = (obj.name || "").toLowerCase();

        // Charcoal coat / pants — visible mid-grey that catches the spot
        let mat;
        if (n.includes("head") || n.includes("face")) {
          mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#5a4a40"),  // warm skin-shadow tone
            metalness: 0.0,
            roughness: 0.55,
            emissive: new THREE.Color("#2a1410"),
            emissiveIntensity: 0.12,
          });
        } else if (n.includes("hair")) {
          mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#1a1414"),
            metalness: 0.2,
            roughness: 0.35,
          });
        } else {
          // Coat / body / pants
          mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#3a2a26"),  // warm charcoal, picks up warm rim
            metalness: 0.35,
            roughness: 0.45,
            emissive: new THREE.Color("#1a0c08"),
            emissiveIntensity: 0.08,
          });
        }
        obj.material = mat;
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

      {/* Dedicated cinematic key-light directly on hero — strong, warm, narrow */}
      <spotLight
        position={[2.2, 4.5, 3.5]}
        target-position={[0, 1.2, 0]}
        angle={0.55}
        penumbra={0.5}
        intensity={7.5}
        color="#FFD9A8"
        distance={14}
        decay={1.4}
        castShadow={false}
      />
      {/* Fill light from front */}
      <spotLight
        position={[0, 3.2, 5.5]}
        target-position={[0, 1.4, 0]}
        angle={0.6}
        penumbra={0.7}
        intensity={3.5}
        color="#FFE9C4"
        distance={12}
        decay={1.6}
      />
      {/* Cool back-rim from above-left */}
      <spotLight
        position={[-3, 5, -3]}
        target-position={[0, 1.4, 0]}
        angle={0.55}
        penumbra={0.6}
        intensity={4.5}
        color="#8FB8FF"
        distance={14}
        decay={1.4}
      />
      {/* Ember underlight */}
      <pointLight position={[0, 0.4, 1.6]} color="#FF5A1F" intensity={1.6} distance={6} decay={2} />

      {/* Subtle cinematic rim halo behind hero */}
      <mesh position={[0, 1.2, -0.65]}>
        <ringGeometry args={[0.98, 1.05, 64]} />
        <meshBasicMaterial color="#FF5A1F" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
