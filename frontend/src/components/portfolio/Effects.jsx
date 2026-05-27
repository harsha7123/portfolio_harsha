import React from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export default function Effects({ quality = "high" }) {
  const useHeavy = quality === "high";
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={useHeavy ? 0.85 : 0.55}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.6}
        mipmapBlur
      />
      {useHeavy && (
        <ChromaticAberration
          offset={new THREE.Vector2(0.0006, 0.0009)}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
      {useHeavy && <Noise opacity={0.06} premultiply />}
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}
