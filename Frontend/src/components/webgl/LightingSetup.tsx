"use client";

export function LightingSetup() {
  return (
    <>
      <ambientLight intensity={0.4} color="#E0F0FF" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#FFFFFF"
        castShadow
      />
      <directionalLight position={[-4, 2, -4]} intensity={0.3} color="#BFDBFE" />
      <pointLight position={[0, -3, 2]} intensity={0.2} color="#60A5FA" />
    </>
  );
}