import { MutableRefObject, useMemo } from "react";

export function useLines({
  canvasRef,
  content,
  maxWidth,
  scale,
}: {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  content: string;
  maxWidth: number;
  scale: number;
}) {
  const lines = useMemo(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return [];
    }
    const result = [];
    const words = content.split(" ");

    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const testWidth = context.measureText(testLine).width * scale;

      if (testWidth > maxWidth) {
        result.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }

    if (line) {
      result.push(line);
    }

    return result;
  }, [canvasRef, maxWidth, scale, content]);

  return lines;
}
