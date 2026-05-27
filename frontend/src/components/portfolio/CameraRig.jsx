import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { usePortfolio } from "../../store/usePortfolio";

const WAYPOINTS = {
  home: { pos: [0, 2.4, 7.5], look: [0, 1.2, 0], fov: 38 },
  contact: { pos: [0, 1.8, 4.5], look: [0, 1.4, 0], fov: 32 },
};

const CAR_RING = 6.5;
const CAM_PERP = 9.5;
const CAM_HEIGHT = 3.8;

function isPortrait() {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

function framingForWork(angle) {
  const cx = Math.cos(angle) * CAR_RING;
  const cz = Math.sin(angle) * CAR_RING;
  const mx = cx / 2;
  const mz = cz / 2;
  const px = -Math.sin(angle);
  const pz = Math.cos(angle);
  // On portrait/mobile, pull camera much further back + widen FOV so hero+car
  // both fit in the narrow viewport.
  const portrait = isPortrait();
  const perpMul = portrait ? 1.8 : 1.0;
  const heightMul = portrait ? 1.25 : 1.0;
  const fov = portrait ? 78 : 56;
  return {
    pos: [mx + px * CAM_PERP * perpMul, CAM_HEIGHT * heightMul, mz + pz * CAM_PERP * perpMul],
    look: [mx, 0.9, mz],
    fov,
  };
}

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

  // Recompute camera waypoint when viewport flips between portrait/landscape
  const [resizeKey, setResizeKey] = React.useState(0);
  useEffect(() => {
    const onResize = () => setResizeKey((k) => k + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let wp;
    const portrait = isPortrait();

    if (activeSection === "home") {
      wp = portrait
        ? { pos: [0, 2.6, 11], look: [0, 1.2, 0], fov: 52 }
        : WAYPOINTS.home;
    } else if (activeSection === "contact") {
      wp = portrait
        ? { pos: [0, 2.2, 7], look: [0, 1.4, 0], fov: 50 }
        : WAYPOINTS.contact;
    } else if (activeSection === "work") {
      const angle = freeDrive ? carAngle : (carRingIndex / 4) * Math.PI * 2;
      const base = framingForWork(angle);
      if (panelOpen) {
        // Shift framing slightly so hero anchors to LEFT 1/3 of the screen,
        // leaving room on the right for the panel overlay.
        wp = {
          pos: [base.pos[0] - 1.6, base.pos[1] - 0.4, base.pos[2] + 0.6],
          look: [base.look[0] - 2.2, base.look[1] + 0.4, base.look[2]],
          fov: 40,
        };
      } else {
        wp = base;
      }
    }

    const dur = reducedMotion ? 0.2 : 1.6;
    const easeName = reducedMotion ? "power1.out" : "power3.inOut";

    gsap.to(camera.position, {
      x: wp.pos[0],
      y: wp.pos[1],
      z: wp.pos[2],
      duration: dur,
      ease: easeName,
      overwrite: true,
    });
    gsap.to(lookAt.current, {
      x: wp.look[0],
      y: wp.look[1],
      z: wp.look[2],
      duration: dur,
      ease: easeName,
      overwrite: true,
    });
    gsap.to(stateRef.current, {
      fov: wp.fov,
      duration: dur,
      ease: easeName,
      overwrite: true,
      onUpdate: () => {
        camera.fov = stateRef.current.fov;
        camera.updateProjectionMatrix();
      },
    });
  }, [activeSection, panelOpen, carRingIndex, carAngle, freeDrive, reducedMotion, camera, resizeKey]);

  // Continuous chase when free-driving (don't wait for re-renders)
  useFrame(() => {
    camera.lookAt(lookAt.current.x, lookAt.current.y, lookAt.current.z);
    if (freeDrive && activeSection === "work" && !panelOpen) {
      const a = carAngle;
      const f = framingForWork(a);
      camera.position.x += (f.pos[0] - camera.position.x) * 0.08;
      camera.position.z += (f.pos[2] - camera.position.z) * 0.08;
      lookAt.current.x += (f.look[0] - lookAt.current.x) * 0.08;
      lookAt.current.z += (f.look[2] - lookAt.current.z) * 0.08;
    }
  });

  return null;
}
