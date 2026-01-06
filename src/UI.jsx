import React from 'react';
import { RotateCcw, Settings2 } from 'lucide-react';
import { useDiceTheme } from './context/DiceContext';


export const TabSwitcher = ({ tab, setTab, onSettings }) => (
  <div style={{
    position: 'absolute',
    top: '3%',
    left: '3%',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none' 
  }}>
    <div 
      className="flex flex-col bg-black/60 backdrop-blur-md rounded-xl border border-white/20 p-1 shadow-2xl"
      style={{ 
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      {['gallery', 'roller'].map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
            tab === t 
              ? 'bg-white text-black shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          style={{
            writingMode: 'horizontal-tb',
            textAlign: 'center',
            minWidth: '80px'
          }}
        >
          {t === 'gallery' ? 'ГАЛЕРЕЯ' : 'БРОСКИ'}
        </button>
      ))}
      <button 
        onClick={onSettings}
        className="absolute -bottom-10 right-0 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
      >
        <Settings2 size={14} />
      </button>
    </div>
  </div>
);

export const InfoPanel = ({ lastRoll, totalSum, onReset }) => (
  <div style={{
    position: 'absolute', 
    top: '3%', 
    right: '3%',
    zIndex: 110, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    pointerEvents: 'auto'
  }}>
    <div style={{
      background: 'rgba(0, 0, 0, 0.7)', 
      padding: '10px 10px', 
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.2)', 
      color: 'white', 
      textAlign: 'right',
      backdropFilter: 'blur(10px)',
      minWidth: '50px'
    }}>
      <div style={{ fontSize: '90%', opacity: 0.7, textTransform: 'uppercase' }}>Выпало</div>
      <div className="text-xl sm:text-2xl font-bold">{lastRoll.result || '-'}</div>
    </div>

    <div style={{
      background: 'rgba(51, 144, 236, 0.2)', 
      padding: '10px 10px', 
      borderRadius: '12px',
      border: '2px solid #3390ec', 
      color: 'white', 
      textAlign: 'right',
      backdropFilter: 'blur(10px)', 
      position: 'relative'
    }}>
      <div style={{ fontSize: '90%', opacity: 0.9, textTransform: 'uppercase' }}>Всего</div>
      <div className="text-2xl sm:text-3xl font-bold">{totalSum}</div>
    </div>

    <button 
        onClick={onReset}
        className="absolute -bottom-10 right-0 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
      >
        <RotateCcw size={14} />
      </button>
  </div>
);

export const SettingsPanel = ({ onClose }) => {
  const { theme, updateColor } = useDiceTheme();
  const [isExiting, setIsExiting] = React.useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`settings-overlay ${isExiting ? 'fadeOut' : 'fadeIn'}`}>
      <div className={`settings-content ${isExiting ? 'scaleDown' : 'scaleUp'}`}>
        <div className="settings-header">
          <h2 className="text-xl font-bold">Настройки цвета</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>

        <div className="settings-grid">
          <div className="setting-control">
            <label>Материал дайса</label>
            <input 
              type="color" 
              value={theme.bodyColor} 
              onChange={(e) => updateColor('bodyColor', e.target.value)} 
            />
          </div>

          <div className="setting-control">
            <label>Рёбра дайсов</label>
            <input 
              type="color" 
              value={theme.edgeColor} 
              onChange={(e) => updateColor('edgeColor', e.target.value)} 
            />
          </div>

          <div className="setting-control">
            <label>Числа</label>
            <input 
              type="color" 
              value={theme.textColor} 
              onChange={(e) => updateColor('textColor', e.target.value)} 
            />
          </div>

          <div className="setting-control">
            <label>Поверхность</label>
            <input 
              type="color" 
              value={theme.floorColor} 
              onChange={(e) => updateColor('floorColor', e.target.value)} 
            />
          </div>
        </div>

        <button className="save-button" onClick={handleClose}>
          Готово
        </button>
      </div>
    </div>
  );
};

export const Footer = ({ diceTypes, onRoll, activeType }) => (
  <div style={{
    position: 'absolute',
    bottom: '20px',
    left: '0',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 200,
    pointerEvents: 'none' 
  }}>
    <div 
      className="bg-black/60 backdrop-blur-lg p-2 rounded-2xl border border-white/10 shadow-2xl"
      style={{ 
        pointerEvents: 'auto',
        width: '90%',
        maxWidth: '400px', // Ограничиваем ширину, чтобы сетка не растягивалась слишком сильно
        display: 'grid',
        // Создаем сетку: 4 колонки (или сколько влезет), автоматически перенося на 2 строки
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '6px',
      }}
    >
        {diceTypes.map(d => (
          <button 
            key={d}
            onClick={(e) => {
              e.stopPropagation();
              onRoll(d);
            }}
            className={`px-2 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-[11px] sm:text-xs ${
              activeType === d.toLowerCase() 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
  </div>
);
