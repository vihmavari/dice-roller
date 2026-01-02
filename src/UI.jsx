import React from 'react';
import { RotateCcw, Settings2 } from 'lucide-react';
import { useDiceTheme } from './context/DiceContext';


export const TabSwitcher = ({ tab, setTab }) => (
  <div style={{
    position: 'absolute',
    top: '3%',
    left: '50%',          // Сдвигаем начало контейнера на центр экрана
    transform: 'translateX(-50%)', // Сдвигаем сам контейнер назад на половину его ширины
    zIndex: 100,
    width: 'auto',        // Контейнер подстроится под размер кнопок
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none' 
  }}>
    <div 
      className="flex bg-black/60 backdrop-blur-md rounded-xl border border-white/20 p-1 shadow-2xl"
      style={{ 
        pointerEvents: 'auto',
        display: 'flex',
      }}
    >
      {['gallery', 'roller'].map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            tab === t ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          {t === 'gallery' ? 'ГАЛЕРЕЯ' : 'БРОСКИ'}
        </button>
      ))}
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

export const SettingsButton = ({ onSettings }) => (
  <div style={{
    position: 'absolute', 
    top: '3%', 
    left: '3%',
    zIndex: 120, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    pointerEvents: 'auto'
  }}>
    <button 
        onClick={onSettings}
        className="absolute -bottom-10 right-0 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
      >
        <Settings2 size={14} />
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
      className="flex bg-black/60 backdrop-blur-lg p-1.5 rounded-2xl border border-white/10 gap-2 overflow-x-auto shadow-2xl"
      style={{ 
        pointerEvents: 'auto',
        maxWidth: '90%',
        display: 'flex',
        gap: '5px'
      }}
    >
        {diceTypes.map(d => (
          <button 
            key={d}
            onClick={(e) => {
              e.stopPropagation();
              onRoll(d);
            }}
            className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold transition-all active:scale-95 whitespace-nowrap ${
              activeType === d.toLowerCase() ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
  </div>
);