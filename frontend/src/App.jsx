import React, { useState, useEffect } from 'react';
import './styles/App.scss';

import Login from './components/Login.jsx';
import WardenProfile from './components/WardenProfile.jsx';
import Dossier from './components/Dossier.jsx';
import PrisonCard from './components/PrisonerCard.jsx';
import PrisonMap from './components/PrisonMap.jsx';
import Notes from './components/Notes.jsx';
import SecretFiles from './components/SecretFiles.jsx';

// Динамически определяем адрес бэкенда
const API_BASE = window.location.hostname === 'localhost' 
  ? '' 
  : 'https://milgram-backend.onrender.com';

export default function App() {
  const [screen, setScreen] = useState('login'); 
  const [wardenProfile, setWardenProfile] = useState(null);
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [prisonersData, setPrisonersData] = useState(null);
  const [systemText, setSystemText] = useState(null);
  const [secretFilesData, setSecretFilesData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // История переходов – для корректной работы кнопки "Назад"
  const [historyStack, setHistoryStack] = useState([]);

  const navigateTo = (newScreen, params = {}) => {
    if (newScreen === screen) return;
    
    setHistoryStack(prev => [...prev, {
      screen: screen,
      selectedPrisoner: selectedPrisoner
    }]);
    
    if (params.selectedPrisoner !== undefined) {
      setSelectedPrisoner(params.selectedPrisoner);
    }
    
    setScreen(newScreen);
  };
  
  // Возврат на предыдущий экран с принудительным обновлением данных
  const goBack = () => {
    setHistoryStack(prev => {
      if (prev.length === 0) {
        setScreen('es-profile');
        return prev;
      }
      
      const last = prev[prev.length - 1];
    
      // Запрос идет на конкретный эндпоинт получения заключенных
      fetch(`${API_BASE}/api/prisoners`)
        .then(res => res.json())
        .then(data => {
          setPrisonersData(data);
          // Если возвращаемся на карточку, обновляем выбранного заключенного
          if (last.selectedPrisoner) {
            const updatedPrisoner = data.prisoners.find(p => p.id === last.selectedPrisoner.id);
            if (updatedPrisoner) {
              setSelectedPrisoner(updatedPrisoner);
            }
          }
        })
        .catch(err => console.error("Ошибка обновления данных:", err));
      
      setSelectedPrisoner(last.selectedPrisoner);
      setScreen(last.screen);
      return prev.slice(0, -1);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // Время для дизайна
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ru-RU', { 
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/prisoners`).then(res => res.json()),
      fetch(`${API_BASE}/api/system-text`).then(res => res.json()),
      fetch(`${API_BASE}/api/warden-profile`).then(res => res.json()),
      fetch(`${API_BASE}/api/secret-files`).then(res => res.json())
    ])
    .then(([pData, sText, wProfile, sFiles]) => {
      setPrisonersData(pData);
      setSystemText(sText);
      setWardenProfile(wProfile);
      setSecretFilesData(sFiles);
    })
    .catch(err => console.error("Ошибка инициализации системы:", err));
  }, []);

  if (!prisonersData || !systemText || !wardenProfile || !secretFilesData) {
    return <div className="loading-screen">INITIALIZING_SYSTEM...</div>;
  }

  const getSystemTitle = () => {
    switch(screen) {
      case 'es-profile':
        return systemText.warden_screen?.system_os;
      case 'dossier':
        return systemText.prisonier_screen?.system_prisonier;
      case 'prison-card':
        return systemText.prisonier_screen?.system_prisonier;
      case 'map':
        return systemText.map_screen?.system_map;
      case 'notes':
        return systemText.notes_screen?.system_note;
      case 'files':
        return systemText.secret_screen?.system_secret;
      default:
        return "MILGRAM_TERMINAL";
    }
  };

  const navigation = systemText.navigation_warden || {};
  
  // Полный список персонажей для навигации
  const getAllCharacters = () => {
    const all = [];
    if (prisonersData.guidan) all.push({ ...prisonersData.guidan, type: 'guidan' });
    if (prisonersData.warden) all.push({ ...prisonersData.warden, type: 'warden' });
    if (prisonersData.prisoners && Array.isArray(prisonersData.prisoners)) {
      prisonersData.prisoners.forEach(p => all.push({ ...p, type: 'prisoner' }));
    }
    return all;
  };
  
  const navigatePrisoner = (direction) => {
    if (!selectedPrisoner) return;
    const allCharacters = getAllCharacters();
    const currentIndex = allCharacters.findIndex(p => p.id === selectedPrisoner.id);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = allCharacters.length - 1;
    if (nextIndex >= allCharacters.length) nextIndex = 0;
    setSelectedPrisoner(allCharacters[nextIndex]);
  };

  const updatePrisonerDataLocally = (id, newNote, newAttrs) => {
    setPrisonersData(prev => ({
      ...prev,
      prisoners: prev.prisoners.map(p => 
        p.id === id ? { ...p, notes_es: newNote, attributes: newAttrs } : p
      )
    }));
  };

  return (
    <div className="app-container">
      {screen !== 'login' && (
        <div className="terminal-header">
          <div className="left">{getSystemTitle()}</div>
          <div className="center">{time}</div>
          <div className="right">
            {systemText.title?.status}
            <div className={`menu-icon ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span></span><span></span><span></span>
            </div>
          </div>

          {isMenuOpen && (
            <div className="side-menu">
              <button onClick={() => { navigateTo('es-profile'); setIsMenuOpen(false); }}>
                {navigation.warden_data}
              </button>
              <button onClick={() => { navigateTo('dossier'); setIsMenuOpen(false); }}>
                {navigation.inmate_data}
              </button>
              <button onClick={() => { navigateTo('map'); setIsMenuOpen(false); }}>
                {navigation.facility_map}
              </button>
              <button onClick={() => { navigateTo('notes'); setIsMenuOpen(false); }}>
                {navigation.warden_notes}
              </button>
              <button className="secret" onClick={() => { navigateTo('files'); setIsMenuOpen(false); }}>
                {navigation.secret_files}
              </button>
            </div>
          )}
        </div>
      )}

      <main className="main-content">
        {screen === 'login' && (
          <Login 
            onLoginSuccess={() => navigateTo('es-profile')} 
            systemText={systemText} 
          />
        )}
        
        {screen === 'es-profile' && (
          <WardenProfile 
            setScreen={navigateTo} 
            wardenData={wardenProfile} 
            systemText={systemText} 
          />
        )}

        {screen === 'dossier' && (
          <Dossier 
            onSelect={(p) => { navigateTo('prison-card', { selectedPrisoner: p }); }} 
            onBack={goBack}
            prisonersData={prisonersData}
            systemText={systemText}
          />
        )}

        {screen === 'prison-card' && (
          <PrisonCard 
            prisoner={selectedPrisoner} 
            onBack={goBack}
            onNext={() => navigatePrisoner(1)}
            onPrev={() => navigatePrisoner(-1)}
            setScreen={navigateTo}
            systemText={systemText}
          />
        )}

        {screen === 'map' && (
          <PrisonMap 
            onSelect={(p) => { navigateTo('prison-card', { selectedPrisoner: p }); }}
            onBack={goBack}
            systemText={systemText}
            prisonersData={prisonersData}
            setScreen={navigateTo}
          />
        )}

        {screen === 'notes' && (
          <Notes 
            initialPrisoner={selectedPrisoner} 
            prisonersData={prisonersData}
            onBack={goBack}
            systemText={systemText}
            updateLocally={updatePrisonerDataLocally}
          />
        )}

        {screen === 'files' && (
          <SecretFiles 
            secretFilesData={secretFilesData}
            onBack={goBack}
            systemText={systemText}
          />
        )}
      </main>
    </div>
  );
}
