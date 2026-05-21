import React, { useState, useEffect } from 'react';
import '../styles/Notes.scss';

// Динамически определяем адрес бэкенда
const API_BASE = window.location.hostname === 'localhost' 
  ? '' 
  : 'https://milgram-backend.onrender.com';


export default function Notes({ initialPrisoner, prisonersData, onBack, onUpdate, systemText }) {
  const [activeSub, setActiveSub] = useState(initialPrisoner || null);
  const [history, setHistory] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const [customAttr, setCustomAttr] = useState("");
  const [notification, setNotification] = useState(null);

  const notesScreen = systemText?.notes_screen || {};
  const navigation = systemText?.navigation_warden || {};
  const prisonierScreen = systemText?.prisonier_screen || {};

  // Все персонажи
  const getAllCharacters = () => {
    const all = [];
    
    if (prisonersData.guidan) {
      all.push({ ...prisonersData.guidan, type: 'guidan' });
    }
    
    if (prisonersData.warden) {
      all.push({ ...prisonersData.warden, type: 'es' });
    } else if (prisonersData.es) {
      all.push({ ...prisonersData.es, type: 'es' });
    }
    
    if (prisonersData.prisoners && Array.isArray(prisonersData.prisoners)) {
      prisonersData.prisoners.forEach(p => {
        all.push({ ...p, type: 'prisoner' });
      });
    }
    
    return all;
  };

  const allCharacters = getAllCharacters();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const hexToRgb = (hex) => {
    if (!hex) return '136, 136, 136';
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '136, 136, 136';
  };

  useEffect(() => {
    if (activeSub) {
      fetch(`${API_BASE}/api/notes/${activeSub.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setHistory(Array.isArray(data) ? data : []);
          setInputText("");
          const attrs = activeSub.attributes;
          setSelectedAttrs(Array.isArray(attrs) ? attrs : (attrs ? [attrs] : []));
        })
        .catch(err => console.error('Ошибка загрузки заметок:', err));
    }
  }, [activeSub]);

  const handleSave = () => {
    if (!activeSub || !inputText.trim()) {
      showNotification('Введите текст заметки!', 'error');
      return;
    }
    
    fetch('${API_BASE}/api/save-full-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: activeSub.id, 
        text: inputText, 
        attributes: selectedAttrs 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setHistory([data.entry, ...history]);
        onUpdate(activeSub.id, inputText, selectedAttrs);
        setInputText("");
        showNotification(`Заметка для ${activeSub.name} сохранена!`, 'success');
      } else {
        showNotification('Ошибка при сохранении', 'error');
      }
    })
    .catch(err => {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения с сервером', 'error');
    });
  };

  const addCustomAttribute = () => {
    const trimmed = customAttr.trim().toUpperCase();
    if (trimmed && !selectedAttrs.includes(trimmed)) {
      setSelectedAttrs([...selectedAttrs, trimmed]);
      setCustomAttr("");
      showNotification(`Тег ${trimmed} добавлен`, 'success');
    }
  };

  const getRole = (char) => {
    if (char.role) return char.role;
    if (char.roles?.object) return char.roles.object;
    return "???";
  };

  const getDrive = (char) => {
    if (char.drive) return char.drive;
    return "???";
  };

  const getCrime = (char) => {
    if (char.crime) return char.crime;
    if (char.bio) return char.bio.substring(0, 80);
    return "???";
  };

  // Единая функция для получения цвета персонажа
  const getCharacterColor = (char) => {
    if (!char) return '#ACACAC';
    if (char.id === '000') return '#FF0000';  // Эс по id
    if (char.type === 'es') return '#FF0000'; // или по типу
    return char.color || '#ACACAC';
  };

  const currentColor = getCharacterColor(activeSub);
  const currentColorRgb = hexToRgb(currentColor);

  return (
    <div 
      className="notes-terminal-screen" 
      style={{ 
        '--accent': currentColor,
        '--accent-rgb': currentColorRgb
      }}
    >
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span className="toast-message">{notification.message}</span>
          <button className="toast-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <aside className="notes-terminal-screen__sidebar">
        <div className="notes-terminal-screen__avatar-list">
          {allCharacters.map(char => {
            const charColor = getCharacterColor(char);
            const rgb = hexToRgb(charColor);
            const isActive = activeSub?.id === char.id;
            
            return (
              <div 
                key={char.id} 
                className={`notes-terminal-screen__avatar ${isActive ? 'active' : ''}`}
                style={{ 
                  '--char-accent': charColor,
                  '--char-accent-rgb': rgb
                }}  
                onClick={() => setActiveSub(char)}
              >
                <div className="notes-terminal-screen__avatar-img">
                  <img src={new URL(`../assets/images/prisoners/${char.id}.png`, import.meta.url).href} alt="" />
                </div>
                <span className="notes-terminal-screen__avatar-id">#{char.id}</span>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="notes-terminal-screen__content">
        <div className="notes-terminal-screen__nav">
          <button className="notes-terminal-screen__back-btn" onClick={onBack}>
            {navigation.back_btn || "← BACK"}
          </button>
        </div>

        {activeSub ? (
          <div className="notes-terminal-screen__layout">
            <aside className="notes-terminal-screen__profile">
              <div className="notes-terminal-screen__portrait" style={{ borderColor: getCharacterColor(activeSub) }}>
                <img src={new URL(`../assets/images/prisoners/${activeSub.id}.png`, import.meta.url).href} alt="" />
                <div className="notes-terminal-screen__scan-tag">SUBJECT_SCAN</div>
              </div>
              <div className="notes-terminal-screen__info">
                <h2 className="notes-terminal-screen__name" style={{ color: getCharacterColor(activeSub) }}>{activeSub.name}</h2>
                <div className="notes-terminal-screen__id">#{activeSub.id}</div>
                <div className="notes-terminal-screen__bio">
                  <p><span>ROLE:</span> {getRole(activeSub)}</p>
                  <p><span>DRIVE:</span> {getDrive(activeSub)}</p>
                  <p><span>CRIME:</span> {getCrime(activeSub)}</p>
                </div>
              </div>
            </aside>

            <div className="notes-terminal-screen__workspace">
              <div className="notes-terminal-screen__section">
                <div className="notes-terminal-screen__section-title">{prisonierScreen.system_logs}</div>
                <div className="notes-terminal-screen__logs">
                  {history.length === 0 ? (
                    <div className="notes-terminal-screen__logs-empty">No records yet</div>
                  ) : (
                    history.map((log, i) => (
                      <div key={i} className="notes-terminal-screen__log">
                        <span className="notes-terminal-screen__log-time">[{log.timestamp}]</span>
                        <span className="notes-terminal-screen__log-text">› {log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="notes-terminal-screen__section">
                <div className="notes-terminal-screen__section-title">{notesScreen.save_note}</div>
                <div className="notes-terminal-screen__editor">
                  <textarea 
                    className="notes-terminal-screen__textarea"
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    placeholder={notesScreen.notes}
                  />
                  <div className="notes-terminal-screen__tags">
                    {Array.isArray(selectedAttrs) && selectedAttrs.map(attr => (
                      <button 
                        key={attr} 
                        className="notes-terminal-screen__tag active"
                        onClick={() => setSelectedAttrs(selectedAttrs.filter(a => a !== attr))}
                      >
                        {attr}
                      </button>
                    ))}
                    <div className="notes-terminal-screen__custom-tag">
                      <input 
                        type="text" 
                        value={customAttr}
                        onChange={(e) => setCustomAttr(e.target.value)}
                        placeholder="NEW TAG..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomAttribute();
                          }
                        }}
                      />
                      <button className="notes-terminal-screen__add-tag" onClick={addCustomAttribute}>+</button>
                    </div>
                  </div>
                  <button className="notes-terminal-screen__save-btn" onClick={handleSave}>
                    {notesScreen.save_note}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="notes-terminal-screen__empty">
            <div className="notes-terminal-screen__empty-cursor">› {notesScreen.select}</div>
            <div className="notes-terminal-screen__empty-hint">{notesScreen.selecttext}</div>
          </div>
        )}
      </main>
    </div>
  );
}