import React, { useState, useEffect } from 'react';
import '../styles/SecretFiles.scss';

import subjectImage from '../assets/images/prisoners/subject.jpg';
import inmateImage from '../assets/images/prisoners/inmate.jpg';

const SecretFiles = ({ onBack, secretFilesData, systemText }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [finalChoice, setFinalChoice] = useState(null);
  const [code, setCode] = useState('');
  const SECRET = "1234";

  const handleInput = (e) => {
    const val = e.target.value;
    setCode(val);
    if (val === SECRET) setIsUnlocked(true);
  };

  const toggleSection = (key) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFinalChoice = (choice) => {
    setFinalChoice(choice);
    localStorage.setItem('secretFinalChoice', choice);
  };

  if (!secretFilesData) {
    return (
      <div className="secret-files">
        <div className="secret-files__loading">
          <h1>LOADING SECRET FILES...</h1>
        </div>
      </div>
    );
  }

  const backButtonText = systemText?.navigation_warden?.back_btn || "<- BACK";
  const { access_denied_screen, main_interface, theory_block, footer } = secretFilesData;
  const { information } = main_interface;

  // Текст для ленты
  const tickerText = access_denied_screen.background_password;
  const socialText = theory_block.background_fon;
  const warningText = theory_block.warning_red;

  // Создаем длинные строки для бесконечной анимации
  const longTickerText = Array(20).fill(tickerText).join('');
  const longSocialText = Array(20).fill(socialText).join('');
  const longWarningText = Array(15).fill(warningText + ' // ').join('');



  return (
    <div className="secret-files">
      {/* Диагональные ленты */}
      {!isUnlocked && (
        <div className="secret-files__diagonal-bg">
          <div className="secret-files__ticker-line secret-files__ticker-line--1">
            <div className="secret-files__ticker-track">
              <span className="secret-files__ticker-text">{longTickerText}</span>
              <span className="secret-files__ticker-text">{longTickerText}</span>
            </div>
          </div>
          <div className="secret-files__ticker-line secret-files__ticker-line--2">
            <div className="secret-files__ticker-track secret-files__ticker-track--reverse">
              <span className="secret-files__ticker-text">{longTickerText}</span>
              <span className="secret-files__ticker-text">{longTickerText}</span>
            </div>
          </div>
          <div className="secret-files__ticker-line secret-files__ticker-line--3">
            <div className="secret-files__ticker-track">
              <span className="secret-files__ticker-text">{longTickerText}</span>
              <span className="secret-files__ticker-text">{longTickerText}</span>
            </div>
          </div>
        </div>
      )}

      {!isUnlocked ? (
        <div className="secret-files__gate-section">
          <div className="secret-files__gate-content">
            <div className="secret-files__alert-flash">{access_denied_screen.main_title}</div>
            <h1 className="secret-files__main-title">{access_denied_screen.question}</h1>
            <p className="secret-files__sub-title">{access_denied_screen.input_hint}</p>
            <div className="secret-files__input-group">
              <input 
                className="secret-files__input"
                type="password" 
                value={code} 
                onChange={handleInput} 
                placeholder="IDENTIFY YOURSELF..."
                maxLength={4} 
                autoFocus 
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="secret-files__nav">
            <button className="secret-files__back-btn" onClick={onBack}>
              {backButtonText}
            </button>
          </div>

          <section className="secret-files__subject-container">
            <div className="secret-files__avatar-box">
              <img 
                className="secret-files__avatar-img" 
                src={subjectImage} 
                alt="Subject" 
              />
              <div className="secret-files__avatar-scan"></div>
            </div>
            <h3 className="secret-files__subject-title">{main_interface.names_action}</h3>
            <p className="secret-files__subject-status">{main_interface.action}</p>
            <p className="secret-files__subject-desc">
              {main_interface.logic_text}
            </p>

            <div className="secret-files__accordion-list">
              {information && Object.keys(information).map((category) => (
                <div key={category} className="secret-files__acc-item">
                  <div className="secret-files__acc-header" onClick={() => toggleSection(category)}>
                    {category.replace(/_/g, ' ')} 
                    <span className="secret-files__acc-icon">{openSections[category] ? '−' : '+'}</span>
                  </div>
                  {openSections[category] && (
                    <div className="secret-files__acc-content">
                      {information[category]?.map((item, idx) => (
                        <div key={idx} className="secret-files__log-entry">
                          <div className="secret-files__log-title">{item.title}</div>
                          <div className="secret-files__log-text">{item.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Горизонтальная лента*/}
          <div className="secret-files__horizontal-ticker">
            <div className="secret-files__horizontal-track">
              <div className="secret-files__horizontal-content">{longSocialText}</div>
              <div className="secret-files__horizontal-content">{longSocialText}</div>
            </div>
          </div>

          <section className="secret-files__content-section">
            <div className="secret-files__analysis-text">
              <h2>{theory_block.mirror_effect_title}</h2>
              <p>{theory_block.mirror_effect_text}</p>
              {theory_block.theories?.map((theory, idx) => (
                <div key={idx} className="secret-files__theory-card">
                  <div className="secret-files__theory-title">{theory.title}</div>
                  <p className="secret-files__theory-text">{theory.text}</p>
                </div>
              ))}
            </div>
            <div className="secret-files__art-aside">
              <div className="secret-files__art-placeholder">
                <img 
                  className="secret-files__art-img" 
                  src={inmateImage} 
                  alt="Inmate" 
                />
                <div className="secret-files__art-tape secret-files__art-tape--top">
                  <div className="secret-files__art-track">
                    <div className="secret-files__art-content">{longWarningText}</div>
                    <div className="secret-files__art-content">{longWarningText}</div>
                  </div>
                </div>
                <div className="secret-files__art-tape secret-files__art-tape--bottom">
                  <div className="secret-files__art-track">
                    <div className="secret-files__art-content">{longWarningText}</div>
                    <div className="secret-files__art-content">{longWarningText}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="secret-files__footer">
            <div className="secret-files__conclusion">
              <p className="secret-files__choice-text">{theory_block.small_note}</p>
              <div className="secret-files__choice-buttons">
                <button 
                  className={`secret-files__choice-btn forgive ${finalChoice === 'forgive' ? 'active' : ''}`}
                  onClick={() => handleFinalChoice('forgive')}
                >
                  Простить
                </button>
                <button 
                  className={`secret-files__choice-btn condemn ${finalChoice === 'punish' ? 'active' : ''}`}
                  onClick={() => handleFinalChoice('punish')}
                >
                  Не простить
                </button>
              </div>
              <p className="secret-files__analysis-end">{theory_block.analysis_end}</p>
              <button className="secret-files__reboot" onClick={() => window.location.reload()}>
                #{theory_block.reboot_btn}
              </button>
            </div>

            <div className="secret-files__red-arc">
              <div className="secret-files__legal">
                {footer.disclaimer?.map((item, idx) => (
                  <div key={idx} className="secret-files__legal-item">
                    <span className="secret-files__legal-title">{item.title}</span> {item.text}
                  </div>
                ))}
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default SecretFiles;