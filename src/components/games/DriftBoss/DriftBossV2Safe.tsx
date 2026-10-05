import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type GameState = 'IDLE' | 'PLAYING' | 'GAMEOVER';
type Direction = 'Z' | 'X';

interface Platform {
  id: number;
  x: number;
  z: number;
}

interface Character {
  id: number;
  x: number;
  z: number;
  y: number;
  velocity: number;
  isDead: boolean;
}

interface PathHistory {
  x: number;
  z: number;
}

const CharacterModel = ({
  position,
  characterId = 1,
}: {
  position: { x: number; y: number; z: number };
  characterId?: number;
}) => {
  try {
    const { scene } = useGLTF(`/3000charactors/${characterId}.glb`) as any;
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
      <group position={[position.x, position.y, position.z]} scale={[1, 1, 1]}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    return (
      <mesh position={[position.x, position.y, position.z]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial
          color={`hsl(${(characterId - 1) * 36}, 100%, 50%)`}
          emissive={`hsl(${(characterId - 1) * 36}, 100%, 30%)`}
          emissiveIntensity={0.4}
        />
      </mesh>
    );
  }
};

const PlatformRenderer = ({ platforms }: { platforms: Platform[] }) => {
  return (
    <>
      {platforms.map((platform) => (
        <mesh key={platform.id} position={[platform.x, 0, platform.z]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.8, 3]} />
          <meshStandardMaterial color="#ff6b35" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

const GameLogic = ({
  gameState,
  characters,
  setCharacters,
  platforms,
  setPlatforms,
  isKeyPressed,
  pathHistory,
  setPathHistory,
  onGameOver,
  setScore,
}: {
  gameState: GameState;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
  pathHistory: PathHistory[];
  setPathHistory: React.Dispatch<React.SetStateAction<PathHistory[]>>;
  onGameOver: (score: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const platformIdRef = useRef(0);
  const lastPlatformRef = useRef({ x: 0, z: 0 });
  const currentDirectionRef = useRef<Direction>('Z');
  const frameCountRef = useRef(0);

  useFrame(() => {
    if (gameState !== 'PLAYING') return;

    frameCountRef.current++;
    const gravity = 0.15;
    const fallThreshold = -15;
    const moveSpeed = 0.35;

    // Leader movement (Character 1)
    let leaderX = characters[0].x;
    let leaderZ = characters[0].z;

    // Toggle direction on spacebar
    if (isKeyPressed.space) {
      currentDirectionRef.current = 'X';
    } else {
      currentDirectionRef.current = 'Z';
    }

    // Move leader based on current direction
    if (currentDirectionRef.current === 'Z') {
      leaderZ += moveSpeed;
    } else {
      leaderX += moveSpeed;
    }

    // Record leader's path for followers to follow
    if (frameCountRef.current % 2 === 0) {
      setPathHistory((prev) => [...prev, { x: leaderX, z: leaderZ }].slice(-300));
    }

    // Generate new platform when leader gets close to edge
    if (
      Math.abs(leaderZ - lastPlatformRef.current.z) > 20 ||
      Math.abs(leaderX - lastPlatformRef.current.x) > 20
    ) {
      const nextDirection = Math.random() > 0.5 ? 'X' : 'Z';
      let nextX = lastPlatformRef.current.x;
      let nextZ = lastPlatformRef.current.z;

      if (nextDirection === 'X') {
        nextX += 3;
      } else {
        nextZ += 3;
      }

      const newPlatform: Platform = {
        id: platformIdRef.current++,
        x: nextX,
        z: nextZ,
      };

      setPlatforms((prev) => {
        const filtered = prev.filter(
          (p) => Math.abs(p.x - leaderX) < 60 && Math.abs(p.z - leaderZ) < 60
        );
        return [...filtered, newPlatform];
      });

      lastPlatformRef.current = { x: nextX, z: nextZ };
    }

    // Update all characters
    setCharacters((prevChars) => {
      const updatedChars = prevChars.map((char, idx) => {
        if (char.isDead) return char;

        let charX = char.x;
        let charZ = char.z;

        if (idx === 0) {
          // Leader follows input
          charX = leaderX;
          charZ = leaderZ;
        } else {
          // Followers follow the path history with delay
          const delayFrames = idx * 15;
          const historyIndex = Math.max(0, pathHistory.length - delayFrames);

          if (historyIndex < pathHistory.length) {
            charX = pathHistory[historyIndex].x;
            charZ = pathHistory[historyIndex].z;
          } else {
            charX = characters[idx].x;
            charZ = characters[idx].z;
          }
        }

        // Check collision with track
        let onTrack = false;
        for (const platform of platforms) {
          if (
            Math.abs(charX - platform.x) < 1.8 &&
            Math.abs(charZ - platform.z) < 1.8
          ) {
            onTrack = true;
            break;
          }
        }

        let newY = char.y;
        let newVelocity = char.velocity;

        if (!onTrack) {
          newVelocity -= gravity;
          newY += newVelocity;
        } else {
          newVelocity = 0;
          newY = 0.5;
        }

        const isDead = newY < fallThreshold;

        return {
          ...char,
          x: charX,
          z: charZ,
          y: newY,
          velocity: newVelocity,
          isDead,
        };
      });

      const aliveChars = updatedChars.filter((c) => !c.isDead);
      if (aliveChars.length === 0) {
        onGameOver(Math.max(0, Math.floor((leaderZ + leaderX) / 6)));
        return updatedChars;
      }

      setScore(Math.max(0, Math.floor((leaderZ + leaderX) / 6)));

      return updatedChars;
    });
  });

  return null;
};

const GameScene = ({
  gameState,
  characters,
  setCharacters,
  platforms,
  setPlatforms,
  isKeyPressed,
  pathHistory,
  setPathHistory,
  onGameOver,
  setScore,
}: {
  gameState: GameState;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
  pathHistory: PathHistory[];
  setPathHistory: React.Dispatch<React.SetStateAction<PathHistory[]>>;
  onGameOver: (score: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { camera } = useThree();

  useFrame(() => {
    if (gameState === 'PLAYING' && camera instanceof THREE.OrthographicCamera) {
      const leader = characters[0];
      const targetX = leader.x - 5;
      const targetZ = leader.z + 5;

      camera.position.x += (targetX - camera.position.x) * 0.1;
      camera.position.z += (targetZ - camera.position.z) * 0.1;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[15, 15, 15]}
        zoom={16}
        near={0.1}
        far={1000}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />

      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[25, 25, 25]} intensity={1.5} castShadow color="#fff9e6" />
      <directionalLight position={[-20, -10, -20]} intensity={0.8} color="#ffcc99" />

      <mesh position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#ffa366" />
      </mesh>

      <PlatformRenderer platforms={platforms} />

      <Suspense fallback={null}>
        {characters.map((char) => (
          <CharacterModel
            key={char.id}
            position={{ x: char.x, y: char.y, z: char.z }}
            characterId={char.id}
          />
        ))}
      </Suspense>

      <GameLogic
        gameState={gameState}
        characters={characters}
        setCharacters={setCharacters}
        platforms={platforms}
        setPlatforms={setPlatforms}
        isKeyPressed={isKeyPressed}
        pathHistory={pathHistory}
        setPathHistory={setPathHistory}
        onGameOver={onGameOver}
        setScore={setScore}
      />
    </>
  );
};

export function DriftBossV2Safe() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [characters, setCharacters] = useState<Character[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      x: 0,
      z: 0,
      y: 0.5,
      velocity: 0,
      isDead: false,
    }))
  );
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 0, x: 0, z: 0 },
    { id: 1, x: 3, z: 0 },
    { id: 2, x: 3, z: 3 },
    { id: 3, x: 3, z: 6 },
    { id: 4, x: 0, z: 6 },
    { id: 5, x: 0, z: 9 },
  ]);
  const [isKeyPressed, setIsKeyPressed] = useState({ space: false });
  const [pathHistory, setPathHistory] = useState<PathHistory[]>([]);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const aliveCount = characters.filter((c) => !c.isDead).length;

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
    setPathHistory([]);
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('GAMEOVER');
  };

  const handleRestart = () => {
    setCharacters(
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        x: 0,
        z: 0,
        y: 0.5,
        velocity: 0,
        isDead: false,
      }))
    );
    setPlatforms([
      { id: 0, x: 0, z: 0 },
      { id: 1, x: 3, z: 0 },
      { id: 2, x: 3, z: 3 },
      { id: 3, x: 3, z: 6 },
      { id: 4, x: 0, z: 6 },
      { id: 5, x: 0, z: 9 },
    ]);
    setScore(0);
    setPathHistory([]);
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
          characters={characters}
          setCharacters={setCharacters}
          platforms={platforms}
          setPlatforms={setPlatforms}
          isKeyPressed={isKeyPressed}
          pathHistory={pathHistory}
          setPathHistory={setPathHistory}
          onGameOver={handleGameOver}
          setScore={setScore}
        />
      </Canvas>

      {/* IDLE State - Start Screen */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="text-center">
            <h1
              className="text-8xl font-black mb-6 text-orange-600 drop-shadow-2xl"
              style={{ textShadow: '3px 3px 0px #fff, 6px 6px 0px rgba(0,0,0,0.2)' }}
            >
              🚂 SQUAD DRIFT
            </h1>
            <p className="text-3xl font-bold text-orange-700 mb-8 drop-shadow-lg">
              Lead Your Train Through The Zigzag!
            </p>
            <div className="space-y-3 mb-12 text-lg font-bold">
              <p className="text-orange-900 drop-shadow-md">
                <span className="text-red-600">🎮 HOLD SPACEBAR</span> to turn RIGHT
              </p>
              <p className="text-orange-900 drop-shadow-md">
                <span className="text-red-600">RELEASE</span> to turn LEFT
              </p>
              <p className="text-orange-900 drop-shadow-md">
                Keep the train together! All fall = Game Over!
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-16 py-5 text-3xl font-black text-white bg-gradient-to-b from-red-500 to-red-600 rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xl drop-shadow-lg border-4 border-red-700"
            >
              ▶ START CHALLENGE
            </button>
          </div>
        </div>
      )}

      {/* PLAYING State - Score & Survivors */}
      {gameState === 'PLAYING' && (
        <>
          <div className="absolute top-8 right-8 z-40 backdrop-blur-sm bg-white/80 rounded-3xl px-8 py-6 border-4 border-orange-500 shadow-lg">
            <div className="text-center">
              <p className="text-orange-600 text-sm font-black tracking-widest uppercase">Score</p>
              <p className="text-orange-700 text-6xl font-black">{score}</p>
            </div>
          </div>

          <div className="absolute top-8 left-8 z-40 backdrop-blur-sm bg-white/80 rounded-3xl px-8 py-6 border-4 border-green-500 shadow-lg">
            <div className="text-center">
              <p className="text-green-600 text-sm font-black tracking-widest uppercase">Train</p>
              <p className="text-green-700 text-5xl font-black">{aliveCount}/10</p>
            </div>
          </div>
        </>
      )}

      {/* GAMEOVER State */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-50">
          <div className="text-center">
            <h2
              className="text-7xl font-black mb-6 text-red-600 drop-shadow-2xl"
              style={{ textShadow: '3px 3px 0px #fff, 6px 6px 0px rgba(0,0,0,0.3)' }}
            >
              TRAIN DERAILED
            </h2>
            <p className="text-2xl font-black text-orange-800 mb-4 drop-shadow-md">Final Score</p>
            <p className="text-8xl font-black text-orange-600 mb-12 drop-shadow-lg">{finalScore}</p>
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
