import React from 'react';

export default function InmateCard({ id, name, color, image, status, onClick, isLarge }) {
  return (
    <div className={`milgram-card ${isLarge ? 'large' : ''}`} onClick={onClick} style={{ '--accent': color }}>
      <div className="double-frame-container">
        <div className="outer-decor-corners"></div>
        
        {/* Рамка */}
        <div className="card-border-outer">
          <div className="card-content-inner">
            <span className="card-id">{id}</span>
            <div className="portrait-wrapper">
              <img src={image} alt={name} className="char-portrait" />
              {status && <div className="hover-status">{status}</div>}
            </div>
            <span className="card-name">{name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

