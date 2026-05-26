/**
 * Luxury Category-based SVG Fallback Images
 * Generates premium, self-contained SVG illustration data URLs
 * that always render offline/online regardless of internet blocking.
 */
export const getFallbackImage = (category, name) => {
  const cat = (category || "").toLowerCase();
  
  // Curated premium HSL-tailored color gradients and stroke colors
  let gradientStart = "#f6d5f7";
  let gradientEnd = "#fbe9d7";
  let textColor = "#be6a4a";
  let outlinePath = "";
  
  if (cat.includes("hair") || cat.includes("shampoo")) {
    // Hair care: warm honey rose gold
    gradientStart = "#fce3ec";
    gradientEnd = "#ffd3b6";
    textColor = "#b0573e";
    outlinePath = `
      <rect x="75" y="55" width="50" height="85" rx="8" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <rect x="90" y="38" width="20" height="17" rx="2" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <line x1="85" y1="80" x2="115" y2="80" stroke="${textColor}" stroke-width="2" stroke-dasharray="2 2" />
      <line x1="85" y1="100" x2="115" y2="100" stroke="${textColor}" stroke-width="2.5" />
      <circle cx="100" cy="118" r="7" fill="none" stroke="${textColor}" stroke-width="2" />
    `;
  } else if (cat.includes("skin") || cat.includes("serum") || cat.includes("cream") || cat.includes("toner") || cat.includes("mask") || cat.includes("wash") || cat.includes("moisturiser") || cat.includes("sunscreen")) {
    // Skincare: luxury warm cream/beige
    gradientStart = "#f5f0eb";
    gradientEnd = "#dfd3c3";
    textColor = "#8d7b68";
    outlinePath = `
      <rect x="78" y="65" width="44" height="75" rx="6" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <path d="M 90,65 L 90,40 A 10,10 0 0,1 110,40 L 110,65" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <rect x="88" y="55" width="24" height="10" rx="1" fill="none" stroke="${textColor}" stroke-width="2" />
      <circle cx="100" cy="105" r="9" fill="none" stroke="${textColor}" stroke-width="2" />
      <line x1="90" y1="105" x2="110" y2="105" stroke="${textColor}" stroke-width="2" />
    `;
  } else if (cat.includes("body") || cat.includes("lotion") || cat.includes("scrub") || cat.includes("deodorant") || cat.includes("perfume") || cat.includes("hand") || cat.includes("foot")) {
    // Body care: soothing botanical sage/mint green
    gradientStart = "#e8f0ec";
    gradientEnd = "#c9dfd6";
    textColor = "#3a6351";
    outlinePath = `
      <path d="M 80,45 L 120,45 L 112,130 L 88,130 Z" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <rect x="84" y="130" width="32" height="10" rx="1" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <path d="M 100,65 Q 108,77 100,90 Q 92,77 100,65 Z" fill="none" stroke="${textColor}" stroke-width="2" />
      <path d="M 100,77 Q 106,85 100,95 Q 94,85 100,77 Z" fill="none" stroke="${textColor}" stroke-width="1.5" />
      <line x1="100" y1="65" x2="100" y2="100" stroke="${textColor}" stroke-width="1.5" />
    `;
  } else if (cat.includes("men") || cat.includes("beard") || cat.includes("shave") || cat.includes("after")) {
    // Men's grooming: premium charcoal/bronze/slate
    gradientStart = "#e4e5e6";
    gradientEnd = "#a8acb3";
    textColor = "#2c3e50";
    outlinePath = `
      <rect x="70" y="65" width="38" height="70" rx="5" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <rect x="77" y="55" width="24" height="10" fill="none" stroke="${textColor}" stroke-width="2" />
      <path d="M 84,55 C 84,35 115,40 115,63 L 115,125" fill="none" stroke="${textColor}" stroke-width="2" stroke-dasharray="3 2" />
      <rect x="114" y="70" width="16" height="50" rx="2" fill="none" stroke="${textColor}" stroke-width="2" />
      <line x1="114" y1="80" x2="124" y2="80" stroke="${textColor}" stroke-width="1.5" />
      <line x1="114" y1="90" x2="124" y2="90" stroke="${textColor}" stroke-width="1.5" />
      <line x1="114" y1="100" x2="124" y2="100" stroke="${textColor}" stroke-width="1.5" />
      <line x1="114" y1="110" x2="124" y2="110" stroke="${textColor}" stroke-width="1.5" />
    `;
  } else {
    // Makeup / Cosmetics: rich coral/berry red
    gradientStart = "#ffe6e6";
    gradientEnd = "#ffb3b3";
    textColor = "#a83232";
    outlinePath = `
      <rect x="86" y="80" width="28" height="55" rx="2" fill="none" stroke="${textColor}" stroke-width="2.5" />
      <rect x="91" y="50" width="18" height="30" fill="none" stroke="${textColor}" stroke-width="2" />
      <path d="M 91,50 L 109,37 L 109,50 Z" fill="${textColor}" stroke="${textColor}" stroke-width="2" />
      <line x1="86" y1="95" x2="114" y2="95" stroke="${textColor}" stroke-width="2" />
    `;
  }
  
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="100%" height="100%">
      <defs>
        <linearGradient id="grad-${cat.replace(/[^a-z0-9]/g, '-')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${gradientStart}" />
          <stop offset="100%" stop-color="${gradientEnd}" />
        </linearGradient>
      </defs>
      <rect width="200" height="180" rx="12" fill="url(#grad-${cat.replace(/[^a-z0-9]/g, '-')})" />
      
      <circle cx="40" cy="140" r="60" fill="white" fill-opacity="0.15" />
      <circle cx="160" cy="30" r="45" fill="white" fill-opacity="0.12" />
      
      <g>
        ${outlinePath}
      </g>
      
      <text x="100" y="162" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="${textColor}" letter-spacing="1.5" text-anchor="middle">
        ALANKAAR
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};
