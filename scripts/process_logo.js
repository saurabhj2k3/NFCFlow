const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const svgPath = path.join(__dirname, '..', 'app', '2.svg');
  let svgContent = fs.readFileSync(svgPath, 'utf8');

  // 1. Clean transparent SVGs
  // Remove white background rectangles
  let cleanSvg = svgContent.replace(/<rect[^>]*fill="#ffffff"[^>]*\/>/g, '');

  // White text version for dark backgrounds
  let whiteSvg = cleanSvg.replace(/fill="#10244b"/g, 'fill="#ffffff"');

  // Render PNG of the full standard logo
  const fullPngBuffer = await sharp(Buffer.from(cleanSvg), { density: 150 })
    .png()
    .toBuffer();

  // Render PNG of the full white logo
  const fullWhitePngBuffer = await sharp(Buffer.from(whiteSvg), { density: 150 })
    .png()
    .toBuffer();

  // Trim transparent padding
  const trimmedFull = await sharp(fullPngBuffer).trim().png().toBuffer();
  const trimmedWhite = await sharp(fullWhitePngBuffer).trim().png().toBuffer();

  const fullMeta = await sharp(trimmedFull).metadata();
  console.log('Trimmed Full Logo dimensions:', fullMeta.width, 'x', fullMeta.height);

  // Resize to standard 1200px width
  const stdFull = await sharp(trimmedFull)
    .resize({ width: 1200 })
    .png({ quality: 100 })
    .toBuffer();

  const stdWhite = await sharp(trimmedWhite)
    .resize({ width: 1200 })
    .png({ quality: 100 })
    .toBuffer();

  // Add slight 3% horizontal, 5% vertical padding
  const stdMeta = await sharp(stdFull).metadata();
  const padX = Math.round(stdMeta.width * 0.03);
  const padY = Math.round(stdMeta.height * 0.05);

  const finalLogo = await sharp(stdFull)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const finalWhiteLogo = await sharp(stdWhite)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Save standard and white logos
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo.png'), finalLogo);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-full.png'), finalLogo);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-dark.png'), finalLogo);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-white.png'), finalWhiteLogo);
  console.log('Saved public/logo.png, logo-dark.png, logo-white.png');

  // 2. Extract and create Icon-only mark (square 512x512)
  const iconWidthEst = Math.round(fullMeta.width * 0.26);
  const iconCrop = await sharp(trimmedFull)
    .extract({
      left: 0,
      top: 0,
      width: iconWidthEst,
      height: fullMeta.height
    })
    .trim()
    .png()
    .toBuffer();

  const squareIcon = await sharp(iconCrop)
    .resize({
      width: 512,
      height: 512,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-icon.png'), squareIcon);

  // Favicons
  const favicon32 = await sharp(squareIcon).resize(32, 32).png().toBuffer();
  const favicon192 = await sharp(squareIcon).resize(192, 192).png().toBuffer();
  const favicon512 = await sharp(squareIcon).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.png'), favicon192);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), favicon32);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-192.png'), favicon192);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-512.png'), favicon512);

  // 3. Standalone cropped SVGs
  const croppedSvg = cleanSvg.replace(
    /viewBox="[^"]*"/,
    'viewBox="298 740 870 220"'
  ).replace(
    /width="2000" zoomAndPan="magnify" viewBox="298 740 870 220" height="2000"/,
    'viewBox="298 740 870 220" width="870" height="220"'
  );
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo.svg'), croppedSvg);

  const croppedWhiteSvg = whiteSvg.replace(
    /viewBox="[^"]*"/,
    'viewBox="298 740 870 220"'
  ).replace(
    /width="2000" zoomAndPan="magnify" viewBox="298 740 870 220" height="2000"/,
    'viewBox="298 740 870 220" width="870" height="220"'
  );
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-white.svg'), croppedWhiteSvg);

  const iconSvg = cleanSvg.replace(
    /viewBox="[^"]*"/,
    'viewBox="298 740 230 210"'
  ).replace(
    /width="2000" zoomAndPan="magnify" viewBox="298 740 230 210" height="2000"/,
    'viewBox="298 740 230 210" width="230" height="210"'
  );
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'logo-icon.svg'), iconSvg);

  console.log('All branding assets generated successfully!');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
