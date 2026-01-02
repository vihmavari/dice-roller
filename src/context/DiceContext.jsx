import React, { createContext, useContext, useState, useEffect } from 'react';

const DiceContext = createContext();

const DEFAULT_THEME = {
  bodyColor: '#1e1b4b',
  edgeColor: '#6366f1',
  textColor: '#ffd700',
  floorColor: '#ca41c7',
};

export const DiceProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dice_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('dice_theme', JSON.stringify(theme));
  }, [theme]);

  const updateColor = (key, color) => {
    setTheme(prev => ({ ...prev, [key]: color }));
  };

  return (
    <DiceContext.Provider value={{ theme, updateColor }}>
      {children}
    </DiceContext.Provider>
  );
};

export const useDiceTheme = () => useContext(DiceContext);