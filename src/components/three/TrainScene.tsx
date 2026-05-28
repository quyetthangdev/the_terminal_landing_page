/* eslint-disable react-hooks/purity, react-hooks/refs */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WHEEL_ROLL_AXIS = new THREE.Vector3(0, 0, 1)

function Smoke() {
  const COUNT = 9
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const data = useRef(
    Array.from({ length: COUNT }, (_, i) => ({
      y: (i / COUNT) * 3.0,
      x: 0,
      z: 0,
      speed: 0.35 + Math.random() * 0.35,
      xDrift: (Math.random() - 0.5) * 0.5,
      zDrift: (Math.random() - 0.5) * 0.25,
      turbX: Math.random() * Math.PI * 2,
      turbZ: Math.random() * Math.PI * 2,
      size: 0.25 + Math.random() * 0.15,
    })),
  )

  useFrame((_, delta) => {
    data.current.forEach((p, i) => {
      p.y += delta * p.speed
      p.turbX += delta * 1.2
      p.turbZ += delta * 0.9
      p.x = p.xDrift * p.y * 0.4 + Math.sin(p.turbX) * 0.1
      p.z = p.zDrift * p.y * 0.3 + Math.cos(p.turbZ) * 0.07

      if (p.y > 3.2) {
        p.y = 0
        p.x = 0
        p.z = 0
        p.speed = 0.35 + Math.random() * 0.35
        p.xDrift = (Math.random() - 0.5) * 0.5
        p.zDrift = (Math.random() - 0.5) * 0.25
        p.turbX = Math.random() * Math.PI * 2
        p.turbZ = Math.random() * Math.PI * 2
      }

      const mesh = meshRefs.current[i]
      if (!mesh) return
      mesh.position.set(p.x, p.y, p.z)
      const lifecycle = p.y / 3.2
      const scale = lifecycle < 0.45
        ? p.size + lifecycle * 1.1
        : (p.size + 0.45 * 1.1) * (1 - (lifecycle - 0.45) * 0.6)
      mesh.scale.setScalar(Math.max(0.05, scale))
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.55 * (1 - lifecycle * 1.1))
    })
  })

  return (
    <group position={[1.4, 1.6, 0]}>
      {data.current.map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el }}>
          <sphereGeometry args={[0.38, 8, 8]} />
          <meshBasicMaterial color="#cccccc" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function SteamTrail() {
  const COUNT = 12
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const data = useRef(
    Array.from({ length: COUNT }, (_, i) => ({
      // Distributed along train body
      startX: -1.5 + (i / COUNT) * 3.5,
      x: -1.5 + (i / COUNT) * 3.5,
      y: -0.8 + Math.random() * 0.3,
      z: (Math.random() - 0.5) * 1.2,
      age: Math.random(),
      lifetime: 0.8 + Math.random() * 0.6,
      speed: 0.25 + Math.random() * 0.2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftZ: (Math.random() - 0.5) * 0.1,
    })),
  )

  useFrame((_, delta) => {
    data.current.forEach((p, i) => {
      p.age += delta * p.speed
      if (p.age >= p.lifetime) {
        p.age = 0
        p.x = p.startX
        p.y = -0.8 + Math.random() * 0.3
        p.z = (Math.random() - 0.5) * 1.2
        p.driftX = (Math.random() - 0.5) * 0.15
        p.driftZ = (Math.random() - 0.5) * 0.1
      }
      const t = p.age / p.lifetime
      p.x += p.driftX * delta
      p.y += delta * 0.12
      p.z += p.driftZ * delta

      const mesh = meshRefs.current[i]
      if (!mesh) return
      mesh.position.set(p.x, p.y, p.z)
      mesh.scale.setScalar(0.06 + t * 0.18)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.18 * (1 - t * 1.2))
    })
  })

  return (
    <group>
      {data.current.map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el }}>
          <sphereGeometry args={[0.4, 6, 6]} />
          <meshBasicMaterial color="#e0e0e0" transparent depthWrite={false} />
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
      wheelGroupRef.current.children.forEach((w) => {
        w.rotateOnWorldAxis(WHEEL_ROLL_AXIS, -delta * SPEED * 2.2)
      })
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
      <SteamTrail />
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
