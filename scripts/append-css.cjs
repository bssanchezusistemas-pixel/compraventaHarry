const fs = require('fs');
const path = require('path');

const css = `
/* Slider Controls */
.slider-controls { position: absolute; top: 50%; left: 0; right: 0; display: flex; justify-content: space-between; transform: translateY(-50%); padding: 0 0.5rem; opacity: 0; transition: opacity 0.3s; z-index: 2; pointer-events: none; }
.has-slider:hover .slider-controls { opacity: 1; }
.slider-btn { background: rgba(0, 0, 0, 0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; transition: background 0.2s, transform 0.2s; backdrop-filter: blur(4px); }
.slider-btn:hover { background: var(--accent); transform: scale(1.1); }
.slider-dots { position: absolute; bottom: 0.5rem; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; z-index: 2; }
.img-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); transition: background 0.2s, transform 0.2s; }
.img-dot.active { background: white; transform: scale(1.3); }
`;

const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
fs.appendFileSync(cssPath, css);
console.log('CSS appended');
