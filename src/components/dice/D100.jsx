import React, { useState, useCallback, useEffect, useRef } from 'react';
import { D10 } from './D10';

export const D100 = ({ isStatic, onResult, rollId, ...props }) => {
  const [tens, setTens] = useState(null);
  const [units, setUnits] = useState(null);
  const hasSentResult = useRef(false);

  useEffect(() => {
    setTens(null);
    setUnits(null);
    hasSentResult.current = false;
  }, [rollId]);

  useEffect(() => {
    if (tens !== null && units !== null && !hasSentResult.current) {
      let finalValue;
      
      if (tens === 10 && units === 10) {
        finalValue = 100;
      } else {
        const t = tens === 10 ? 0 : tens;
        const u = units === 10 ? 0 : units;
        
        finalValue = t * 10 + u;
        
        if (finalValue === 0) finalValue = 100;
      }

      hasSentResult.current = true;
      onResult(finalValue);
    }
  }, [tens, units, onResult]);

  if (isStatic) {
    return (
      <group {...props}>
        <D10 isStatic={true} position={[-1.2, 0, 0]} />
        <D10 isStatic={true} position={[1.2, 0, 0]} isTens = { true } />
      </group>
    );
  }

  return (
    <group>
      {/* Кубик Десятков */}
      <D10 
        {...props}
        rollId={rollId}
        position={[-1.5, 6, 0]} 
        onResult={(val) => setTens(val)} 
        isTens = { true }
      />
      {/* Кубик Единиц */}
      <D10 
        {...props}
        rollId={rollId}
        position={[1.5, 6, 0]} 
        onResult={(val) => setUnits(val)} 
      />
    </group>
  );
};
