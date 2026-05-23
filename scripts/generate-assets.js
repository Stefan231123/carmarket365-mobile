const sharp = require('/Users/stefankocevski/carmarket365-backend/node_modules/sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Brand colors
const BLACK = '#030213';
const BLUE = '#2563eb';
const WHITE = '#ffffff';

// Car silhouette SVG (simple, clean car icon)
function carIconSvg(size) {
  const scale = size / 1024;
  return `<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="100%" style="stop-color:#030213"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>

  <!-- Car body -->
  <g transform="translate(512, 490)">
    <!-- Car body shape -->
    <path d="M-280,40 L-280,-20 Q-280,-50 -260,-70 L-180,-120 Q-140,-150 -80,-160 L80,-160 Q160,-150 200,-120 L280,-50 Q300,-30 300,0 L300,40 Q300,60 280,60 L-260,60 Q-280,60 -280,40 Z"
          fill="${WHITE}" opacity="0.95"/>

    <!-- Windshield -->
    <path d="M-120,-140 L-60,-140 Q40,-135 100,-120 L180,-70 Q185,-65 180,-60 L-140,-60 Q-150,-60 -148,-70 Z"
          fill="${BLUE}" opacity="0.85"/>

    <!-- Rear window -->
    <path d="M-140,-140 L-200,-100 Q-210,-90 -205,-85 L-160,-60 Q-155,-55 -145,-60 L-145,-135 Q-145,-142 -140,-140 Z"
          fill="${BLUE}" opacity="0.7"/>

    <!-- Headlight right -->
    <ellipse cx="270" cy="-15" rx="22" ry="18" fill="${BLUE}" opacity="0.9"/>

    <!-- Taillight left -->
    <rect x="-278" y="-35" width="15" height="25" rx="4" fill="#dc2626" opacity="0.8"/>

    <!-- Body line -->
    <line x1="-250" y1="0" x2="270" y2="0" stroke="${WHITE}" stroke-width="2" opacity="0.3"/>

    <!-- Front wheel -->
    <circle cx="180" cy="60" r="50" fill="#1a1a2e"/>
    <circle cx="180" cy="60" r="35" fill="#2a2a3e"/>
    <circle cx="180" cy="60" r="18" fill="#3a3a4e"/>
    <circle cx="180" cy="60" r="8" fill="#555"/>

    <!-- Rear wheel -->
    <circle cx="-180" cy="60" r="50" fill="#1a1a2e"/>
    <circle cx="-180" cy="60" r="35" fill="#2a2a3e"/>
    <circle cx="-180" cy="60" r="18" fill="#3a3a4e"/>
    <circle cx="-180" cy="60" r="8" fill="#555"/>
  </g>

  <!-- "CM365" text -->
  <text x="512" y="740" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="800" font-size="110" fill="${WHITE}" letter-spacing="6">
    CM<tspan fill="${BLUE}">365</tspan>
  </text>
</svg>`;
}

// Adaptive icon (foreground only, no rounded corners, centered with padding)
function adaptiveIconSvg() {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Transparent background (system provides the shape) -->

  <!-- Car body - centered with safe area padding -->
  <g transform="translate(512, 440)">
    <!-- Car body shape -->
    <path d="M-240,35 L-240,-15 Q-240,-40 -220,-60 L-150,-105 Q-115,-130 -65,-140 L65,-140 Q140,-130 170,-105 L240,-40 Q258,-22 258,5 L258,35 Q258,52 240,52 L-222,52 Q-240,52 -240,35 Z"
          fill="${BLACK}"/>

    <!-- Windshield -->
    <path d="M-100,-122 L-45,-122 Q38,-118 85,-105 L155,-58 Q160,-53 155,-48 L-118,-48 Q-128,-48 -126,-58 Z"
          fill="${BLUE}" opacity="0.9"/>

    <!-- Rear window -->
    <path d="M-118,-122 L-170,-85 Q-180,-76 -175,-72 L-135,-48 Q-130,-44 -122,-48 L-122,-117 Q-122,-124 -118,-122 Z"
          fill="${BLUE}" opacity="0.75"/>

    <!-- Headlight -->
    <ellipse cx="232" cy="-10" rx="18" ry="15" fill="${BLUE}"/>

    <!-- Taillight -->
    <rect x="-238" y="-28" width="12" height="20" rx="3" fill="#dc2626" opacity="0.85"/>

    <!-- Front wheel -->
    <circle cx="155" cy="52" r="44" fill="#1a1a2e"/>
    <circle cx="155" cy="52" r="30" fill="#2a2a3e"/>
    <circle cx="155" cy="52" r="15" fill="#3a3a4e"/>

    <!-- Rear wheel -->
    <circle cx="-155" cy="52" r="44" fill="#1a1a2e"/>
    <circle cx="-155" cy="52" r="30" fill="#2a2a3e"/>
    <circle cx="-155" cy="52" r="15" fill="#3a3a4e"/>
  </g>

  <!-- "CM365" text -->
  <text x="512" y="680" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="800" font-size="100" fill="${BLACK}" letter-spacing="5">
    CM<tspan fill="${BLUE}">365</tspan>
  </text>
</svg>`;
}

// Feature graphic (1024x500)
function featureGraphicSvg() {
  return `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#050520"/>
      <stop offset="50%" style="stop-color:#030213"/>
      <stop offset="100%" style="stop-color:#0a0a2a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="500" fill="url(#fbg)"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04" stroke="${WHITE}" stroke-width="1">
    <line x1="0" y1="100" x2="1024" y2="100"/>
    <line x1="0" y1="200" x2="1024" y2="200"/>
    <line x1="0" y1="300" x2="1024" y2="300"/>
    <line x1="0" y1="400" x2="1024" y2="400"/>
    <line x1="200" y1="0" x2="200" y2="500"/>
    <line x1="400" y1="0" x2="400" y2="500"/>
    <line x1="600" y1="0" x2="600" y2="500"/>
    <line x1="800" y1="0" x2="800" y2="500"/>
  </g>

  <!-- Blue accent glow -->
  <ellipse cx="512" cy="250" rx="400" ry="200" fill="${BLUE}" opacity="0.06"/>

  <!-- Car silhouette on the right -->
  <g transform="translate(740, 220)">
    <path d="M-200,30 L-200,-12 Q-200,-35 -185,-52 L-130,-90 Q-100,-110 -58,-118 L58,-118 Q120,-110 145,-90 L200,-38 Q215,-22 215,0 L215,30 Q215,44 200,44 L-184,44 Q-200,44 -200,30 Z"
          fill="${WHITE}" opacity="0.12"/>
    <circle cx="130" cy="44" r="38" fill="${WHITE}" opacity="0.08"/>
    <circle cx="-130" cy="44" r="38" fill="${WHITE}" opacity="0.08"/>
  </g>

  <!-- App name -->
  <text x="100" y="200" font-family="Arial, Helvetica, sans-serif"
        font-weight="800" font-size="72" fill="${WHITE}" letter-spacing="2">
    CarMarket
  </text>
  <text x="100" y="280" font-family="Arial, Helvetica, sans-serif"
        font-weight="800" font-size="72" fill="${BLUE}" letter-spacing="2">
    365
  </text>

  <!-- Tagline -->
  <text x="100" y="340" font-family="Arial, Helvetica, sans-serif"
        font-weight="400" font-size="24" fill="${WHITE}" opacity="0.6" letter-spacing="3">
    BUY &amp; SELL CARS. ANYTIME.
  </text>

  <!-- Bottom accent line -->
  <rect x="100" y="370" width="80" height="4" rx="2" fill="${BLUE}"/>
</svg>`;
}

// Splash icon
function splashIconSvg() {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Car body -->
  <g transform="translate(100, 85)">
    <path d="M-55,8 L-55,-3 Q-55,-10 -50,-15 L-35,-25 Q-25,-32 -14,-34 L14,-34 Q30,-32 38,-25 L55,-10 Q60,-5 60,2 L60,8 Q60,12 55,12 L-52,12 Q-55,12 -55,8 Z"
          fill="${BLACK}"/>
    <path d="M-22,-30 L-8,-30 Q10,-29 20,-25 L35,-14 Q37,-12 35,-10 L-26,-10 Q-29,-10 -28,-14 Z"
          fill="${BLUE}" opacity="0.9"/>
    <circle cx="35" cy="12" r="10" fill="#1a1a2e"/>
    <circle cx="35" cy="12" r="7" fill="#2a2a3e"/>
    <circle cx="-35" cy="12" r="10" fill="#1a1a2e"/>
    <circle cx="-35" cy="12" r="7" fill="#2a2a3e"/>
  </g>

  <!-- "CM365" text -->
  <text x="100" y="145" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="800" font-size="28" fill="${BLACK}" letter-spacing="2">
    CM<tspan fill="${BLUE}">365</tspan>
  </text>
</svg>`;
}

async function generate() {
  console.log('Generating app assets...\n');

  // 1. App icon (1024x1024 with rounded corners)
  const iconSvg = Buffer.from(carIconSvg(1024));
  await sharp(iconSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));
  console.log('  icon.png (1024x1024)');

  // 2. Adaptive icon foreground (1024x1024, transparent bg)
  const adaptiveSvg = Buffer.from(adaptiveIconSvg());
  await sharp(adaptiveSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));
  console.log('  adaptive-icon.png (1024x1024)');

  // 3. Favicon (48x48)
  await sharp(iconSvg)
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));
  console.log('  favicon.png (48x48)');

  // 4. Splash icon (200x200)
  const splashSvg = Buffer.from(splashIconSvg());
  await sharp(splashSvg)
    .resize(200, 200)
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));
  console.log('  splash-icon.png (200x200)');

  // 5. Feature graphic (1024x500)
  const featureSvg = Buffer.from(featureGraphicSvg());
  await sharp(featureSvg)
    .resize(1024, 500)
    .png()
    .toFile(path.join(ASSETS_DIR, 'feature-graphic.png'));
  console.log('  feature-graphic.png (1024x500)');

  // 6. Google Play store icon (512x512)
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(ASSETS_DIR, 'play-store-icon.png'));
  console.log('  play-store-icon.png (512x512)');

  console.log('\nAll assets generated!');
}

generate().catch(console.error);
