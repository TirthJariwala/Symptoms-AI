"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { OrganModel } from "./OrganModel";
import { LightingSetup } from "./LightingSetup";

interface AnatomySceneProps {
  highlightedOrgan?: string;
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
    }
  });
  return <group ref={ref}>{children}</group>;
}

export function AnatomyScene({ highlightedOrgan }: AnatomySceneProps) {
  return (
    <div className="w-full h-80 bg-[#0F172A] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <LightingSetup />
        <RotatingGroup>
          <OrganModel organ="torso" highlighted={false} />
          <OrganModel organ="lungs" highlighted={highlightedOrgan === "lungs"} />
          <OrganModel organ="heart" highlighted={highlightedOrgan === "heart"} />
        </RotatingGroup>
        <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
        <Environment preset="city" />
      </Canvas>
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <p className="text-white text-[11px]">
          {highlightedOrgan
            ? `Highlighting: ${highlightedOrgan}`
            : "Interactive 3D anatomy — drag to rotate"}
        </p>
      </div>
    </div>
  );
}