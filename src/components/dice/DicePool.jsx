import React, { useState, useEffect, useRef, useMemo } from 'react';
import { D4 } from './D4';
import { D6 } from './D6';
import { D8 } from './D8';
import { D10 } from './D10';
import { D12 } from './D12';
import { D20 } from './D20';

const Components = { D4, D6, D8, D10, D12, D20 };

export const DicePool = ({ formula, rollId, onResult, ...props }) => {
  const [results, setResults] = useState({});
  const hasSentResult = useRef(false);

  useEffect(() => {
    setResults({});
    hasSentResult.current = false;
  }, [rollId]);

  const diceList = useMemo(() => {
    let list = [];
    const spacing = 2; 
    const goldenAngle = 137.5 * (Math.PI / 180); 

    formula.forEach((group, groupIdx) => {
      for (let i = 0; i < group.count; i++) {
        const globalIdx = list.length; 

        const radius = spacing * Math.sqrt(globalIdx);
        const theta = globalIdx * goldenAngle;

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        const y = 8 + globalIdx * 0.8;

        list.push({
          type: group.type,
          id: `${group.type}-${groupIdx}-${i}`,
          Component: Components[group.type],
          offset: [x, y, z],
          randomRotation: [
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]
        });
      }
    });
    return list;
  }, [formula, rollId]);

  useEffect(() => {
    const values = Object.values(results);    
    if (values.length === diceList.length && diceList.length > 0 && !hasSentResult.current) {
      hasSentResult.current = true;
      
      onResult(values); 
    }
  }, [results, diceList.length, onResult]);

  return (
    <group>
      {diceList.map((dice) => (
        <dice.Component
          key={dice.id}
          {...props}
          rollId={rollId}
          position={dice.offset}
          rotation={dice.randomRotation}
          onResult={(val) => setResults(prev => ({ ...prev, [dice.id]: val }))}
        />
      ))}
    </group>
  );
};