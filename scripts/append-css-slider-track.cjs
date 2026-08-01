const fs = require('fs');
const path = require('path');

const css = `
/* Slider Track Optimization */
.slider-track {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.slider-track .slider-img {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  z-index: 0;
}
.slider-track .slider-img.active {
  opacity: 1;
  z-index: 1;
}
`;

const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
fs.appendFileSync(cssPath, css);
console.log('CSS appended for slider track');
