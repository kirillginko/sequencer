// components/Model.js
"use client"; // Ensure this is a client component

import React, { useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const Model = (props) => {
  const { scene } = useGLTF("/cd_case.glb");

  // Load custom texture
  const customTexture = useTexture("/liluzi.jpg"); // Replace with your custom texture path

  // Create a custom shader material to blend the holographic effect with the custom texture
  const holographicShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        customTexture: { value: customTexture },
        holographicColor: { value: new THREE.Color(0xe5e5e5) },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D customTexture;
        uniform vec3 holographicColor;
        varying vec2 vUv;

        void main() {
          // Get the base custom texture
          vec4 baseTexture = texture2D(customTexture, vUv);

          // Create the holographic effect as an overlay
          vec4 holographicOverlay = vec4(holographicColor, 0.3); // Holographic transparency set to 0.3

          // Blend the custom texture with the holographic overlay
          gl_FragColor = mix(baseTexture, holographicOverlay, 0.18); // 30% holographic, 70% custom texture
        }
      `,
      transparent: true,
    });
  }, [customTexture]);

  // Apply the shader material to the model
  scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name === "Object_10" || child.name === "Object_11") {
        // Apply the custom shader material
        child.material = holographicShaderMaterial;
      }
    }
  });

  scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name === "Object_14") {
        child.material.map = customTexture; // Assign the texture to the mesh material's map
        child.material.needsUpdate = true; // Ensure the material gets updated
      }
    }
  });

  return <primitive object={scene} {...props} />;
};

export default Model;
