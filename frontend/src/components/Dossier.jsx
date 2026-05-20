import React from 'react';
import InmateCard from './InmateCard';
import '../styles/Dossier.scss';

export default function Dossier({ onSelect, onBack, prisonersData, systemText }) {
  
  if (!prisonersData || !systemText) return null;
  const { prisoners, guidan, es } = prisonersData;
  
  const prisonierScreen = systemText.prisonier_screen || {};
  const navigation = systemText.navigation_warden || {};

  const getPhotoUrl = (id) => {
    if (!id) return "";
    try {
      return new URL(`../assets/images/prisoners/${id}.png`, import.meta.url).href;
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="selection-page">
      <button className="back-link-btn" onClick={onBack}>
        {navigation.back_btn}
      </button>

      <div className="top-management-row">
        {/* Джекалоп */}
        {guidan && (
          <InmateCard 
            id={guidan.id} name={guidan.name} color={guidan.color} 
            image={getPhotoUrl(guidan.id)}
            status={guidan.roles?.object} isLarge={true}
            onClick={() => onSelect(guidan)}
          />
        )}
        
        {/* Эс */}
        {es && (
          <div className="es-card-wrapper">
            <InmateCard 
              id={es.id} name={es.name} color={es.color} 
              image={getPhotoUrl(es.id)}
              status={es.roles?.object} isLarge={true}
              onClick={() => onSelect(es)}
            />
          </div>
        )}
      </div>

      <div className="guidance-section">
        <h2 className="guidance-title">{prisonierScreen.guidance}</h2>
        <div className="guidance-container">
           <div className="side-line"></div>
           <p className="guidance-text" dangerouslySetInnerHTML={{ __html: prisonierScreen.intro_text}} />
           <div className="side-line"></div>
        </div>
      </div>

      <h3 className="select-prompt">{prisonierScreen.prompt}</h3>

      <div className="inmates-grid">
        {/* Персы */}
        {prisoners.map(p => (
          <InmateCard 
            key={p.id} id={p.id} name={p.name} color={p.color} 
            image={getPhotoUrl(p.id)}
            status={p.roles?.object}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>

      <footer className="footer-warning">
         <div className="warning-title">{prisonierScreen.warning_title}</div>
         <p className="warning-desc">{prisonierScreen.warning_text}</p>
         <div className="footer-deco">♥</div>
      </footer>
    </div>
  );
}