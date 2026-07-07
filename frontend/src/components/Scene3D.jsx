import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Preload } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const particlesRef = useRef(null)
  const particleCount = 500

  useEffect(() => {
    if (!particlesRef.current) return

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2000
      positions[i + 1] = (Math.random() - 0.5) * 2000
      positions[i + 2] = (Math.random() - 0.5) * 2000
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesRef.current.geometry = geometry
  }, [])

  useFrame((state) => {
    if (!particlesRef.current) return
    particlesRef.current.rotation.x -= 0.0001
    particlesRef.current.rotation.y -= 0.0002
  })

  return (
    <Points ref={particlesRef} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#2F5D50"
        size={3}
        sizeAttenuation={true}
        opacity={0.3}
      />
    </Points>
  )
}

function RotatingBox() {
  const boxRef = useRef(null)

  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.x += 0.001
      boxRef.current.rotation.y += 0.002
    }
  })

  return (
    <mesh ref={boxRef} position={[-300, 100, 0]} scale={60}>
      <boxGeometry args={[1, 1.5, 0.3]} />
      <meshStandardMaterial color="#2F5D50" roughness={0.7} metalness={0.2} />
    </mesh>
  )
}

function FloatingBook() {
  const bookRef = useRef(null)

  useFrame((state) => {
    if (bookRef.current) {
      bookRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.01
      bookRef.current.rotation.z += 0.005
    }
  })

  return (
    <mesh ref={bookRef} position={[300, 100, 0]} scale={50}>
      <boxGeometry args={[1.2, 0.15, 1]} />
      <meshStandardMaterial color="#6B8E23" roughness={0.6} metalness={0.3} />
    </mesh>
  )
}

function GraduationCap() {
  const capRef = useRef(null)

  useFrame((state) => {
    if (capRef.current) {
      capRef.current.position.y += Math.cos(state.clock.elapsedTime * 0.8) * 0.008
      capRef.current.rotation.x += 0.003
    }
  })

  return (
    <group ref={capRef} position={[0, 200, -100]}>
      <mesh scale={40}>
        <coneGeometry args={[1.5, 0.3, 32]} />
        <meshStandardMaterial color="#D4A017" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.3, 0]} scale={40}>
        <boxGeometry args={[2.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#D4A017" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

export default function Scene3D() {
  return (
    <>
      <color attach="background" args={['#F8F6F0']} />
      <fog attach="fog" args={['#F8F6F0', 500, 5000]} />

      <ambientLight intensity={1.2} />
      <pointLight position={[1000, 1000, 500]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-1000, -1000, 500]} intensity={0.8} color="#2F5D50" />

      <ParticleField />
      <RotatingBox />
      <FloatingBook />
      <GraduationCap />

      <Preload all />
    </>
  )
}
