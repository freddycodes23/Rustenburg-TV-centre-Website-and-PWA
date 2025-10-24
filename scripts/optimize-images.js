const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets', 'images');
const OUT = path.join(SRC, 'optimized');

async function walk(dir) {
  let files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    const res = path.join(dir, it.name);
    if (it.isDirectory()) {
      files = files.concat(await walk(res));
    } else {
      files.push(res);
    }
  }
  return files;
}

function isRaster(ext) {
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function optimize() {
  await ensureDir(OUT);
  const files = await walk(SRC);
  const todo = files.filter(f => !f.includes(path.join(SRC, 'optimized')));
  console.log(`Found ${todo.length} files to consider`);
  for (const file of todo) {
    const rel = path.relative(SRC, file);
    const ext = path.extname(file).toLowerCase();
    const destDir = path.join(OUT, path.dirname(rel));
    await ensureDir(destDir);

    if (ext === '.svg') {
      // copy SVG as-is
      const dest = path.join(destDir, path.basename(file));
      await fs.copyFile(file, dest);
      console.log('copied svg', rel);
      continue;
    }

    if (!isRaster(ext)) {
      // skip other files
      continue;
    }

    // special handling for horizontal reel logos (smaller)
    if (rel.toLowerCase().includes('horizontal reel logo media')) {
      const outPath = path.join(destDir, path.basename(file).replace(ext, '.webp'));
      try {
        await sharp(file).resize({ height: 80 }).webp({ quality: 80 }).toFile(outPath);
        console.log('optimized reel', rel, '->', path.relative(SRC, outPath));
      } catch (err) {
        console.warn('failed optimize reel', rel, err.message);
      }
      continue;
    }

    // general images: produce three sizes
    const sizes = [1920, 800, 360];
    for (const w of sizes) {
      const outName = path.basename(file).replace(ext, `-${w}.webp`);
      const outPath = path.join(destDir, outName);
      try {
        await sharp(file).resize({ width: w }).webp({ quality: 80 }).toFile(outPath);
        console.log('wrote', path.relative(SRC, outPath));
      } catch (err) {
        console.warn('failed', rel, '->', outName, err.message);
      }
    }
  }
  console.log('Optimization complete. Optimized images are in assets/images/optimized/');
}

optimize().catch(err => {
  console.error('Image optimization failed', err);
  process.exit(1);
});
