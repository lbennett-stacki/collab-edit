const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;

export const rgbToRgba = (rgb: string, alpha: number) => {
  if (alpha > 1 || alpha < 0) {
    throw new Error(`alpha value must be between 0 and 1. Currently: ${alpha}`);
  }

  const matches = rgb.match(rgbRegex);

  if (!matches || matches.length === 0) {
    throw new Error(`Invalid rgb value "${rgb}" failed parsing`);
  }

  const [, red, green, blue] = matches;

  const rgba = `rgba(${red}, ${green}, ${blue}, ${alpha})`;

  return rgba;
};
