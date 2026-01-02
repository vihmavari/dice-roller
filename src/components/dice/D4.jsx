import React, { useEffect, useMemo, useRef } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useDiceTheme } from '../../context/DiceContext';

export const D4 = ({ isStatic, onResult, rollId, ...props }) => {
  const { theme } = useDiceTheme();
  
  const hasSettled = useRef(false);
  const spawnTime = useRef(Date.now());
  const currentQuaternion = useRef(new THREE.Quaternion());

  const { geometry, textConfig, uniqueVertices } = useMemo(() => {
    let geo = new THREE.TetrahedronGeometry(1.2);
    geo = BufferGeometryUtils.mergeVertices(geo);
    geo.center();
    geo.computeVertexNormals();

    const posAttr = geo.attributes.position;
    const indexAttr = geo.index;
    const textData = [];

    // Извлекаем уникальные вершины для логики определения результата
    const vertices = [];
    for (let i = 0; i < posAttr.count; i++) {
      vertices.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
    }

    // Логика нумерации (оставляем твою)
    const sortedIndices = vertices
      .map((v, idx) => ({ v, idx }))
      .sort((a, b) => b.v.y - a.v.y || b.v.z - a.v.z || b.v.x - a.v.x);

    const vertexToNumber = {};
    sortedIndices.forEach((item, i) => {
      vertexToNumber[item.idx] = i + 1;
    });

    for (let i = 0; i < indexAttr.count; i += 3) {
      const idxs = [indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2)];
      const vA = vertices[idxs[0]];
      const vB = vertices[idxs[1]];
      const vC = vertices[idxs[2]];

      const faceCenter = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
      const faceNormal = faceCenter.clone().normalize();

      idxs.forEach((vIdx) => {
        const vertexVec = vertices[vIdx];
        const textPos = new THREE.Vector3().lerpVectors(faceCenter, vertexVec, 0.5);
        textPos.add(faceNormal.clone().multiplyScalar(0.01));
        const dirToVertex = new THREE.Vector3().subVectors(vertexVec, faceCenter).normalize();
        
        const dummy = new THREE.Object3D();
        dummy.position.copy(textPos);
        dummy.up.copy(dirToVertex);
        dummy.lookAt(textPos.clone().add(faceNormal));

        textData.push({
          pos: textPos,
          rot: dummy.rotation.clone(),
          num: Math.trunc((vertexToNumber[vIdx] - 1) / 3) + 1
        });
      });
    }

    return { geometry: geo, textConfig: textData, uniqueVertices: vertices };
  }, []);

  const physicsArgs = useMemo(() => {
    const vertices = geometry.attributes.position.array;
    const points = [];
    for (let i = 0; i < vertices.length; i += 3) {
      points.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
    }
    const faces = [];
    const indices = geometry.index.array;
    for (let i = 0; i < indices.length; i += 3) {
      faces.push([indices[i], indices[i + 1], indices[i + 2]]);
    }
    return [points, faces, []];
  }, [geometry]);

  const [ref, api] = useConvexPolyhedron(() => ({
    mass: isStatic ? 0 : 1.5,
    args: physicsArgs,
    position: isStatic ? [0, 0, 0] : [0, 6, 0],
    rotation: isStatic 
        ? [0.5, 0.5, 0]
        : [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
    linearDamping: 0.35,
    angularDamping: 0.35,
    material: { friction: 0.1, restitution: 0.5 },
    ...props
  }));

  // Эффект импульса
  useEffect(() => {
    if (isStatic) return;
    hasSettled.current = false;
    spawnTime.current = Date.now();

    api.applyImpulse(
      [Math.random() * 6 - 3, 2, Math.random() * 6 - 3], 
      [Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2]
    );
    api.angularVelocity.set(
      Math.random() * 25 - 12.5,
      Math.random() * 25 - 12.5,
      Math.random() * 25 - 12.5
    );
  }, [api, isStatic, rollId]);

  // Определение результата для D4
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
        let maxWorldY = -Infinity;
        let topVertexIdx = -1;

        // Для D4 ищем вершину с максимальной координатой Y в мировом пространстве
        uniqueVertices.forEach((v, idx) => {
          const worldV = v.clone().applyQuaternion(currentQuaternion.current);
          if (worldV.y > maxWorldY) {
            maxWorldY = worldV.y;
            topVertexIdx = idx;
          }
        });

        if (topVertexIdx !== -1) {
          // Вычисляем число на основе твоей логики нумерации вершин
          const sortedIndices = uniqueVertices
            .map((v, idx) => ({ v, idx }))
            .sort((a, b) => b.v.y - a.v.y || b.v.z - a.v.z || b.v.x - a.v.x);
          
          const vertexToNumber = {};
          sortedIndices.forEach((item, i) => { vertexToNumber[item.idx] = i + 1; });

          const detectedValue = Math.trunc((vertexToNumber[topVertexIdx] - 1) / 3) + 1;

          if (!hasSettled.current) {
            hasSettled.current = true;
            onResult(detectedValue);
          }
        }
      }
    });

    return () => {
      unsubsQuat();
      unsubsVel();
    };
  }, [api, isStatic, onResult, uniqueVertices]);

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
          fontSize={0.4}
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