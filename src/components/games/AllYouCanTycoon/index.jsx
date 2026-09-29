import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { Vector3, MathUtils } from 'three';
import './App.css';

function Player({ playerRef, onPositionChange }) {
  const [position, setPosition] = useState([0, 1.8, 0]);
  const velocityRef = useRef({ x: 0, z: 0 });
  const keysRef = useRef({});
  const targetRotationRef = useRef(0);
  const SPEED = 0.15;
  const FRICTION = 0.85;

  const randomModelNumber = useMemo(() => Math.floor(Math.random() * 10) + 1, []);
  const { scene } = useGLTF(`/1.glb`);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive.setHex(0x333333);
        child.material.emissiveIntensity = 0.5;
        if (child.material.map) child.material.map.anisotropy = 16;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useFrame((state) => {
    if (playerRef.current) {
      if (keysRef.current['w'] || keysRef.current['arrowup']) velocityRef.current.z -= SPEED;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) velocityRef.current.z += SPEED;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) velocityRef.current.x -= SPEED;
      if (keysRef.current['d'] || keysRef.current['arrowright']) velocityRef.current.x += SPEED;

      velocityRef.current.x *= FRICTION;
      velocityRef.current.z *= FRICTION;

      const [x, y, z] = position;
      const newX = x + velocityRef.current.x;
      const newZ = z + velocityRef.current.z;

      const maxDistance = 40;
      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, newX));
      const clampedZ = Math.max(-maxDistance, Math.min(maxDistance, newZ));

      setPosition([clampedX, y, clampedZ]);
      playerRef.current.position.set(clampedX, y, clampedZ);

      if (keysRef.current['w'] || keysRef.current['arrowup'] || keysRef.current['s'] || keysRef.current['arrowdown'] || keysRef.current['a'] || keysRef.current['arrowleft'] || keysRef.current['d'] || keysRef.current['arrowright']) {
        targetRotationRef.current = Math.atan2(velocityRef.current.x, velocityRef.current.z);
      }

      playerRef.current.rotation.y = MathUtils.lerp(playerRef.current.rotation.y, targetRotationRef.current, 0.1);

      if (onPositionChange) {
        onPositionChange([clampedX, y, clampedZ]);
      }
    }
  });

  return (
    <group ref={playerRef} position={position}>
      <primitive object={clonedScene} />
    </group>
  );
}

function AllYouCanTycoon() {
  const playerRef = useRef();
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 4, 8], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[20, 20, 20]} intensity={1} castShadow shadow-mapSize={2048} />
        <Environment preset="sunset" />
        <Player playerRef={playerRef} onPositionChange={setPlayerPosition} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </Canvas>

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        ← Back
      </button>
    </div>
  );
}

export default AllYouCanTycoon;
