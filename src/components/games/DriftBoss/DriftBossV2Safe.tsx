import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Text } from '@react-three/drei';
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
  onPlatform: boolean;
  gameOver: boolean;
  score: number;
}

// Safe Pink Box Player - NO GLB file loading
const PlayerBox = ({ position }: { position: THREE.Vector3 }) => {
  return (
    <mesh position={[position.x, position.y, position.z]} castShadow>
      <boxGeometry args={[0.8, 1.2, 0.8]} />
      <meshStandardMaterial
        color="#ec4899"
        metalness={0.8}
        roughness={0.2}
        emissive="#ff1493"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

const DriftBossPlayer = ({
  playerState,
  setPlayerState,
  platforms,
  isKeyPressed,
}: {
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  platforms: Platform[];
  isKeyPressed: { space: boolean };
}) => {
  const targetXRef = useRef(0);

  useFrame(() => {
    if (playerState.gameOver) return;

    const gravity = 0.12;
    const fallThreshold = -15;

    const targetX = isKeyPressed.space ? 2 : -2;
    targetXRef.current += (targetX - targetXRef.current) * 0.1;

    const newPosition = playerState.position.clone();
    newPosition.x = targetXRef.current;
    newPosition.z += 0.35;

    let onPlatform = false;
    for (const platform of platforms) {
      if (
        Math.abs(newPosition.z - platform.z) < 1.2 &&
        Math.abs(newPosition.x) < platform.width / 2 + 0.5
      ) {
        onPlatform = true;
        newPosition.y = platform.z + 1.5;
        break;
      }
    }

    let newVelocity = playerState.velocity.clone();
    if (!onPlatform) {
      newVelocity.y -= gravity;
      newPosition.y += newVelocity.y;
    } else {
      newVelocity.y = 0;
    }

    if (newPosition.y < fallThreshold || Math.abs(newPosition.x) > 5) {
      setPlayerState((prev) => ({ ...prev, gameOver: true }));
      return;
    }

    setPlayerState((prev) => ({
      ...prev,
      position: newPosition,
      velocity: newVelocity,
      onPlatform,
      score: Math.max(prev.score, Math.floor(newPosition.z / 2)),
    }));
  });

  return <PlayerBox position={playerState.position} />;
};

const PlatformGrid = ({
  platforms,
  setPlatforms,
  playerZ,
}: {
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  playerZ: number;
}) => {
  const platformIdRef = useRef(0);
  const lastPlatformZRef = useRef(0);

  useEffect(() => {
    if (playerZ > lastPlatformZRef.current - 5) {
      const newPlatform: Platform = {
        id: platformIdRef.current++,
        z: lastPlatformZRef.current + 4,
        x: Math.random() > 0.5 ? 2 : -2,
        width: 4,
      };

      setPlatforms((prev) => {
        const updated = [...prev, newPlatform].filter((p) => p.z > playerZ - 15);
        return updated;
      });

      lastPlatformZRef.current += 4;
    }
  }, [playerZ, setPlatforms]);

  return (
    <>
      {platforms.map((platform) => (
        <mesh key={platform.id} position={[platform.x, 0, platform.z]} castShadow>
          <boxGeometry args={[platform.width, 0.5, 2]} />
          <meshStandardMaterial color="#f97316" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

const GameScene = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: new THREE.Vector3(0, 5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    onPlatform: true,
    gameOver: false,
    score: 0,
  });

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: -1, z: -2, x: 0, width: 4 },
    { id: 0, z: 2, x: 2, width: 4 },
    { id: 1, z: 6, x: -2, width: 4 },
  ]);

  const [isKeyPressed, setIsKeyPressed] = useState({ space: false });
  const { camera } = useThree();

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

    const handleTouchStart = () => {
      setIsKeyPressed((prev) => ({ ...prev, space: true }));
    };

    const handleTouchEnd = () => {
      setIsKeyPressed((prev) => ({ ...prev, space: false }));
    };

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

  useFrame(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = playerState.position.z + 15;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[5, 8, 15]}
        zoom={25}
        near={0.1}
        far={1000}
        onUpdate={(camera) => camera.lookAt(0, 5, 0)}
      />

      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, -5, -10]} intensity={0.3} />

      <mesh position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[30, 100]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      <DriftBossPlayer
        playerState={playerState}
        setPlayerState={setPlayerState}
        platforms={platforms}
        isKeyPressed={isKeyPressed}
      />

      <PlatformGrid platforms={platforms} setPlatforms={setPlatforms} playerZ={playerState.position.z} />

      {playerState.gameOver && (
        <>
          <mesh position={[0, playerState.position.y, playerState.position.z]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="black" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[0, 3, playerState.position.z + 0.1]}
            fontSize={2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            GAME OVER
          </Text>
          <Text
            position={[0, 0, playerState.position.z + 0.1]}
            fontSize={1.2}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
          >
            Score: {playerState.score}
          </Text>
        </>
      )}

      <Text position={[-8, playerState.position.y + 3, playerState.position.z + 5]} fontSize={0.8} color="white" anchorX="left">
        Score: {playerState.score}
      </Text>

      {playerState.score < 5 && (
        <Text position={[-8, playerState.position.y + 1.5, playerState.position.z + 5]} fontSize={0.4} color="#cbd5e1" anchorX="left">
          Hold SPACE to move right
        </Text>
      )}
    </>
  );
};

export function DriftBossV2Safe() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!gameStarted && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <h1 style={{ fontSize: '3em', marginBottom: '20px', fontWeight: 'bold' }}>
            🚗 DRIFT BOSS
          </h1>
          <p style={{ fontSize: '1.1em', marginBottom: '30px', color: '#cbd5e1' }}>
            Navigate the zigzag path and survive as long as you can!
          </p>
          <button
            onClick={() => setGameStarted(true)}
            style={{
              padding: '15px 40px',
              fontSize: '1.2em',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#16a34a';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            START GAME
          </button>
          <p style={{ marginTop: '30px', fontSize: '0.9em', color: '#94a3b8', maxWidth: '400px' }}>
            💡 Tip: Hold SPACE (or touch) to move right, release to move left
          </p>
        </div>
      )}

      <Canvas
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        gl={{ antialias: true, pixelRatio: Math.min(window.devicePixelRatio, 2), alpha: true }}
      >
        {gameStarted && <GameScene />}
      </Canvas>
    </div>
  );
}
