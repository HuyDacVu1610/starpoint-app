const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const compiledSeed = path.join(__dirname, '..', 'dist', 'prisma', 'seed.js');
const sourceSeed = path.join(__dirname, 'seed.ts');

if (fs.existsSync(compiledSeed)) {
  console.log(`🌱 Running compiled seed script: ${compiledSeed}`);
  cp.execSync(`node "${compiledSeed}"`, { stdio: 'inherit' });
} else if (fs.existsSync(sourceSeed)) {
  console.log(`🌱 Running source seed script: ${sourceSeed}`);
  cp.execSync(`npx ts-node "${sourceSeed}"`, { stdio: 'inherit' });
} else {
  console.error('❌ Error: Could not find compiled seed.js or source seed.ts');
  process.exit(1);
}
