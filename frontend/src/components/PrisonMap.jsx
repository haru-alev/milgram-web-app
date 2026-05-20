import React, { useState, useRef, useEffect } from 'react';
import MilgramMapSVG from '../components/MilgramMapSVG';
import '../styles/PrisonMap.scss';

export default function PrisonMap({ onSelect, onBack, prisonersData, systemText, setScreen }) {
  const [selected, setSelected] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [pos, setPos] = useState({ x: 150, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const mapAreaRef = useRef(null);

  const hexToRgb = (hex) => {
    if (!hex) return '255, 51, 102';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 51, 102';
  };

  // Загружаем историю из localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('prisonMapHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prisonMapHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const lastSelectedId = localStorage.getItem('prisonMapLastSelected');
    if (lastSelectedId) {
      let found = null;
      if (prisonersData.guidan && prisonersData.guidan.id === lastSelectedId) found = prisonersData.guidan;
      if (!found && prisonersData.es && prisonersData.es.id === lastSelectedId) found = prisonersData.es;
      if (!found && prisonersData.warden && prisonersData.warden.id === lastSelectedId) found = prisonersData.warden;
      if (!found && prisonersData.prisoners) found = prisonersData.prisoners.find(p => p.id === lastSelectedId);
      if (found) setSelected(found);
    }
  }, [prisonersData]);

  // Запрещен скролл страницы когда курсор на карте
  useEffect(() => {
    const preventBodyScroll = (e) => {
      if (mapAreaRef.current && mapAreaRef.current.contains(e.target)) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventBodyScroll, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventBodyScroll);
    };
  }, []);

  const addToHistory = (prisoner) => {
    setHistory(prev => {
      const newEntry = {
        id: prisoner.id,
        name: prisoner.name,
        color: prisoner.color,
        timestamp: new Date().toLocaleTimeString()
      };
      const filtered = prev.filter(p => p.id !== prisoner.id);
      return [newEntry, ...filtered].slice(0, 15);
    });
    localStorage.setItem('prisonMapLastSelected', prisoner.id);
  };

  const handleRoomSelect = (prisoner) => {
    setSelected(prisoner);
    addToHistory(prisoner);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    const newScale = Math.min(Math.max(0.4, scale * delta), 2.5);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(0.5);
    setPos({ x: 25, y: 25 });
  };

  const findPrisonerById = (id) => {
    if (prisonersData.guidan && prisonersData.guidan.id === id) return prisonersData.guidan;
    if (prisonersData.es && prisonersData.es.id === id) return prisonersData.es;
    if (prisonersData.warden && prisonersData.warden.id === id) return prisonersData.warden;
    if (prisonersData.prisoners) return prisonersData.prisoners.find(p => p.id === id);
    return null;
  };

  const systemMap = systemText?.map_screen || {};
  const navigation = systemText?.navigation_warden || {};
  const prisonierScreen = systemText?.prisonier_screen || {};
  
  const currentColor = selected?.color;
  const currentColorRgb = hexToRgb(currentColor);

  return (
    <div 
      className="prison-map" 
      style={{ 
        '--accent-color': currentColor,
        '--accent-color-rgb': currentColorRgb
      }}
    >
      <div className="prison-map__nav">
        <button className="prison-map__back-btn" onClick={onBack}>
          {navigation.back_btn || "<- BACK"}
        </button>
        <span className="prison-map__welcome">{systemMap.welcome}</span>
        <button className="prison-map__reset-btn" onClick={resetView}>
          RESET VIEW
        </button>
      </div>

      <div className="prison-map__main">
        <aside className="prison-map__panel prison-map__panel--left">
          {selected ? (
            <div className="prison-map__dossier">
              <div className="prison-map__portrait" style={{ borderColor: selected.color }}>
                <img 
                  src={new URL(`../assets/images/prisoners/${selected.id}.png`, import.meta.url).href} 
                  alt={selected.name}
                />
              </div>
              <div className="prison-map__dossier-name" style={{ color: selected.color }}>
                {selected.name}
              </div>
              <div className="prison-map__dossier-id">#{selected.id}</div>
              <div className="prison-map__dossier-bio">
                <p><span>{systemText.profile.role}</span> {selected.role || selected.roles?.object || "???"}</p>
                <p><span>{systemText.profile.drive}</span> {selected.drive || "???"}</p>
                <p><span>{systemText.profile.crime}</span> {selected.crime || selected.bio?.substring(0, 80) || "???"}</p>
              </div>
              <button 
                className="prison-map__open-btn" 
                onClick={() => onSelect(selected)}
              >
                {systemMap.open_dossier}
              </button>
            </div>
          ) : (
            <div className="prison-map__dossier-empty">
              <div className="prison-map__empty-text">{systemMap.empty_room}</div>
              <div className="prison-map__empty-hint">Click on any room to view dossier</div>
            </div>
          )}
        </aside>

        <div 
          className="prison-map__map-area"
          ref={mapAreaRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="prison-map__map-transform"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <MilgramMapSVG 
              selectedId={selected?.id} 
              onRoomClick={(id) => {
                const prisoner = findPrisonerById(id);
                if (prisoner) handleRoomSelect(prisoner);
              }}
              prisonersData={prisonersData}
            />
          </div>
        </div>

        <aside className="prison-map__panel prison-map__panel--right">
          <label className="prison-map__label">{prisonierScreen.system_logs}</label>
          <div className="prison-map__history">
            {history.length === 0 ? (
              <div className="prison-map__history-empty">No records yet</div>
            ) : (
              history.map((item, idx) => (
                <div 
                  key={item.id + idx} 
                  className={`prison-map__history-item ${selected?.id === item.id ? 'active' : ''}`}
                  onClick={() => {
                    const prisoner = findPrisonerById(item.id);
                    if (prisoner) setSelected(prisoner);
                  }}
                >
                  <div className="prison-map__history-time">[{item.timestamp}]</div>
                  <div className="prison-map__history-name" style={{ color: item.color }}>{item.name}</div>
                  <div className="prison-map__history-id">#{item.id}</div>
                </div>
              ))
            )}
          </div>
          {history.length > 0 && (
            <button 
              className="prison-map__clear-history" 
              onClick={() => setHistory([])}
            >
              CLEAR HISTORY
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}