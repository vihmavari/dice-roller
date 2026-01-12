import React, { useState } from 'react';
import { RotateCcw, Palette, PencilLine, Trash2 } from 'lucide-react';
import { useDiceTheme } from './context/DiceContext';
import { useRoll } from './context/RollContext';


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
        <Palette size={18} strokeWidth={3}/>
      </button>
    </div>
  </div>
);

export const InfoPanel = ({ lastRoll, totalSum, onReset }) => {
  const isCustom = lastRoll.type === 'custom';
  const results = lastRoll.individualResults || [];
  const hasResults = results.length > 0;
  const minVal = hasResults ? Math.min(...results) : '-';
  const maxVal = hasResults ? Math.max(...results) : '-';

  return (
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
        <div className="text-xl sm:text-2xl font-bold">{lastRoll.result !== null ? lastRoll.result : '-'}</div>
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

      {isCustom && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          marginTop: '-2px'
        }}>
          <div style={{ 
            background: 'rgba(255, 77, 77, 0.2)', 
            padding: '2px 8px', 
            borderRadius: '6px',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            minWidth: '45px',
            textAlign: 'center'
          }}>
            MIN: {minVal}
          </div>
          <div style={{ 
            background: 'rgba(77, 255, 136, 0.2)', 
            padding: '2px 8px', 
            borderRadius: '6px',
            border: '1px solid rgba(77, 255, 136, 0.3)',
            minWidth: '45px',
            textAlign: 'center'
          }}>
            MAX: {maxVal}
          </div>
        </div>
      )}

      <button 
        onClick={onReset}
        className="absolute -bottom-10 right-0 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};

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

const formatDicePool = (pool) => {
  if (!pool || pool.length === 0) return "Пустой пул";
  return pool.map(d => `${d.count}${d.type.toLowerCase()}`).join(' + ');
};

export const ChooseCustomPanel = ({ onClose, onSelect }) => {
  const { formulaList, addFormula, delFormula, editFormula } = useRoll();
  const [isExiting, setIsExiting] = useState(false);
  
  const [editingIndex, setEditingIndex] = useState(null);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300);
  };

  const handleSelect = (formula) => {
    if (onSelect) {
        onSelect(formula.dice_pool); 
        handleClose();
    }
  };

  const handleDelete = (e, index) => {
    e.stopPropagation();
    if (window.confirm('Удалить этот шаблон?')) {
      delFormula(index);
    }
  };

  const handleEditClick = (e, index) => {
    e.stopPropagation();
    setEditingIndex(index);
  };

  const handleCreateClick = () => {
    setEditingIndex(-1);
  };

  const handleBackToList = () => {
    setEditingIndex(null);
  };

  return (
    <div className={`settings-overlay ${isExiting ? 'fadeOut' : 'fadeIn'}`}>
      <div className={`settings-content ${isExiting ? 'scaleDown' : 'scaleUp'}`}>
        
        <div className="settings-header">
          <h2 className="text-xl font-bold">
            {editingIndex !== null 
              ? (editingIndex === -1 ? 'Новый шаблон' : 'Редактирование') 
              : 'Кастомные шаблоны'}
          </h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>

        <div className="settings-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0.5rem' }}>
          
          {editingIndex === null && (
            <div className="flex flex-col gap-3">
              {formulaList.length === 0 && (
                <div className="text-center text-gray-500 py-4"><i>Нет сохраненных шаблонов...</i></div>
              )}

              {formulaList.map((item, idx) => (
                <div 
                  key={idx} 
                  className="formula-card"
                  onClick={() => handleSelect(item)}
                >
                  <div className="formula-name"><b>{item.roll_name}</b></div>
                  
                  {/* Кнопки управления (уедут вправо-верх) */}
                  <div className="formula-actions">
                    <button 
                      className="icon-btn edit-btn" 
                      onClick={(e) => handleEditClick(e, idx)}
                    >
                      <PencilLine strokeWidth={3}/>
                    </button>
                    <button 
                      className="icon-btn del-btn" 
                      onClick={(e) => handleDelete(e, idx)}
                    >
                      <Trash2 strokeWidth={3}/>
                    </button>
                  </div>

                  <div className="formula-details">
                    <i>{formatDicePool(item.dice_pool)}</i>
                  </div>
                </div>
              ))}

              <button className="add-formula-btn" onClick={handleCreateClick}>
                + Новый шаблон
              </button>
            </div>
          )}

          {editingIndex !== null && (
            <FormulaEditor 
              index={editingIndex}
              initialData={editingIndex === -1 ? null : formulaList[editingIndex]}
              onSave={(data) => {
                if (editingIndex === -1) addFormula(data);
                else editFormula(editingIndex, data);
                setEditingIndex(null);
              }}
              onCancel={handleBackToList}
            />
          )}

        </div>
      </div>
    </div>
  );
};

const FormulaEditor = ({ index, initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.roll_name || "");
  const [pool, setPool] = useState(initialData?.dice_pool || []);

  const diceTypes = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20'];

  const changeDiceCount = (type, delta) => {
    setPool(prev => {
      const existing = prev.find(d => d.type === type);
      let newPool = [...prev];
      if (existing) {
        newPool = newPool.map(d => 
          d.type === type ? { ...d, count: Math.max(0, d.count + delta) } : d
        );
      } else if (delta > 0) {
        newPool.push({ type, count: 1 });
      }
      return newPool.filter(d => d.count > 0);
    });
  };

  const getCount = (type) => pool.find(d => d.type === type)?.count || 0;

  const handleSave = () => {
    if (!name.trim()) return alert("Введите название");
    if (pool.length === 0) return alert("Выберите хотя бы один кубик");
    onSave({ roll_name: name, dice_pool: pool });
  };

  return (
    <div className="editor-container">
      <input 
        type="text" 
        className="editor-input"
        placeholder="Название шаблона..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="dice-grid">
        {diceTypes.map(type => (
          <div key={type} className="dice-counter-row">
            <span className="dice-type-label">{type}</span>
            <div className="counter-controls">
              <button 
                className="circle-btn" 
                onClick={() => changeDiceCount(type, -1)} 
                disabled={getCount(type) === 0}
              >
                <span>−</span>
              </button>
              <span className="count-display">{getCount(type)}</span>
              <button 
                className="circle-btn" 
                onClick={() => changeDiceCount(type, 1)}
              >
                <span>+</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="editor-footer-actions">
        <button className="footer-btn btn-cancel" onClick={onCancel}>
          Отмена
        </button>
        <button className="footer-btn btn-save" onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
};

export const Footer = ({ diceTypes, onRoll, activeType, onCustom, active_tab }) => (
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
        maxWidth: '400px',
        display: 'grid',
        gridTemplateColumns: active_tab === 'roller' ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(80px, 1fr))', 
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

        {active_tab === 'roller' && (
          <button 
            className={`px-2 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-[11px] sm:text-xs ${
              activeType === 'custom' 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            onClick={onCustom}
          >
            Custom
          </button>
        )}
      </div>
  </div>
);
