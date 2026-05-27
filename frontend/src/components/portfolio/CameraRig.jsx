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
      // Frame hero on the LEFT 1/3 of the screen so the right-side panel doesn't
      // sit on a black void — gives the OG-cutout composition.
      wp = { pos: [3.6, 2.6, 6.2], look: [-1.6, 1.3, 0], fov: 36 };
    } else if (activeSection === "work") {
      // Chase cam slightly behind & above the car, looking through it to the hero
      const RING = 11;
      const angle = freeDrive ? carAngle : (carRingIndex / 4) * Math.PI * 2;
      // car sits at (cos*RING, 0, sin*RING); camera sits BEHIND car along the same radial,
      // i.e. further from origin by `chase` units, then up.
      const chase = 6.5;
      const camR = RING + chase;
      const cx = Math.cos(angle) * camR;
      const cz = Math.sin(angle) * camR;
      wp = { pos: [cx, 4.2, cz], look: [0, 1.4, 0], fov: 48 };
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
      const chase = 6.5;
      const camR = RING + chase;
      const a = carAngle;
      const tx = Math.cos(a) * camR;
      const tz = Math.sin(a) * camR;
      camera.position.x += (tx - camera.position.x) * 0.06;
      camera.position.z += (tz - camera.position.z) * 0.06;
    }
  });

  return null;
}
