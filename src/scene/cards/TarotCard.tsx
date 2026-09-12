import { getSharedBackTexture } from '@/scene/illustrations/card-back';
import { createFrontTexture } from '@/scene/illustrations/card-fronts';
import type { SectionId } from '@/types';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Group, Mesh, PointLight } from 'three';
import { CardDef } from './card-configs';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface TarotCardProps {
  def: CardDef;
  isActive: boolean;
  isAnyActive: boolean;
  onSelect: (id: SectionId) => void;
  dealDelay: number;
}

export function TarotCard({
  def,
  isActive,
  isAnyActive,
  onSelect,
  dealDelay,
}: TarotCardProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const glowLightRef = useRef<PointLight>(null);
  const materialFrontRef = useRef<THREE.MeshStandardMaterial>(null);
  const materialBackRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowBorderRef = useRef<THREE.MeshBasicMaterial>(null);

  const [isHovered, setIsHovered] = useState(false);

  const flipProgress = useRef(0);
  const hoverLift = useRef(0);
  const activeLift = useRef(0);
  const glowIntensity = useRef(0);
  const dimProgress = useRef(0);
  const dealProgress = useRef(0);
  const dealClock = useRef(0);
  const settledBaseY = useRef(-8);

  const backTexture = getSharedBackTexture();
  const frontTexture = useMemo(() => createFrontTexture(def), [def]);
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) throw new Error('Canvas 2D context unavailable');
    const ratioX = 2.0 / 3.0;
    const ratioY = 3.5 / 5.25;
    const cw = 256 * ratioX;
    const ch = 256 * ratioY;
    const cx = (256 - cw) / 2;
    const cy = (256 - ch) / 2;
    ctx2d.clearRect(0, 0, 256, 256);
    ctx2d.shadowColor = def.accentColor;
    ctx2d.shadowBlur = 14;
    ctx2d.fillStyle = def.accentColor + 'ff';
    ctx2d.fillRect(cx, cy, cw, ch);
    ctx2d.globalCompositeOperation = 'destination-out';
    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = 'rgba(0,0,0,1)';
    ctx2d.fillRect(cx, cy, cw, ch);
    return new THREE.CanvasTexture(canvas);
  }, [def.accentColor]);

  useEffect(() => {
    return () => {
      frontTexture.dispose();
      glowTexture.dispose();
      document.body.style.cursor = 'auto';
    };
  }, [frontTexture, glowTexture]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(def.id);
    },
    [def.id, onSelect],
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  useFrame((_state, delta) => {
    dealClock.current += delta;
    if (dealClock.current > dealDelay && dealProgress.current < 1) {
      dealProgress.current = prefersReducedMotion
        ? 1
        : Math.min(1, dealProgress.current + delta / 0.85);
    }
    const t = dealProgress.current;
    const ease = 1 - Math.pow(1 - t, 3);

    hoverLift.current = THREE.MathUtils.lerp(
      hoverLift.current,
      isHovered ? 1 : 0,
      prefersReducedMotion ? 1 : 1 - Math.pow(0.02, delta),
    );
    activeLift.current = THREE.MathUtils.lerp(
      activeLift.current,
      isActive ? 1 : 0,
      prefersReducedMotion ? 1 : 1 - Math.pow(0.015, delta),
    );
    glowIntensity.current = THREE.MathUtils.lerp(
      glowIntensity.current,
      isActive ? 1 : isHovered ? 0.7 : 0,
      prefersReducedMotion ? 1 : 1 - Math.pow(0.02, delta),
    );
    dimProgress.current = THREE.MathUtils.lerp(
      dimProgress.current,
      isAnyActive ? 1 : 0,
      prefersReducedMotion ? 1 : 1 - Math.pow(0.02, delta),
    );

    if (groupRef.current) {
      if (dealProgress.current < 1) {
        groupRef.current.position.x = THREE.MathUtils.lerp(
          0,
          def.position[0],
          ease,
        );
        groupRef.current.position.z = THREE.MathUtils.lerp(
          0,
          def.position[2],
          ease,
        );
        settledBaseY.current = THREE.MathUtils.lerp(-8, def.position[1], ease);
      } else {
        const snap = prefersReducedMotion ? 1 : 1 - Math.pow(0.005, delta);
        groupRef.current.position.x = THREE.MathUtils.lerp(
          groupRef.current.position.x,
          def.position[0],
          snap,
        );
        groupRef.current.position.z = THREE.MathUtils.lerp(
          groupRef.current.position.z,
          def.position[2],
          snap,
        );
        settledBaseY.current = THREE.MathUtils.lerp(
          settledBaseY.current,
          def.position[1],
          snap,
        );
      }
      groupRef.current.position.y =
        settledBaseY.current +
        hoverLift.current * 0.2 +
        activeLift.current * 0.4;
    }

    if (glowLightRef.current)
      glowLightRef.current.intensity = 0.3 + glowIntensity.current * 2.5;
    if (glowBorderRef.current)
      glowBorderRef.current.opacity = hoverLift.current * 0.75;

    if (materialFrontRef.current) {
      materialFrontRef.current.emissiveIntensity =
        0.75 + glowIntensity.current * 0.5;
      materialFrontRef.current.opacity = 1 - dimProgress.current * 0.5;
    }
    if (materialBackRef.current) {
      materialBackRef.current.emissiveIntensity =
        0.65 + glowIntensity.current * 0.4;
      materialBackRef.current.opacity = 1 - dimProgress.current * 0.5;
    }

    flipProgress.current = THREE.MathUtils.lerp(
      flipProgress.current,
      isActive ? 1 : 0,
      prefersReducedMotion ? 1 : 1 - Math.pow(0.004, delta),
    );

    if (meshRef.current) {
      const flipScale = Math.abs(Math.cos(flipProgress.current * Math.PI));
      const dimScale = 1 - dimProgress.current * 0.08;
      meshRef.current.rotation.y = flipProgress.current >= 0.5 ? Math.PI : 0;
      meshRef.current.scale.set(flipScale * dimScale, dimScale, dimScale);
    }
  });

  return (
    <group ref={groupRef} position={[0, -8, 0]}>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.0, 5.25]} />
        <meshBasicMaterial
          ref={glowBorderRef}
          map={glowTexture}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.0, 3.5, 0.02]} />
        <meshStandardMaterial
          attach="material-0"
          color={def.accentColor}
          roughness={0.8}
        />
        <meshStandardMaterial
          attach="material-1"
          color={def.accentColor}
          roughness={0.8}
        />
        <meshStandardMaterial
          attach="material-2"
          color={def.accentColor}
          roughness={0.8}
        />
        <meshStandardMaterial
          attach="material-3"
          color={def.accentColor}
          roughness={0.8}
        />
        <meshStandardMaterial
          attach="material-4"
          ref={materialFrontRef}
          map={frontTexture}
          emissiveMap={frontTexture}
          emissive="#ffffff"
          emissiveIntensity={0.75}
          roughness={0.4}
          metalness={0.1}
          transparent
        />
        <meshStandardMaterial
          attach="material-5"
          ref={materialBackRef}
          map={backTexture}
          emissiveMap={backTexture}
          emissive="#ffffff"
          emissiveIntensity={0.65}
          roughness={0.4}
          metalness={0.1}
          transparent
        />
      </mesh>
      <pointLight
        ref={glowLightRef}
        position={[0, 0.5, 0]}
        intensity={0}
        color={def.accentColor}
        distance={2.5}
      />
    </group>
  );
}
