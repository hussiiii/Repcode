import { cssColor, canvasColor, hexColor, collectionChartColor } from '@/lib/colors';

test('color helpers remain safe when rendering on the server without a document', () => {
  expect(cssColor('foreground')).toBe('rgb(var(--foreground) / 1)');
  expect(canvasColor('foreground')).toBe('transparent');
  expect(collectionChartColor(0, 1)).toBe('transparent');
  expect(hexColor('app-action-end')).toMatch(/^#[\da-f]{6}$/);
});
