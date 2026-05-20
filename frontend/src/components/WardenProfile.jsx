import React, { useState } from 'react';
import '../styles/WardenProfile.scss';

export default function WardenProfile({ setScreen, wardenData, systemText }) {
  if (!wardenData || !systemText) return null;

  const warden = wardenData.warden || {};
  const titles = wardenData.title || {};
  
  const systemSource = systemText.system ? systemText.system : systemText;
  const labels = systemSource.profile || {};
  const navigation = systemSource.navigation_warden || {}; 

  const [openSections, setOpenSections] = useState({});

  const toggleSection = (key) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getWardenPhoto = (name) => {
    try {
      return new URL(`../assets/images/prisoners/${name}.png`, import.meta.url).href;
    } catch (e) {
      console.error("Фото Warden не найдено");
      return "";
    }
  };

  return (
    <div className="warden-profile">
      
      {/* Верх эса*/}
      <div className="warden-profile__header">
        <h1 className="warden-profile__title">{titles.header}</h1>
        <div className="warden-profile__title-line"></div>
        <span className="warden-profile__id">N.{warden.id}</span>
      </div>
      <div className="warden-profile__confidential">{titles.confidential}</div>

      {/* Основная информация про эса*/}
      <div className="warden-profile__inner">
        <div className="warden-profile__main-section">
          
          <div className="warden-profile__photo-box">
            <div className="warden-profile__photo-decor"></div>
            <img 
              src={getWardenPhoto(warden.name)} 
              alt={warden.name} 
              className="warden-profile__photo" 
            />
          </div>

          <div className="warden-profile__stats">
            <div className="warden-profile__stat-row">
              <label className="warden-profile__stat-label">{labels.name}</label> 
              <span className="warden-profile__stat-value">{warden.name}</span>
            </div>
            <div className="warden-profile__stat-row">
              <label className="warden-profile__stat-label">{labels.age}</label> 
              <span className="warden-profile__stat-value">{warden.age}</span>
            </div>
            <div className="warden-profile__stat-row">
              <label className="warden-profile__stat-label">{labels.role}</label> 
              <span className="warden-profile__stat-value">{warden.role}</span>
            </div>
            <div className="warden-profile__attributes">
              <label className="warden-profile__attributes-label">{labels.attributes}</label>
              <div className="warden-profile__tags">
                {warden.attributes?.map(attr => (
                  <span key={attr} className="warden-profile__tag">[{attr}]</span>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="warden-profile__bio">{warden.bio}</div>

        {/* Плюсики */}
        <div className="warden-profile__accordion-list">
          {Object.keys(warden.information || {}).map((key) => (
            <div key={key} className="warden-profile__acc-item">
              <div className="warden-profile__acc-header" onClick={() => toggleSection(key)}>
                {key.replace(/_/g, ' ')} 
                <span className="warden-profile__acc-icon">{openSections[key] ? '−' : '+'}</span>
              </div>
              
              {openSections[key] && (
                <div className="warden-profile__acc-content">
                  {warden.information[key]?.map((item, i) => (
                    <div key={i} className="warden-profile__log-entry">
                      <div className="warden-profile__log-title">{item.title}</div>
                      <div className="warden-profile__log-text">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Страницы */}
      <div className="warden-profile__navigation">
        <button className="warden-profile__nav-btn" onClick={() => setScreen('dossier')}>{navigation.inmate_data}</button>
        <button className="warden-profile__nav-btn" onClick={() => setScreen('map')}>{navigation.facility_map}</button>
        <button className="warden-profile__nav-btn" onClick={() => setScreen('notes')}>{navigation.warden_notes}</button>
        <button className="warden-profile__nav-btn warden-profile__nav-btn--secret" onClick={() => setScreen('files')}>{navigation.secret_files}</button>
      </div>

      {/* футер */}
      <footer className="warden-profile__footer">
        <div className="warden-profile__scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="warden-profile__arrow-line">
            <svg viewBox="0 0 24 24">
              <path d="M12 4 L12 20 M7 9 L12 4 L17 9" />
            </svg>
          </div>
          <span className="warden-profile__footer-text">{navigation.page}</span>
        </div>

        <div className="warden-profile__terminate" onClick={() => setScreen('login')}>
          {navigation.terminate}
        </div>
      </footer>
    </div>
  );
}
