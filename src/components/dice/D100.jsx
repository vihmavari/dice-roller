import React, { useState, useCallback, useEffect, useRef } from 'react';
import { D10 } from './D10';

export const D100 = ({ isStatic, onResult, rollId, ...props }) => {
  // Храним результаты двух кубиков отдельно
  const [tens, setTens] = useState(null);
  const [units, setUnits] = useState(null);
  const hasSentResult = useRef(false);

  // Сброс при новом броске
  useEffect(() => {
    setTens(null);
    setUnits(null);
    hasSentResult.current = false;
  }, [rollId]);

  // Проверка итогового результата
  useEffect(() => {
    if (tens !== null && units !== null && !hasSentResult.current) {
      let finalValue;
      
      // Логика классического D100:
      // tens (0-9), units (0-9)
      // Если оба 0 -> 100
      if (tens === 10 && units === 10) {
        finalValue = 100;
      } else {
        // Превращаем 10 в 0 для корректного сложения десятков и единиц
        const t = tens === 10 ? 0 : tens;
        const u = units === 10 ? 0 : units;
        
        finalValue = t * 10 + u;
        
        // Если вышло 0 (00 + 0), в некоторых системах это тоже 100, 
        // но чаще 100 — это именно 00 + 0. 
        // Если t=0 и u=0 дали 0, заменим на 100:
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
