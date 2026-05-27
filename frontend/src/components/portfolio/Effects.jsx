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

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.6}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0006, 0.0009)}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise opacity={0.06} premultiply />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}
