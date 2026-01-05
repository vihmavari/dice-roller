import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Edges } from '@react-three/drei';
import { Physics, usePlane } from '@react-three/cannon';
import { PhysicalDice } from './index';
import { D4 } from './D4';
import { D6 } from './D6';
import { D8 } from './D8';
import { D10 } from './D10';
import { D12 } from './D12';
import { D20 } from './D20';
import { useDiceTheme } from '../../context/DiceContext';

const PhysicsFloor = ( {height = 0} ) => {
  const { theme } = useDiceTheme();
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, height, 0],
    friction: 0.1,
    restitution: 0.5
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color={theme.floorColor} side={2} depthWrite={true}/>
    </mesh>
  );
};

export const DiceScene = ({ lastRoll, isPhysicsEnabled, onPhysicsResult }) => (  
  <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
    <ambientLight intensity={1} />
    <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
    
    {isPhysicsEnabled ? (
      <Physics gravity={[0, -9.81, 0]}>
        <PhysicsFloor />
        <PhysicsFloor height={-0.1}/>
        <PhysicalDice 
          key={lastRoll.id} 
          rollId={lastRoll.id}
          type={lastRoll.type} 
          config={lastRoll}
          onResult={onPhysicsResult} 
        />
      </Physics>
    ) : (
      /* Оборачиваем превью в физику с нулевой гравитацией */
      <Physics gravity={[0, 0, 0]}>
        <Center>
          <DicePreview type={lastRoll.type} />
        </Center>
      </Physics>
    )}
    <OrbitControls />
  </Canvas>
);

const DicePreview = ({ type }) => {
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

  // Заглушки для остальных
  return (
     <mesh rotation={[0.4, 0.4, 0]} scale={1.3}>
        <OldDiceAppearance type={type} />
     </mesh>
  );
};

const OldDiceAppearance = ({ type }) => {
  const geometry = React.useMemo(() => {
    switch (type) {
      case 'd4': return new THREE.TetrahedronGeometry(1.2);
      case 'd6': return new THREE.BoxGeometry(1.5, 1.5, 1.5);
      case 'd8': return new THREE.OctahedronGeometry(1.2);
      case 'd12': return new THREE.DodecahedronGeometry(1.2);
      case 'd20': return new THREE.IcosahedronGeometry(1.2);
      default: return new THREE.BoxGeometry(1.5, 1.5, 1.5);
    }
  }, [type]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#1e1b4b" transparent opacity={0.9} />
      <Edges threshold={15} color="#6366f1" lineWidth={2} />
    </mesh>
  );
};