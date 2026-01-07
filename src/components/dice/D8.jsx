import React, { useEffect, useMemo, useRef } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text } from '@react-three/drei'; // Добавили Text
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useDiceTheme } from '../../context/DiceContext';

export const D8 = ({ isStatic, onResult, rollId, ...props }) => {
    const { theme } = useDiceTheme();
    
    const { geometry, textConfig } = useMemo(() => {
    let geo = new THREE.OctahedronGeometry(1.2, 0);
    geo = BufferGeometryUtils.mergeVertices(geo);
    geo.center();
    geo.computeVertexNormals();

    const posAttr = geo.attributes.position;
    const indexAttr = geo.index;
    const textData = [];

    const getVector = (idx) => new THREE.Vector3().fromBufferAttribute(posAttr, idx);

    const values = [1, 6, 2, 5, 3, 8, 4, 7]

    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i);
      const b = indexAttr.getX(i + 1);
      const c = indexAttr.getX(i + 2);

      const vA = getVector(a);
      const vB = getVector(b);
      const vC = getVector(c);

      const center = new THREE.Vector3()
        .add(vA).add(vB).add(vC)
        .divideScalar(3);

      const normal = center.clone().normalize();
      
      const textPos = center.clone().add(normal.multiplyScalar(0.01));

      const isTopHemisphere = center.y > 0;
      const pole = new THREE.Vector3(0, isTopHemisphere ? 1 : -1, 0);

      const dummy = new THREE.Object3D();
      dummy.position.copy(textPos);
      
      dummy.up.copy(pole);
      dummy.lookAt(textPos.clone().add(normal));

      textData.push({
        pos: textPos,
        rot: dummy.rotation.clone(),
        num: values[i / 3] // Номер грани (от 1 до 8)
      });
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
    position: isStatic ? [0, 0, 0] : [0, 6, 0],
    rotation: isStatic 
        ? [Math.PI / 4, Math.PI / 4, 0] 
        : [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
    linearDamping: 0.35,
    angularDamping: 0.35,
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
    <group ref={ref} dispose={null}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={theme.bodyColor} roughness={0.2} flatShading />
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