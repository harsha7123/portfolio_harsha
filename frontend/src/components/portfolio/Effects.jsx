import React from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";

/**
 * Clean cinematic post — no chromatic aberration, no noise.
 * Only a gentle Bloom + Vignette so edges stay crisp.
 */
export default function Effects({ quality = "high" }) {
  const useHeavy = quality === "high";
  return (
    <EffectComposer multisampling={useHeavy ? 4 : 0}>
      <Bloom
        intensity={useHeavy ? 0.42 : 0.28}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.7}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.3} darkness={0.78} />
    </EffectComposer>
  );
}
