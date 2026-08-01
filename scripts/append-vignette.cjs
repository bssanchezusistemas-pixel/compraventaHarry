const fs = require('fs');
const path = require('path');

const css = `
/* Vignette para ocultar bordes duros de imágenes */
.home-hero__media::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 30%, #000 95%);
  z-index: 1;
}

@media (min-width: 769px) {
  .home-hero__media::after {
    background: radial-gradient(ellipse at center, transparent 50%, #000 100%);
  }
}
`;

const cssPath = path.join(__dirname, '..', 'src', 'components', 'HomeHero.css');
fs.appendFileSync(cssPath, css);
console.log('Vignette CSS appended');
