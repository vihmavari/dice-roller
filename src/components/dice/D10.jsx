import React, { useEffect, useMemo, useRef } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useDiceTheme } from '../../context/DiceContext';

export const D10 = ({ isStatic, onResult, rollId, isTens, ...props }) => {
    const { theme } = useDiceTheme();
    
    const { geometry, textConfig } = useMemo(() => {
    const R = 1;        
    const h = 0.1;     
    const p = 0.11;     
    
    const cosPi5 = Math.cos(Math.PI / 5);
    const H = p * ((h + Math.pow(R, 2) * (1 + cosPi5)) / (2 * h));

    const vertices = [];
    const v3Array = []; // Для удобства расчета центров граней

    const addV = (x, y, z) => {
      vertices.push(x, y, z);
      v3Array.push(new THREE.Vector3(x, y, z));
    };

    addV(0, H, 0);  // Верхний полюс
    addV(0, -H, 0); // Нижний полюс

    const stepAngle = (Math.PI * 2) / 5; // 72 градуса
    const halfAngle = stepAngle / 2;     // 36 градуса

    for (let i = 0; i < 5; i++) {
      const angle = i * stepAngle;
      addV(R * Math.cos(angle), h, R * Math.sin(angle));
    }

    for (let i = 0; i < 5; i++) {
      const angle = i * stepAngle + halfAngle;
      addV(R * Math.cos(angle), -h, R * Math.sin(angle));
    }

    const indices = [];
    const textData = [];

    const values = [0, 3, 8, 5, 2, 9, 6, 1, 4, 7];

    for (let i = 0; i < 5; i++) {
      const topBeltCurr = 2 + i;
      const topBeltNext = 2 + ((i + 1) % 5);
      const botBeltCurr = 7 + i;
      const botBeltNext = 7 + ((i + 1) % 5);

      indices.push(0, botBeltCurr, topBeltCurr);  
      indices.push(0, topBeltNext, botBeltCurr);  
      indices.push(1, topBeltNext, botBeltNext); 
      indices.push(1, botBeltCurr, topBeltNext); 

      const createFaceConfig = (points, number, isTop) => {
        const center = new THREE.Vector3(0, 0, 0);
        points.forEach((pIdx) => center.add(v3Array[pIdx]));
        center.divideScalar(points.length);

        const vA = v3Array[points[0]];
        const vB = v3Array[points[1]];
        const vC = v3Array[points[2]];
        const edge1 = new THREE.Vector3().subVectors(vB, vA);
        const edge2 = new THREE.Vector3().subVectors(vC, vA);
        const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
        
        if (normal.dot(center) < 0) normal.multiplyScalar(-1);

        const textPos = center.clone().add(normal.clone().multiplyScalar(0.01));

        const dummy = new THREE.Object3D();
        dummy.position.copy(textPos);

        const polePos = v3Array[isTop ? 0 : 1];
        const dirToPole = new THREE.Vector3().subVectors(polePos, center).normalize();

        const upVector = dirToPole.clone().projectOnPlane(normal).normalize();

        dummy.up.copy(upVector);
        dummy.lookAt(textPos.clone().add(normal));

        return { pos: textPos, rot: dummy.rotation.clone(), num: number };
        };

      textData.push(createFaceConfig([0, botBeltCurr, topBeltCurr, topBeltNext], values[i * 2], true));
      textData.push(createFaceConfig([1, topBeltNext, botBeltNext, botBeltCurr], values[i * 2 + 1], false));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return { geometry: geo, textConfig: textData };
  }, []);

  const physicsArgs = useMemo(() => {
    const positions = geometry.attributes.position.array;
    const points = [];
    for (let i = 0; i < positions.length; i += 3) {
      points.push([positions[i], positions[i + 1], positions[i + 2]]);
    }
    const geoIndices = geometry.index.array;
    const faces = [];
    for (let i = 0; i < geoIndices.length; i += 3) {
      faces.push([geoIndices[i], geoIndices[i + 1], geoIndices[i + 2]]);
    }
    return [points, faces];
  }, [geometry]);

  const [ref, api] = useConvexPolyhedron(() => ({
    mass: isStatic ? 0 : 1.5,
    args: physicsArgs,
    position: isStatic ? [0, 0, 0] : [0, 6, 0],
    rotation: isStatic ? [0.4, 0.4, 0] : [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    linearDamping: 0.4,
    angularDamping: 0.4,
    material: { friction: 0.1, restitution: 0.5 },
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

  const hasSettled = useRef(false);
  const spawnTime = useRef(Date.now());

  useEffect(() => {
    if (isStatic || !onResult) return;

    hasSettled.current = false;
    spawnTime.current = Date.now();

    let currentQuaternion = new THREE.Quaternion();

    const unsubsQuat = api.quaternion.subscribe(q => {
      currentQuaternion.set(q[0], q[1], q[2], q[3]);
    });

    const unsubsVel = api.velocity.subscribe(v => {
      if (hasSettled.current) return;
      if (Date.now() - spawnTime.current < 600) return;

      const speed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
      
      if (speed < 0.01 && speed > 0) { 
        const UP = new THREE.Vector3(0, 1, 0);
        let maxDot = -1;
        let detectedValue = null;

        textConfig.forEach((cfg) => {
          const faceNormal = cfg.pos.clone().normalize().applyQuaternion(currentQuaternion);
          const dot = faceNormal.dot(UP);
          if (dot > maxDot) {
            maxDot = dot;
            detectedValue = cfg.num;
            if (cfg.num === 0) {
              detectedValue = 10
            }
          }
        });

        if (detectedValue !== null) {
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
    <group ref={ref}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={theme.bodyColor} roughness={0.2} flatShading  />
        <Edges threshold={15} color={theme.edgeColor} lineWidth={2} />
      </mesh>

      {textConfig.map((cfg, idx) => {
        let displayValue;
        if (isTens) {
          displayValue = cfg.num === 0 ? "00" : `${cfg.num}0`;
        } else {
          displayValue = cfg.num === 0 ? "0" : cfg.num;
        }

        return (
          <Text
            key={idx}
            position={cfg.pos}
            rotation={cfg.rot}
            fontSize={isTens ? 0.4 : 0.5} 
            color={theme.textColor}
            font={`${import.meta.env.BASE_URL}fonts/DragonHunter.otf`}
            anchorX="center"
            anchorY="middle"
            depthOffset={-1}
          >
            {displayValue}
          </Text>
        );
      })}
    </group>
  );
};