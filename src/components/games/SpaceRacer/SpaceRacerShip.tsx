import { useRef } from 'react'
import * as THREE from 'three'

export function SpaceRacerShip() {
  const shipRef = useRef<THREE.Group>(null)

  return (
    <group ref={shipRef}>
      {/* Main hull - sleek fuselage */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.4, 1.2, 8]} />
        <meshStandardMaterial color={0x1a1a2e} metalness={0.9} roughness={0.1} emissive={0x0a0a1a} />
      </mesh>

      {/* Cockpit dome */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color={0x00d4ff} metalness={0.8} roughness={0.2} emissive={0x0088ff} emissiveIntensity={0.5} />
      </mesh>

      {/* Left wing */}
      <mesh position={[-0.5, -0.1, 0.1]}>
        <boxGeometry args={[0.5, 0.12, 0.8]} />
        <meshStandardMaterial color={0x1a1a2e} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Right wing */}
      <mesh position={[0.5, -0.1, 0.1]}>
        <boxGeometry args={[0.5, 0.12, 0.8]} />
        <meshStandardMaterial color={0x1a1a2e} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Left engine thruster */}
      <group position={[-0.35, -0.2, -0.4]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.15, 0.3, 6]} />
          <meshBasicMaterial color={0xff6600} />
        </mesh>
        <pointLight intensity={1.5} color={0xff6600} distance={3} />
      </group>

      {/* Right engine thruster */}
      <group position={[0.35, -0.2, -0.4]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.15, 0.3, 6]} />
          <meshBasicMaterial color={0xff6600} />
        </mesh>
        <pointLight intensity={1.5} color={0xff6600} distance={3} />
      </group>

      {/* Center engine thruster */}
      <group position={[0, -0.35, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.2, 0.4, 8]} />
          <meshBasicMaterial color={0xff3300} />
        </mesh>
        <pointLight intensity={2} color={0xff3300} distance={4} />
      </group>

      {/* Engine glow particles visualization */}
      <mesh position={[0, -0.35, -0.7]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color={0xff9900} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}
