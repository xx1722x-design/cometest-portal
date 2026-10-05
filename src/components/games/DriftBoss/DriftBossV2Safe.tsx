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
  depth: number;
}

interface Character {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  onTrack: boolean;
  isDead: boolean;
}

const CharacterModel = ({
  position,
  characterId = 1,
  modelScale = [0.8, 0.8, 0.8],
  isDead = false,
}: {
  position: THREE.Vector3;
  characterId?: number;
  modelScale?: [number, number, number];
  isDead?: boolean;
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
      <group position={[position.x, position.y, position.z]} scale={modelScale}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    return (
      <mesh position={[position.x, position.y, position.z]} scale={modelScale} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.6]} />
        <meshStandardMaterial
          color={`hsl(${(characterId - 1) * 36}, 100%, 50%)`}
          emissive={`hsl(${(characterId - 1) * 36}, 100%, 30%)`}
          emissiveIntensity={0.4}
        />
      </mesh>
    );
  }
};

const GameLogic = ({
  gameState,
  characters,
  setCharacters,
  platforms,
  setPlatforms,
  isKeyPressed,
  onGameOver,
  setScore,
}: {
  gameState: GameState;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
  onGameOver: (score: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const platformIdRef = useRef(0);
  const lastPlatformZRef = useRef(0);
  const targetXRef = useRef(0);

  useFrame(() => {
    if (gameState !== 'PLAYING') return;

    const moveSpeed = 0.12;
    const gravity = 0.18;
    const fallThreshold = -30;

    const targetX = isKeyPressed.space ? 1.8 : -1.8;
    targetXRef.current += (targetX - targetXRef.current) * moveSpeed;

    let aliveCount = 0;
    const maxZ = Math.max(...characters.map(c => c.position.z));

    setCharacters((prevChars) =>
      prevChars.map((char) => {
        if (char.isDead) {
          return char;
        }

        const newPosition = char.position.clone();
        newPosition.x = targetXRef.current + (char.id % 3) * 0.8 - 0.8;
        newPosition.z += 0.35;

        let onTrack = false;
        for (const platform of platforms) {
          if (
            Math.abs(newPosition.z - platform.z) < platform.depth / 2 + 0.5 &&
            Math.abs(newPosition.x - platform.x) < platform.width / 2 + 0.5
          ) {
            onTrack = true;
            newPosition.y = platform.z + 1.2;
            break;
          }
        }

        let newVelocity = char.velocity.clone();
        if (!onTrack) {
          newVelocity.y -= gravity;
          newPosition.y += newVelocity.y;
        } else {
          newVelocity.y = 0;
        }

        const isDead = newPosition.y < fallThreshold || Math.abs(newPosition.x) > 6;

        if (!isDead) {
          aliveCount++;
        }

        return {
          ...char,
          position: newPosition,
          velocity: newVelocity,
          onTrack,
          isDead,
        };
      })
    );

    const aliveChars = characters.filter((c) => !c.isDead);
    if (aliveChars.length === 0) {
      const finalScore = Math.floor(maxZ / 3);
      onGameOver(finalScore);
      return;
    }

    setScore(Math.floor(maxZ / 3));

    if (maxZ > lastPlatformZRef.current - 8) {
      const newPlatform: Platform = {
        id: platformIdRef.current++,
        z: lastPlatformZRef.current + 3,
        x: Math.random() > 0.5 ? 1.5 : -1.5,
        width: 3,
        depth: 3,
      };

      setPlatforms((prev) => {
        const updated = [...prev, newPlatform].filter((p) => p.z > maxZ - 20);
        return updated;
      });

      lastPlatformZRef.current += 3;
    }
  });

  return null;
};

const PlatformRenderer = ({ platforms }: { platforms: Platform[] }) => {
  return (
    <>
      {platforms.map((platform) => (
        <mesh
          key={platform.id}
          position={[platform.x, -0.5, platform.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[platform.width, 1, platform.depth]} />
          <meshStandardMaterial color="#ff6b35" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

const GameScene = ({
  gameState,
  characters,
  setCharacters,
  platforms,
  setPlatforms,
  isKeyPressed,
  onGameOver,
  setScore,
}: {
  gameState: GameState;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  isKeyPressed: { space: boolean };
  onGameOver: (score: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { camera } = useThree();

  useFrame(() => {
    if (gameState === 'PLAYING' && camera instanceof THREE.OrthographicCamera) {
      const aliveChars = characters.filter((c) => !c.isDead);
      if (aliveChars.length > 0) {
        const avgZ = aliveChars.reduce((sum, c) => sum + c.position.z, 0) / aliveChars.length;
        camera.position.z = avgZ + 25;
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 12, 25]}
        zoom={18}
        near={0.1}
        far={1000}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />

      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[20, 20, 20]} intensity={1.5} castShadow color="#fff9e6" />
      <directionalLight position={[-15, -8, -15]} intensity={0.7} color="#ffcc99" />

      <mesh position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[60, 200]} />
        <meshStandardMaterial color="#ffa366" />
      </mesh>

      <Suspense fallback={null}>
        {characters.map((char) => (
          <CharacterModel
            key={char.id}
            position={char.position}
            characterId={char.id}
            modelScale={[0.8, 0.8, 0.8]}
            isDead={char.isDead}
          />
        ))}
      </Suspense>

      <PlatformRenderer platforms={platforms} />

      <GameLogic
        gameState={gameState}
        characters={characters}
        setCharacters={setCharacters}
        platforms={platforms}
        setPlatforms={setPlatforms}
        isKeyPressed={isKeyPressed}
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
      position: new THREE.Vector3((i % 3) * 0.8 - 0.8, 3, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      onTrack: true,
      isDead: false,
    }))
  );
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: -1, z: -3, x: 0, width: 5, depth: 5 },
    { id: 0, z: 0, x: 1.5, width: 3, depth: 3 },
    { id: 1, z: 3, x: -1.5, width: 3, depth: 3 },
  ]);
  const [isKeyPressed, setIsKeyPressed] = useState({ space: false });
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
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('GAMEOVER');
  };

  const handleRestart = () => {
    setCharacters(
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        position: new THREE.Vector3((i % 3) * 0.8 - 0.8, 3, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        onTrack: true,
        isDead: false,
      }))
    );
    setPlatforms([
      { id: -1, z: -3, x: 0, width: 5, depth: 5 },
      { id: 0, z: 0, x: 1.5, width: 3, depth: 3 },
      { id: 1, z: 3, x: -1.5, width: 3, depth: 3 },
    ]);
    setScore(0);
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
              🚗 SQUAD SURVIVOR
            </h1>
            <p className="text-3xl font-bold text-orange-700 mb-8 drop-shadow-lg">
              Lead Your 10-Character Squad Through The Zigzag!
            </p>
            <div className="space-y-3 mb-12 text-lg font-bold">
              <p className="text-orange-900 drop-shadow-md">
                <span className="text-red-600">🎮 SPACEBAR/TOUCH</span> to dodge right
              </p>
              <p className="text-orange-900 drop-shadow-md">
                <span className="text-red-600">RELEASE</span> to dodge left
              </p>
              <p className="text-orange-900 drop-shadow-md">
                Last squad member standing wins!
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-16 py-5 text-3xl font-black text-white bg-gradient-to-b from-red-500 to-red-600 rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xl drop-shadow-lg border-4 border-red-700"
            >
              ▶ START SQUAD CHALLENGE
            </button>
          </div>
        </div>
      )}

      {/* PLAYING State - Score & Squad Status */}
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
              <p className="text-green-600 text-sm font-black tracking-widest uppercase">Survivors</p>
              <p className="text-green-700 text-5xl font-black">{aliveCount}/10</p>
            </div>
          </div>
        </>
      )}

      {/* GAMEOVER State - Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-50">
          <div className="text-center">
            <h2
              className="text-7xl font-black mb-6 text-red-600 drop-shadow-2xl"
              style={{ textShadow: '3px 3px 0px #fff, 6px 6px 0px rgba(0,0,0,0.3)' }}
            >
              SQUAD ELIMINATED
            </h2>
            <p className="text-2xl font-black text-orange-800 mb-4 drop-shadow-md">Final Score</p>
            <p className="text-8xl font-black text-orange-600 mb-12 drop-shadow-lg">{finalScore}</p>
            <button
              onClick={handleRestart}
              className="px-16 py-5 text-3xl font-black text-white bg-gradient-to-b from-green-500 to-green-600 rounded-2xl hover:from-green-400 hover:to-green-500 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xl drop-shadow-lg border-4 border-green-700"
            >
              🔄 RESTART CHALLENGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
