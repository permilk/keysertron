const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Fix floating card ALL CAPS
c = c.replace('Sin Fines de Lucro', 'SIN FINES DE LUCRO');

// SVG icons
const svgBanca = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
const svgRetail = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>';
const svgEnergia = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
const svgIndustrial = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';

// Replace emoji + text (surrogates)
c = c.replace('\uD83C\uDFE6 Banca', svgBanca + ' Banca');
c = c.replace('\uD83D\uDED2 Retail', svgRetail + ' Retail');
c = c.replace('\u26A1 Energ\u00EDa', svgEnergia + ' Energ\u00EDa');
c = c.replace('\uD83C\uDFED Industrial', svgIndustrial + ' Industrial');

fs.writeFileSync('index.html', c, 'utf8');
console.log('Done');
