export type Color = [red: number, green: number, blue: number];

export const clientColors = new Map<string, Color>();

export const colors: Record<string, Color> = {
  red: [255, 0, 0],
  blue: [0, 0, 255],
  green: [0, 255, 0],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
  yellow: [255, 255, 0],
  pink: [255, 192, 203],
  brown: [165, 42, 42],
};

export const colorValues = Object.values(colors);

export const roundRobinNextColor = () => {
  const clientCount = clientColors.size;
  const colorIndex = clientCount % colorValues.length;

  return colorValues[colorIndex];
};
