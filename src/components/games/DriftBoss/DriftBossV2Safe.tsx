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
  modelScale = [1.5, 1.5, 1.5],
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
        <meshStandardMaterial color="#ff6b35" emissive="#ff8c42" emissiveIntensity={0.5} />
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
          <meshStandardMaterial color="#ff6b35" metalness={0.3} roughness={0.7} />
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
        position={[10, 10, 10]}
        zoom={20}
        near={0.1}
        far={1000}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />

      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[15, 15, 15]} intensity={1.5} castShadow color="#fff9e6" />
      <directionalLight position={[-10, -5, -10]} intensity={0.6} color="#ffcc99" />

      <mesh position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[50, 150]} />
        <meshStandardMaterial color="#ffa366" />
      </mesh>

      <Suspense fallback={null}>
        <CharacterModel position={playerState.position} modelScale={[1.5, 1.5, 1.5]} />
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
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-orange-300 via-orange-200 to-amber-100">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="text-center">
            <h1 className="text-8xl font-black mb-6 text-orange-600 drop-shadow-2xl" style={{ textShadow: '3px 3px 0px #fff, 6px 6px 0px rgba(0,0,0,0.2)' }}>
              🚗 DRIFT BOSS
            </h1>
            <p className="text-3xl font-bold text-orange-700 mb-4 drop-shadow-lg">
              Navigate the infinite zigzag track!
            </p>
            <div className="space-y-3 mb-12 text-lg font-bold">
              <p className="text-orange-900 drop-shadow-md">
                <span className="text-red-600">🎮 SPACEBAR/TOUCH</span> to turn right
              </p>
              <p className="text-orange-900 drop-shadow-md">
                <span className="text-red-600">RELEASE</span> to turn left
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-16 py-5 text-3xl font-black text-white bg-gradient-to-b from-red-500 to-red-600 rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xl drop-shadow-lg border-4 border-red-700"
            >
              ▶ START GAME
            </button>
          </div>
        </div>
      )}

      {/* PLAYING State - Score Display */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-8 right-8 z-40 backdrop-blur-sm bg-white/80 rounded-3xl px-8 py-6 border-4 border-orange-500 shadow-lg">
          <div className="text-center">
            <p className="text-orange-600 text-sm font-black tracking-widest uppercase">SCORE</p>
            <p className="text-orange-700 text-6xl font-black">
              {playerState.score}
            </p>
          </div>
        </div>
      )}

      {/* GAMEOVER State - Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-50">
          <div className="text-center">
            <h2 className="text-7xl font-black mb-6 text-red-600 drop-shadow-2xl" style={{ textShadow: '3px 3px 0px #fff, 6px 6px 0px rgba(0,0,0,0.3)' }}>
              GAME OVER
            </h2>
            <p className="text-2xl font-black text-orange-800 mb-4 drop-shadow-md">Final Score</p>
            <p className="text-8xl font-black text-orange-600 mb-12 drop-shadow-lg">
              {finalScore}
            </p>
            <button
              onClick={handleRestart}
              className="px-16 py-5 text-3xl font-black text-white bg-gradient-to-b from-green-500 to-green-600 rounded-2xl hover:from-green-400 hover:to-green-500 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xl drop-shadow-lg border-4 border-green-700"
            >
              🔄 TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
