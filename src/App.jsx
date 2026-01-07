import React, { useState, useCallback, useEffect } from 'react';
import { DiceScene } from './components/dice/DiceScene';
import { SettingsPanel, ChooseCustomPanel, TabSwitcher, InfoPanel, Footer } from './UI';

export default function DiceApp() {

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    if (typeof tg.setupSwipeBehavior === 'function') {
      tg.setupSwipeBehavior({ allow_vertical_swipe: false });
    } 
    else if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }
    else {
      console.log("Вертикальные свайпы отключить не получилось, нужная функция не найдена");
    }
  }, []);

  const [tab, setTab] = useState('gallery');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChooseCustomOpen, setIsChooseCustomOpen] = useState(false);
  const [lastRoll, setLastRoll] = useState({ type: 'd20', result: null, id: 0 });
  const [history, setHistory] = useState([]);

  const diceTypes = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];
  

  const defaultFormula = [
    { type: 'D10', count: 5 },
  ];

  const handleCustomRoll = ( customFormula=defaultFormula ) => {
  const newRoll = { 
    type: 'custom', 
    formula: customFormula,
    result: null, 
    id: Date.now() 
  };
  
  setLastRoll(newRoll);
};

  const handleRoll = (dType) => {
    const isPhysDice = true;
    const sides = parseInt(dType.substring(1));
    
    const result = isPhysDice ? null : (Math.floor(Math.random() * sides) + 1);
    const newRoll = { 
      type: dType.toLowerCase(), 
      result, 
      id: Date.now() 
    };
    
    setLastRoll(newRoll);
    if (tab === 'roller' && result !== null) {
      setHistory(prev => [...prev, result]);
    }
  };

  const onPhysicsResult = useCallback((value) => {
    setLastRoll(prev => {
      if (prev.result !== null) return prev;
      return { ...prev, result: value };
    });
  }, []);

  useEffect(() => {
    if (lastRoll.result !== null) {
      setHistory(prev => {
        return [...prev, lastRoll.result];
      });
    }
  }, [lastRoll.result, lastRoll.id]);

  const handleReset = () => {
    setHistory([]);
    // если нужно кидать d20 по нажатию на RESET, раскомментируй нижнюю строчку
    // setLastRoll({ type: 'd20', result: null, id: Date.now() });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0 
      }}>
        <DiceScene 
          lastRoll={lastRoll} 
          isPhysicsEnabled={tab === 'roller'} 
          onPhysicsResult={onPhysicsResult}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <TabSwitcher tab={tab} setTab={setTab} onSettings={() => setIsSettingsOpen(true)} />

        {tab === 'roller' && (
          <InfoPanel 
            lastRoll={lastRoll} 
            totalSum={history.reduce((a, b) => a + b, 0)} 
            onReset={handleReset} 
          />
        )}

        <Footer 
          diceTypes={diceTypes} 
          onRoll={handleRoll} 
          activeType={lastRoll.type} 
          onCustom={() => setIsChooseCustomOpen(true)}
        />

        {isSettingsOpen && (
          <div style={{ pointerEvents: 'auto' }}> 
             <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
          </div>
        )}

        {isChooseCustomOpen && (
          <div style={{ pointerEvents: 'auto' }}> 
             <ChooseCustomPanel 
              onClose={() => setIsChooseCustomOpen(false)} 
              onSelect={ (dicePool) => { handleCustomRoll(dicePool); } }
            />
          </div>
        )}
      </div>
    </div>
  );
}