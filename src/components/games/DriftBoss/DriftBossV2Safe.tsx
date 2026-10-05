import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Platform {
  id: number;
  z: number;
  x: number;
  width: number;
}

interface PlayerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  onTrack: boolean;
  gameOver: boolean;
  score: number;
}

// Character Model Loader
const CharacterModel = ({
  position,
  modelScale = [1, 1, 1],
}: {
  position: THREE.Vector3;
  modelScale?: [number, number, number];
}) => {
  try {
    const { scene } = useGLTF('/3000charactors/1.glb') as any;
    const clonedScene = scene.clone();

    useEffect(() => {
      clonedScene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [clonedScene]);

    return (
      <group position={[position.x, position.y, position.z]} scale={modelScale}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    // Fallback: Pink cube if GLB fails to load
    console.warn('GLB load failed, using fallback cube');
    return (
      <mesh position={[position.x, position.y, position.z]} scale={modelScale} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ff1493" emissiveIntensity={0.3} />
      </mesh>
    );
  }
};

// Game Logic Component
const GameLogic = ({
  playerState,
  setPlayerState,
  platforms,
  setPlatforms,
  isKeyPressed,
}: {
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
}) => {
  const platformIdRef = useRef(0);
  const lastPlatformZRef = useRef(0);
  const targetXRef = useRef(0);

  useFrame(() => {
    if (playerState.gameOver) return;

    const moveSpeed = 0.1;
    const gravity = 0.15;
    const fallThreshold = -20;

    // Movement: Space = right diagonal, no space = left diagonal
    const targetX = isKeyPressed.space ? 2.5 : -2.5;
    targetXRef.current += (targetX - targetXRef.current) * moveSpeed;

    // Update position
    const newPosition = playerState.position.clone();
    newPosition.x = targetXRef.current;
    newPosition.z += 0.4; // Continuous forward movement

    // Track collision detection
    let onTrack = false;
    for (const platform of platforms) {
      if (
        Math.abs(newPosition.z - platform.z) < 1.2 &&
        Math.abs(newPosition.x) < platform.width / 2 + 0.5
      ) {
        onTrack = true;
        newPosition.y = platform.z + 1.5;
        break;
      }
    }

    // Gravity & falling
    let newVelocity = playerState.velocity.clone();
    if (!onTrack) {
      newVelocity.y -= gravity;
      newPosition.y += newVelocity.y;
    } else {
      newVelocity.y = 0;
    }

    // Game over conditions
    if (newPosition.y < fallThreshold || Math.abs(newPosition.x) > 5) {
      setPlayerState((prev) => ({ ...prev, gameOver: true }));
      return;
    }

    // Generate new track platforms
    if (newPosition.z > lastPlatformZRef.current - 5) {
      const newPlatform: Platform = {
        id: platformIdRef.current++,
        z: lastPlatformZRef.current + 4,
        x: Math.random() > 0.5 ? 2.5 : -2.5,
        width: 5,
      };

      setPlatforms((prev) => {
        const updated = [...prev, newPlatform].filter((p) => p.z > newPosition.z - 15);
        return updated;
      });

      lastPlatformZRef.current += 4;
    }

    setPlayerState((prev) => ({
      ...prev,
      position: newPosition,
      velocity: newVelocity,
      onTrack,
      score: Math.max(prev.score, Math.floor(newPosition.z / 4)),
    }));
  });

  return null;
};

// Platform Renderer
const PlatformRenderer = ({ platforms }: { platforms: Platform[] }) => {
  return (
    <>
      {platforms.map((platform) => (
        <mesh key={platform.id} position={[platform.x, 0, platform.z]} castShadow receiveShadow>
          <boxGeometry args={[platform.width, 0.5, 2.5]} />
          <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </>
  );
};

// Main Game Scene
const GameScene = ({ modelScale }: { modelScale: [number, number, number] }) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: new THREE.Vector3(0, 5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    onTrack: true,
    gameOver: false,
    score: 0,
  });

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: -1, z: -2, x: 0, width: 5 },
    { id: 0, z: 2, x: 2.5, width: 5 },
    { id: 1, z: 6, x: -2.5, width: 5 },
  ]);

  const [isKeyPressed, setIsKeyPressed] = useState({ space: false });
  const { camera } = useThree();

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsKeyPressed((prev) => ({ ...prev, space: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsKeyPressed((prev) => ({ ...prev, space: false }));
      }
    };

    const handleTouchStart = () => setIsKeyPressed((prev) => ({ ...prev, space: true }));
    const handleTouchEnd = () => setIsKeyPressed((prev) => ({ ...prev, space: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Camera follows player
  useFrame(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = playerState.position.z + 18;
      camera.updateProjectionMatrix();
    }
  });

  const handleRestart = () => {
    setPlayerState({
      position: new THREE.Vector3(0, 5, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      onTrack: true,
      gameOver: false,
      score: 0,
    });
    setPlatforms([
      { id: -1, z: -2, x: 0, width: 5 },
      { id: 0, z: 2, x: 2.5, width: 5 },
      { id: 1, z: 6, x: -2.5, width: 5 },
    ]);
  };

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[5, 8, 15]}
        zoom={22}
        near={0.1}
        far={1000}
        onUpdate={(camera) => camera.lookAt(0, 5, 0)}
      />

      <ambientLight intensity={0.9} />
      <directionalLight position={[12, 15, 12]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -5, -10]} intensity={0.4} />

      {/* Ground */}
      <mesh position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[40, 120]} />
        <meshStandardMaterial color="#0f0f1a" />
      </mesh>

      {/* Player Character */}
      <Suspense fallback={null}>
        <CharacterModel position={playerState.position} modelScale={modelScale} />
      </Suspense>

      {/* Platforms */}
      <PlatformRenderer platforms={platforms} />

      {/* Game Logic */}
      <GameLogic
        playerState={playerState}
        setPlayerState={setPlayerState}
        platforms={platforms}
        setPlatforms={setPlatforms}
        isKeyPressed={isKeyPressed}
      />

      {/* Game Over Overlay */}
      {playerState.gameOver && (
        <group>
          <mesh position={[0, playerState.position.y, playerState.position.z]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="black" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </>
  );
};

export function DriftBossV2Safe() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOverScore, setGameOverScore] = useState(0);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, pixelRatio: Math.min(window.devicePixelRatio, 2), alpha: true }}
      >
        {gameStarted && <GameScene modelScale={[1, 1, 1]} />}
      </Canvas>

      {/* UI Overlay */}
      {!gameStarted && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            zIndex: 10,
          }}
        >
          <h1 style={{ fontSize: '3.5em', color: 'white', marginBottom: '20px', fontWeight: 'bold' }}>
            🚗 DRIFT BOSS
          </h1>
          <p style={{ fontSize: '1.2em', color: '#cbd5e1', marginBottom: '40px', maxWidth: '500px', textAlign: 'center' }}>
            Navigate the zigzag track. Hold SPACE to turn right. Release to turn left. Survive as long as you can!
          </p>
          <button
            onClick={() => setGameStarted(true)}
            style={{
              padding: '18px 50px',
              fontSize: '1.3em',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#16a34a';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            START GAME
          </button>
        </div>
      )}
    </div>
  );
}
