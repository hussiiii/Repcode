/** CSS is the palette's source of truth. Use this for DOM styles/SVG attributes. */
export function cssColor(token: string, opacity = 1): string {
  return `rgb(var(--${token}) / ${opacity})`;
}

function tokenValue(token: string): string {
  const styles = getComputedStyle(document.documentElement);
  let value = styles.getPropertyValue(`--${token}`).trim();
  const seen = new Set<string>();
  // Browsers resolve aliases themselves; this also supports DOM test environments.
  while (/^var\(--[\w-]+\)$/.test(value)) {
    if (seen.has(value)) throw new Error(`Circular color token: ${token}`);
    seen.add(value);
    value = styles.getPropertyValue(value.slice(4, -1)).trim();
  }
  if (!value) throw new Error(`Undefined color token: ${token}`);
  return value;
}

/** Canvas and Chart.js need resolved colors, rather than CSS var() expressions. */
function tokenChannels(token: string): number[] {
  const channels = tokenValue(token).split(/\s+/).map(Number);
  if (channels.length !== 3 || channels.some(channel => !Number.isFinite(channel) || channel < 0 || channel > 255)) {
    throw new Error(`Invalid RGB color token: ${token}`);
  }
  return channels;
}

export function canvasColor(token: string, opacity = 1): string {
  // Canvas is mounted on the client; keep server rendering independent of the DOM.
  if (typeof document === 'undefined') return 'transparent';
  const channels = tokenChannels(token);
  return `rgba(${channels.join(', ')}, ${opacity})`;
}

/** Some libraries (including Joyride's primaryColor) explicitly parse hex strings. */
export function hexColor(token: string): string {
  const channels = typeof document === 'undefined' ? [0, 0, 0] : tokenChannels(token);
  return '#' + channels.map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('');
}

/** Preserve generated collection hues, with their parameters in the shared palette. */
export function collectionChartColor(index: number, totalCount: number): string {
  if (typeof document === 'undefined') return 'transparent';
  const offset = Number(tokenValue('chart-collection-hue-offset'));
  const hue = (index * 360 / totalCount + offset) % 360;
  return `hsla(${hue}, ${tokenValue('chart-collection-saturation')}, ${tokenValue('chart-collection-lightness')}, 0.85)`;
}

/** Change the alpha channel without replacing matching digits elsewhere in a color. */
export function withColorOpacity(color: string, opacity: number): string {
  if (color === 'transparent') return color;
  if (!/^(?:rgba|hsla)\([^()]+,\s*[\d.]+\)$/.test(color)) {
    throw new Error(`Expected a resolved chart color: ${color}`);
  }
  return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
}
