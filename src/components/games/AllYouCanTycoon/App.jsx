import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { Vector3, MathUtils } from 'three';

function Player({ playerRef, onPositionChange }) {
  const [position, setPosition] = useState([0, 1.8, 0]);
  const velocityRef = useRef({ x: 0, z: 0 });
  const keysRef = useRef({});
  const targetRotationRef = useRef(0);
  const SPEED = 0.15;
  const FRICTION = 0.85;

  const randomModelNumber = useMemo(() => Math.floor(Math.random() * 10) + 1, []);
  const { scene } = useGLTF(`/${randomModelNumber}.glb`);
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

      const speed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.z ** 2);
      const maxSpeed = 0.3;
      if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        velocityRef.current.x *= ratio;
        velocityRef.current.z *= ratio;
      }

      if (speed > 0.01) {
        targetRotationRef.current = Math.atan2(velocityRef.current.x, velocityRef.current.z);
      }

      playerRef.current.rotation.y = MathUtils.lerp(
        playerRef.current.rotation.y,
        targetRotationRef.current,
        0.1
      );

      const newPos = [
        position[0] + velocityRef.current.x,
        position[1],
        position[2] + velocityRef.current.z
      ];
      setPosition(newPos);
      playerRef.current.position.set(newPos[0], newPos[1], newPos[2]);

      const targetCameraPos = new Vector3(newPos[0], newPos[1] + 5, newPos[2] + 10);
      state.camera.position.lerp(targetCameraPos, 0.1);
      state.camera.lookAt(newPos[0], newPos[1], newPos[2]);

      onPositionChange(newPos);
    }
  });

  return (
    <group ref={playerRef} position={position}>
      <primitive object={clonedScene} scale={[2.5, 2.5, 2.5]} rotation-y={0} />
    </group>
  );
}

function Enemy({ playerPos, enemyPos, onCollision, score }) {
  const enemyRef = useRef();
  const targetRotationRef = useRef(0);
  const BASE_SPEED = 0.08;
  const speedMultiplier = 1 + (score / 1000) * 0.3;
  const ENEMY_SPEED = BASE_SPEED * speedMultiplier;

  const randomModelNumber = useMemo(() => Math.floor(Math.random() * 10) + 1, []);
  const { scene } = useGLTF(`/${randomModelNumber}.glb`);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

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

  useFrame(() => {
    if (enemyRef.current && playerPos) {
      const direction = new Vector3(
        playerPos[0] - enemyRef.current.position.x,
        0,
        playerPos[2] - enemyRef.current.position.z
      );
      const distance = direction.length();

      if (distance > 1.5) {
        direction.normalize();
        enemyRef.current.position.x += direction.x * ENEMY_SPEED;
        enemyRef.current.position.z += direction.z * ENEMY_SPEED;

        targetRotationRef.current = Math.atan2(direction.x, direction.z);
        enemyRef.current.rotation.y = MathUtils.lerp(
          enemyRef.current.rotation.y,
          targetRotationRef.current,
          0.1
        );
      } else {
        onCollision();
      }
    }
  });

  return (
    <group ref={enemyRef} position={enemyPos}>
      <primitive object={clonedScene} scale={[2.5, 2.5, 2.5]} />
    </group>
  );
}

export default function GameScene() {
  const playerRef = useRef();
  const [playerPos, setPlayerPos] = useState([0, 1.8, 0]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const enemyPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = 20;
      positions.push([
        Math.cos(angle) * distance,
        1.8,
        Math.sin(angle) * distance
      ]);
    }
    return positions;
  }, []);

  useEffect(() => {
    if (isGameOver) return;

    const scoreInterval = setInterval(() => {
      setScore(prev => prev + 10);
    }, 1000);

    return () => clearInterval(scoreInterval);
  }, [isGameOver]);

  const handleGameOver = () => {
    setIsGameOver(true);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handlePremium = () => {
    alert('프리미엄 에셋 쇼룸으로 이동합니다!');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#202020' }}>
      <Canvas shadows>
        <Environment preset="city" intensity={1.2} />
        <ambientLight intensity={2.2} />
        <directionalLight position={[15, 20, 10]} castShadow intensity={2} />
        <pointLight position={[0, 5, 0]} intensity={1.5} />
        <pointLight position={[20, 10, 20]} intensity={1.5} />
        <pointLight position={[-20, 10, -20]} intensity={1.5} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="green" />
        </mesh>

        <Player ref={playerRef} playerRef={playerRef} onPositionChange={setPlayerPos} />

        {enemyPositions.map((pos, idx) => (
          <Enemy
            key={idx}
            playerPos={playerPos}
            enemyPos={pos}
            onCollision={handleGameOver}
            score={score}
          />
        ))}
      </Canvas>

      <div style={{
        position: 'fixed',
        top: '30px',
        right: '30px',
        fontSize: '32px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 100,
        fontFamily: 'Arial, sans-serif'
      }}>
        생존 점수: {score}
      </div>

      {isGameOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            textAlign: 'center'
          }}>
            <h1 style={{
              color: '#ff0000',
              fontSize: '80px',
              margin: '0 0 20px 0',
              fontWeight: 'bold'
            }}>
              GAME OVER
            </h1>
            <p style={{
              color: '#ffffff',
              fontSize: '48px',
              margin: '0 0 60px 0',
              fontWeight: 'bold'
            }}>
              최종 점수: {score}
            </p>
            <button
              onClick={handleRestart}
              style={{
                padding: '20px 60px',
                fontSize: '24px',
                backgroundColor: '#ff0000',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.3s',
                marginBottom: '20px',
                display: 'block',
                margin: '0 auto 20px auto'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#cc0000'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ff0000'}
            >
              다시 하기
            </button>
            <button
              onClick={handlePremium}
              style={{
                padding: '20px 60px',
                fontSize: '24px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.3s',
                boxShadow: '0 8px 16px rgba(255, 215, 0, 0.4)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              💎 80,000 폴리곤 프리미엄 스킨 구경하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
