import React, { useEffect, useMemo, useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useDiceTheme } from '../../context/DiceContext';

export const D6 = ({ isStatic, onResult, rollId, ...props }) => {
  const { theme } = useDiceTheme();
  
  const hasSettled = useRef(false);
  const spawnTime = useRef(Date.now());
  
  const currentQuaternion = useRef(new THREE.Quaternion());

  const textConfig = useMemo(() => {
    const offset = 0.76; 
    return [
      { pos: new THREE.Vector3(offset, 0, 0), rot: [0, Math.PI / 2, 0], num: 1 },
      { pos: new THREE.Vector3(-offset, 0, 0), rot: [0, -Math.PI / 2, 0], num: 6 },
      { pos: new THREE.Vector3(0, offset, 0), rot: [-Math.PI / 2, 0, 0], num: 2 },
      { pos: new THREE.Vector3(0, -offset, 0), rot: [Math.PI / 2, 0, 0], num: 5 },
      { pos: new THREE.Vector3(0, 0, offset), rot: [0, 0, 0], num: 3 },
      { pos: new THREE.Vector3(0, 0, -offset), rot: [0, Math.PI, 0], num: 4 },
    ];
  }, []);

  const [ref, api] = useBox(() => ({
    mass: isStatic ? 0 : 1.5, 
    args: [1.5, 1.5, 1.5],
    position: isStatic ? [0, 0, 0] : [0, 6, 0],
    rotation: isStatic 
        ? [Math.PI / 4, Math.PI / 4, 0] 
        : [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
    linearDamping: 0.3,
    angularDamping: 0.3,
    material: { restitution: 0.1, friction: 0.6 },
    ...props
  }));

  useEffect(() => {
    if (isStatic) return;

    api.applyImpulse(
      [Math.random() * 6 - 3, 2, Math.random() * 6 - 3], 
      [Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2]
    );

    api.angularVelocity.set(
      Math.random() * 25 - 12.5,
      Math.random() * 25 - 12.5,
      Math.random() * 25 - 12.5
    );
  }, [api, isStatic]);

  useEffect(() => {
    if (isStatic || !onResult) return;

    const unsubsQuat = api.quaternion.subscribe(q => {
      currentQuaternion.current.set(q[0], q[1], q[2], q[3]);
    });

    const unsubsVel = api.velocity.subscribe(v => {
      if (hasSettled.current) return;
      if (Date.now() - spawnTime.current < 800) return;

      const speed = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);

      if (speed < 0.01 && speed > 0) {
        const UP = new THREE.Vector3(0, 1, 0);
        let maxDot = -1;
        let detectedValue = null;

        textConfig.forEach((cfg) => {
          const faceNormal = cfg.pos.clone().normalize().applyQuaternion(currentQuaternion.current);
          const dot = faceNormal.dot(UP);

          if (dot > maxDot) {
            maxDot = dot;
            detectedValue = cfg.num;
          }
        });

        if (detectedValue !== null && !hasSettled.current) {
          hasSettled.current = true;
          onResult(detectedValue);
        }
      }
    });

    return () => {
      unsubsQuat();
      unsubsVel();
    };
  }, [api, isStatic, onResult, textConfig]);

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={theme.bodyColor} roughness={0.2} flatShading />
      <Edges threshold={15} color={theme.edgeColor} lineWidth={2} />
            
      {textConfig.map((cfg, idx) => (
        <Text
          key={idx}
          position={cfg.pos}
          rotation={cfg.rot}
          fontSize={0.8}
          color={theme.textColor}
          font={`${import.meta.env.BASE_URL}fonts/DragonHunter.otf`}
          anchorX="center"
          anchorY="middle"
          depthOffset={-1}
        >
          {cfg.num}
        </Text>
      ))}
    </mesh>
  );
};