// pages/index.js
"use client"; // Ensure this is a client component

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./components/model";

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Ambient light provides soft light across the whole scene */}
        <ambientLight intensity={0.5} />

        {/* Directional light acts like sunlight */}
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Optional: Add a point light for focused lighting */}
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        {/* Load the 3D model */}
        <Model position={[0, -1, 1]} />

        {/* Controls to rotate and zoom the model */}
        <OrbitControls />

        {/* Environment: Adding HDRI or environment textures to enhance realism */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
