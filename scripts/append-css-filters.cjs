const fs = require('fs');
const path = require('path');

const css = `
/* Subcategory Filters */
.subcategory-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}
.subcategory-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}
.subcategory-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
.subcategory-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
`;

const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
fs.appendFileSync(cssPath, css);
console.log('CSS appended');
