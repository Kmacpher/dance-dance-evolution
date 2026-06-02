import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { homeAudio } from '../game/homeAudio';

// Pink to match the legacy "SexyBack" visualizer (THREE color 0xea4c88).
const PINK = '#ea4c88';

// Four rings of vertical bars whose heights track the audio spectrum — a
// faithful remake of the legacy quarterFormation, but drawn as a single
// InstancedMesh (one draw call) so it stays light on weak GPUs.
const RINGS = 4;
const BARS_PER_RING = 64;
const COUNT = RINGS * BARS_PER_RING;

// Ring centers in the XZ plane — the original's four corners (2x2 grid).
const RING_CENTERS: [number, number][] = [
  [-1.8, -1.8],
  [1.8, -1.8],
  [-1.8, 1.8],
  [1.8, 1.8],
];
const RING_RADIUS = 1.35;
const BAR_WIDTH = 0.015;

function Bars() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Eases 0..1 toward whether audio is playing — drives a smooth start/stop of
  // the whole visualizer so it freezes when the music is paused.
  const levelRef = useRef(0);

  // Precompute each bar's ring position + which frequency bin it reads.
  const bars = useMemo(() => {
    const arr: { x: number; z: number; bin: number }[] = [];
    for (let r = 0; r < RINGS; r++) {
      const [cx, cz] = RING_CENTERS[r];
      for (let i = 0; i < BARS_PER_RING; i++) {
        const a = (i / BARS_PER_RING) * Math.PI * 2;
        const x = cx + RING_RADIUS * Math.sin(a);
        const z = cz + RING_RADIUS * Math.cos(a);
        const g = r * BARS_PER_RING + i;
        // Sweep across the low-mid bins, where music actually has energy
        // (mirrors the legacy freqByteData[i + OFFSET] sequential mapping).
        const bin = 2 + Math.floor((g / COUNT) * 140);
        arr.push({ x, z, bin });
      }
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group) return;

    // Ease toward play/pause: bars grow in when starting and flatten + spin
    // stops when the music fades out.
    const target = homeAudio.isPlaying ? 1 : 0;
    levelRef.current += (target - levelRef.current) * Math.min(1, delta * 8);
    const level = levelRef.current;

    const freq = homeAudio.getFrequencies();
    for (let g = 0; g < COUNT; g++) {
      const { x, z, bin } = bars[g];
      const mag = freq.length ? freq[bin] / 255 : 0;
      const h = 0.06 + mag * mag * 2.6 * level;
      dummy.position.set(x, h / 2, z);
      dummy.scale.set(BAR_WIDTH, h, BAR_WIDTH);
      dummy.updateMatrix();
      mesh.setMatrixAt(g, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Steady spin (scaled by level so it stops with the music), like the
    // original's groupCubes.rotation.y -= 0.001.
    group.rotation.y += 0.0016 * level;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={PINK}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

// Look down at the rings from a steep above-front angle so they read as
// ellipses, like the legacy orthographic camera (y=300, z=500, lookAt group).
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 5.4, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function Visualizer() {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 5.4, 6], fov: 55 }}
      // Hard-cap device-pixel-ratio at 1 to keep it light on weak GPUs.
      dpr={1}
    >
      <CameraRig />
      <Bars />
    </Canvas>
  );
}
