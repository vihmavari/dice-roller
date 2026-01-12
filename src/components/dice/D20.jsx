import React, { useEffect, useMemo, useRef } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useDiceTheme } from '../../context/DiceContext';
import { max } from 'three/tsl';

export const D20 = ({ isStatic, onResult, rollId, ...props }) => {
  const { theme } = useDiceTheme();
  
  const { geometry, textConfig } = useMemo(() => {
    let geo = new THREE.IcosahedronGeometry(1.2, 0);
    geo = BufferGeometryUtils.mergeVertices(geo);
    geo.center();
    geo.computeVertexNormals();

    const posAttr = geo.attributes.position;
    const indexAttr = geo.index;
    const textData = [];

    const values = [1, 19, 3, 17, 7, 9, 13, 15, 10, 16, 4, 18, 2, 20, 14, 11, 5, 12, 8, 6]

    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i);
      const b = indexAttr.getX(i + 1);
      const c = indexAttr.getX(i + 2);

      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a);
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b);
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c);

      const center = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
      const normal = center.clone().normalize();

      const num = values[i / 3];

      const poleDir = center.y > 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
      let bestVertexDir = new THREE.Vector3();
      let maxDot = -Infinity;

      [vA, vB, vC].forEach(v => {
        const vDir = v.clone().sub(center).normalize();
        const dot = vDir.dot(poleDir);
        if (dot > maxDot) {
          maxDot = dot;
          bestVertexDir.copy(vDir);
        }
      });

      const bitangent = bestVertexDir.clone();
      bitangent.sub(normal.clone().multiplyScalar(bitangent.dot(normal))).normalize();

      const dummy = new THREE.Object3D();
      const textPos = center.clone().add(normal.clone().multiplyScalar(0.01));
      dummy.position.copy(textPos);
      dummy.up.copy(bitangent);
      dummy.lookAt(textPos.clone().add(normal));

      textData.push({ pos: textPos, rot: dummy.rotation.clone(), num });
    }

    return { geometry: geo, textConfig: textData };
  }, []);

  const physicsArgs = useMemo(() => {
    const posAttr = geometry.attributes.position;
    const indexAttr = geometry.index;
    const uniqueVertices = [];
    const map = new Map();
    const precision = 4;

    for (let i = 0; i < posAttr.count; i++) {
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
    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i);
      const b = indexAttr.getX(i + 1);
      const c = indexAttr.getX(i + 2);
      
      const getNewIdx = (oldIdx) => {
        const x = posAttr.getX(oldIdx).toFixed(precision);
        const y = posAttr.getY(oldIdx).toFixed(precision);
        const z = posAttr.getZ(oldIdx).toFixed(precision);
        return map.get(`${Number(x)}_${Number(y)}_${Number(z)}`);
      };

      faces.push([getNewIdx(a), getNewIdx(b), getNewIdx(c)]);
    }

    return [uniqueVertices, faces, []]; 
  }, [geometry]);

  const [ref, api] = useConvexPolyhedron(() => ({
    mass: isStatic ? 0 : 1.5,
    args: physicsArgs,
    allowSleep: true,
    position: isStatic ? [0, 0, 0] : [0, 6, 0],
    rotation: isStatic ? [0, 0, 0] : [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    linearDamping: 0.31,
    angularDamping: 0.31,
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
          console.log(maxDot)
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
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={theme.bodyColor} roughness={0.2} flatShading 
          polygonOffset 
          polygonOffsetFactor={2} 
          polygonOffsetUnits={2}
        />
        <Edges threshold={30} color={theme.edgeColor} lineWidth={2} />
      </mesh>

      {textConfig.map((cfg, idx) => (
        <Text
          key={idx}
          position={cfg.pos}
          rotation={cfg.rot}
          fontSize={0.35}
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