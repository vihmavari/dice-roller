import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RollContext = createContext();

const DEFAULT_FORMULA_LIST = [
  {
    roll_name: "Проверка с помехой/преимуществом",
    dice_pool: [
      { type: 'D20', count: 2 },
    ]
  },
  {
    roll_name: "3 D6 + 2 D4",
    dice_pool: [
      { type: 'D4', count: 2 },
      { type: 'D6', count: 3 },
    ]
  },
];

export const RollProvider = ({ children }) => {
  const [formulaList, setFormulaList] = useState(() => {
    try {
      const saved = localStorage.getItem('formula_list');
      return saved ? JSON.parse(saved) : DEFAULT_FORMULA_LIST;
    } catch (e) {
      console.error("Ошибка чтения localStorage", e);
      return DEFAULT_FORMULA_LIST;
    }
  });

  useEffect(() => {
    localStorage.setItem('formula_list', JSON.stringify(formulaList));
  }, [formulaList]);

  const addFormula = useCallback((newFormula) => {
    if (!newFormula.dice_pool || newFormula.dice_pool.length === 0) return;
    
    setFormulaList((prev) => [...prev, newFormula]);
  }, []);

  const delFormula = useCallback((index) => {
    setFormulaList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const editFormula = useCallback((index, updatedFormula) => {
    setFormulaList((prev) => 
      prev.map((item, i) => (i === index ? updatedFormula : item))
    );
  }, []);

  const resetFormulas = useCallback(() => {
    setFormulaList(DEFAULT_FORMULA_LIST);
  }, []);

  const value = {
    formulaList,
    addFormula,
    delFormula,
    editFormula,
    resetFormulas
  };

  return (
    <RollContext.Provider value={value}>
      {children}
    </RollContext.Provider>
  );
};

export const useRoll = () => {
  const context = useContext(RollContext);
  if (!context) {
    throw new Error('useRoll must be used within a RollProvider');
  }
  return context;
};