const generateKeyboardIcon = () => {
  // Define key layout
  const ROWS = 2;
  const COLS = [5, 4]; // Number of keys in each row

  // Calculate dimensions to fill the viewBox
  const MARGIN = 20; // Space from edge of viewBox
  const KEYBOARD_WIDTH = 512 - 2 * MARGIN; // Full width minus margins
  const KEYBOARD_HEIGHT = 350; // Proportional height
  const KEYBOARD_Y = (512 - KEYBOARD_HEIGHT) / 2; // Center vertically

  // Calculate key sizes based on keyboard width
  const KEY_SPACING = KEYBOARD_WIDTH * 0.025; // 2.5% of keyboard width
  const KEYBOARD_PADDING = KEYBOARD_WIDTH * 0.05; // 5% padding inside keyboard
  const KEY_WIDTH =
    (KEYBOARD_WIDTH -
      KEY_SPACING * (Math.max(...COLS) + 1) -
      2 * KEYBOARD_PADDING) /
    Math.max(...COLS);
  const KEY_HEIGHT = KEY_WIDTH; // Square keys
  const SECOND_ROW_OFFSET = KEY_WIDTH * 0.6; // Offset proportional to key size

  // Calculate spacebar dimensions
  const SPACEBAR_WIDTH =
    KEYBOARD_WIDTH - KEY_SPACING * 2 - 2 * KEYBOARD_PADDING;
  const SPACEBAR_HEIGHT = KEY_HEIGHT;
  const ROW_SPACING = KEY_HEIGHT * 0.25; // Space between rows

  const OUTLINE_STROKE_WIDTH = 5;

  // Color function for keys
  const getColorForKey = (row, col) => {
    const x = 0.5 * row + col;
    const maxKeys = Math.max(...COLS);
    const hueIncrement = 360 / maxKeys;
    const hue = (x * hueIncrement) % 360;
    return `hsl(${hue}, 100%, 80%)`;
  };

  // Generate all keyboard keys
  const generateKeys = () => {
    let keys = "";

    // Generate each row of keys
    for (let row = 0; row < ROWS; row++) {
      const baseX =
        MARGIN +
        KEY_SPACING +
        KEYBOARD_PADDING +
        (row === 1 ? SECOND_ROW_OFFSET : 0);
      const baseY =
        KEYBOARD_Y +
        KEY_SPACING +
        KEYBOARD_PADDING +
        row * (KEY_HEIGHT + ROW_SPACING);

      for (let col = 0; col < COLS[row]; col++) {
        const x = baseX + col * (KEY_WIDTH + KEY_SPACING);
        const color = getColorForKey(row, col);
        keys += `<rect x="${x}" y="${baseY}" width="${KEY_WIDTH}" height="${KEY_HEIGHT}" rx="${
          KEY_WIDTH * 0.2
        }" fill="${color}" stroke="#333" stroke-width="${OUTLINE_STROKE_WIDTH}"/>`;
      }
    }

    return keys;
  };

  // Generate SVG
  const generateSVG = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="6" dy="6" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="keyboardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE0D9"/>
      <stop offset="100%" style="stop-color:#FFC0A8"/>
    </linearGradient>
  </defs>
  <rect x="${MARGIN}" y="${KEYBOARD_Y}" width="${KEYBOARD_WIDTH}" height="${KEYBOARD_HEIGHT}" rx="${
      KEYBOARD_WIDTH * 0.05
    }" fill="url(#keyboardGradient)" stroke="#333" stroke-width="12" filter="url(#shadow)"/>
  ${generateKeys()}
  <rect x="${MARGIN + KEY_SPACING + KEYBOARD_PADDING}" y="${
      KEYBOARD_Y +
      KEY_SPACING +
      KEYBOARD_PADDING +
      2.2 * (KEY_HEIGHT + ROW_SPACING)
    }" width="${SPACEBAR_WIDTH}" height="${SPACEBAR_HEIGHT}" rx="${
      KEY_WIDTH * 0.2
    }" fill="#87CEEB" stroke="#333" stroke-width="${OUTLINE_STROKE_WIDTH}"/>
</svg>`;
  };

  // Public interface
  return {
    getColorForKey,
    generateSVG,
  };
};

export default generateKeyboardIcon;
