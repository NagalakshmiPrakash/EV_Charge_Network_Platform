'use client';

import { useMemo } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  const grid = useMemo(() => generateQRGrid(value), [value]);
  const cellSize = size / grid.length;

  return (
    <div className="bg-white p-3 rounded-lg inline-block" style={{ width: size + 24, height: size + 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {grid.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

function generateQRGrid(text: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const hash = hashString(text + Date.now().toString());
  let bitIndex = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      grid[y][x] = hash[bitIndex % hash.length] === '1';
      bitIndex++;
    }
  }

  drawFinder(grid, 0, 0);
  drawFinder(grid, size - 7, 0);
  drawFinder(grid, 0, size - 7);

  for (let i = 7; i < size - 7; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  return grid;
}

function drawFinder(grid: boolean[][], x: number, y: number) {
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const onBorder = dx === 0 || dx === 6 || dy === 0 || dy === 6;
      const onInner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
      grid[y + dy][x + dx] = onBorder || onInner;
    }
  }
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const py = y + dy;
      const px = x + dx;
      if (py >= 0 && py < grid.length && px >= 0 && px < grid.length) {
        const isBorder = (dx === -1 || dx === 7) && dy >= 0 && dy <= 6;
        const isBorder2 = (dy === -1 || dy === 7) && dx >= 0 && dx <= 6;
        if (isBorder || isBorder2) grid[py][px] = false;
      }
    }
  }
}

function hashString(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 0x01000193);
    h2 = Math.imul(h2 + str.charCodeAt(i), 0x1000193);
  }
  const bits = ((h1 >>> 0).toString(2) + (h2 >>> 0).toString(2)).padEnd(625, '1');
  return bits.slice(0, 625);
}
