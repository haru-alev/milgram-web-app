import React, { useState, useEffect } from 'react';
import '../styles/PrisonierCard.scss';

export default function EsCard({ prisoner, onBack, onNext, onPrev, systemText, setScreen }) {
  const [showData, setShowData] = useState(true);
  const [showDenied, setShowDenied] = useState(false);
  const [history, setHistory] = useState([]);
  const [glitchText, setGlitchText] = useState({});

  if (!prisoner || !systemText) return null;

  const labels = systemText.profile || {};
  const prisonierScreen = systemText.prisonier_screen || {};
  const navigation = systemText.navigation_warden || {};
  const isFirst = prisoner.id === "---";
  const isLast = prisoner.id === "010";

  // Загрузка заметок для Эс
  useEffect(() => {
    fetch(`http://localhost:5000/api/notes/${prisoner.id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Ошибка загрузки заметок для Эс:', err));
  }, [prisoner.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowData(false);
      setShowDenied(true);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleOk = () => {
    onBack();
  };

  const getPhotoUrl = (id) => {
    try {
      return new URL(`../assets/images/prisoners/${id}.png`, import.meta.url).href;
    } catch (e) {
      return "";
    }
  };

  const esColor = '#FF0000';

  // Функция для глитча текста
  const glitchString = (str) => {
    if (!str) return str;
    const symbols = ['#', '%', '&', '?', '!', '@', '$', '*', 'X'];
    return str.split('').map(char => {
      if (Math.random() > 0.94) {
        return symbols[Math.floor(Math.random() * symbols.length)];
      }
      return char;
    }).join('');
  };

  useEffect(() => {
    if (!showData) return;
    
    const glitchInterval = setInterval(() => {
      const newGlitch = {};
      newGlitch.name = glitchString(prisoner.name);
      newGlitch.qualityStatus = glitchString(prisoner.quality_status);
      newGlitch.err = glitchString(prisoner.err);
      newGlitch.acses = glitchString(prisoner.acses);
      newGlitch.age = glitchString(prisoner.biometrs?.age);
      newGlitch.gender = glitchString(prisoner.biometrs?.gender);
      newGlitch.height = glitchString(prisoner.biometrs?.height);
      newGlitch.blood = glitchString(prisoner.biometrs?.blood);
      newGlitch.status = glitchString(prisoner.roles?.status);
      newGlitch.object = glitchString(prisoner.roles?.object);
      newGlitch.quote = glitchString(prisoner.quote);
      newGlitch.bio = glitchString(prisoner.bio);
      setGlitchText(newGlitch);
    }, 1000);
    
    return () => clearInterval(glitchInterval);
  }, [showData, prisoner]);

  return (
    <div className="prisoner-case-file" style={{ '--accent': esColor }}>
      {showDenied && (
        <div className="es-denied-overlay">
          <div className="es-denied-box">
            <div className="es-denied-title">ДОСТУП ЗАПРЕЩЕН</div>
            <div className="es-denied-data">
              <div className="es-denied-line">{prisoner.err}</div>
              <div className="es-denied-line">{ prisoner.acses}</div>
            </div>
            <button className="es-denied-btn" onClick={handleOk}>
              {prisoner.ok || "[ OK ]"}
            </button>
          </div>
        </div>
      )}

      {showData && (
        <>
          <header className="case-header">
            <div className="sys-id">{prisonierScreen.system_id}{prisoner.id}</div>
            <div className="close-btn" onClick={onBack}> [ X ] </div>
          </header>

          <div className="case-layout">
            <aside className="case-sidebar">
              <div className="portrait-zone">
                <div className="photo-wrap" style={{ borderColor: esColor }}>
                  <div className="corner-decor"></div>
                  <img src={getPhotoUrl(prisoner.id)} alt={prisoner.name} />
                </div>
                <h1 className="char-name" style={{ color: esColor }}>
                  {glitchText.name || prisoner.name}
                </h1>
                <p className="case-id" style={{ color: esColor }}>{prisoner.quality} // DOSSIER</p>
              </div>

              <div className="error-stats">
                <div className="error-line">{glitchText.qualityStatus || prisoner.quality_status}</div>
                <div className="error-line">{glitchText.err || prisoner.err}</div>
                <div className="error-line">{glitchText.acses || prisoner.acses}</div>
              </div>
            </aside>

            <main className="case-info">
              <section className="info-block">
                <h2 className="block-title" style={{ '--accent': esColor }}>{prisonierScreen.biometrics}</h2>
                <div className="data-grid">
                  <div className="data-row"><label>{labels.age}</label> <span>{glitchText.age || prisoner.biometrs?.age || "???"}</span></div>
                  <div className="data-row"><label>{labels.gender}</label> <span>{glitchText.gender || prisoner.biometrs?.gender || "???"}</span></div>
                  <div className="data-row"><label>{labels.height}</label> <span>{glitchText.height || prisoner.biometrs?.height || "???"}</span></div>
                  <div className="data-row"><label>{labels.blood}</label> <span>{glitchText.blood || prisoner.biometrs?.blood || "???"}</span></div>
                </div>
              </section>

              <section className="info-block">
                <h2 className="block-title" style={{ '--accent': esColor }}>{prisonierScreen.role}</h2>
                <div className="data-grid">
                  <div className="data-row"><label>{labels.status}</label> <span>{glitchText.status || prisoner.roles?.status || "???"}</span></div>
                  <div className="data-row"><label>{labels.object}</label> <span>{glitchText.object || prisoner.roles?.object || "???"}</span></div>
                </div>
              </section>

              <section className="info-block">
                <h2 className="block-title" style={{ '--accent': esColor }}>{prisonierScreen.quote}</h2>
                <p className="quote-text" style={{ borderLeftColor: esColor }}>{glitchText.quote || prisoner.quote || "..."}</p>
              </section>

              <section className="info-block">
                <h2 className="block-title" style={{ '--accent': esColor }}>{prisonierScreen.description}</h2>
                <p className="bio-desc">{glitchText.bio || prisoner.bio || "???"}</p>
              </section>

              <section className="info-block-warden-notes">
                <h2 className="block-title" style={{ '--accent': esColor }}>{prisonierScreen.notes}</h2>
                <div className="notes-display-area">
                  {history.length === 0 ? (
                    <p className="current-note">Нет заметок</p>
                  ) : (
                    history.map((log, i) => (
                      <div key={i} className="log-entry" style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,0,0,0.3)' }}>
                        <div className="log-time" style={{ fontSize: '9px', color: '#ff6666' }}>[{log.timestamp}]</div>
                        <div className="log-text" style={{ fontSize: '11px', color: '#ffcccc' }}>{log.text}</div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="attributes-row">
                  <label>{labels.attributes}</label>
                  <div className="tag-list">
                    {prisoner.attributes && Array.isArray(prisoner.attributes) ? (
                      prisoner.attributes.map(attr => (
                        <span key={attr} className="attr-tag">[{attr}]</span>
                      ))
                    ) : (
                      <span className="attr-tag">[{prisoner.attributes}]</span>
                    )}
                  </div>
                </div>

                <button className="edit-notes-btn" onClick={() => setScreen('notes')}>
                  {prisonierScreen.add_note}
                </button>
              </section>
            </main>
          </div>

          <footer className="case-footer">
            <button onClick={onPrev} disabled={isFirst}> {prisonierScreen.prev_btn}</button>
            <span className="page-indicator">#{prisoner.id}</span>
            <button onClick={onNext} disabled={isLast}> {prisonierScreen.next_btn}</button>
          </footer>
        </>
      )}
    </div>
  );
}