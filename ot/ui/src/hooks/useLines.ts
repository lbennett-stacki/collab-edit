import { MutableRefObject, useMemo } from "react";

export function useLines({
  canvasRef,
  content,
  textSize,
  maxWidth,
  scale,
}: {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  content: string;
  textSize: number;
  maxWidth: number;
  scale: number;
}) {
  const lines = useMemo(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return [];
    }

    context.font = `${textSize}px Arial`;

    const result = [];

    const preservableLines = content.split("\n");

    for (const preserve of preservableLines) {
      let line = "";
      const words = preserve.split(" ");

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const width = context.measureText(testLine).width * scale;

        if (width > maxWidth) {
          result.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }

      if (line) {
        result.push(line);
      }
    }

    return result;
  }, [canvasRef, scale, content, maxWidth, textSize]);

  return lines;
}
