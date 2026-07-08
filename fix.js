const fs = require('fs');
const lines = fs.readFileSync('app/globals.css', 'utf8').split('\n');
const original = lines.slice(0, 191).join('\n');
const extra = `
/* Color Palette Themes */
.theme-clay {}
.theme-midnight {
  --color-background: #0f172a;
  --color-on-background: #f8fafc;
  --color-primary: #38bdf8;
  --color-primary-container: #0ea5e9;
  --color-on-primary: #ffffff;
  --color-surface: #1e293b;
  --color-on-surface: #f1f5f9;
  --color-surface-variant: #334155;
  --color-on-surface-variant: #cbd5e1;
  --color-surface-container: #0f172a;
  --color-surface-container-low: #1e293b;
  --color-surface-container-highest: #334155;
  --color-surface-container-lowest: #020617;
  --color-outline-variant: #475569;
}
.theme-rose {
  --color-background: #fff1f2;
  --color-on-background: #4c0519;
  --color-primary: #e11d48;
  --color-primary-container: #fb7185;
  --color-on-primary: #ffffff;
  --color-surface: #fff1f2;
  --color-on-surface: #881337;
  --color-surface-variant: #ffe4e6;
  --color-on-surface-variant: #9f1239;
  --color-surface-container: #fecdd3;
  --color-surface-container-low: #ffe4e6;
  --color-surface-container-highest: #fda4af;
  --color-surface-container-lowest: #ffffff;
  --color-outline-variant: #fecdd3;
}
.theme-ocean {
  --color-background: #f0fdfa;
  --color-on-background: #042f2e;
  --color-primary: #0d9488;
  --color-primary-container: #14b8a6;
  --color-on-primary: #ffffff;
  --color-surface: #f0fdfa;
  --color-on-surface: #115e59;
  --color-surface-variant: #ccfbf1;
  --color-on-surface-variant: #134e4a;
  --color-surface-container: #99f6e4;
  --color-surface-container-low: #ccfbf1;
  --color-surface-container-highest: #5eead4;
  --color-surface-container-lowest: #ffffff;
  --color-outline-variant: #99f6e4;
}

/* Font Themes */
.font-theme-jakarta * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
.font-theme-inter * { font-family: 'Inter', sans-serif !important; }
.font-theme-roboto * { font-family: 'Roboto', sans-serif !important; }
.font-theme-outfit * { font-family: 'Outfit', sans-serif !important; }
`;
fs.writeFileSync('app/globals.css', original + extra, 'utf8');
console.log('Fixed');
