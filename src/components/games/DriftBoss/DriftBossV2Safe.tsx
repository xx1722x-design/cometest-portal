import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type GameState = 'IDLE' | 'PLAYING' | 'GAMEOVER';

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
  score: number;
}

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
    return (
      <mesh position={[position.x, position.y, position.z]} scale={modelScale} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ff1493" emissiveIntensity={0.3} />
      </mesh>
    );
  }
};

const GameLogic = ({
  gameState,
  playerState,
  setPlayerState,
  platforms,
  setPlatforms,
  isKeyPressed,
  onGameOver,
}: {
  gameState: GameState;
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
  onGameOver: (score: number) => void;
}) => {
  const platformIdRef = useRef(0);
  const lastPlatformZRef = useRef(0);
  const targetXRef = useRef(0);

  useFrame(() => {
    if (gameState !== 'PLAYING') return;

    const moveSpeed = 0.1;
    const gravity = 0.15;
    const fallThreshold = -20;

    const targetX = isKeyPressed.space ? 2.5 : -2.5;
    targetXRef.current += (targetX - targetXRef.current) * moveSpeed;

    const newPosition = playerState.position.clone();
    newPosition.x = targetXRef.current;
    newPosition.z += 0.4;

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

    let newVelocity = playerState.velocity.clone();
    if (!onTrack) {
      newVelocity.y -= gravity;
      newPosition.y += newVelocity.y;
    } else {
      newVelocity.y = 0;
    }

    if (newPosition.y < fallThreshold || Math.abs(newPosition.x) > 5) {
      onGameOver(Math.floor(playerState.position.z / 4));
      return;
    }

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

const GameScene = ({
  gameState,
  playerState,
  setPlayerState,
  platforms,
  setPlatforms,
  isKeyPressed,
  onGameOver,
}: {
  gameState: GameState;
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
  onGameOver: (score: number) => void;
}) => {
  const { camera } = useThree();

  useFrame(() => {
    if (camera instanceof THREE.OrthographicCamera && gameState === 'PLAYING') {
      camera.position.z = playerState.position.z + 18;
      camera.updateProjectionMatrix();
    }
  });

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

      <mesh position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[40, 120]} />
        <meshStandardMaterial color="#0f0f1a" />
      </mesh>

      <Suspense fallback={null}>
        <CharacterModel position={playerState.position} modelScale={[1, 1, 1]} />
      </Suspense>

      <PlatformRenderer platforms={platforms} />

      <GameLogic
        gameState={gameState}
        playerState={playerState}
        setPlayerState={setPlayerState}
        platforms={platforms}
        setPlatforms={setPlatforms}
        isKeyPressed={isKeyPressed}
        onGameOver={onGameOver}
      />
    </>
  );
};

export function DriftBossV2Safe() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: new THREE.Vector3(0, 5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    onTrack: true,
    score: 0,
  });
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: -1, z: -2, x: 0, width: 5 },
    { id: 0, z: 2, x: 2.5, width: 5 },
    { id: 1, z: 6, x: -2.5, width: 5 },
  ]);
  const [isKeyPressed, setIsKeyPressed] = useState({ space: false });
  const [finalScore, setFinalScore] = useState(0);

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

  const handleStartGame = () => {
    setGameState('PLAYING');
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('GAMEOVER');
  };

  const handleRestart = () => {
    setPlayerState({
      position: new THREE.Vector3(0, 5, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      onTrack: true,
      score: 0,
    });
    setPlatforms([
      { id: -1, z: -2, x: 0, width: 5 },
      { id: 0, z: 2, x: 2.5, width: 5 },
      { id: 1, z: 6, x: -2.5, width: 5 },
    ]);
    setGameState('PLAYING');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, pixelRatio: Math.min(window.devicePixelRatio, 2), alpha: true }}
      >
        <GameScene
          gameState={gameState}
          playerState={playerState}
          setPlayerState={setPlayerState}
          platforms={platforms}
          setPlatforms={setPlatforms}
          isKeyPressed={isKeyPressed}
          onGameOver={handleGameOver}
        />
      </Canvas>

      {/* IDLE State - Start Screen */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-sm z-50">
          <div className="text-center">
            <h1 className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg">
              🚗 DRIFT BOSS
            </h1>
            <p className="text-2xl font-bold text-cyan-300 mb-4 drop-shadow-lg">
              Navigate the infinite zigzag track!
            </p>
            <div className="space-y-3 mb-12 text-lg font-semibold">
              <p className="text-white/90 drop-shadow-md">
                <span className="text-yellow-300">🎮 SPACEBAR/TOUCH</span> to turn right
              </p>
              <p className="text-white/90 drop-shadow-md">
                <span className="text-yellow-300">RELEASE</span> to turn left
              </p>
              <p className="text-white/90 drop-shadow-md">
                Survive as long as you can!
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-12 py-4 text-2xl font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl drop-shadow-lg"
            >
              ▶ START GAME
            </button>
          </div>
        </div>
      )}

      {/* PLAYING State - Score Display */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-8 right-8 z-40 backdrop-blur-md bg-black/50 rounded-2xl px-8 py-4 border-2 border-cyan-400/50">
          <div className="text-center">
            <p className="text-cyan-300 text-sm font-semibold tracking-widest uppercase">SCORE</p>
            <p className="text-white text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {playerState.score}
            </p>
          </div>
        </div>
      )}

      {/* GAMEOVER State - Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 via-black/70 to-black/80 backdrop-blur-md z-50">
          <div className="text-center">
            <h2 className="text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 drop-shadow-lg">
              GAME OVER
            </h2>
            <p className="text-3xl font-bold text-white mb-3 drop-shadow-md">Final Score</p>
            <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-12 drop-shadow-lg">
              {finalScore}
            </p>
            <button
              onClick={handleRestart}
              className="px-12 py-4 text-2xl font-black text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl drop-shadow-lg"
            >
              🔄 TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
