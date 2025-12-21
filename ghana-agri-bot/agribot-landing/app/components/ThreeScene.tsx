// app/components/ThreeScene.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import { useRef } from 'react'
import { Mesh } from 'three'

function AnimatedSphere() {
  const meshRef = useRef<Mesh>(null)
  
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color="#22c55e"
          attach="material"
          distort={0.5}
          speed={2}
          opacity={0.6}
          transparent
        />
      </Sphere>
    </Float>
  )
}

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <AnimatedSphere />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  )
}