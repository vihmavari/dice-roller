import React, {useMemo} from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Edges } from '@react-three/drei';
import { Physics, usePlane, useCylinder } from '@react-three/cannon';
import { PhysicalDice } from './index';
import { D4 } from './D4';
import { D6 } from './D6';
import { D8 } from './D8';
import { D10 } from './D10';
import { D12 } from './D12';
import { D20 } from './D20';
import { D100 } from './D100';
import { DicePool } from './DicePool';
import { useDiceTheme } from '../../context/DiceContext';

const PhysicsFloor = ({ height = 0 }) => {
  const { theme } = useDiceTheme();
  
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, height, 0],
    friction: 0.1,
    restitution: 0.5,
    // polygonOffset: 0.1
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <circleGeometry args={[24, 128]} />
      <meshStandardMaterial 
        color={theme.floorColor}
        transparent={true}
        side={2}
        onBeforeCompile={(shader) => {
          shader.vertexShader = `varying vec2 vUv;\n` + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            `#include <uv_vertex>`,
            `vUv = uv;`
          );

          shader.fragmentShader = `varying vec2 vUv;\n` + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `
            float dist = distance(vUv, vec2(0.5));
            float vignette = smoothstep(0.6, 0.2, dist); 
            vec4 diffuseColor = vec4( diffuse, opacity * vignette );
            `
          );
        }}
      />
    </mesh>
  );
};


export const InvisibleWalls = ({ radius = 24, count = 8 }) => {
  const wallWidth = useMemo(() => {
    return 2 * radius * Math.tan(Math.PI / count);
  }, [radius, count]);

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <Wall 
          key={i} 
          index={i} 
          total={count} 
          radius={radius} 
          width={wallWidth} 
        />
      ))}
    </group>
  );
};

const Wall = ({ index, total, radius, width }) => {
  const angle = (index / total) * Math.PI * 2;
  
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const [ref] = usePlane(() => ({
    rotation: [0, -angle - Math.PI / 2, 0],
    position: [x, 5, z],
    type: 'Static',
    friction: 0.1,
    restitution: 0.5
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry args={[width, 10]} /> 
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

export const DiceScene = ({ lastRoll, isPhysicsEnabled, onPhysicsResult }) => (   
  <Canvas 
    // shadows={{ type: THREE.PCFSoftShadowMap }}
    shadows
    onCreated={({ gl }) => {
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }}
    camera={{ position: [0, 15, 20], fov: 35 }}
    performance={{ min: 0.5 }}
    gl={{ 
      antialias: true, 
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    }}
  >
    <directionalLight
      position={[5, 20, 5]}
      intensity={1.5}
      castShadow
      shadow-mapSize={[4096, 4096]} 
      shadow-bias={-0.0001}
      shadow-radius={4}
    >
      <orthographicCamera 
        attach="shadow-camera" 
        args={[-25, 25, 25, -25, 5, 150]} 
      />
      
    </directionalLight>

    <ambientLight intensity={1.5} />
    <pointLight position={[-10, 10, -10]} intensity={0.4} /> 

    {isPhysicsEnabled ? (
      <Physics 
        gravity={[0, -9.81, 0]}
        tolerance={0.001}
        size={10}
        iterations={20}
        allowSleep={true} 
        broadphase="SAP"
      >
        <PhysicsFloor />
        <InvisibleWalls />

        {lastRoll.type === 'custom' ? (
          <DicePool 
            key={lastRoll.id}
            rollId={lastRoll.id}
            formula={lastRoll.formula}
            onResult={onPhysicsResult}
          />
        ) : (
          <PhysicalDice 
            key={lastRoll.id} 
            rollId={lastRoll.id}
            type={lastRoll.type} 
            config={lastRoll}
            onResult={onPhysicsResult} 
          />
        )}
      </Physics>
    ) : (
      <Physics gravity={[0, 0, 0]}>
        <Center>
          <DicePreview type={lastRoll.type} />
        </Center>
      </Physics>
    )}
    <OrbitControls 
      minDistance={15} 
      maxDistance={50} 
      maxPolarAngle={Math.PI / 3}
      enableDamping={true}
      dampingFactor={0.05}
      enablePan={false}
      makeDefault
    />
  </Canvas>
);

const DicePreview = ({ type }) => {
  if (type === 'd100') {
    return (
      <group scale={1.5}>
         <D100 isStatic={true} /> 
      </group>
    );
  }
  if (type === 'd20') {
    return (
      <group scale={1.5}>
         <D20 isStatic={true} /> 
      </group>
    );
  }
  if (type === 'd12') {
    return (
      <group scale={1.5}>
         <D12 isStatic={true} /> 
      </group>
    );
  }
  if (type === 'd10') {
    return (
      <group scale={1.5}>
         <D10 isStatic={true} /> 
      </group>
    );
  }
  if (type === 'd8') {
    return (
      <group scale={1.5}>
         <D8 isStatic={true} /> 
      </group>
    );
  }
  if (type === 'd6') {
    return (
      <group scale={1.5}>
         <D6 isStatic={true} /> 
      </group>
    );
  }
  if (type === 'd4') {
    return (
      <group scale={1.5}>
         <D4 isStatic={true} /> 
      </group>
    );
  }

  // для остальных отображать D20 :)
  return (
      <group scale={1.5}>
         <D20 isStatic={true} /> 
      </group>
    );
};
