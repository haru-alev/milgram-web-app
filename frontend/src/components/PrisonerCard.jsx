import React, { useState, useEffect } from 'react';
import '../styles/PrisonierCard.scss';
import EsCard from './EsCard';

// Динамически определяем адрес бэкенда
const API_BASE = window.location.hostname === 'localhost' 
  ? '' 
  : 'https://milgram-backend.onrender.com';


export default function PrisonCard({ prisoner, onBack, onNext, onPrev, systemText, setScreen }) {
  const [isVoting, setIsVoting] = useState(false);
  const [guiltyPercent, setGuiltyPercent] = useState(0);
  const [innocentPercent, setInnocentPercent] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [notification, setNotification] = useState(null);
  const [notesHistory, setNotesHistory] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [prisoner]);

  // Истории заметок из warden_notes.json
  useEffect(() => {
    if (prisoner?.id) {
      fetch(`${API_BASE}/api/notes/${prisoner.id}`)
        .then(res => res.json())
        .then(data => {
          setNotesHistory(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error('Ошибка загрузки заметок:', err));
    }
  }, [prisoner?.id]);

  if (prisoner?.id === '000') {
    return (
      <EsCard 
        prisoner={prisoner}
        onBack={onBack}
        onNext={onNext}
        onPrev={onPrev}
        systemText={systemText}
        setScreen={setScreen}
      />
    );
  }

  if (!prisoner || !systemText) return null;

  const labels = systemText.profile || {};
  const prisonierScreen = systemText.prisonier_screen || {};
  const isFirst = prisoner.id === "---";
  const isLast = prisoner.id === "010";

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const loadVotes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/votes/${prisoner.id}`);
      const data = await response.json();
      if (data.success) {
        const votes = data.votes || [];
        const total = votes.length;
        
        if (total > 0) {
          const guiltyCount = votes.filter(v => v.verdict === 'guilty').length;
          const innocentCount = votes.filter(v => v.verdict === 'innocent').length;
          
          setGuiltyPercent(Math.round((guiltyCount / total) * 100));
          setInnocentPercent(Math.round((innocentCount / total) * 100));
          setTotalVotes(total);
        } else {
          setGuiltyPercent(0);
          setInnocentPercent(0);
          setTotalVotes(0);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки голосов:', error);
    }
  };

  useEffect(() => {
    loadVotes();
  }, [prisoner.id]);

  const handleVote = async (choice) => {
    setIsVoting(true);
    try {
      const response = await fetch('${API_BASE}/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prisonerId: prisoner.id, 
          verdict: choice,
          timestamp: new Date().toISOString()
        })
      });
      const data = await response.json();
      if (data.success) {
        await loadVotes();
        const verdictText = choice === 'guilty' ? 'НЕ ОПРАВДАН' : 'ОПРАВДАН';
        showNotification(`Голос за ${prisoner.name}: ${verdictText} записан! Всего голосов: ${totalVotes + 1}`, 'success');
      } else {
        showNotification('Ошибка при записи голоса', 'error');
      }
    } catch (error) {
      console.error('Ошибка голосования:', error);
      showNotification('Ошибка соединения с сервером', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  const getPhotoUrl = (id) => {
    if (!id) return "";
    try {
      return new URL(`../assets/images/prisoners/${id}.png`, import.meta.url).href;
    } catch (e) {
      return "";
    }
  };

  const getVerdictStats = () => {
    if (prisoner.verdict_stats_1 || prisoner.verdict_stats_2) {
      return {
        stage1: prisoner.verdict_stats_1,
        stage2: prisoner.verdict_stats_2
      };
    }
    return null;
  };

  const verdictStats = getVerdictStats();

  return (
    <div className="prisoner-case-file" style={{ '--accent': prisoner.color }}>
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span className="toast-message">{notification.message}</span>
          <button className="toast-close" onClick={() => setNotification(null)}>♥</button>
        </div>
      )}

      <header className="case-header">
        <div className="sys-id">{systemText.prisonier_screen.system_id}{prisoner.id}</div>
        <div className="close-btn" onClick={onBack}> [ X ] </div>
      </header>

      <div className="case-layout">
        <aside className="case-sidebar">
          <div className="portrait-zone">
            <div className="photo-wrap">
              <div className="corner-decor"></div>
              <img src={getPhotoUrl(prisoner.id)} alt={prisoner.name} />
            </div>
            <h1 className="char-name" style={{ color: prisoner.color }}>{prisoner.name}</h1>
            <p className="case-id">{prisoner.roles?.object || prisoner.role || "SUBJECT"} // DOSSIER</p>
          </div>

          <div className="guilty-meter">
            <div className="meter-label">ВЕРДИКТ ОБЩЕСТВА</div>
            <div className="meter-label small">Всего голосов: {totalVotes}</div>
            
            <div className="meter-track">
              <div className="meter-fill" style={{ width: `${guiltyPercent}%` }}></div>
              <div className="meter-marker" style={{ left: `${guiltyPercent}%` }}></div>
            </div>
            
            <div className="meter-stats">
              <span className="guilty-stat">НЕ ОПРАВДАН {guiltyPercent}%</span>
              <span className="innocent-stat">ОПРАВДАН {innocentPercent}%</span>
            </div>
            
            <div className="verdict-buttons">
              <button className={`vote-btn guilty`} onClick={() => handleVote('guilty')} disabled={isVoting}>
                НЕ ОПРАВДАН
              </button>
              <button className={`vote-btn innocent`} onClick={() => handleVote('innocent')} disabled={isVoting}>
                ОПРАВДАН
              </button>
            </div>
            
            {verdictStats && (
              <div className="verdict-history">
                <div className="stage-result">
                  <span>1 ЭТАП:</span>
                  <span className={verdictStats.stage1?.status_verdict_1?.includes('Оправдан') ? 'innocent-text' : 'guilty-text'}>
                    {verdictStats.stage1?.status_verdict_1 || '???'}
                  </span>
                  <span className="percent">
                    {verdictStats.stage1?.guilty_percent}% / {verdictStats.stage1?.innocent_percent}%
                  </span>
                </div>
                <div className="stage-result">
                  <span>2 ЭТАП:</span>
                  <span className={verdictStats.stage2?.status_verdict_2?.includes('Оправдан') ? 'innocent-text' : 'guilty-text'}>
                    {verdictStats.stage2?.status_verdict_2 || '???'}
                  </span>
                  <span className="percent">
                    {verdictStats.stage2?.guilty_percent}% / {verdictStats.stage2?.innocent_percent}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="case-info">
          <section className="info-block">
            <h2 className="block-title">{systemText.prisonier_screen.biometrics}</h2>
            <div className="data-grid">
              <div className="data-row"><label>{labels.age}</label> <span>{prisoner.biometrs?.age || prisoner.age || "???"}</span></div>
              <div className="data-row"><label>{labels.gender}</label> <span>{prisoner.biometrs?.gender || prisoner.gender || "???"}</span></div>
              <div className="data-row"><label>{labels.height}</label> <span>{prisoner.biometrs?.height || prisoner.height || "???"}</span></div>
              <div className="data-row"><label>{labels.blood}</label> <span>{prisoner.biometrs?.blood || prisoner.blood || "???"}</span></div>
            </div>
          </section>

          <section className="info-block">
            <h2 className="block-title">{systemText.prisonier_screen.role}</h2>
            <p className="role-text">{prisoner.role || prisoner.roles?.object || "???"}</p>
            {prisoner.drive && (
              <div className="drive-info">
                <label>DRIVE:</label>
                <span>{prisoner.drive}</span>
              </div>
            )}
          </section>

          <section className="info-block">
            <h2 className="block-title">{systemText.prisonier_screen.crime}</h2>
            <p className="crime-text">{prisoner.crime || "???"}</p>
          </section>

          <section className="info-block">
            <h2 className="block-title">{systemText.prisonier_screen.quote}</h2>
            <p className="quote-text">{prisoner.quote}</p>
          </section>

          <section className="info-block">
            <h2 className="block-title">{systemText.prisonier_screen.description}</h2>
            <p className="bio-desc">{prisoner.bio || "???"}</p>
          </section>

          <section className="info-block-warden-notes">
            <h2 className="block-title">{systemText.prisonier_screen.notes}</h2>
            <div className="notes-display-area">
              {notesHistory.length === 0 ? (
                <p className="current-note">Нет заметок</p>
              ) : (
                notesHistory.map((note, idx) => (
                  <div key={idx} className="note-entry">
                    <div className="note-time">[{note.timestamp}]</div>
                    <div className="note-text">{note.text}</div>
                  </div>
                ))
              )}
            </div>
            
            <div className="attributes-row">
              <label>{labels.attributes}</label>
              <div className="tag-list">
                {Array.isArray(prisoner.attributes) ? (
                  prisoner.attributes.map(attr => (
                    <span key={attr} className="attr-tag">[{attr}]</span>
                  ))
                ) : (
                  <span className="attr-tag">[{prisoner.attributes}]</span>
                )}
              </div>
            </div>

            <button className="edit-notes-btn" onClick={() => setScreen('notes')}>
              {systemText.prisonier_screen.add_note}
            </button>
          </section>
        </main>
      </div>

      <footer className="case-footer">
        <button onClick={onPrev} disabled={isFirst}> {systemText.prisonier_screen.prev_btn}</button>
        <span className="page-indicator">#{prisoner.id}</span>
        <button onClick={onNext} disabled={isLast}>{systemText.prisonier_screen.next_btn} </button>
      </footer>
    </div>
  );
}