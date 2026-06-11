"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface OrganModelProps {
  organ: "torso" | "lungs" | "heart";
  highlighted: boolean;
}

const ORGAN_CONFIG = {
  torso: {
    position: [0, 0, 0] as [number, number, number],
    scale: [0.9, 1.4, 0.5] as [number, number, number],
    color: "#334155",
    emissive: "#0F172A",
    transparent: true,
    opacity: 0.25,
  },
  lungs: {
    position: [0, 0.1, 0] as [number, number, number],
    scale: [0.7, 0.9, 0.35] as [number, number, number],
    color: "#60A5FA",
    emissive: "#1E3A5F",
    transparent: false,
    opacity: 1,
  },
  heart: {
    position: [0.05, 0.15, 0.1] as [number, number, number],
    scale: [0.25, 0.25, 0.25] as [number, number, number],
    color: "#F87171",
    emissive: "#7F1D1D",
    transparent: false,
    opacity: 1,
  },
};

export function OrganModel({ organ, highlighted }: OrganModelProps) {
  const meshRef = useRef<Mesh>(null);
  const cfg = ORGAN_CONFIG[organ];

  useFrame((_, delta) => {
    if (meshRef.current && highlighted) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={cfg.position} scale={cfg.scale}>
      {organ === "heart" ? (
        <sphereGeometry args={[0.5, 16, 16]} />
      ) : (
        <cylinderGeometry args={[0.6, 0.7, 2, 16]} />
      )}
      <meshStandardMaterial
        color={highlighted ? "#FBBF24" : cfg.color}
        emissive={highlighted ? "#78350F" : cfg.emissive}
        emissiveIntensity={highlighted ? 0.4 : 0.1}
        roughness={0.4}
        metalness={0.1}
        transparent={cfg.transparent}
        opacity={cfg.opacity}
      />
    </mesh>
  );
}