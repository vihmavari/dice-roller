import React, { useEffect, useMemo, useRef } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const CommonDice = ({ type }) => {
  // 1. Геометрия (мемоизируем, но при смене key она создастся заново)
  const geometry = useMemo(() => {
    let geo;
    const s = 1.2; // Базовый размер

    // 1. Выбираем примитив в зависимости от типа
    switch (type?.toLowerCase()) {
      case 'd4':
        geo = new THREE.TetrahedronGeometry(s);
        break;
      case 'd8':
        geo = new THREE.OctahedronGeometry(s);
        break;
      case 'd10':
        geo = new THREE.CylinderGeometry(0, s, s * 2, 10);
        break;
      case 'd12':
        geo = new THREE.DodecahedronGeometry(s);
        break;
      case 'd20':
        geo = new THREE.IcosahedronGeometry(s);
        break;
      default:
        geo = new THREE.IcosahedronGeometry(s);
    }

    geo = BufferGeometryUtils.mergeVertices(geo);
    
    geo.center();
    
    return geo;
  }, [type]);

  const physicsArgs = useMemo(() => {
    const vertices = geometry.attributes.position.array;
    const points = [];
    for (let i = 0; i < vertices.length; i += 3) points.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
    const faces = [];
    const indices = geometry.index.array;
    for (let i = 0; i < indices.length; i += 3) faces.push([indices[i], indices[i + 1], indices[i + 2]]);
    return [points, faces, []];
  }, [geometry]);

  // 2. Начальное случайное состояние
  const randomRotation = useMemo(() => [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  ], []);

  // 3. Создание физического тела (позиция всегда вверху)
  const [ref, api] = useConvexPolyhedron(() => ({
    mass: 1.5,
    args: physicsArgs,
    position: [0, 6, 0],
    rotation: randomRotation,
    linearDamping: 0.35,
    angularDamping: 0.35,
  }));

  // 4. Тот самый импульс при "рождении"
  useEffect(() => {
    // Импульс: вверх и немного в бок
    api.applyImpulse(
      [Math.random() * 6 - 3, 2, Math.random() * 6 - 3], 
      [Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2]
    );

    // Сильное вращение
    api.angularVelocity.set(
      Math.random() * 25 - 12.5,
      Math.random() * 25 - 12.5,
      Math.random() * 25 - 12.5
    );
  }, [api]); // Сработает только один раз при монтировании

  return (
    <mesh ref={ref} castShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#1e1b4b" roughness={0.2} metalness={0.5} />
      <Edges threshold={15} color="#6366f1" lineWidth={2} />
    </mesh>
  );
};