import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { usePortfolio } from "../../store/usePortfolio";

const WAYPOINTS = {
  home: { pos: [0, 2.4, 7.5], look: [0, 1.2, 0], fov: 38 },
  work: { pos: [0, 6.8, 16], look: [0, 1.2, 0], fov: 48 },
  contact: { pos: [0, 1.8, 4.5], look: [0, 1.4, 0], fov: 32 },
};

export default function CameraRig() {
  const { camera } = useThree();
  const {
    activeSection,
    panelOpen,
    carRingIndex,
    reducedMotion,
    freeDrive,
    carAngle,
  } = usePortfolio();
  const lookAt = useRef({ x: 0, y: 1.2, z: 0 });
  const stateRef = useRef({ fov: 38 });

  useEffect(() => {
    let wp = WAYPOINTS[activeSection];

    if (activeSection === "work" && panelOpen) {
      const RING = 11;
      const angle = freeDrive ? carAngle : (carRingIndex / 4) * Math.PI * 2;
      const bx = Math.cos(angle) * (RING + 4.5);
      const bz = Math.sin(angle) * (RING + 4.5);
      const cx = Math.cos(angle) * (RING + 1.2);
      const cz = Math.sin(angle) * (RING + 1.2);
      wp = { pos: [cx, 3.4, cz], look: [bx, 2.2, bz], fov: 40 };
    } else if (activeSection === "work") {
      const RING = 11;
      const angle = freeDrive ? carAngle : (carRingIndex / 4) * Math.PI * 2;
      const cx = Math.cos(angle) * (RING + 5);
      const cz = Math.sin(angle) * (RING + 5);
      wp = { pos: [cx * 0.55, 5.2, cz * 0.55], look: [0, 1.2, 0], fov: 52 };
    }

    const dur = reducedMotion ? 0.2 : 1.6;
    const easeName = reducedMotion ? "power1.out" : "power3.inOut";

    gsap.to(camera.position, {
      x: wp.pos[0],
      y: wp.pos[1],
      z: wp.pos[2],
      duration: dur,
      ease: easeName,
    });
    gsap.to(lookAt.current, {
      x: wp.look[0],
      y: wp.look[1],
      z: wp.look[2],
      duration: dur,
      ease: easeName,
    });
    gsap.to(stateRef.current, {
      fov: wp.fov,
      duration: dur,
      ease: easeName,
      onUpdate: () => {
        camera.fov = stateRef.current.fov;
        camera.updateProjectionMatrix();
      },
    });
  }, [activeSection, panelOpen, carRingIndex, carAngle, freeDrive, reducedMotion, camera]);

  // continuous follow when free-driving
  useFrame(() => {
    camera.lookAt(lookAt.current.x, lookAt.current.y, lookAt.current.z);
    if (freeDrive && activeSection === "work" && !panelOpen) {
      const RING = 11;
      const a = carAngle;
      const tx = Math.cos(a) * (RING + 5) * 0.55;
      const tz = Math.sin(a) * (RING + 5) * 0.55;
      camera.position.x += (tx - camera.position.x) * 0.06;
      camera.position.z += (tz - camera.position.z) * 0.06;
    }
  });

  return null;
}
