import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { usePortfolio } from "../../store/usePortfolio";

/**
 * Camera waypoints per section.
 * Tweens smoothly between HOME, WORK, CONTACT framings.
 */
const WAYPOINTS = {
  home: {
    pos: [0, 2.4, 7.5],
    look: [0, 1.2, 0],
    fov: 38,
  },
  work: {
    pos: [0, 6.8, 16],
    look: [0, 1.2, 0],
    fov: 48,
  },
  contact: {
    pos: [0, 1.8, 4.5],
    look: [0, 1.4, 0],
    fov: 32,
  },
};

export default function CameraRig() {
  const { camera } = useThree();
  const { activeSection, panelOpen, carRingIndex } = usePortfolio();
  const lookAt = useRef({ x: 0, y: 1.2, z: 0 });
  const stateRef = useRef({ fov: 38 });

  useEffect(() => {
    let wp = WAYPOINTS[activeSection];

    // When a project panel is open, zoom toward the billboard
    if (activeSection === "work" && panelOpen) {
      const RING = 11;
      const a = (carRingIndex / 4) * Math.PI * 2;
      const bx = Math.cos(a) * (RING + 4.5);
      const bz = Math.sin(a) * (RING + 4.5);
      // camera in front of car, looking at billboard
      const cx = Math.cos(a) * (RING + 1.2);
      const cz = Math.sin(a) * (RING + 1.2);
      wp = {
        pos: [cx, 3.4, cz],
        look: [bx, 2.2, bz],
        fov: 40,
      };
    } else if (activeSection === "work") {
      // chase cam behind car as it orbits
      const RING = 11;
      const a = (carRingIndex / 4) * Math.PI * 2;
      const cx = Math.cos(a) * (RING + 5);
      const cz = Math.sin(a) * (RING + 5);
      wp = {
        pos: [cx * 0.55, 5.2, cz * 0.55],
        look: [0, 1.2, 0],
        fov: 52,
      };
    }

    gsap.to(camera.position, {
      x: wp.pos[0],
      y: wp.pos[1],
      z: wp.pos[2],
      duration: 1.6,
      ease: "power3.inOut",
    });

    gsap.to(lookAt.current, {
      x: wp.look[0],
      y: wp.look[1],
      z: wp.look[2],
      duration: 1.6,
      ease: "power3.inOut",
    });

    gsap.to(stateRef.current, {
      fov: wp.fov,
      duration: 1.6,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.fov = stateRef.current.fov;
        camera.updateProjectionMatrix();
      },
    });
  }, [activeSection, panelOpen, carRingIndex, camera]);

  useFrame(() => {
    camera.lookAt(lookAt.current.x, lookAt.current.y, lookAt.current.z);
  });

  return null;
}
