import React, { useEffect, useMemo, useRef } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useDiceTheme } from '../../context/DiceContext';

export const D12 = ({ isStatic, onResult, rollId, ...props }) => {
    const { theme } = useDiceTheme();
  
  const { geometry, textConfig } = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.2, 0);
    const pos = geo.attributes.position;
    const sides = 12;
    const textData = [];

    const values = [1, 11, 6, 4, 2, 3, 5, 7, 12, 9, 8, 10]

    for (let i = 0; i < sides; i++) {
      const startVert = i * 9;
      const center = new THREE.Vector3(0, 0, 0);
      const tempV = new THREE.Vector3();

      for (let v = 0; v < 9; v++) {
        tempV.fromBufferAttribute(pos, startVert + v);
        center.add(tempV);
      }
      center.divideScalar(9);

      const v0 = new THREE.Vector3().fromBufferAttribute(pos, startVert);
      const v1 = new THREE.Vector3().fromBufferAttribute(pos, startVert + 1);
      const v2 = new THREE.Vector3().fromBufferAttribute(pos, startVert + 2);
      const normal = new THREE.Vector3()
        .subVectors(v1, v0)
        .cross(new THREE.Vector3().subVectors(v2, v0))
        .normalize();

      let bestVertex = new THREE.Vector3();
      let maxDot = -Infinity;
      const poleDir = center.y > 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);

      for (let v = 0; v < 9; v++) {
        const vert = new THREE.Vector3().fromBufferAttribute(pos, startVert + v);
        const vDir = vert.clone().sub(center).normalize();
        const dot = vDir.dot(poleDir);
        if (dot > maxDot) {
          maxDot = dot;
          bestVertex.copy(vDir); 
        }
      }

      const bitangent = bestVertex.clone();
      const dotCorrection = bitangent.dot(normal);
      bitangent.sub(normal.clone().multiplyScalar(dotCorrection)).normalize();

      const dummy = new THREE.Object3D();
      const textPos = center.clone().add(normal.clone().multiplyScalar(0.01));
      dummy.position.copy(textPos);
      dummy.up.copy(bitangent);
      dummy.lookAt(textPos.clone().add(normal));

      textData.push({ 
        pos: textPos, 
        rot: dummy.rotation.clone(), 
        num: values[i]
      });
    }

    return { geometry: geo, textConfig: textData };
  }, []);

  const physicsArgs = useMemo(() => {
    const posAttr = geometry.attributes.position;
    const vertexCount = posAttr.count; 
    
    const uniqueVertices = [];
    const map = new Map();
    const precision = 4;

    for (let i = 0; i < vertexCount; i++) {
      const x = Number(posAttr.getX(i).toFixed(precision));
      const y = Number(posAttr.getY(i).toFixed(precision));
      const z = Number(posAttr.getZ(i).toFixed(precision));
      const key = `${x}_${y}_${z}`;
      
      if (!map.has(key)) {
        map.set(key, uniqueVertices.length);
        uniqueVertices.push([x, y, z]);
      }
    }

    const faces = [];
    for (let i = 0; i < vertexCount; i += 3) {
      const getNewIdx = (vIdx) => {
        const x = posAttr.getX(vIdx).toFixed(precision);
        const y = posAttr.getY(vIdx).toFixed(precision);
        const z = posAttr.getZ(vIdx).toFixed(precision);
        return map.get(`${Number(x)}_${Number(y)}_${Number(z)}`);
      };

      const a = getNewIdx(i);
      const b = getNewIdx(i + 1);
      const c = getNewIdx(i + 2);

      if (a !== b && b !== c && a !== c) {
        faces.push([a, b, c]);
      }
    }

    return [uniqueVertices, faces, []]; 
  }, [geometry]);

  const [ref, api] = useConvexPolyhedron(() => ({
    mass: isStatic ? 0 : 1.5,
    args: physicsArgs,
    allowSleep: true,
    position: isStatic ? [0, 0, 0] : [0, 6, 0],
    rotation: isStatic ? [0.4, 0.4, 0] : [Math.random() * 6, Math.random() * 6, Math.random() * 6],
    linearDamping: 0.3,
    angularDamping: 0.3,
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
      if (Date.now() - spawnTime.current < 800) return;

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
          }
        });

        
        if (maxDot < 0.99) {
          api.position.set(0, 8, 0); 
          api.velocity.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
          api.angularVelocity.set(
            Math.random() * 30 - 15,
            Math.random() * 30 - 15,
            Math.random() * 30 - 15
          );
          spawnTime.current = Date.now();
          return; 
        }

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
  }, [api, isStatic, onResult, textConfig, rollId]);

  return (
    <group ref={ref}>
      <mesh castShadow geometry={geometry}>
        <meshStandardMaterial color={theme.bodyColor} roughness={0.55} flatShading 
          polygonOffset 
          polygonOffsetFactor={2} 
          polygonOffsetUnits={2}
        />
        <Edges threshold={15} color={theme.edgeColor} lineWidth={2} />
      </mesh>

      {textConfig.map((cfg, idx) => (
        <Text
          key={idx}
          position={cfg.pos}
          rotation={cfg.rot}
          fontSize={0.5}
          color={theme.textColor}
          font={`${import.meta.env.BASE_URL}fonts/DragonHunter.otf`}
          anchorX="center"
          anchorY="middle"
          depthOffset={-1}
        >
          {cfg.num}
        </Text>
      ))}
    </group>
  );
};