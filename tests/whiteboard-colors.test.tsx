/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { Whiteboard } from '@/components/app/WhiteBoard';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return { ...actual, useState: (initial: any) => actual.useState(initial === 'drawing-ink-black' && mockLegacyInk ? mockLegacyInk : initial) };
});
let mockLegacyInk: string | undefined;

beforeEach(() => {
  mockLegacyInk = undefined;
  const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const style = document.createElement('style');
  style.textContent = `:root {${css.match(/:root\s*\{([\s\S]*?)\n  \}/)![1]}}`;
  document.head.append(style);
});
afterEach(cleanup);

function canvasContext() {
  const strokes: string[] = [];
  const context = { clearRect: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn(), strokeRect: jest.fn(), setLineDash: jest.fn(), lineWidth: 1, lineCap: '', lineJoin: '' } as any;
  Object.defineProperty(context, 'strokeStyle', { set: (value: string) => strokes.push(value) });
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  return strokes;
}

test('new whiteboard strokes save resolved ink, so later UI palette edits cannot recolor old paths', () => {
  canvasContext();
  const setElements = jest.fn();
  const { container } = render(<Whiteboard elements={[]} setElements={setElements} />);
  const canvas = container.querySelector('canvas')!;
  jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 300, bottom: 150, width: 300, height: 150, toJSON: () => ({}) });
  fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
  fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
  fireEvent.mouseUp(canvas);
  const saved = setElements.mock.calls.find(([value]) => Array.isArray(value) && value[0]?.type === 'path')![0][0];
  expect(saved.color).toBe('#000000');
  expect(saved.color).not.toContain('var(');
  document.documentElement.style.setProperty('--drawing-ink-black', '1 2 3');
  expect(saved.color).toBe('#000000');
  document.documentElement.style.removeProperty('--drawing-ink-black');
});

test('existing sketches retain saved colors when they are redrawn', () => {
  const strokes = canvasContext();
  render(<Whiteboard elements={[{ id: 'saved', type: 'path', points: [{ x: 1, y: 2 }, { x: 3, y: 4 }], color: '#123456', strokeWidth: 2 }]} setElements={jest.fn()} />);
  expect(strokes).toContain('#123456');
});

test('a legacy hex ink selection continues drawing and saving in its existing format', () => {
  mockLegacyInk = '#FFA500';
  canvasContext();
  const setElements = jest.fn();
  const { container } = render(<Whiteboard elements={[]} setElements={setElements} />);
  const canvas = container.querySelector('canvas')!;
  jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 300, bottom: 150, width: 300, height: 150, toJSON: () => ({}) });
  fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
  fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
  fireEvent.mouseUp(canvas);
  const saved = setElements.mock.calls.find(([value]) => Array.isArray(value) && value[0]?.type === 'path')![0][0];
  expect(saved.color).toBe('#FFA500');
});
