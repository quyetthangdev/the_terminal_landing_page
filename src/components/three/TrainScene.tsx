import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Smoke() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const data = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      y: i * 0.45,
      speed: 0.55 + Math.random() * 0.3,
    })),
  )

  useFrame((_, delta) => {
    data.current.forEach((p, i) => {
      p.y += delta * p.speed
      if (p.y > 2.2) p.y = 0
      const mesh = meshRefs.current[i]
      if (!mesh) return
      mesh.position.y = p.y
      mesh.scale.setScalar(0.12 + p.y * 0.22)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - p.y * 0.26)
    })
  })

  return (
    <group position={[1.4, 1.6, 0]}>
      {data.current.map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el }}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshBasicMaterial color="#c0c0c0" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Train() {
  const trainRef = useRef<THREE.Group>(null)
  const wheelGroupRef = useRef<THREE.Group>(null)
  const SPEED = 1.6

  useFrame((_, delta) => {
    if (!trainRef.current) return
    trainRef.current.position.x -= delta * SPEED
    if (trainRef.current.position.x < -15) trainRef.current.position.x = 15
    if (wheelGroupRef.current) {
      wheelGroupRef.current.children.forEach((w) => { w.rotation.z -= delta * SPEED * 2.2 })
    }
  })

  const wheelPositions: [number, number, number][] = [
    [-1.1, -0.6, 0.58], [-0.2, -0.6, 0.58], [0.8, -0.6, 0.58],
    [-1.1, -0.6, -0.58], [-0.2, -0.6, -0.58], [0.8, -0.6, -0.58],
  ]

  return (
    <group ref={trainRef} position={[15, -1.2, 0]}>
      {/* Main boiler body */}
      <mesh position={[0.5, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.44, 0.4, 2.8, 14]} />
        <meshStandardMaterial color="#2e2e2e" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Cab */}
      <mesh position={[-1.1, 0.55, 0]}>
        <boxGeometry args={[1.1, 1.0, 1.1]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[-1.1, 1.08, 0]}>
        <boxGeometry args={[1.2, 0.12, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Cab window glow */}
      <mesh position={[-1.68, 0.6, 0]}>
        <boxGeometry args={[0.04, 0.38, 0.55]} />
        <meshBasicMaterial color="#CFA93F" />
      </mesh>
      {/* Chimney */}
      <mesh position={[1.5, 1.1, 0]}>
        <cylinderGeometry args={[0.13, 0.19, 0.55, 8]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.45} />
      </mesh>
      {/* Dome */}
      <mesh position={[0.4, 0.86, 0]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color="#CFA93F" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Front plate */}
      <mesh position={[2.0, 0.1, 0]}>
        <boxGeometry args={[0.12, 0.8, 1.1]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Cowcatcher */}
      <mesh position={[2.25, -0.35, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.5, 0.12, 1.0]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Undercarriage */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[3.5, 0.25, 0.9]} />
        <meshStandardMaterial color="#1e1e1e" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* Wheels */}
      <group ref={wheelGroupRef}>
        {wheelPositions.map((pos, i) => (
          <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.1, 16]} />
            <meshStandardMaterial color="#CFA93F" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
      {/* Smoke (child of train, moves with it) */}
      <Smoke />
    </group>
  )
}

function GoldParticles() {
  const ref = useRef<THREE.Points>(null)
  const count = 280

  const { geometry, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd: number[] = []
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
      spd.push(Math.random() * 0.35 + 0.08)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geometry: geo, speeds: spd }
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const arr = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * speeds[i] * 0.38
      if (arr[i * 3 + 1] > 5.5) arr[i * 3 + 1] = -5.5
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#CFA93F" size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function Track() {
  return (
    <mesh position={[0, -2.0, 0]}>
      <boxGeometry args={[35, 0.04, 0.07]} />
      <meshStandardMaterial color="#CFA93F" emissive="#CFA93F" emissiveIntensity={0.45} />
    </mesh>
  )
}

export default function TrainScene() {
  return (
    <>
      <ambientLight intensity={0.25} color="#fff5e0" />
      <directionalLight position={[6, 6, 4]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 2, 3]} intensity={0.6} color="#CFA93F" />
      <Train />
      <Track />
      <GoldParticles />
    </>
  )
}
