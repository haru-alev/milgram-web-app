import React, { useState } from 'react';

export default function MilgramMapSVG({ onRoomClick, selectedId, prisonersData }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', id: '', color: '', description: '' });

  const getPrisonerByRoomId = (roomId) => {
    if (!prisonersData?.prisoners) return null;
    return prisonersData.prisoners.find(p => p.id === roomId);
  };

  const rooms = [
    { id: "001", angle: 120 },
    { id: "002", angle: 150 },
    { id: "003", angle: 180 },
    { id: "004", angle: 210 },
    { id: "005", angle: 240 },
    { id: "006", angle: 270 },
    { id: "007", angle: 300 },
    { id: "008", angle: 330 },
    { id: "009", angle: 0 },
    { id: "010", angle: 30 },
    { id: "000", angle: 60 }
  ];

  const handleRoomClick = (roomId, e) => {
    e.stopPropagation();
    onRoomClick(roomId);
  };

  const handleMouseEnter = (room, e) => {
    const prisoner = getPrisonerByRoomId(room.id);
    if (prisoner) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.right + 10,
        y: rect.top - 10,
        name: prisoner.name,
        id: prisoner.id,
        color: prisoner.color || '#000000',
        description: ''
      });
    }
  };

  // Для комнат Джекалопа и Эса
  const handleSpecialMouseEnter = (room, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.right + 10,
      y: rect.top - 10,
      name: room.name,
      id: room.id,
      color: room.color,
      description: room.description
    });
  };

  const handleAreaMouseEnter = (area, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.right + 10,
      y: rect.top - 10,
      name: area.name,
      id: '',
      color: '#ffffff',
      description: area.description
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, name: '', id: '', color: '', description: '' });
  };

  return (
    <>
      <svg viewBox="-200 0 1300 300" width="100%" height="100%" className="map-svg-blueprint" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`
            .map-bg { fill: #8B0000; }
            .line { stroke: #000000; fill: none; stroke-width: 2; }
            .line.thick { stroke-width: 3; }
            .line.thin { stroke-width: 1.5; }
            .line.dashed { stroke-dasharray: 6 4; }
            .mort { fill: none; stroke: #000000; stroke-width: 2; }
            .room-box { stroke: #000000; stroke-width: 2; fill: rgba(0, 0, 0, 0.15); cursor: pointer; transition: all 0.2s ease; }
            .room-box:hover { fill: rgba(0, 0, 0, 0.3); stroke-width: 3; }
            .active .room-box { stroke-width: 3; fill: rgba(0, 0, 0, 0.25); }
            .active .mort { stroke-width: 3; }
            .room-text { fill: #000000; font-size: 10px; font-weight: bold; pointer-events: none; font-family: monospace; }
            .hover-area { cursor: pointer; }
            .disabled-room { opacity: 0.5; cursor: not-allowed; }
            .disabled-room .room-box { fill: rgba(0, 0, 0, 0.05); }
            .disabled-room:hover .room-box { fill: rgba(0, 0, 0, 0.05); stroke-width: 2; }
            .special-room-jackalope .room-box { stroke: #000000; }
            .special-room-jackalope .room-box:hover { stroke: #FFD600; stroke-width: 3; fill: rgba(0, 0, 0, 0.3); }
            .special-room-jackalope.active .room-box { stroke: #FFD600; stroke-width: 3; fill: rgba(0, 0, 0, 0.25); }
            .special-room-es .room-box { stroke: #000000; }
            .special-room-es .room-box:hover { stroke: #FF0000; stroke-width: 3; fill: rgba(0, 0, 0, 0.3); }
            .special-room-es.active .room-box { stroke: #FF0000; stroke-width: 3; fill: rgba(0, 0, 0, 0.25); }
          `}</style>
        </defs>

        <rect width="1100" height="700" className="map-bg" />

        {/* Левый павильон - PANOPTICON */}
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Panopticon', description: "This is a tower where a guard can see every cell and inmate but the inmates can't see into the tower." }, e)} onMouseLeave={handleMouseLeave}>
          <circle cx="65" cy="300" r="135" className="line thick" />
          <circle cx="65" cy="300" r="120" className="line dashed" />
          <circle cx="65" cy="300" r="115" className="line" />
          <circle cx="65" cy="300" r="44" className="line" />
          <circle cx="65" cy="300" r="42" className="line" />
          <circle cx="65" cy="300" r="40" className="line" />
          <circle cx="65" cy="300" r="38" className="line" />
          <circle cx="65" cy="300" r="36" className="line" />
          <circle cx="65" cy="300" r="34" className="line" />
          <circle cx="65" cy="300" r="140" fill="transparent" />
        </g>

        {/* Комнаты 001-010 И 000 (000 - недоступна) */}
        {rooms.map((room) => {
          const prisoner = getPrisonerByRoomId(room.id);
          const roomColor = prisoner?.color || '#000000';
          const isActive = selectedId === room.id;
          const isDisabled = room.id === '000';
          
          return (
            <g 
              key={room.id} 
              transform={`rotate(${room.angle}, 65, 300)`}
              className={`${isActive ? 'active' : ''} ${isDisabled ? 'disabled-room' : ''}`}
              onClick={(e) => {
                if (!isDisabled) handleRoomClick(room.id, e);
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) handleMouseEnter(room, e);
              }}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            >
              <rect x="20" y="30" width="90" height="110" rx="10" ry="10" fill="transparent" />
              <circle cx="65" cy="90" r="15" className="mort" style={{ stroke: isActive ? roomColor : '#000000' }} />
              <line x1="55" y1="185" x2="55" y2="130" className="line" />
              <line x1="75" y1="185" x2="75" y2="130" className="line" />
              <rect x="35" y="48" width="60" height="80" rx="10" ry="10" className="room-box" style={{ stroke: isActive ? roomColor : '#000000' }} />
              <rect x="55" y="123" width="20" height="6" rx="2" ry="2" className="line" />
              <rect x="55" y="183" width="20" height="6" rx="2" ry="2" className="line" />
              <text x="65" y="95" textAnchor="middle" className="room-text">{room.id}</text>
            </g>
          );
        })}

        {/* Кружочки между комнатами */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
          <g key={angle} transform={`rotate(${angle}, 65, 300)`}>
            <circle cx="65" cy="200" r="4" className="mort" />
          </g>
        ))}

        {/* Коридоры */}
        <line x1="180" y1="285" x2="760" y2="285" className="line" />
        <rect x="177" y="285" width="6" height="30" rx="2" ry="2" className="line" />
        <line x1="180" y1="315" x2="760" y2="315" className="line thick" />

        {/* Правый павильон - COURT */}
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Court' }, e)} onMouseLeave={handleMouseLeave}>
          <polygon points="76,14 93,36 93,64 76,86 50,95 24,86 7,64 7,36 24,14 50,5" transform="translate(715, 95) scale(4.1)" className="line" />
          <polygon points="76,14 93,36 93,64 76,86 50,95 24,86 7,64 7,36 24,14 50,5" transform="translate(730, 110) scale(3.8)" className="line dashed" />
          <polygon points="76,14 93,36 93,64 76,86 50,95 24,86 7,64 7,36 24,14 50,5" transform="translate(735, 115) scale(3.7)" className="line" />
          <polygon points="76,14 93,36 93,64 76,86 50,95 24,86 7,64 7,36 24,14 50,5" transform="translate(820, 200) scale(2)" className="line" />
          <rect x="700" y="80" width="200" height="250" fill="transparent" />
        </g>

        {/* Верхние комнаты по центру */}
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Dining Room', description: 'This is where prisoners enjoy their daily foods together' }, e)} onMouseLeave={handleMouseLeave}>
          <rect x="330" y="50" width="100" height="200" rx="10" ry="10" className="line" />
          <rect x="330" y="50" width="100" height="200" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="390" y="247" width="20" height="6" rx="2" ry="2" className="line" />
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Kitchen', description: 'This is where Jackalope cooks for the prisoners' }, e)} onMouseLeave={handleMouseLeave}>
          <rect x="430" y="50" width="40" height="40" rx="10" ry="10" className="line" />
          <rect x="430" y="50" width="40" height="40" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="427" y="53" width="6" height="20" rx="2" ry="2" className="line" />
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Shower Room', description: 'This is where prisoners clean themselves' }, e)} onMouseLeave={handleMouseLeave}>
          <rect x="460" y="110" width="70" height="140" rx="10" ry="10" className="line" />
          <rect x="460" y="110" width="70" height="140" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="490" y="247" width="20" height="6" rx="2" ry="2" className="line" />
        
        {/* Комната джекалопа */}
        <g 
          className={selectedId === '---' ? 'active special-room-jackalope' : 'special-room-jackalope'}
          onClick={(e) => handleRoomClick('---', e)}
          onMouseEnter={(e) => handleSpecialMouseEnter({ name: 'Guide 000 (Jackalope)', id: '---', color: '#FFD600', description: 'Jackalope personal room' }, e)}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'pointer' }}
        >
          <rect x="600" y="110" width="70" height="140" rx="10" ry="10" className="room-box" />
          <text x="635" y="175" textAnchor="middle" className="room-text">GUIDE</text>
          <rect x="600" y="110" width="70" height="140" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="630" y="247" width="20" height="6" rx="2" ry="2" className="line" />
        
        {/* Кружочки в верхних залах */}
        {[90, 150, 210].map((cy) => (
          <><circle cx="360" cy={cy} r="4" className="mort" /><circle cx="400" cy={cy} r="4" className="mort" /><circle cx="360" cy={cy} r="15" fill="transparent" /><circle cx="400" cy={cy} r="15" fill="transparent" /></>
        ))}

        {/* Нижние комнаты по центру */}
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Hall Room' }, e)} onMouseLeave={handleMouseLeave}>
          <rect x="330" y="360" width="100" height="200" rx="10" ry="10" className="line" />
          <rect x="330" y="360" width="100" height="200" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="390" y="357" width="20" height="6" rx="2" ry="2" className="line" />
        <g className="hover-area" onMouseEnter={(e) => handleAreaMouseEnter({ name: 'Warehouse' }, e)} onMouseLeave={handleMouseLeave}>
          <rect x="500" y="360" width="70" height="140" rx="10" ry="10" className="line" />
          <rect x="500" y="360" width="70" height="140" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="540" y="357" width="20" height="6" rx="2" ry="2" className="line" />
        
        {/* Комната эса */}
        <g 
          className={selectedId === '000' ? 'active special-room-es' : 'special-room-es'}
          onClick={(e) => handleRoomClick('000', e)}
          onMouseEnter={(e) => handleSpecialMouseEnter({ name: 'Guard 000 (Es)', id: '000', color: '#FF0000', description: 'Es personal room' }, e)}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'pointer' }}
        >
          <rect x="600" y="360" width="70" height="140" rx="10" ry="10" className="room-box" />
          <text x="635" y="425" textAnchor="middle" className="room-text">GUARD</text>
          <rect x="600" y="360" width="70" height="140" rx="10" ry="10" fill="transparent" />
        </g>
        <rect x="630" y="357" width="20" height="6" rx="2" ry="2" className="line" />
        
        {/* Кружочки в нижних залах */}
        {[400, 460, 520].map((cy) => (
            <><circle cx="360" cy={cy} r="4" className="mort" /><circle cx="400" cy={cy} r="4" className="mort" /><circle cx="360" cy={cy} r="15" fill="transparent" /><circle cx="400" cy={cy} r="15" fill="transparent" /></>
        ))}

        {/*  линии */}
        <line x1="390" y1="285" x2="390" y2="250" className="line" />
        <line x1="410" y1="285" x2="410" y2="250" className="line" />
        <line x1="390" y1="360" x2="390" y2="315" className="line" />
        <line x1="410" y1="360" x2="410" y2="315" className="line" />
        <line x1="490" y1="285" x2="490" y2="250" className="line" />
        <line x1="510" y1="285" x2="510" y2="250" className="line" />
        <line x1="540" y1="360" x2="540" y2="315" className="line" />
        <line x1="560" y1="360" x2="560" y2="315" className="line" />
        <line x1="630" y1="285" x2="630" y2="250" className="line" />
        <line x1="650" y1="285" x2="650" y2="250" className="line" />
        <line x1="630" y1="360" x2="630" y2="315" className="line" />
        <line x1="650" y1="360" x2="650" y2="315" className="line" />

        <rect x="759" y="285" width="6" height="30" rx="2" ry="2" className="line" />

        {/* Кружочки вокруг арены */}
        {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((angle) => (
          <g key={angle} transform={`rotate(${angle}, 920, 300)`}>
            <circle cx="1005" cy="300" r="4" className="mort" />
          </g>
        ))}
      </svg>

      {/* ТУЛТИП */}
      {tooltip.visible && (
        <div 
          className="map-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1000,
            borderColor: tooltip.color
          }}
        >
          <div className="map-tooltip__name" style={{ color: tooltip.color }}>{tooltip.name}</div>
          {tooltip.id && <div className="map-tooltip__id">ID: {tooltip.id}</div>}
          {tooltip.description && <div className="map-tooltip__desc">{tooltip.description}</div>}
        </div>
      )}
    </>
  );
}