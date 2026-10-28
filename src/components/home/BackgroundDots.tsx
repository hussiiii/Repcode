import React from 'react';

interface BackgroundDotsProps {
  size: number;
  spacing: number;
  opacity: number;
}

const BackgroundDots: React.FC<BackgroundDotsProps> = ({ size, spacing, opacity }) => {
  const sizeArr = new Array(size).fill(null);

  const calculateOpacity = (x: number, y: number) => {
    const distanceFromCenter = Math.sqrt(Math.pow(x - size / 2, 2) + Math.pow(y - size / 2, 2));
    const normalizedDistance = distanceFromCenter / (size / 2);
    return (1 - normalizedDistance).toFixed(1);
  };

  const widthHeight = 9 + size * spacing;

  return (
    <div className="w-full h-1/4 absolute top-0 left-0 z-0 overflow-hidden">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${widthHeight} ${widthHeight}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity, width: '100%', height: '100%' }}
      >
        {sizeArr.map((_, x) => (
          sizeArr.map((_, y) => (
            <circle key={`${x}-${y}`} cx={9 + (spacing * x)} cy={9 + (spacing * y)} r="1" className="fill-foreground" fillOpacity={calculateOpacity(x, y)} />
          ))
        ))}
      </svg>
    </div>
  );
};

export default BackgroundDots;
