// The date object every browser and every Node process carries. It refuses
// nothing: an impossible written date is moved to a possible one, silently.
import { writeFileSync } from 'node:fs';
const Y0 = 1500, Y1 = 1930, out = process.argv[2];
const lines = [];
for (let y = Y0; y <= Y1; y++)
  for (let m = 1; m <= 12; m++)
    for (let d = 1; d <= 31; d++) {
      const ms = Date.UTC(y, m - 1, d, 12);
      lines.push(Number.isNaN(ms) ? '-' : String(Math.floor(ms / 86400000) + 2440588));
    }
writeFileSync(out + '/js-date.txt', lines.join('\n') + '\n');
console.error('node ' + process.version);
