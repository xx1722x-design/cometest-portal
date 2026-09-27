import { useMemo } from 'react'

interface BurgerStackProps {
  count: number
  position: [number, number, number]
}

const BURGER_HEIGHT = 0.15
const BURGER_OFFSET = 1.2

export function BurgerStack({ count, position }: BurgerStackProps) {
  const stackPositions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const y = position[1] + BURGER_OFFSET + i * BURGER_HEIGHT
      return [position[0], y, position[2]] as [number, number, number]
    })
  }, [count, position])

  return (
    <group>
      {stackPositions.map((pos, idx) => (
        <mesh key={`burger-${idx}`} position={pos} scale={[0.4, 0.15, 0.4]}>
          <cylinderGeometry args={[1, 1, 1, 16]} />
          <meshStandardMaterial color="#c4622d" />
        </mesh>
      ))}
    </group>
  )
}
