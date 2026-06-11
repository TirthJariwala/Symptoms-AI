"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* 
  Realistic DNA double helix:
  - Two parallel backbone strands as tubes
  - Base pairs (rungs) connecting them horizontally
  - Proper Watson-Crick geometry: antiparallel strands, ~10 base pairs per turn
  - Each rung colored to represent the 4 nucleotide bases (A-T, G-C)
  - Biological color convention:
      A (adenine)  = red    #E63946
      T (thymine)  = yellow #F4D35E
      G (guanine)  = teal   #2A9D8F
      C (cytosine) = blue   #457B9D
      backbone     = warm phosphate-sugar brown/tan
*/

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);

  const TURNS = 2.5;
  const STEPS = 80;
  const RADIUS = 1.05;
  const HEIGHT = 7.0;
  const RISE_PER_STEP = HEIGHT / STEPS;
  const ANGLE_PER_STEP = (TURNS * Math.PI * 2) / STEPS;

  const { strand1, strand2, rungs } = useMemo(() => {
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    const r: { a: THREE.Vector3; b: THREE.Vector3; type: number }[] = [];

    for (let i = 0; i <= STEPS; i++) {
      const angle = i * ANGLE_PER_STEP;
      const y = (i / STEPS) * HEIGHT - HEIGHT / 2;

      const x1 = Math.cos(angle) * RADIUS;
      const z1 = Math.sin(angle) * RADIUS;
      const x2 = Math.cos(angle + Math.PI) * RADIUS;
      const z2 = Math.sin(angle + Math.PI) * RADIUS;

      s1.push(new THREE.Vector3(x1, y, z1));
      s2.push(new THREE.Vector3(x2, y, z2));

      if (i < STEPS) {
        r.push({
          a: new THREE.Vector3(x1, y, z1),
          b: new THREE.Vector3(x2, y, z2),
          type: i % 4,
        });
      }
    }
    return { strand1: s1, strand2: s2, rungs: r };
  }, []);

  // Backbone tubes — deep red / crimson
  const backboneMat1 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#C0152A", emissive: "#8B0000", roughness: 0.3, metalness: 0.5 }),
    []
  );
  const backboneMat2 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#A01020", emissive: "#6B0000", roughness: 0.3, metalness: 0.5 }),
    []
  );

  // Base pair rung materials — standard biology color convention
  // A (adenine) = red | T (thymine) = yellow | G (guanine) = teal | C (cytosine) = steel blue
  const rungMats = useMemo(() => [
    [ // A–T
      new THREE.MeshStandardMaterial({ color: "#E63946", emissive: "#B02030", emissiveIntensity: 0.4, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: "#F4D35E", emissive: "#C9A820", emissiveIntensity: 0.4, roughness: 0.4 }),
    ],
    [ // T–A
      new THREE.MeshStandardMaterial({ color: "#F4D35E", emissive: "#C9A820", emissiveIntensity: 0.4, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: "#E63946", emissive: "#B02030", emissiveIntensity: 0.4, roughness: 0.4 }),
    ],
    [ // G–C
      new THREE.MeshStandardMaterial({ color: "#2A9D8F", emissive: "#1A6D62", emissiveIntensity: 0.4, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: "#457B9D", emissive: "#2C5570", emissiveIntensity: 0.4, roughness: 0.4 }),
    ],
    [ // C–G
      new THREE.MeshStandardMaterial({ color: "#457B9D", emissive: "#2C5570", emissiveIntensity: 0.4, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: "#2A9D8F", emissive: "#1A6D62", emissiveIntensity: 0.4, roughness: 0.4 }),
    ],
  ], []);

  // Phosphate bead — bright red
  const phosphateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#E8192C", emissive: "#B00010", emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.5 }),
    []
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.18;
    }
  });

  const tubeRadius = 0.045;
  const beadRadius = 0.075;

  return (
    <group ref={groupRef}>
      {/* ── Backbone 1 beads (phosphate-sugar units) ── */}
      {strand1.map((pos, i) => (
        <mesh key={`b1-${i}`} position={pos} material={phosphateMat}>
          <sphereGeometry args={[beadRadius, 10, 10]} />
        </mesh>
      ))}

      {/* ── Backbone 2 beads ── */}
      {strand2.map((pos, i) => (
        <mesh key={`b2-${i}`} position={pos} material={phosphateMat}>
          <sphereGeometry args={[beadRadius, 10, 10]} />
        </mesh>
      ))}

      {/* ── Backbone tubes connecting adjacent beads ── */}
      {strand1.slice(0, -1).map((pos, i) => {
        const next = strand1[i + 1];
        const mid = pos.clone().add(next).multiplyScalar(0.5);
        const dir = next.clone().sub(pos);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        return (
          <mesh key={`t1-${i}`} position={mid} quaternion={quat} material={backboneMat1}>
            <cylinderGeometry args={[tubeRadius, tubeRadius, len, 7]} />
          </mesh>
        );
      })}
      {strand2.slice(0, -1).map((pos, i) => {
        const next = strand2[i + 1];
        const mid = pos.clone().add(next).multiplyScalar(0.5);
        const dir = next.clone().sub(pos);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        return (
          <mesh key={`t2-${i}`} position={mid} quaternion={quat} material={backboneMat2}>
            <cylinderGeometry args={[tubeRadius, tubeRadius, len, 7]} />
          </mesh>
        );
      })}

      {/* ── Base pair rungs (horizontal ladder steps) ── */}
      {rungs.map((rung, i) => {
        const mid = rung.a.clone().add(rung.b).multiplyScalar(0.5);
        const dir = rung.b.clone().sub(rung.a);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        const mats = rungMats[rung.type];

        const leftMid = rung.a.clone().add(mid).multiplyScalar(0.5);
        const rightMid = mid.clone().add(rung.b).multiplyScalar(0.5);

        return (
          <group key={`rung-${i}`}>
            {/* Left half */}
            <mesh position={leftMid} quaternion={quat} material={mats[0]}>
              <cylinderGeometry args={[0.038, 0.038, len * 0.48, 7]} />
            </mesh>
            {/* Right half */}
            <mesh position={rightMid} quaternion={quat} material={mats[1]}>
              <cylinderGeometry args={[0.038, 0.038, len * 0.48, 7]} />
            </mesh>
            {/* Center junction dot */}
            <mesh position={mid}>
              <sphereGeometry args={[0.055, 8, 8]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── Scanning ring that pulses up and down ── */
function ScanRing() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const y = Math.sin(clock.elapsedTime * 0.65) * 3.0;
    if (meshRef.current) meshRef.current.position.y = y;
    if (glowRef.current) glowRef.current.position.y = y;
  });

  return (
    <>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.022, 8, 90]} />
        <meshStandardMaterial color="#E8192C" emissive="#B00010" emissiveIntensity={2} transparent opacity={0.85} />
      </mesh>
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.18, 8, 90]} />
        <meshStandardMaterial color="#C0152A" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

/* ── Ambient particles floating around ── */
function Particles() {
  const groupRef = useRef<THREE.Group>(null);
  const items = useMemo(() => Array.from({ length: 30 }, () => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4),
    color: ["#E8192C", "#2A9D8F", "#C0152A", "#F4D35E"][Math.floor(Math.random() * 4)],
    speed: 0.15 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    size: 0.025 + Math.random() * 0.04,
  })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.y = items[i].pos.y + Math.sin(clock.elapsedTime * items[i].speed + items[i].phase) * 0.4;
      child.rotation.x = clock.elapsedTime * 0.3;
      child.rotation.y = clock.elapsedTime * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <octahedronGeometry args={[p.size]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Camera gently orbits ── */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.1) * 1.5;
    camera.position.y = Math.sin(t * 0.07) * 0.6;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} color="#1a0505" />
      <directionalLight position={[5, 8, 5]} intensity={1.1} color="#ffb0b0" />
      <pointLight position={[-4, 3, 3]} intensity={1.2} color="#E8192C" />
      <pointLight position={[4, -3, 2]} intensity={0.9} color="#C0152A" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ff8080" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#2A9D8F" />

      <DNAHelix />
      <ScanRing />
      <Particles />
      <CameraRig />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
        rotateSpeed={0.4}
        autoRotate={false}
      />
    </Canvas>
  );
}